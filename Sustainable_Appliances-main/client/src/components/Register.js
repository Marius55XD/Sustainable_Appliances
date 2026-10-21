import React, {useState} from "react"
import {Redirect, Link} from "react-router-dom"
import axios from "axios"
import {Button} from "../components/Button"
import {SERVER_HOST} from "../config/global_constants"


export const Register = props =>
{
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [selectedFile, setSelectedFile] = useState(null)

    const [isRegistered, setIsRegistered] = useState(false)

    // error messages for each field
    const [errors, setErrors] = useState({})


    const handleNameChange = e =>
    {
        setName(e.target.value)
        if (errors.name) setErrors(prev => { const { name, ...rest } = prev; return rest; });
    }


    const handleEmailChange = e =>
    {
        setEmail(e.target.value)
        if (errors.email) setErrors(prev => { const { email, ...rest } = prev; return rest; });
    }


    const handlePasswordChange = e =>
    {
        setPassword(e.target.value)
        if (errors.password) setErrors(prev => { const { password, ...rest } = prev; return rest; });
    }


    const handleConfirmPasswordChange = e =>
    {
        setConfirmPassword(e.target.value)
        if (errors.confirmPassword) setErrors(prev => { const { confirmPassword, ...rest } = prev; return rest; });
    }


    const validate = () => {
        const errs = {}

        if (!name.trim()) errs.name = "Name is required."
        if (!email.trim()) errs.email = "Email is required."
        else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Invalid email format."
        if (!password) errs.password = "Password is required."
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[£!#€\$%\^&\*]).{10,}$/.test(password))
            errs.password = "Password must be ≥10 chars and include lowercase, uppercase, digit and special char."
        if (password !== confirmPassword) errs.confirmPassword = "Passwords must match."

        setErrors(errs)
        return Object.keys(errs).length === 0
    }
    
const handleFileChange = e => 
{
    setSelectedFile(e.target.files[0])
}

    const handleSubmit = e =>
    {
        e.preventDefault()

        if (!validate()) return

         let formData = new FormData()
        formData.append("profilePhoto", selectedFile)

        axios.post(`${SERVER_HOST}/users/register/${name}/${email}/${password}`, formData, {headers: {"Content-type": "multipart/form-data"}})
        .then(res =>
        {
            sessionStorage.userId = res.data.userId
            sessionStorage.name = res.data.name
            sessionStorage.email = res.data.email
            sessionStorage.accessLevel = res.data.accessLevel
            sessionStorage.profilePhotoFilename = res.data.profilePhotoFilename || ""

            setIsRegistered(true)
        })
        .catch(err => console.log(`${err.response?.data || err.message}\n${err}`))
    }


    return (
    <form className="container" noValidate = {true} id = "auth-form">
    
        {isRegistered ? <Redirect to="/DisplayAllProducts"/> : null} 
    
        <h2>New User Registration</h2>
    
        <input  
            class="input"
            name = "name"              
            type = "text"
            placeholder = "Name"
            autoComplete="name"
            value = {name}
            onChange = {handleNameChange}
            className={errors.name ? "error" : ""}
            autoFocus 
            />          
        {errors.name && <div className="error">{errors.name}</div>}
    
        <input  
            class="input"
            name = "email"              
            type = "email"
            placeholder = "Email"
            autoComplete="email"
            value = {email}
            onChange = {handleEmailChange}
            className={errors.email ? "error" : ""}
            />             
        {errors.email && <div className="error">{errors.email}</div>}
    
        <input  
            class="input"
            name = "password"           
            type = "password"
            placeholder = "Password"
            autoComplete="password"
            title = "Password must be at least ten-digits long and contains at least one lowercase letter, one uppercase letter, one digit and one of the following characters (£!#€$%^&*)"
            value = {password}
            onChange = {handlePasswordChange}
            className={errors.password ? "error" : ""}
            />          
        {errors.password && <div className="error">{errors.password}</div>}
    
        <input   
            class="input"
            name = "confirmPassword"    
            type = "password"
            placeholder = "Confirm password"
            autoComplete="confirmPassword"
            value = {confirmPassword}
            onChange = {handleConfirmPasswordChange}
            className={errors.confirmPassword ? "error" : ""}
            />
        {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
    
    <input             
    name = "profilePhoto"
    type = "file"                    
    onChange = {handleFileChange}
/>
        <Button value="Register New User" className="btn-green" onClick={handleSubmit} />
        <Link className="btn-red" to={"/DisplayAllProducts"}>Cancel</Link>   
    </form>
    )
}