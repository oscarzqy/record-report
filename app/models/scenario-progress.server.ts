import { prisma } from "../db.server";

export async function getScenarioProgressAll(collectionId: number) {
  const moduleNames = [
    "Assessment #1",
    "Assessment #2",
    "Assessment #3",
    "Assessment #4",
    "Assessment #5",
    "Practice Drill #1",
    "Practice Drill #2",
    "Practice Drill #3",
    "Practice Drill #4",
    "Practice Drill #5",
    "Practice Drill #6",
    "Practice Drill #7",
  ];

  const personReports = await prisma.personReport.findMany({
    where: { collectionId },
  });
  const personIds = personReports.map((personReport) => personReport.id);
  const personReportsMap = new Map();
  const personPracticeMap = new Map<number, boolean>();
  personReports.forEach((personReport) => {
    personReportsMap.set(personReport.id, personReport);
    personPracticeMap.set(personReport.id, false);
  });
  const scenarioAttempts = await prisma.scenarioProgress.groupBy({
    by: ["personReportId", "name"],
    _count: {
      _all: true,
    },
    where: { personReportId: { in: personIds } },
  });
  const scenarioPasses = await prisma.scenarioProgress.groupBy({
    by: ["personReportId", "name"],
    _count: {
      _all: true,
    },
    where: { personReportId: { in: personIds }, grade: { gte: 80 } },
  });

  const passMap = new Map();
  scenarioPasses.forEach((item) => {
    if (passMap.has(item.personReportId)) {
      passMap.get(item.personReportId).set(item.name, item._count._all);
    } else {
      passMap.set(item.personReportId, new Map());
      passMap.get(item.personReportId).set(item.name, item._count._all);
    }
  });

  let attempts = scenarioAttempts.map((attempt) => {
    const filteredModuleNames = moduleNames.filter((moduleName) =>
      attempt.name.includes(moduleName)
    );

    const simplifiedModuleName =
      filteredModuleNames.length > 0 ? filteredModuleNames[0] : null;
    personPracticeMap.set(attempt.personReportId, true);
    return {
      userName: personReportsMap.get(attempt.personReportId).personName,
      simplifiedModuleName,
      total: attempt._count._all,
      pass:
        passMap.has(attempt.personReportId) && simplifiedModuleName
          ? passMap.get(attempt.personReportId).get(attempt.name)
          : 0,
    };
  });
  const NeverPracticedPeople = personReports.filter(
    (personReport) => personPracticeMap.get(personReport.id) == false
  );

  for (const neverPracticedPerson of NeverPracticedPeople) {
    attempts = attempts.concat(
      // console.log(
      moduleNames.map((moduleName) => ({
        userName: neverPracticedPerson.personName,
        simplifiedModuleName: moduleName,
        total: 0,
        pass: 0,
      }))
      // );
    );
  }

  // console.log(scenarioAttempts);

  const userName2Attempts = Object.groupBy(
    attempts,
    ({ userName }) => userName
  );

  // console.log(userName2Attempts);

  const response: any = {};
  response.records = [];
  for (const userName in userName2Attempts) {
    const attemptsByCourses = new Map();
    userName2Attempts[userName].forEach((item) => {
      attemptsByCourses.set(item.simplifiedModuleName, {
        total: item.total,
        pass: item.pass,
      });
    });

    response.moduleNames = moduleNames;
    const record = { userName, performance: [] };
    moduleNames.forEach((moduleName) => {
      if (!attemptsByCourses.has(moduleName)) {
        record.performance.push({ moduleName: moduleName, total: 0, pass: 0 });
      } else {
        record.performance.push({
          moduleName: moduleName,
          total: attemptsByCourses.get(moduleName).total,
          pass: attemptsByCourses.get(moduleName).pass,
        });
      }
    });
    response.records.push(record);
  }

  return response;
}
