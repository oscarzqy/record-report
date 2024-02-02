import React from "react";

const tableColumnClassName = "border-double border-2 border-slate-600 p-2";

export default function OverallReport({ moduleNames, records }) {
  return (
    <div>
      <div className='flex justify-end w-full mt-2'>
        <button
          className='text-white text-sm p-2 bg-blue-400 hover:bg-yellow-700 rounded'
          onClick={
            // download the report dom as a html file
            () => {
              let pageHTML =
                document.getElementById("report-overall")?.outerHTML;
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
              tempEl.download = "Student Performance.html";
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
      </div>
      <div id='report-overall'>
        <div className='m-2'>
          <table className='border-separate border-spacing-1 border border-slate-600 m-4'>
            <thead>
              <tr>
                <th className={tableColumnClassName}></th>
                <th className={tableColumnClassName}>Name</th>
                {moduleNames.map((moduleName: string) => (
                  <th className={tableColumnClassName}>{moduleName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((record: any, index: number) => (
                <tr>
                  <td className={tableColumnClassName}>{index + 1}</td>
                  <td className={tableColumnClassName}>{record.userName}</td>
                  {record.performance.map((item: any) => {
                    const color = item.pass
                      ? "bg-green-400"
                      : !item.total
                      ? "bg-yellow-400"
                      : "";
                    return (
                      <td className={tableColumnClassName + " " + color}>
                        {item.pass ? item.pass : !item.total ? "N/C" : "0"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
