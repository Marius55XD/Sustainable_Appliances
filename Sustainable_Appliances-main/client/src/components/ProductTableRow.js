import React from "react";
import { Link } from "react-router-dom";
import { ACCESS_LEVEL_ADMIN, SERVER_HOST } from "../config/global_constants";

export const ProductTableRow = (props) => {
  const normalizeImageUrl = (imageValue) => {
    if (!imageValue) {
      return "";
    }

    if (
      imageValue.startsWith("http://") ||
      imageValue.startsWith("https://") ||
      imageValue.startsWith("data:") ||
      imageValue.startsWith("blob:")
    ) {
      return imageValue;
    }

    if (imageValue.startsWith("/")) {
      return `${SERVER_HOST}${imageValue}`;
    }

    return `${SERVER_HOST}/uploads/${imageValue}`;
  };

  const rawProductImage = Array.isArray(props.product.image)
    ? props.product.image[0]
    : props.product.image;
  const productImage = normalizeImageUrl(rawProductImage);
  const isAdmin = Number(sessionStorage.accessLevel || 0) >= ACCESS_LEVEL_ADMIN;

  const openDetails = () => {
    if (props.onViewDetails) {
      props.onViewDetails(props.product);
    }
  };

  const stopCardClick = (event) => {
    event.stopPropagation();
  };

  return (
    <article
      className="card card-clickable"
      onClick={openDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetails();
        }
      }}
    >
      {productImage ? (
        <img className="card-image" src={productImage} alt="Product" />
      ) : (
        <div className="card-image card-image-placeholder">No Image</div>
      )}

      <div className="card-content">
        <h3 className="card-title">{props.product.name}</h3>
        <p className="card-category">{props.product.category}</p>

        <div className="card-details">
          <p>
            <span>Energy Rating:</span> {props.product.energyRating}
          </p>
          <p>
            <span>Price:</span> EUR {Number(props.product.price || 0).toFixed(2)}
          </p>
        </div>

        <p className="card-hint">Click card to view full details</p>

        {props.product.stockLevel <= 0 ? (
          <span className="sold-out">Sold Out</span>
        ) : (
          <button
            onClick={(event) => {
              stopCardClick(event);
              props.addToCart(props.product);
            }}
            className="btn-blue-small"
          >
            Add to Cart
          </button>
        )}

        {isAdmin ? (
          <div className="actions">
            <Link
              className="btn-green"
              to={"/EditProduct/" + props.product._id}
              onClick={stopCardClick}
            >
              Edit
            </Link>
            <button
              className="btn-red"
              onClick={(event) => {
                stopCardClick(event);
                props.onDeleteClick(props.product);
              }}
            >
              Delete
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
};
