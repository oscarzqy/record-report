import { json } from "@remix-run/node";
import { prisma } from "../db.server";
import moment from "moment";

interface ReportCollection {
  id: number;
  name: string;
  rawData: string;
  lastModefiedTime: string;
}

interface PersonReport {
  id: number;
  personName: string;
  email: string;
  createdAt: Date;
}

interface CBTProgress {
  id: number;
  name: string;
  completed: string;
  completedAt: Date;
}

interface ScenarioProgress {
  id: number;
  name: string;
  grade: number;
  attempts: number;
  pass: number;
  fail: number;
  totalTime: number;
  criticalErrors: number;
  nonCriticalErrors: number;
}

export async function getReportCollections() {
  return prisma.reportCollection.findMany();
}

export async function getReportCollection(collectionId: number) {
  return prisma.personReport.findMany({ where: { collectionId } });
}

export async function getPersonReport(personReportId: number) {
  const personReport = prisma.personReport.findUnique({
    where: { id: personReportId },
  });
  const CBTProgresses = await personReport.CBTProgress();

  const scenarioSums = await prisma.scenarioProgress.groupBy({
    by: ["name"],
    where: {
      personReportId,
    },
    _count: {
      _all: true,
    },
    _sum: {
      totalTime: true,
      criticalErrors: true,
      nonCriticalErrors: true,
    },
    _max: {
      grade: true,
    },
  });

  const lastRuntime = await prisma.scenarioProgress.aggregate({
    where: {
      personReportId,
    },
    _max: {
      runAt: true,
    },
  });

  const scenarioPasses = await prisma.scenarioProgress.groupBy({
    by: ["name"],
    _count: {
      _all: true,
    },
    where: {
      personReportId,
      grade: {
        gte: 80,
      },
    },
  });

  const scenarioPassMap = new Map();
  scenarioPasses.forEach((item) => {
    scenarioPassMap.set(item.name, item._count._all);
  });

  // construct the scenarioReport object
  const scenarioReport = scenarioSums.map((item) => {
    return {
      name: item.name,
      grade: item._max.grade,
      totalTime: item._sum.totalTime,
      criticalErrors: item._sum.criticalErrors,
      nonCriticalErrors: item._sum.nonCriticalErrors,
      pass: scenarioPassMap.has(item.name) ? scenarioPassMap.get(item.name) : 0,
      attempts: item._count._all,
      fail:
        item._count._all -
        (scenarioPassMap.has(item.name) ? scenarioPassMap.get(item.name) : 0),
    };
  });

  return {
    CBT: CBTProgresses,
    Scenario: scenarioReport,
    lastSimTime: lastRuntime._max.runAt,
  };
}

export async function createReportCollection(
  collectionName: string,
  rawData: string,
  cbtObjs: any,
  scenarioObjs: any
) {
  const collection = await prisma.reportCollection.create({
    data: {
      name: collectionName,
      rawData,
    },
  });
  // merge the data for pepole with the same name
  const cbtMap = new Map();
  cbtObjs.forEach((item: any) => {
    const fullName = item["Full Name"];
    if (fullName.trim() == "") {
      return;
    }
    if (cbtMap.has(fullName)) {
      const cbt = cbtMap.get(fullName);
      for (const prop in cbt) {
        if (prop === "Full Name") continue;
        // Email Address is disgarded
        if (prop.endsWith("CompletionDate")) {
          cbt[prop] = item[prop];
        } else {
          cbt[prop] = item[prop] === "Completed" ? item[prop] : cbt[prop];
        }
      }
      cbtMap.set(fullName, cbt);
    } else {
      cbtMap.set(fullName, item);
    }
  });

  const scenarioMap = new Map();
  scenarioObjs.forEach((item: any) => {
    const userName = item["Name"];
    const scenario: any = {};
    scenario["name"] = item["Simulation Name"];
    scenario["grade"] = parseInt(item["Grade"]);
    scenario["completed"] =
      item["Was scenario completed?"].toLowerCase() == "true" ? true : false;
    scenario["totalTime"] = parseFloat(
      item["Overall time to complete scenario (seconds)"]
    );
    scenario["criticalErrors"] = 0;
    scenario["nonCriticalErrors"] = 0;
    scenario["runAt"] = moment(item["Timestamp"], "YYYY-MM-DD_HH-mm-ss");

    if (scenarioMap.has(userName)) {
      scenarioMap.get(userName).push(scenario);
    } else {
      scenarioMap.set(userName, [scenario]);
    }
  });

  cbtMap.forEach(async (cbt, fullName) => {
    // console.log("in the iteratoin： ", cbt, fullName);
    const personReport = await prisma.personReport.create({
      data: {
        collectionId: collection.id,
        personName: fullName,
        email: cbt["Email address"],
        createdAt: new Date(),
      },
    });
    for (const prop in cbt) {
      if (
        prop === "Full Name" ||
        prop === "Email address" ||
        prop.endsWith("_CompletionDate")
      ) {
        continue;
      }
      await prisma.cBTProgress.create({
        data: {
          name: prop,
          completed: cbt[prop] == "Completed" ? true : false,
          completedAt:
            cbt[prop + "_CompletionDate"] === ""
              ? new Date()
              : moment(
                  cbt[prop + "_CompletionDate"],
                  "dddd, DD MMMM YYYY, h:mm:ss a"
                ),
          personReportId: personReport.id,
        },
      });
    }

    if (scenarioMap.has(fullName)) {
      scenarioMap.get(fullName).forEach(async (scenario) => {
        await prisma.scenarioProgress.create({
          data: {
            name: scenario.name,
            grade: scenario.grade,
            completed: scenario.completed,
            totalTime: scenario.totalTime,
            criticalErrors: scenario.criticalErrors,
            nonCriticalErrors: scenario.nonCriticalErrors,
            runAt: scenario.runAt,
            personReportId: personReport.id,
          },
        });
      });
    }
  });
}
