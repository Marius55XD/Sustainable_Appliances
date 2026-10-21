import React, { useState, useEffect } from "react"
import { Redirect, Link } from "react-router-dom"
import axios from "axios"
import { Button } from "../components/Button"
import { SERVER_HOST } from "../config/global_constants"
import { NavBar } from "./NavBar"

export const EditProfile = (props) => {
    const userId = sessionStorage.userId
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [selectedFile, setSelectedFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState("")

    const [isUpdated, setIsUpdated] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [successMessage, setSuccessMessage] = useState("")
    const [serverError, setServerError] = useState("")

    useEffect(() => {
        //Load current user data
        const currentName = sessionStorage.name || ""
        const currentEmail = sessionStorage.email || ""
        const currentPhoto = sessionStorage.profilePhotoFilename || ""
        
        setName(currentName)
        setEmail(currentEmail)
        
        if (currentPhoto) {
            setPreviewUrl(`${SERVER_HOST}/uploads/${currentPhoto}`)
        }
    }, [])

    const handleNameChange = (e) => {
        setName(e.target.value)
        if (errors.name) {
            const { name, ...rest } = errors
            setErrors(rest)
        }
        setServerError("")
    }

    const handleEmailChange = (e) => {
        setEmail(e.target.value)
        if (errors.email) {
            const { email, ...rest } = errors
            setErrors(rest)
        }
        setServerError("")
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        setSelectedFile(file)
        
        if (file) {
            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewUrl(reader.result)
            }
            reader.readAsDataURL(file)
        }
        setServerError("")
    }

    const validate = () => {
        const errs = {}

        if (!name.trim()) {
            errs.name = "Name is required."
        } else if (name.trim().length < 2) {
            errs.name = "Name must be at least 2 characters long."
        }

        if (!email.trim()) {
            errs.email = "Email is required."
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            errs.email = "Invalid email format."
        }

        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setServerError("")
        setSuccessMessage("")

        if (!validate()) return

        setIsLoading(true)

        let formData = new FormData()
        formData.append("name", name)
        formData.append("email", email)
        if (selectedFile) {
            formData.append("profilePhoto", selectedFile)
        }

        axios
            .put(`${SERVER_HOST}/users/${userId}`, formData, {
                headers: { "Content-type": "multipart/form-data" }
            })
            .then((res) => {
                // Update session storage
                sessionStorage.name = res.data.name
                sessionStorage.email = res.data.email
                sessionStorage.accessLevel = res.data.accessLevel
                sessionStorage.profilePhotoFilename = res.data.profilePhotoFilename || ""

                setSuccessMessage("Profile updated successfully!")
                setIsLoading(false)
                // Update profile photo preview
                if (res.data.profilePhotoFilename) {
                    setPreviewUrl(`${SERVER_HOST}/uploads/${res.data.profilePhotoFilename}`)
                }
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    setIsUpdated(true)
                }, 2000)
            })
            .catch((err) => {
                setIsLoading(false)
                const errorMessage = err.response?.data || err.message || "An error occurred while updating profile"
                setServerError(errorMessage)
                console.log(`${errorMessage}\n${err}`)
            })
    }

    if (!userId) {
        return <Redirect to="/Login" />
    }

    return [
        <div key={1} className="navbar">
            <NavBar cart={props.cart} />
        </div>,

        <div key={2} className="container">
            {isUpdated ? <Redirect to="/DisplayAllProducts" /> : null}

            <form className="profile-edit-form" noValidate={true} onSubmit={handleSubmit}>
                <h2>Edit Profile</h2>

                {serverError && (
                    <div className="error-banner">
                        <span className="error-icon">⚠️</span>
                        <div className="error-content">
                            <strong>Error:</strong> {serverError}
                        </div>
                    </div>
                )}

                {successMessage && (
                    <div className="success-banner">
                        <span className="success-icon">✓</span>
                        <div className="success-content">
                            {successMessage}
                        </div>
                    </div>
                )}

                <div className="profile-photo-section">
                    <div className="profile-photo-preview">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Profile preview" className="profile-preview-img" />
                        ) : (
                            <div className="profile-placeholder">No Photo</div>
                        )}
                    </div>
                    <div className="profile-photo-upload">
                        <label htmlFor="profilePhoto" className="upload-label">
                            Profile Photo
                        </label>
                        <input
                            id="profilePhoto"
                            name="profilePhoto"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="file-input"
                        />
                        <p className="help-text">Choose a new profile photo (optional)</p>
                    </div>
                </div>

                <div className="form-field">
                    <label htmlFor="name">Name *</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Your name"
                        autoComplete="name"
                        value={name}
                        onChange={handleNameChange}
                        className={errors.name ? "error" : ""}
                    />
                    {errors.name && <div className="field-error">{errors.name}</div>}
                </div>

                <div className="form-field">
                    <label htmlFor="email">Email *</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        autoComplete="email"
                        value={email}
                        onChange={handleEmailChange}
                        className={errors.email ? "error" : ""}
                    />
                    {errors.email && <div className="field-error">{errors.email}</div>}
                </div>

                <div className="form-actions">
                    <Button 
                        value={isLoading ? "Updating..." : "Update Profile"} 
                        className="btn-green" 
                        onClick={handleSubmit}
                        disabled={isLoading}
                    />
                    <Link className="btn-red" to={"/DisplayAllProducts"}>
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    ]
}
