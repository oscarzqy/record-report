import { json } from "@remix-run/node";

import { getReportCollections } from "~/models/report-collection.server";
import Header from "./components/Header";
import { Link, useLoaderData } from "@remix-run/react";

export const loader = async () => {
  return json({ reportCollections: await getReportCollections() });
};
export default function ReportCollections() {
  const { reportCollections } = useLoaderData<typeof loader>();
  return (
    <>
      <Header />
      <div className='m-4'>
        <h1 className='text-2xl text-gray-700 font-medium py-2 px-2'>
          Reports History
        </h1>
        <ul className='border p-4'>
          {reportCollections.map((collection) => (
            <li key={collection.id}>
              <Link
                to={collection.id.toString()}
                className='text-blue-600 underline'
              >
                {collection.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
