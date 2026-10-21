import React, { useState, useEffect } from "react";
import { Redirect, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "./Button";
import { SERVER_HOST } from "../config/global_constants";

export const AddProduct = (props) => {
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [energyRating, setEnergyRating] = useState("");
  const [price, setPrice] = useState("");
  const [stockLevel, setStockLevel] = useState("");
  const [redirectToDisplayAllProducts, setRedirectToDisplayAllProducts] =
    useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    return () => {
      imagePreviews.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    };
  }, [imagePreviews]);

  // helper to remove a single field error when the user starts typing
  const clearError = (field) => {
    setErrors(prev => {
      if (!prev[field]) return prev;
      const { [field]: removed, ...rest } = prev;
      return rest;
    });
  };

  //https://stackoverflow.com/questions/66428771/upload-img-with-e-target-files0-to-url
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    imagePreviews.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));

    if (files.length === 0) {
      setImages([]);
      setImagePreviews([]);
      return;
    }

    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setImages(files);
    setImagePreviews(imageUrls);
    clearError("image");
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    clearError("name");
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    clearError("category");
  };

  const handlePriceChange = (e) => {
    setPrice(e.target.value);
    clearError("price");
  };
  const handleEnergyRatingChange = (e) => {
    setEnergyRating(e.target.value);
    clearError("energyRating");
  };

  const handleStockLevelChange = (e) => {
    setStockLevel(e.target.value);
    clearError("stockLevel");
  };

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Name is required.";
    if (!category.trim()) errs.category = "Category is required.";
    if (!energyRating.trim()) errs.energyRating = "Energy rating is required.";
    if (price === "" || isNaN(price) || Number(price) < 0)
      errs.price = "Price must be a non‑negative number.";
    if (stockLevel === "" || isNaN(stockLevel) || Number(stockLevel) < 0)
      errs.stockLevel = "Stock level must be a non‑negative number.";
    if (images.length === 0) errs.image = "Please select at least one image.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    images.forEach((file) => formData.append("images", file));
    formData.append("name", name);
    formData.append("category", category);
    formData.append("energyRating", energyRating);
    formData.append("price", price);
    formData.append("stockLevel", stockLevel);

    axios
      .post(`${SERVER_HOST}/products`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        imagePreviews.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
        setImages([]);
        setImagePreviews([]);
        setRedirectToDisplayAllProducts(true);
      })
      .catch((err) => console.log(`${err.response?.data || err.message}\n${err}`));
  };

  return (
    <div className="container">
      {redirectToDisplayAllProducts ? (
        <Redirect to="/DisplayAllProducts" />
      ) : null}

      <form className="product-form">
        <div className="product-image-section">
            <label>Image</label>
            <input
            autoFocus
            type="file"
            name="image"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className={errors.image ? "error" : ""}
            />
            {errors.image && <div className="error">{errors.image}</div>}
            <div className="preview">
            {imagePreviews.length > 0
              ? imagePreviews.map((img, index) => (
                    <img
                    key={index}
                    src={img}
                    alt="Selected product"
                    />
                ))
                : null}
            </div>
        </div>

        <div className="product-details-section">
            <label>Name</label>
            <input
            type="text"
            name="name"
            value={name}
            onChange={handleNameChange}
            className={errors.name ? "error" : ""}
            />
            {errors.name && <div className="error">{errors.name}</div>}

            <label>Category</label>
            <input
            type="text"
            name="category"
            value={category}
            onChange={handleCategoryChange}
            className={errors.category ? "error" : ""}
            />
            {errors.category && <div className="error">{errors.category}</div>}

            <label>Energy Rating</label>
            <input
            type="text"
            name="energyRating"
            value={energyRating}
            onChange={handleEnergyRatingChange}
            className={errors.energyRating ? "error" : ""}
            />
            {errors.energyRating && <div className="error">{errors.energyRating}</div>}

            <label>Price</label>
            <input
            type="text"
            name="price"
            value={price}
            onChange={handlePriceChange}
            className={errors.price ? "error" : ""}
            />
            {errors.price && <div className="error">{errors.price}</div>}

            <label>Stock Level</label>
            <input
            type="text"
            name="stockLevel"
            value={stockLevel}
            onChange={handleStockLevelChange}
            className={errors.stockLevel ? "error" : ""}
            />
            {errors.stockLevel && <div className="error">{errors.stockLevel}</div>}

            <div className="form-actions">
                <Button value="Add Product" className="btn-green" onClick={handleSubmit} />
                <Link className="btn-red" to={"/DisplayAllProducts"}>
                Cancel
                </Link>
            </div>
        </div>
      </form>
    </div>
  );
};
