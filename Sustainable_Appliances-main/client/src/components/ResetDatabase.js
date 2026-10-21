
import React, {useState} from "react"
import {Redirect, Link} from "react-router-dom"
import axios from "axios"  // For making HTTP requests
import {Button} from "../components/Button"
import {SERVER_HOST} from "../config/global_constants"

export const ResetDatabase = props =>
{
    const [isReset, setIsReset] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")


    const resetEverything = () =>
    {
        //Gets user's access level from session
        const requesterAccessLevel = parseInt(sessionStorage.accessLevel || 0)
        setErrorMessage("")

        //Send reset request to server
        axios.post(`${SERVER_HOST}/users/reset_user_collection`, null, {
            params: { accessLevel: requesterAccessLevel }
        })
        .then(res =>
        {
            //Clears all browser storage
            localStorage.clear()
            sessionStorage.clear()
            setIsReset(true)
        })
        .catch(err =>
        {
            //If the reset fails, show error message
            const serverMessage = err.response?.data
            const fallback = `Unable to reset database. Please try again.`
            setErrorMessage(typeof serverMessage === "string" ? serverMessage : fallback)
            console.log(`${serverMessage || err.message}\n${err}`)
        })
    }


    return (
    <div className="container reset-db-wrap">

        {/*Redirects to products page after successful reset*/}
        {isReset ? <Redirect to="/DisplayAllProducts"/> : null}

        <section className="reset-db-card" aria-labelledby="reset-db-title">
            <header className="reset-db-head">
                <span className="reset-db-badge">Admin Only</span>
                <h2 id="reset-db-title">Reset Entire Database</h2>
                <p className="reset-db-lead">
                    Use this only when you need a fresh database.
                </p>
            </header>

            <div className="reset-db-impact">
                <p className="reset-db-impact-title">Reset Impact</p>
                <ul className="reset-db-list">
                    <li>All users, products, and sales records are permanently removed.</li>
                    <li>Uploaded profile photos and product images are deleted from storage.</li>
                    <li>Your current login session is cleared from this browser.</li>
                    <li>The default admin account is recreated as a@a.com.</li>
                </ul>
            </div>

            <div className="reset-db-actions">
                <Button value="Reset Entire Database" className="btn-red reset-db-primary" onClick={resetEverything}/>
                <Link className="btn-blue reset-db-secondary" to={"/DisplayAllProducts"}>Cancel</Link>
            </div>

            {errorMessage ? <p className="error" role="alert">{errorMessage}</p> : null}
        </section>
    </div>
    )
}