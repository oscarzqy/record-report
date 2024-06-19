import { json } from "@remix-run/node";
import { getReportCollections } from "~/models/report-collection.server";
import Header from "./components/Header";
import { Link, useLoaderData } from "@remix-run/react";
import { Popup } from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { Component, useState } from "react";

export const loader = async () => {
  return json({ reportCollections: await getReportCollections() });
};
export default function ReportCollections() {
  const { reportCollections } = useLoaderData<typeof loader>();
  const [collections, setCollections] = useState(reportCollections);

  const displayPatchCount = 20;
  const [displayCollections, setDisplayCollections] = useState(
    collections.slice(0, displayPatchCount)
  );

  return (
    <>
      <Header />
      <div className='m-4'>
        <h1 className='text-2xl text-gray-700 font-medium py-2 px-2'>
          Reports History
        </h1>
        <ul className='border p-4 flex flex-wrap gap-10'>
          {displayCollections.map((collection) => (
            <li key={collection.id} className='grid-item'>
              <div className='flex gap-2'>
                <Link
                  to={collection.id.toString()}
                  className='text-blue-600 underline'
                >
                  {collection.name}
                </Link>
                <Popup
                  trigger={
                    <div className='text-red-600 my-auto'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth={1.5}
                        stroke='currentColor'
                        className='w-4 h-4 cursor-pointer'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M6 18 18 6M6 6l12 12'
                        />
                      </svg>
                    </div>
                  }
                  modal
                >
                  {(close: any) => (
                    <div className='h-40 p-4 border-2 rounded-lg bg-slate-100 flex flex-col justify-between'>
                      <div>
                        <p className='m-auto text-xl'>
                          Are you sure you want to delete collection
                        </p>
                        <p className='m-auto text-xl font-bold text-amber-700 text-center'>
                          {collection.name}
                        </p>
                      </div>
                      <div className='flex justify-center gap-24'>
                        <button
                          className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
                          onClick={async () => {
                            close();
                            const res = await fetch(
                              `/api/report-collection/${collection.id}`,
                              {
                                method: "DELETE",
                              }
                            );
                          }}
                        >
                          Yes
                        </button>
                        <button
                          className='bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded'
                          onClick={() => close()}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}
                </Popup>
              </div>
            </li>
          ))}
        </ul>
        {displayCollections.length < collections.length ? (
          <div className='w-full flex justify-center'>
            <button
              className='text-slate-500 font-bold py-2 px-4 rounded bg-gradient-to-r from-white via-blue-200 to-white w-1/2 m-0'
              onClick={() => {
                setDisplayCollections(
                  collections.slice(
                    0,
                    displayCollections.length + displayPatchCount
                  )
                );
              }}
            >
              Show More
            </button>
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
