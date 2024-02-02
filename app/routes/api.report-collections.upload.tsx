// routes/upload.js
import {
  ActionFunction,
  json,
  LoaderFunction,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import multer from "multer";

const upload = multer({ dest: "uploads/" }); // Specify the destination folder

export let loader: LoaderFunction = async ({ request }) => {
  // Return any data needed for rendering the page
  return json({});
};

// export let action: LoaderFunction = async ({ request }) => {
//   const ScenarioReq = await upload.single("Scenario");
//   const CBTReq = await upload.single("CBT");
//   console.log(ScenarioReq);
//   // `files` now contains information about the uploaded file
//   // Perform any additional actions, such as saving the file or processing it
//   return json({ success: true });
// };

export async function action({ request }: ActionFunction) {
  const formData = await unstable_parseMultipartFormData(
    request,
    unstable_createFileUploadHandler({
      filter({ contentType }) {
        return contentType.includes("text/csv");
      },
      directory: "./public/uploads",
      maxPartSize: 1024 * 1024 * 10,
      file({ filename }) {
        return filename;
      },
    })
  );

  console.log(formData);
  return json({
    scenarioFile: `/uploads/1`,
    CBTfiles: `/uploads/2`,
  });
}
