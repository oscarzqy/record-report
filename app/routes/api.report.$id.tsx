import { getPersonReport } from "~/models/report-collection.server";

export const loader = async ({ params }: any) => {
  const data = await getPersonReport(parseInt(params.id));
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
