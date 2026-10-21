import React, {useState, useEffect} from "react"
import {Redirect, Link} from "react-router-dom"
import axios from "axios"
import {Button} from "./Button"
import {SERVER_HOST} from "../config/global_constants"



export const ViewProduct = props =>
{
    const [image, setImage] = useState([])
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [name, setName] = useState("")
    const [category, setCategory] = useState("")
    const [energyRating, setEnergyRating] = useState("")
    const [price, setPrice] = useState("")
    const [stockLevel, setStockLevel] = useState("")
    const [redirectToDisplayAllProducts, setRedirectToDisplayAllProducts] = useState(false)

    useEffect(() =>
    {
        axios.get(`${SERVER_HOST}/products/${props.match.params.id}`)
        .then(res =>
        {
            const productImages = Array.isArray(res.data.image)
                ? res.data.image
                : (res.data.image ? [res.data.image] : [])

            setImage(productImages)
            setSelectedImageIndex(0)
            setName(res.data.name)
            setCategory(res.data.category)
            setEnergyRating(res.data.energyRating)
            setPrice(res.data.price)
            setStockLevel(res.data.stockLevel)
        })
        .catch(err => console.log(`${err.response.data}\n${err}`))
    }, [props.match.params.id])

    const displayedImages = image.length === 0
        ? []
        : [
            image[selectedImageIndex],
            ...image.filter((_, index) => index !== selectedImageIndex)
          ]

    const getOriginalIndex = (selectedImageUrl) => image.findIndex((img) => img === selectedImageUrl)


    

    return (
        
    <div className="container">
        {redirectToDisplayAllProducts ? <Redirect to="/DisplayAllProducts"/> : null}  
    
        <form className="product-form">
            <div className="product-image-section">
                <label>Images</label>
                <div className="preview">
                {displayedImages.length > 0
                    ? displayedImages.map((img, index) => (
                        <img
                        key={index}
                        src={img}
                        alt="Selected product"
                        className={index !== 0 && image[selectedImageIndex] === img ? "active-product-thumbnail" : ""}
                        onClick={() => {
                            const originalIndex = getOriginalIndex(img)
                            if (originalIndex !== -1)
                            {
                                setSelectedImageIndex(originalIndex)
                            }
                        }}
                        />
                    ))
                    : null}
                </div>    
            </div>

            <div className="product-details-section">
                <label>Name</label>
                <input type="text" name="name" value={name} readOnly className="view-only-input" />
        
                <label>Category</label>
                <input type="text" name="category" readOnly value={category} className="view-only-input" />
        
                <label>Energy Rating</label>
                <input type="text" name="energyRating" value={energyRating} readOnly className="view-only-input" />
                
                <label>Price</label>
                <input type="text" name="price" value={`€${price}`} readOnly className="view-only-input price-input" />
        
                <label>Stock Level</label>
                <input type="text" name="stockLevel" value={stockLevel} readOnly className="view-only-input" />
        
                <div className="form-actions">
                    <Link className="btn-blue" to={"/DisplayAllProducts"}>View All Products</Link>
                </div>
            </div>
        </form>
    </div>
    )
}