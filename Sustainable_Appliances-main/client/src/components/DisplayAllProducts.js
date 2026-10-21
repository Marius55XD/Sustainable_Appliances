import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ProductTable } from "./ProductTable";
import { SERVER_HOST } from "../config/global_constants";
import { NavBar } from "./NavBar";
import { ACCESS_LEVEL_ADMIN } from "../config/global_constants";

export const DisplayAllProducts = (props) => {
  const [products, setProducts] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterEnergyRating, setFilterEnergyRating] = useState("");
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    axios
      .get(`${SERVER_HOST}/products`)
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => console.log(`${err.response.data}\n${err}`));
  }, []);

  //Get unique categories and energy ratings for filter dropdowns
  const categories = [...new Set(products.map((p) => p.category))].filter(Boolean);
  const energyRatings = [...new Set(products.map((p) => p.energyRating))].filter(Boolean);

  // Apply search, filter, and sort together
  const getFilteredAndSortedProducts = () => {
    let filtered = [...products];

    //Apply search
    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    //Apply category filter
    if (filterCategory) {
      filtered = filtered.filter((product) => product.category === filterCategory);
    }

    //Apply energy rating filter
    if (filterEnergyRating) {
      filtered = filtered.filter((product) => product.energyRating === filterEnergyRating);
    }

    //Apply sorting
    if (sortBy === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "price-asc") {
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === "stock-asc") {
      filtered.sort((a, b) => parseFloat(a.stockLevel) - parseFloat(b.stockLevel));
    } else if (sortBy === "stock-desc") {
      filtered.sort((a, b) => parseFloat(b.stockLevel) - parseFloat(a.stockLevel));
    }

    return filtered;
  };

  const displayedProducts = getFilteredAndSortedProducts();

  const handleDeleteClick = (product) => {
    setDeleteConfirm(product);
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setSelectedImageIndex(0);
  };

  const handleCloseDetails = () => {
    setSelectedProduct(null);
    setSelectedImageIndex(0);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirm) return;

    axios
      .delete(`${SERVER_HOST}/products/${deleteConfirm._id}`)
      .then(() => {
        setProducts(products.filter((p) => p._id !== deleteConfirm._id));
        setDeleteConfirm(null);
      })
      .catch((err) => {
        console.log(`${err.response?.data}\n${err}`);
        alert("Failed to delete product");
        setDeleteConfirm(null);
      });
  };

  return [
    <div key={1} className="navbar">
      {" "}
      <NavBar cart={props.cart} />
    </div>,

    <div key={2} className="container">
     
      <h1 id="title">Sustainable Home Appliances</h1>
      
      {/*Search, Filter, and Sort Controls */}
      <div className="controls-section">
        <div className="search-box">
          <label>Search Products</label>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-sort-group">
          <div className="filter-box">
            <label>Filter by Category</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-box">
            <label>Filter by Energy Rating</label>
            <select value={filterEnergyRating} onChange={(e) => setFilterEnergyRating(e.target.value)}>
              <option value="">All Ratings</option>
              {energyRatings.map((rating, index) => (
                <option key={index} value={rating}>
                  {rating}
                </option>
              ))}
            </select>
          </div>

          <div className="sort-box">
            <label>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="">Default</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="stock-asc">Stock (Low to High)</option>
              <option value="stock-desc">Stock (High to Low)</option>
            </select>
          </div>
        </div>

        <div className="results-info">
          Showing {displayedProducts.length} of {products.length} products
        </div>
      </div>

      <div className="table-wrap">
        <ProductTable
          products={displayedProducts}
          addToCart={props.addToCart}
          onDeleteClick={handleDeleteClick}
          onViewDetails={handleViewDetails}
        />

        {parseInt(sessionStorage.accessLevel) === ACCESS_LEVEL_ADMIN ? (
          <div className="add-wrap">
            <Link className="btn-blue" to={"/AddProduct"}>
              Add New Product
            </Link>
          </div>
        ) : null}
      </div>

      {deleteConfirm && (
        <div className="deleteModalOverlay">
          <div className="deleteModal">
            <h3>Delete Product</h3>
            <p>
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
            </p>
            <p>This action cannot be undone.</p>
            <div className="deleteModalActions">
              <button onClick={handleDeleteCancel} className="btn-blue">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className="btn-red">
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="productDetailsModalOverlay" onClick={handleCloseDetails}>
          <div className="productDetailsModal" onClick={(event) => event.stopPropagation()}>
            <div className="productDetailsHeader">
              <h3>{selectedProduct.name}</h3>
              <button className="btn-blue-small" onClick={handleCloseDetails}>
                Close
              </button>
            </div>

            <div className="productDetailsBody">
              <div className="productDetailsImageArea">
                {(() => {
                  const images = Array.isArray(selectedProduct.image)
                    ? selectedProduct.image
                    : (selectedProduct.image ? [selectedProduct.image] : []);

                  const activeImage = images[selectedImageIndex];

                  return (
                    <>
                      {activeImage ? (
                        <img
                          src={activeImage}
                          alt={selectedProduct.name}
                          className="productDetailsMainImage"
                        />
                      ) : (
                        <div className="productDetailsNoImage">No Image</div>
                      )}

                      {images.length > 1 ? (
                        <div className="productDetailsThumbs">
                          {images.map((imageUrl, imageIndex) => (
                            <img
                              key={imageIndex}
                              src={imageUrl}
                              alt={`${selectedProduct.name} ${imageIndex + 1}`}
                              className={`productDetailsThumb ${selectedImageIndex === imageIndex ? "is-active" : ""}`}
                              onClick={() => setSelectedImageIndex(imageIndex)}
                            />
                          ))}
                        </div>
                      ) : null}
                    </>
                  );
                })()}
              </div>

              <div className="productDetailsInfo">
                <p><span>Name:</span> {selectedProduct.name}</p>
                <p><span>Category:</span> {selectedProduct.category}</p>
                <p><span>Energy Rating:</span> {selectedProduct.energyRating}</p>
                <p><span>Price:</span> EUR {Number(selectedProduct.price || 0).toFixed(2)}</p>
                <p><span>Stock Level:</span> {selectedProduct.stockLevel}</p>
                <p><span>Product ID:</span> {selectedProduct._id}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
  ];
};
