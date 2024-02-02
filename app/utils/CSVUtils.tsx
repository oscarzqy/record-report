// src/utils/csvUtils.js
import fs from "fs";
import csvParser from "csv-parser";
import readline from "readline";
import events from "events";

export async function convertCsvFileToJson(filePath: string) {
  const jsonData: Array<any> = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        jsonData.push(row);
      })
      .on("end", () => {
        resolve(jsonData);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

async function readLineByLine(filePath: string) {
  console.log("Reading file:", filePath);
  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  try {
    const lines: Array<string> = [];

    // Read the first line
    rl.on("line", (line) => {
      lines.push(line);
    });

    // Handle errors
    rl.once("error", (error) => {
      console.log("error occurred");
    });

    await events.once(rl, "close");

    return lines;
  } catch (error) {
    console.error(error);
    return [];
  } finally {
    // Ensure the stream is closed in case of an error
    stream.close();
  }
}

function parseCsvLine(line: string) {
  const list = [];
  let stringStack = "";
  for (let c of line) {
    if (c === ",") {
      // Should be pushed to list, either quoted or not quotead at all
      // otherwise it's a comma in the actua data
      if (
        // quoted
        stringStack.length >= 2 &&
        stringStack[0] === '"' &&
        stringStack[stringStack.length - 1] === '"'
      ) {
        list.push(stringStack.slice(1, -1));
        stringStack = "";
      } else if (
        // no quotes
        (stringStack.length >= 2 &&
          stringStack[0] !== '"' &&
          stringStack[stringStack.length - 1] !== '"') ||
        stringStack.search('"') === -1 // here is a potensioal vulnerability, assuming the quotes will only be the first or the last character
      ) {
        list.push(stringStack);
        stringStack = "";
      } else {
        stringStack += c;
      }
      continue;
    }

    stringStack += c;
  }

  if (stringStack.length > 0) {
    if (stringStack[0] === '"' && stringStack[stringStack.length - 1] === '"') {
      list.push(stringStack.slice(1, -1));
    } else {
      list.push(stringStack);
    }
    stringStack = "";
  }

  return list;
}

export async function getCbtProgressObject(filePath: string) {
  const lines = await readLineByLine(filePath);
  const header = lines[0];
  const headerList = parseCsvLine(header);
  const cbtProgressHeaderList = headerList.map((item, index) => {
    if (index === 0) {
      return "Full Name";
    }
    if (item === "") {
      return headerList[index - 1] + "_CompletionDate";
    }
    return item;
  });
  const objs = lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const obj: any = {};
    cbtProgressHeaderList.map((item, index) => {
      obj[item] = values[index];
    });
    return obj;
  });

  return objs;
}

export async function getScenariosProgressObject(filePath: string) {
  const lines = await readLineByLine(filePath);
  const header = lines[0];
  const headerList = parseCsvLine(header);
  const scenarioHeaderList = headerList.map((item, index) => {
    return item;
  });

  const scenarioObjs = lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const obj: any = {};
    scenarioHeaderList.map((item, index) => {
      obj[item] = values[index];
    });
    return obj;
  });

  return scenarioObjs;
}
