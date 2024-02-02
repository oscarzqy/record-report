import Header from "./components/Header";
import {
  convertCsvFileToJson,
  getCbtProgressObject,
  getScenariosProgressObject,
} from "../utils/CSVUtils";
import { Form, redirect } from "@remix-run/react";
import {
  ActionFunction,
  ActionFunctionArgs,
  unstable_createFileUploadHandler as createFileUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_composeUploadHandlers,
} from "@remix-run/node";
import { createReportCollection } from "~/models/report-collection.server";

export const action: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const formData = await parseMultipartFormData(
    request,
    unstable_composeUploadHandlers(
      createFileUploadHandler({
        filter({ contentType }) {
          return contentType.includes("text/csv");
        },
        directory: "./public/uploads",
        maxPartSize: 1024 * 1024 * 10,
        file({ filename }) {
          return filename;
        },
      }),
      createMemoryUploadHandler()
    )
  );

  // console.log(formData.get("CollectionName"));
  // console.log(formData.get("Scenario").name);
  // console.log(formData.get("CBT").name);

  const cbtObjs = await getCbtProgressObject(
    `./public/uploads/${formData.get("CBT").name}`
  );
  const scenarioObjs = await getScenariosProgressObject(
    `./public/uploads/${formData.get("Scenario").name}`
  );

  await createReportCollection(
    formData.get("CollectionName"),
    "unavailable",
    cbtObjs,
    scenarioObjs
  );

  return redirect("/report-collections/new");
};

export default function NewReportCollection() {
  return (
    <>
      <Header />
      <Form
        method='POST'
        className='rounded-lg border-2 border-solid border-green-700 w-1/2 flex flex-col items-center m-auto py-2 my-2'
        encType='multipart/form-data'
      >
        <label htmlFor='CollectionName' className='block pt-1'>
          Collection Name
        </label>
        <input type='text' name='CollectionName' className='block py-1 border-slate-600 border rounded' />
        <label htmlFor='Scenario' className='block pt-1'>
          Upload the Export csv file
        </label>
        <input type='file' name='Scenario' className='block py-1' />
        <label htmlFor='Scenario' className='block pt-1'>
          Upload the Activity csv file
        </label>
        <input type='file' name='CBT' className='block py-1' />
        <button
          type='submit'
          className='rounded-lg bg-stone-300 px-3 hover:bg-slate-400'
        >
          Upload
        </button>
      </Form>
    </>
  );
}
