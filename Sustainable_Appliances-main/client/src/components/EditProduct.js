import React, {useState, useEffect, useRef} from "react"
import {Redirect, Link} from "react-router-dom"
import axios from "axios"
import {Button} from "./Button"
import {SERVER_HOST} from "../config/global_constants"


export const EditProduct = props =>
{
    const [existingImages, setExistingImages] = useState([])
    const [newImageFiles, setNewImageFiles] = useState([])
    const [newImagePreviews, setNewImagePreviews] = useState([])
    const [name, setName] = useState("")
    const [category, setCategory] = useState("")
    const [energyRating, setEnergyRating] = useState("")
    const [price, setPrice] = useState("")
    const [stockLevel, setStockLevel] = useState("")
    const [redirectToDisplayAllProducts, setRedirectToDisplayAllProducts] = useState(false)
    const [errors, setErrors] = useState({});
    const newImagePreviewsRef = useRef([])

    const clearError = (field) => {
        setErrors(prev => {
            if (!prev[field]) return prev;
            const { [field]: removed, ...rest } = prev;
            return rest;
        });
    };

    useEffect(() =>
    {
        //Get the product data from the server using the ID from URL
        axios.get(`${SERVER_HOST}/products/${props.match.params.id}`)
        .then(res =>
        {
            const storedImages = Array.isArray(res.data.image)
                ? res.data.image
                : (res.data.image ? [res.data.image] : [])

            // Ignore temporary preview URLs that cannot persist across page loads.
            setExistingImages(storedImages.filter(imageUrl => typeof imageUrl === "string" && !imageUrl.startsWith("blob:")))
            setName(res.data.name)
            setCategory(res.data.category)
            setEnergyRating(res.data.energyRating)
            setPrice(res.data.price)
            setStockLevel(res.data.stockLevel)
        })
        .catch(err => console.log(`${err.response.data}\n${err}`))
    }, [props.match.params.id])

    useEffect(() =>
    {
        newImagePreviewsRef.current = newImagePreviews
    }, [newImagePreviews])

    useEffect(() =>
    {
        return () =>
        {
            newImagePreviewsRef.current.forEach(previewUrl => URL.revokeObjectURL(previewUrl))
        }
    }, [])

    const handleImageChange = (e) => {
        //Converts FileList to array
        const files = Array.from(e.target.files);
        if (files.length === 0) {
            return;
        }
        //Creates preview URLs for selected images
        const previewUrls = files.map((file) => URL.createObjectURL(file));

        setNewImageFiles(prev => [...prev, ...files])
        setNewImagePreviews(prev => [...prev, ...previewUrls])

        // Allow selecting the same file again after removing it.
        e.target.value = ""
    }

    const handleNameChange = e =>
    {
        setName(e.target.value)
        clearError("name");
    }


    const handleCategoryChange = e =>
    {
        setCategory(e.target.value)
        clearError("category");
    }


    const handleEnergyRatingChange = e =>
    {
        setEnergyRating(e.target.value)
        clearError("energyRating");
    }


    const handlePriceChange = e =>
    {
        setPrice(e.target.value)
        clearError("price");
    }


    const handleStockLevelChange = e =>
    {
        setStockLevel(e.target.value)
        clearError("stockLevel");
    }
    const handleDeleteExistingImage = (index) =>
    {
        //Filter out the image at the specified index
        setExistingImages(prev => prev.filter((img, i) => i !== index))
    }

    const handleDeleteNewImage = (index) =>
    {
        setNewImageFiles(prev => prev.filter((file, i) => i !== index))
        setNewImagePreviews(prev =>
        {
            const previewToRemove = prev[index]
            if (previewToRemove)
            {
                URL.revokeObjectURL(previewToRemove)
            }
            return prev.filter((preview, i) => i !== index)
        })
    }





    const handleSubmit = (e) =>
    {
        e.preventDefault()

        const formData = new FormData()
        formData.append("existingImages", JSON.stringify(existingImages))
        formData.append("name", name)
        formData.append("category", category)
        formData.append("energyRating", energyRating)
        formData.append("price", price)
        formData.append("stockLevel", stockLevel)

        newImageFiles.forEach(file => formData.append("images", file))

        // Send PUT request to server with updated product data
        axios.put(`${SERVER_HOST}/products/${props.match.params.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })
        .then(res =>
        {
            newImagePreviews.forEach(previewUrl => URL.revokeObjectURL(previewUrl))
            setNewImageFiles([])
            setNewImagePreviews([])
            // If update succeeds, redirect back to products list
            setRedirectToDisplayAllProducts(true)
        })
        .catch(err => console.log(`${err.response.data}\n${err}`))
    }


    return (
    <div className="container">
        {/*Redirect to products list if update was successful */}
        {redirectToDisplayAllProducts ? <Redirect to="/DisplayAllProducts"/> : null}  
    
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
                />
                <div className="preview">
                {existingImages.map((img, index) => (
                        <img
                        key={`existing-${index}`}
                        src={img}
                        alt="Current product"
                        onClick={() => handleDeleteExistingImage(index)} 
                        />
                    ))}
                {newImagePreviews.map((previewUrl, index) => (
                        <img
                        key={`new-${index}`}
                        src={previewUrl}
                        alt="New product"
                        onClick={() => handleDeleteNewImage(index)}
                        />
                    ))}
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
                    <Button value="Update" className="btn-green" onClick={handleSubmit}/>  
                    <Link className="btn-red" to={"/DisplayAllProducts"}>Cancel</Link>
                </div>
            </div>
        </form>
    </div>
    )
}