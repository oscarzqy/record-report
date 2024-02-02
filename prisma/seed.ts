import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // const collection1 = await prisma.reportCollection.upsert({
  //   where: { name: "collection1" },
  //   update: {},
  //   create: {
  //     name: "collection1",
  //     rawData: "localhost:3000",
  //     personReports: {
  //       create: [
  //         {
  //           personName: "Gabe Dufresen",
  //           email: "gabe@vmt.ca",
  //           CBTProgress: {
  //             create: [
  //               {
  //                 name: "module1",
  //                 completed: true,
  //                 completedAt: new Date(),
  //               },
  //             ],
  //           },
  //           scenarioProgress: {
  //             create: [
  //               {
  //                 name: "assessment1",
  //                 highestGrade: 90.5,
  //                 attempts: 2,
  //                 pass: 1,
  //                 fail: 1,
  //                 totalTime: 20.1,
  //                 criticalErrors: 5,
  //                 nonCriticalErrors: 2,
  //               },
  //             ],
  //           },
  //         },
  //       ],
  //     },
  //   },
  // });
  // console.log({ collection1 });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
