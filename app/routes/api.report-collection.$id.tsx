import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { deleteReportCollection } from "~/models/report-collection.server";

export let loader: LoaderFunction = async ({ request }) => {
  // Return any data needed for rendering the page
  return json({});
};

export async function action({ request, params }: ActionFunction) {
  console.log(params);
  if (request.method === "DELETE") {
    const res = await deleteReportCollection(parseInt(params.id));
    return json({
      success: res.success,
      message: res.message,
    });
  }
}
