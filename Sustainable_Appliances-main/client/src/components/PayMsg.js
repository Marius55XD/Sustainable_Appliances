import React, {useState, useEffect} from "react"
import {Link} from "react-router-dom"
import {NavBar} from "./NavBar"


export const PayMsg = props =>
{
    const [heading, setHeading] = useState("")
    const [message, setMessage] = useState("")
    const [buttonColour, setButtonColour] = useState("btn-red")
    const [buttonText, setButtonText] = useState("Continue")
    const [statusType, setStatusType] = useState("error")
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")


    useEffect(() =>
    {
        if(props.match.params.messageType === "SUCCESS")
        {
            setHeading("Payment Successful")
            setMessage("Your PayPal payment has been processed successfully. Thank you for your purchase.")
            setButtonColour("btn-green")
            setButtonText("Continue")
            setStatusType("success")
        }
        else if(props.match.params.messageType === "CANCEL")
        {
            setHeading("Checkout Session Closed")
            setMessage("You exited PayPal before final confirmation. No payment was taken, and your cart remains unchanged.")
            setButtonColour("btn-blue")
            setButtonText("Return to Products")
            setStatusType("cancel")
        }
        else if(props.match.params.messageType === "ERROR")
        {
            setHeading("Payment Failed")
            setMessage("We were unable to process your PayPal payment at this time. Please try again shortly.")
            setButtonText("Try Again")
            setStatusType("error")
        }
        else
        {
            console.log("The 'messageType' prop that was passed into the PayMsg component is invalid. It must be one of the following: PayMsg.messageType.SUCCESS, PayMsg.messageType.CANCEL or PayMsg.messageType.ERROR")
        }

    }, [props.match.params.messageType])


    return (
    <div>
        <div className="navbar">
            <NavBar cart={cart} />
        </div>
        <div className="payPalMessageWrap">
            <div className={`payPalMessage payPalMessage--${statusType}`}>
                <h3>{heading}</h3>
                <p>{message}</p>

                {props.match.params.messageType === "SUCCESS" ? (
                    <div className="payPalPaymentMeta">
                        <p>Transaction confirmation ID:</p>
                        <span className="payPalPaymentID">{props.match.params.payPalPaymentID}</span>
                    </div>
                ) : null}

                <div className="payPalMessageActions">
                    <Link className={buttonColour} to={"/DisplayAllProducts"}>{buttonText}</Link>
                </div>
            </div>
        </div>
    </div>
    )
}
