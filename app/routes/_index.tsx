import type { MetaFunction } from "@remix-run/node";
import Header from "./components/Header";
import { redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "VM Training Report" },
    { name: "description", content: "Welcome to Virtual Marine Traning!" },
  ];
};

export async function loader() {
  return redirect("/report-collections");
}

export default function Index() {
  useLoaderData();
  return (
    <>
      <Header />
    </>
  );
}
