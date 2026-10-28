import * as React from "react";
import NextLink from "next/link";
import ViewProduct from "@/components/eCommerce/ViewProduct";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <>
      <div className="breadcrumb-card">
        <h5>Product Details</h5>
        <ul className="breadcrumb">
          <li>
            <NextLink href="/dashboard/ecommerce/">
              <i className="material-symbols-outlined">home</i>
              Dashboard
            </NextLink>
          </li>
          <li>eCommerce</li>
          <li>
            <NextLink href="/ecommerce/products-list/">Products List</NextLink>
          </li>
          <li>Product Details</li>
        </ul>
      </div>

      <ViewProduct id={params.id} />
    </>
  );
}
