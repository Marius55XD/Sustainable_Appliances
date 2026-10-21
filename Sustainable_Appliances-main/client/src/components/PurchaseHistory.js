import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { NavBar } from "./NavBar";
import { ACCESS_LEVEL_ADMIN, SERVER_HOST } from "../config/global_constants";

export const PurchaseHistory = (props) => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemFilter, setItemFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  useEffect(() => {
    const requesterEmail = sessionStorage.email || "";
    const accessLevel = Number(sessionStorage.accessLevel || 0);

    if (!requesterEmail) {
      setLoading(false);
      return;
    }

    axios
      .get(`${SERVER_HOST}/sales/history`, {
        params: {
          requesterEmail,
          accessLevel,
        },
      })
      .then((res) => {
        setPurchases(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(`${err.response?.data}\n${err}`);
        setLoading(false);
      });
  }, []);

  //Ensures image values are usable URLs for display
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

  //Build the list shown on screen
  const filteredAndSortedPurchases = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    const filteredPurchases = purchases.filter((purchase) => {
      if (itemFilter !== "all") {
        const hasSelectedItem = (purchase.items || []).some(
          (item) => (item.productName || "") === itemFilter
        );

        if (!hasSelectedItem) {
          return false;
        }
      }

      if (!normalizedSearchTerm) {
        return true;
      }

      const itemNames = (purchase.items || [])
        .map((item) => item.productName || "")
        .join(" ")
        .toLowerCase();

      const searchableValue = `${purchase.customerName || ""} ${purchase.customerEmail || ""} ${purchase.paypalPaymentID || ""} ${itemNames}`.toLowerCase();

      return searchableValue.includes(normalizedSearchTerm);
    });

    const sortedPurchases = [...filteredPurchases].sort((firstPurchase, secondPurchase) => {
      if (sortBy === "date-asc") {
        return new Date(firstPurchase.purchaseDate) - new Date(secondPurchase.purchaseDate);
      }

      if (sortBy === "total-desc") {
        return Number(secondPurchase.totalAmount || 0) - Number(firstPurchase.totalAmount || 0);
      }

      if (sortBy === "total-asc") {
        return Number(firstPurchase.totalAmount || 0) - Number(secondPurchase.totalAmount || 0);
      }

      return new Date(secondPurchase.purchaseDate) - new Date(firstPurchase.purchaseDate);
    });

    return sortedPurchases;
  }, [purchases, searchTerm, itemFilter, sortBy]);

  //Build unique item names for the filter dropdown
  const itemFilterOptions = useMemo(() => {
    const uniqueNames = new Set();

    purchases.forEach((purchase) => {
      (purchase.items || []).forEach((item) => {
        if (item.productName) {
          uniqueNames.add(item.productName);
        }
      });
    });

    return Array.from(uniqueNames).sort((firstName, secondName) =>
      firstName.localeCompare(secondName)
    );
  }, [purchases]);

  return (
    <div>
      <div className="navbar">
        <NavBar cart={props.cart} />
      </div>
      <div className="container">
        <h1 id="title">Purchase History</h1>
        {Number(sessionStorage.accessLevel || 0) === ACCESS_LEVEL_ADMIN ? (
          <p>Admin view</p>
        ) : null}
        
        {loading ? (
          <p>Loading purchase history...</p>
        ) : purchases.length === 0 ? (
          //Empty state when user has no purchases
          <div>
            <p>You haven't made any purchases yet.</p>
            <Link className="btn-blue" to="/DisplayAllProducts">
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Search, filter, and sort controls */}
            <div className="purchase-history-controls">
              <input
                type="text"
                className="purchase-search-input"
                placeholder="Search by customer, email, transaction ID, or product"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <div className="purchase-control-group">
                <label htmlFor="purchase-date-filter">Filter</label>
                <select
                  id="purchase-date-filter"
                  className="purchase-select"
                  value={itemFilter}
                  onChange={(event) => setItemFilter(event.target.value)}
                >
                  <option value="all">All Items</option>
                  {itemFilterOptions.map((itemName) => (
                    <option key={itemName} value={itemName}>
                      {itemName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="purchase-control-group">
                <label htmlFor="purchase-sort">Sort</label>
                <select
                  id="purchase-sort"
                  className="purchase-select"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="date-desc">Recent</option>
                  <option value="date-asc">Oldest</option>
                  <option value="total-desc">Total: High to Low</option>
                  <option value="total-asc">Total: Low to High</option>
                </select>
              </div>
            </div>

            {filteredAndSortedPurchases.length === 0 ? (
              <p className="purchase-no-results">No purchases match the current filter or search.</p>
            ) : (
              //Purchase list cards
              <div className="purchase-history">
                {filteredAndSortedPurchases.map((purchase) => (
                  <div key={purchase._id} className="purchase-card">
                    <div className="purchase-header">
                      <h3>Order #{purchase.paypalPaymentID}</h3>
                      <span className="purchase-date">
                        {new Date(purchase.purchaseDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="purchase-details">
                      <p><strong>Customer:</strong> {purchase.customerName}</p>
                      <p><strong>Email:</strong> {purchase.customerEmail}</p>
                      <p><strong>Transaction ID:</strong> {purchase.paypalPaymentID}</p>
                    </div>
                    <div className="purchase-items-mobile">
                      {/* Mobile-friendly item layout */}
                      {purchase.items.map((item, index) => (
                        <article key={`mobile-${index}`} className="purchase-item-card">
                          <div className="purchase-item-card-image">
                            {item.productImage ? (
                              <img
                                src={normalizeImageUrl(item.productImage)}
                                alt={item.productName}
                                className="purchase-item-image"
                              />
                            ) : (
                              <div className="purchase-item-image-placeholder">No image</div>
                            )}
                          </div>
                          <div className="purchase-item-card-content">
                            <p className="purchase-item-card-name">{item.productName}</p>
                            <p><strong>Quantity:</strong> {item.quantity}</p>
                            <p><strong>Price:</strong> EUR {item.price.toFixed(2)}</p>
                            <p><strong>Subtotal:</strong> EUR {(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </article>
                      ))}
                    </div>

                    <div className="purchase-items-wrap purchase-items-desktop">
                      <table className="purchase-items-table">
                        <thead>
                          <tr>
                            <th>Image</th>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchase.items.map((item, index) => (
                            <tr key={index}>
                              <td>
                                {item.productImage ? (
                                  <img
                                    src={normalizeImageUrl(item.productImage)}
                                    alt={item.productName}
                                    className="purchase-item-image"
                                  />
                                ) : (
                                  <div className="purchase-item-image-placeholder">No image</div>
                                )}
                              </td>
                              <td>{item.productName}</td>
                              <td>{item.quantity}</td>
                              <td>€{item.price.toFixed(2)}</td>
                              <td>€{(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="purchase-total">
                      <strong>Total Amount: €{purchase.totalAmount.toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="purchase-results-count">
              Showing {filteredAndSortedPurchases.length} of {purchases.length} purchase{purchases.length === 1 ? "" : "s"}
            </div>
          </>
        )}
        
        <div className="back-button">
          <Link className="btn-blue" to="/DisplayAllProducts">
            Back to Products
          </Link>
        </div>
      </div>
    </div>
  );
};
