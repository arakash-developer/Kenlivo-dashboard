import * as React from "react";
import NextLink from "next/link";
import SetupTable from "@/components/Setup/SetupTable";

export default function Page() {
  return (
    <>
      <div className="breadcrumb-card">
        <h5>Product Types</h5>
        <ul className="breadcrumb">
          <li><NextLink href="/dashboard/ecommerce/"><i className="material-symbols-outlined">home</i>Dashboard</NextLink></li>
          <li>Setup</li>
          <li>Product Types</li>
        </ul>
      </div>
      <SetupTable entity="product-types" label="Product Type" />
    </>
  );
}
