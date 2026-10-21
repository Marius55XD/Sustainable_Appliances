import React, {useState} from "react"
import axios from "axios"
import {Redirect, Link} from "react-router-dom"
import {SANDBOX_CLIENT_ID, SERVER_HOST, ACCESS_LEVEL_GUEST} from "../config/global_constants"
import {PayPalButtons, PayPalScriptProvider} from "@paypal/react-paypal-js"


export const BuyProduct = props =>
{
    const [redirectToPayPalMessage, setRedirectToPayPalMessage] = useState(false)
    const [payPalMessageType, setPayPalMessageType] = useState(null)
    const [payPalOrderID, setPayPalOrderID] = useState(null)

    const accessLevel = Number(sessionStorage.accessLevel ?? ACCESS_LEVEL_GUEST)
    const isLoggedIn = accessLevel > ACCESS_LEVEL_GUEST


    const createOrder = (data, actions) =>
    {
        //PayPal asks for order details
        return actions.order.create({purchase_units: [{amount: {value: props.price}}]})
    }


    const onApprove = paymentData =>
    {
        //Sends the payment details to the server to record the sale
        axios.post(`${SERVER_HOST}/sales/${paymentData.orderID}/${props.productID}/${props.price}`, {}, {headers: {"authorization": localStorage.token}})
        .then(res =>
        {
            setPayPalMessageType("SUCCESS")
            setPayPalOrderID(paymentData.orderID)
            setRedirectToPayPalMessage(true)
        })
        .catch(err =>
        {
            setPayPalMessageType("ERROR")
            setRedirectToPayPalMessage(true)
        })
    }

    //Handles PayPal payment errors
    const onError = err =>
    {
        setPayPalMessageType("ERROR")
        setRedirectToPayPalMessage(true)
    }

    //Handles when user cancels the PayPal payment
    const onCancel = cancelData =>
    {
        // The user pressed the Paypal checkout popup window cancel button or closed the Paypal checkout popup window
        setPayPalMessageType("CANCEL")
        setRedirectToPayPalMessage(true)
    }


    return (
    <div>
        {/* Redirect to payment result page after payment is processed */}
        {redirectToPayPalMessage ? <Redirect to= {`/PayPalMessage/${payPalMessageType}/${payPalOrderID || 'null'}`}/> : null}            
    
        {/* Show PayPal buttons if user is logged in, otherwise show login prompt */}
        {isLoggedIn ? (
            <PayPalScriptProvider options={{currency: "EUR", "client-id": SANDBOX_CLIENT_ID}}>
                <PayPalButtons style={{layout: "horizontal", tagline: false}} createOrder={createOrder} onApprove={onApprove} onError={onError} onCancel={onCancel}/>
            </PayPalScriptProvider>
        ) : (
            <div className="login-required">
                <p>Please log in to purchase this product</p>
                <Link 
                  className="btn-green" 
                  to="/Login"
                  style={{ 
                    minHeight: '32px', 
                    maxHeight: '32px',
                    padding: '6px 14px', 
                    fontSize: '11px',
                    margin: '0'
                  }}
                >
                    Log In
                </Link>
            </div>
        )}
    </div>
    )

}