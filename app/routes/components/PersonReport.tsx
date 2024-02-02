import moment from "moment";
import type { CBTProgress, ScenarioProgress } from "@prisma/client";

interface ReportTuple {
  personName: string;
  CBTs: CBTProgress[];
  scenarios: any[];
  lastSimTime: Date;
}

const tableColumnClassName = "border-double border-2 border-slate-600 p-2";

export default function PersonReport({
  personName,
  CBTs,
  scenarios,
  lastSimTime,
}: ReportTuple) {
  return (
    <div>
      <button
        className='text-white text-sm p-2 bg-blue-400 hover:bg-yellow-700 rounded absolute right-6'
        onClick={
          // download the report dom as a html file
          () => {
            let pageHTML = document.getElementById("report")?.outerHTML;
            const styleSheets = document.styleSheets;
            let allStyles = "";
            for (let i = 0; i < styleSheets.length; i++) {
              const styleSheet = styleSheets[i];
              const rules = styleSheet.cssRules;
              for (let j = 0; j < rules.length; j++) {
                const rule = rules[j];
                allStyles += rule.cssText + "\n";
              }
            }
            const styleBlock = `<style>${allStyles}</style>`;
            pageHTML += styleBlock;

            const blob = new Blob([pageHTML], { type: "text/html" });
            const url = URL.createObjectURL(blob);
            const tempEl = document.createElement("a");
            document.body.appendChild(tempEl);
            tempEl.href = url;
            tempEl.download = `${personName}.html`;
            tempEl.click();
            setTimeout(() => {
              URL.revokeObjectUrl(url);
              tempEl.parentNode.removeChild(tempEl);
            }, 2000);
          }
        }
      >
        downlaod the report
      </button>
      <div id='report'>
        <div className='flex m-6 justify-between'>
          <h1 className='text-3xl text-bold'>{personName}</h1>
        </div>
        <div className='m-2'>
          <table className='border-separate border-spacing-1 border border-slate-600 m-4'>
            <thead>
              <tr>
                <th className={tableColumnClassName}>Modules</th>
                <th className={tableColumnClassName}>Highest Grade</th>
                <th className={tableColumnClassName}>Attempts</th>
                <th className={tableColumnClassName}>Pass</th>
                <th className={tableColumnClassName}>Fail</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario) => (
                <tr>
                  <td className={tableColumnClassName}>{scenario.name}</td>
                  <td className={tableColumnClassName}>{scenario.grade}</td>
                  <td className={tableColumnClassName}>{scenario.attempts}</td>
                  <td className={tableColumnClassName}>{scenario.pass}</td>
                  <td className={tableColumnClassName}>{scenario.fail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2 className='text-2xl bold m-6'>
          Last simulations completed at (yyyy-mm-dd hh:mm:ss):
          {lastSimTime ? moment(lastSimTime).format("YYYY-MM-DD HH:mm:ss") : ""}
        </h2>
        <div className='m-2'>
          <table className='border-separate border-spacing-1 border border-slate-600 m-4'>
            <thead>
              <tr>
                <th className={tableColumnClassName}></th>
                <th className={tableColumnClassName}>Module Name</th>
                <th className={tableColumnClassName}>Completed On</th>
              </tr>
            </thead>
            <tbody>
              {CBTs.map((CBT, index) => (
                <tr>
                  <td className={tableColumnClassName}>{index + 1}</td>
                  <td className={tableColumnClassName}>{CBT.name}</td>
                  <td className={tableColumnClassName}>
                    {CBT.completed
                      ? moment(CBT.completedAt).format("YYYY-MM-DD HH:mm:ss")
                      : CBT.completedAt
                      ? moment(CBT.completedAt).format("YYYY-MM-DD HH:mm:ss")
                      : "Not Completed"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
