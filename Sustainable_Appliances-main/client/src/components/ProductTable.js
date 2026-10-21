import React from "react";
import { ProductTableRow } from "./ProductTableRow";
export const ProductTable = (props) => {
  return (
    <div className="grid">
        {props.products.map((product) => (
          <ProductTableRow
            key={product._id}
            product={product}
            addToCart={props.addToCart}
            onDeleteClick={props.onDeleteClick}
            onViewDetails={props.onViewDetails}
          />
        ))}
    </div>
  );
};
