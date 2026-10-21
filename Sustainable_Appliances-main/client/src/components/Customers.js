import React, { useEffect, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import axios from "axios";
import { NavBar } from "./NavBar";
import { ACCESS_LEVEL_ADMIN, SERVER_HOST } from "../config/global_constants";

export const Customers = (props) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const accessLevel = Number(sessionStorage.accessLevel || 0);

  useEffect(() => {
    if (accessLevel !== ACCESS_LEVEL_ADMIN) {
      setLoading(false);
      return;
    }

    //Requests customer data from the server
    axios
      .get(`${SERVER_HOST}/users`, {
        params: { accessLevel },
      })
      .then((res) => {
        setCustomers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(`${err.response?.data}\n${err}`);
        setLoading(false);
      });
  }, [accessLevel]);

  const handleDeleteClick = (customer) => {
    setDeleteConfirm(customer);
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirm) return;

    axios
      .delete(`${SERVER_HOST}/users/${deleteConfirm._id}`, {
        params: { accessLevel },
      })
      .then(() => {
        //Removes deleted customer from the displayed list
        setCustomers(customers.filter((c) => c._id !== deleteConfirm._id));
        setDeleteConfirm(null);
      })
      .catch((err) => {
        console.error(`${err.response?.data}\n${err}`);
        alert("Failed to delete customer");
        setDeleteConfirm(null);
      });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  //Redirects non-admin users to products page
  if (accessLevel !== ACCESS_LEVEL_ADMIN) {
    return <Redirect to="/DisplayAllProducts" />;
  }

  return (
    <div>
      <div className="navbar">
        <NavBar cart={props.cart} />
      </div>

      <div className="container">
        <h1 id="title">Customers</h1>

        {loading ? (
          <p>Loading customers...</p>
        ) : customers.length === 0 ? (
          <p>No customers found.</p>
        ) : (
          <div className="simple-card-grid">
            {customers.map((customer) => {
              const roleLabel = customer.accessLevel === ACCESS_LEVEL_ADMIN ? "Admin" : "Customer";

              return (
                <div key={customer._id} className="simple-card customer-simple-card">
                  <div className="simple-card-head">
                    <h3 className="simple-card-title">{customer.name}</h3>
                    <span
                      className={`simple-badge ${
                        roleLabel === "Admin" ? "simple-badge-admin" : "simple-badge-user"
                      }`}
                    >
                      {roleLabel}
                    </span>
                  </div>

                  <p className="simple-row">
                    <strong>Email</strong>
                    <span>{customer.email}</span>
                  </p>

                  <p className="simple-row">
                    <strong>Access</strong>
                    <span>{roleLabel}</span>
                  </p>

                  <p className="simple-row">
                    <strong>ID</strong>
                    <span>{customer._id}</span>
                  </p>

                <button
                  onClick={() => handleDeleteClick(customer)}
                  className="btn-red-small"
                >
                  Delete
                </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="back-button">
          <Link className="btn-blue" to="/DisplayAllProducts">
            Back to Products
          </Link>
        </div>
      </div>

      {deleteConfirm && (
        <div className="deleteModalOverlay">
          <div className="deleteModal">
            <h3>Delete Customer</h3>
            <p>
              Are you sure you want to delete customer <strong>{deleteConfirm.name}</strong> ({deleteConfirm.email})?
            </p>
            <p>This action cannot be undone.</p>
            <div className="deleteModalActions">
              <button onClick={handleDeleteCancel} className="btn-blue">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className="btn-red">
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
