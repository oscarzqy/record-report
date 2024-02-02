import { getScenarioProgressAll } from "~/models/scenario-progress.server";

export const loader = async ({ params }: any) => {
  const data = await getScenarioProgressAll(parseInt(params.id));
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
