// Import React and necessary libraries
import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import axios from "axios";  // For making HTTP requests
import { NavBar } from "./NavBar";
import { SANDBOX_CLIENT_ID, SERVER_HOST, ACCESS_LEVEL_GUEST } from "../config/global_constants";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";  // PayPal payment integration

export const ShoppingCart = (props) => {
  const { cart, removeCart, clearCart } = props;
  const [redirectToPayPalMessage, setRedirectToPayPalMessage] = useState(false);
  const [payPalMessageType, setPayPalMessageType] = useState(null);
  const [payPalOrderID, setPayPalOrderID] = useState(null);

  //Checks if user is logged in
  const accessLevel = Number(sessionStorage.accessLevel ?? ACCESS_LEVEL_GUEST);
  const isLoggedIn = accessLevel > ACCESS_LEVEL_GUEST;

  //Calculate total price
  let total = 0;
  cart.forEach((item) => {
    total += item.price * item.quantity;
  });

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [{ amount: { value: total.toFixed(2) } }],
    });
  };

  //Successful PayPal payment
  const onApprove = (paymentData) => {
    // Prepare items array for database
    const items = cart.map((item) => ({
      productId: item._id,
      productName: item.name,
      productImage: item.image?.[0] || "",
      quantity: item.quantity,
      price: item.price,
    }));

    //stock deduction
    const stockItems = cart.map((item) => ({
      productId: item._id,
      quantity: item.quantity,
    }));

    //Creates purchase record data
    const purchaseData = {
      paypalPaymentID: paymentData.orderID,
      customerName: sessionStorage.name || "Guest",
      customerEmail: sessionStorage.email || "guest@example.com",
      items: items,
      totalAmount: total,
    };

    Promise.all([
      axios.post(`${SERVER_HOST}/products/decrement-stock`, { items: stockItems }),
      axios.post(`${SERVER_HOST}/sales`, purchaseData),
    ])
      .then(() => {
        clearCart();
        setPayPalMessageType("SUCCESS");
        setPayPalOrderID(paymentData.orderID);
        setRedirectToPayPalMessage(true);
      })
      .catch((err) => {
        console.error(err);
        setPayPalMessageType("ERROR");
        setRedirectToPayPalMessage(true);
      });
  };

  const onError = (err) => {
    setPayPalMessageType("ERROR");
    setRedirectToPayPalMessage(true);
  };

  const onCancel = (cancelData) => {
    setPayPalMessageType("CANCEL");
    setRedirectToPayPalMessage(true);
  };

  if (redirectToPayPalMessage) {
    return (
      <Redirect
        to={`/PayPalMessage/${payPalMessageType}/${payPalOrderID || "null"}`}
      />
    );
  }

  if (cart.length === 0) {
    return (
      <div>
        <div className="navbar">
          <NavBar cart={cart} />
        </div>
        <div className="container">
          <h1 id="title">Shopping Cart</h1>
          <p>Your cart is empty.</p>
          <Link className="btn-blue" to="/DisplayAllProducts">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="navbar">
        <NavBar cart={cart} />
      </div>
      <div className="container">
        <h1 id="title">Shopping Cart</h1>
        <div className="simple-card-grid">
          {cart.map((item) => (
            <div key={item._id} className="simple-card cart-simple-card">
              <div className="simple-card-head">
                <h3 className="simple-card-title">{item.name}</h3>
                <span className="simple-badge simple-badge-neutral">
                  x{item.quantity}
                </span>
              </div>

              <p className="simple-row">
                <strong>Price</strong>
                <span>€{Number(item.price || 0).toFixed(2)}</span>
              </p>

              <p className="simple-row">
                <strong>Quantity</strong>
                <span>{item.quantity}</span>
              </p>

              <p className="simple-row simple-total-row">
                <strong>Subtotal</strong>
                <span>€{(item.price * item.quantity).toFixed(2)}</span>
              </p>

              <button
                onClick={() => removeCart(item._id)}
                className="btn-red-small"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Total: €{total.toFixed(2)}</h2>
          <div className="cart-actions">
            <Link className="btn-blue small-btn" to="/DisplayAllProducts">
              Continue Shopping
            </Link>
            {isLoggedIn ? (
              <PayPalScriptProvider
                options={{ currency: "EUR", "client-id": SANDBOX_CLIENT_ID }}
              >
                <PayPalButtons
                  style={{ layout: "horizontal", tagline: false, height: 38 }}
                  createOrder={createOrder}
                  onApprove={onApprove}
                  onError={onError}
                  onCancel={onCancel}
                />
              </PayPalScriptProvider>
            ) : (
              <div className="login-required">
                <p>Please log in to complete your purchase</p>
                <Link className="btn-green btn-login-small" to="/Login">
                  Log In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};