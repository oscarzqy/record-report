import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import Header from "./components/Header";
import { getReportCollection } from "~/models/report-collection.server";
import { useState } from "react";
import {
  type PersonReport,
  type CBTProgress,
  type ScenarioProgress,
} from "@prisma/client";
import PersonReportComponent from "./components/PersonReport";
import OverallReportComponent from "./components/OverallReport";
import fuzzysort from "fuzzysort";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  if (params.id == undefined) {
    return json({ personReports: [] });
  } else {
    const personReports = await getReportCollection(parseInt(params.id));
    personReports.sort((r1: PersonReport, r2: PersonReport) =>
      r1.personName < r2.personName ? -1 : 1
    );
    return json({ personReports });
  }
};

export default function ReportCollection() {
  const { personReports } = useLoaderData<typeof loader>();
  const [selectedPerson, setSelectedPerson] = useState<PersonReport | null>(
    null
  );
  const [CBTs, setCBTs] = useState<CBTProgress[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioProgress[]>([]);
  const [lastSimTime, setlastSimTime] = useState<Date | null>(null);
  const [overallReport, setOverallReport] = useState<any>(null);
  const [showOverall, setShowOverall] = useState<boolean>(false);
  const [displayPersons, setDisplayPersons] = useState(personReports);

  return (
    <>
      <Header />
      <div className='grid grid-cols-11 gap-4'>
        <div className='col-span-2 border-r-2 border-indigo-500'>
          {" "}
          <ul className='m-2'>
            <li className='cursor-pointer text-center' key='overall'>
              <span
                className={`text-blue-400 text-xl underline px-2 ${
                  showOverall ? "ring-2 ring-pink-500 ring-inset" : ""
                }`}
                onClick={async () => {
                  try {
                    const response = await fetch(
                      `/api/report-all/${personReports[0].collectionId}`,
                      {
                        method: "GET",
                      }
                    );
                    setOverallReport(await response.json());
                    setShowOverall(true);
                  } catch (error) {
                    console.error("Fetch all error");
                  }
                }}
              >
                Overall
              </span>
            </li>
            <li className='text-center'>
              <input
                type='text'
                className=' border-blue-600 border-2 rounded px-2 text-lg w-full placeholder:text-lg'
                placeholder='Search for the person/email...'
                onChange={(e) => {
                  const result = fuzzysort.go(e.target.value, personReports, {
                    threshold: 0.5,
                    keys: ["personName", "email"],
                    all: true,
                  });
                  setDisplayPersons(result.map((person) => person.obj));
                }}
              />
            </li>
            {displayPersons.map((displayPersonReport, index) => {
              return (
                <li key={displayPersonReport.id} className='break-words'>
                  <span>{index + 1}</span>
                  <p
                    className={`text-blue-500 underline px-2 cursor-pointer ${
                      !showOverall &&
                      selectedPerson?.id == displayPersonReport.id
                        ? "ring-2 ring-pink-500 ring-inset"
                        : ""
                    }`}
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          `/api/report/${displayPersonReport.id}`,
                          {
                            method: "GET",
                          }
                        );
                        const data = await response.json();
                        setCBTs(data.CBT);
                        setScenarios(data.Scenario);
                        setSelectedPerson(displayPersonReport);
                        setlastSimTime(data.lastSimTime);
                        setShowOverall(false);
                      } catch (error) {
                        console.error("Fetch error");
                      }
                    }}
                  >
                    {displayPersonReport.personName}
                  </p>
                  <p className='px-2'>{displayPersonReport.email}</p>
                </li>
              );
            })}
          </ul>
        </div>
        <div className='col-span-9'>
          {!showOverall ? (
            selectedPerson ? (
              PersonReportComponent({
                personName: selectedPerson.personName,
                CBTs,
                scenarios,
                lastSimTime,
              })
            ) : (
              <h1 className='text-2xl text-gray-700 font-medium py-2 px-2'>
                Choose a report on the left
              </h1>
            )
          ) : overallReport ? (
            OverallReportComponent(overallReport)
          ) : (
            <h1 className='text-2xl text-gray-700 font-medium py-2 px-2'>
              Choose a report on the left
            </h1>
          )}
        </div>
      </div>
    </>
  );
}
