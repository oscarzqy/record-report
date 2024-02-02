import { Link } from "@remix-run/react";

export default function Header() {
  return (
    <div className='flex justify-start text-2xl text-gray-300 font-medium py-2 px-2 gap-4 bg-gradient-to-r from-blue-500 to-blue-200'>
      <Link to='/report-collections/new' className='px-2 hover:text-blue-100'>
        Home
      </Link>
      <Link to='/report-collections/new' className='px-2 hover:text-blue-100'>
        New Report
      </Link>

      <Link to='/report-collections' className='px-2 hover:text-blue-100'>
        Reports History
      </Link>
    </div>
  );
}
