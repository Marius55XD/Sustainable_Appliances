import React, {useState, useEffect} from "react"
import {Redirect} from "react-router-dom"
import axios from "axios"
import {SERVER_HOST} from "../config/global_constants"

export const DeleteProduct = props =>
{
    const [redirectToDisplayAllProducts, setRedirectToDisplayAllProducts] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")


    useEffect(() =>
    {
        window.scrollTo(0, 0)
    }, [props.match.params.id])


    const confirmDelete = () =>
    {
        setIsDeleting(true)
        setErrorMessage("")

        //Sends DELETE request to the server with the product id
        axios.delete(`${SERVER_HOST}/products/${props.match.params.id}`)
        .then(() =>
        {
            setRedirectToDisplayAllProducts(true)
        })
        .catch(err =>
        {
            //If deletion fails display error message from server
            const serverMessage = err?.response?.data
            setErrorMessage(serverMessage || "Unable to delete this product right now. Please try again.")
            setIsDeleting(false)
        })
    }


    return (
    <div>
        {/*If user confirmed deletion it redirects to products list */}
        {redirectToDisplayAllProducts ? <Redirect to="/DisplayAllProducts"/> : null}

        <div className="deleteModalOverlay">
            <div className="deleteModal">
                <h3>Delete Product</h3>
                <p>Are you sure you want to delete this product? This action cannot be undone.</p>

                {errorMessage ? <p className="deleteModalError">{errorMessage}</p> : null}

                <div className="deleteModalActions">
                    <button className="btn-red" onClick={confirmDelete} disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Yes, Delete"}
                    </button>
                    <button className="btn-blue" onClick={() => setRedirectToDisplayAllProducts(true)} disabled={isDeleting}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
    )
}