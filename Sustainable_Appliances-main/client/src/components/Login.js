
import React, {useState} from "react"
import {Redirect, Link} from "react-router-dom"
import axios from "axios" 
import {Button} from "../components/Button"
import {ACCESS_LEVEL_GUEST, SERVER_HOST} from "../config/global_constants"


export const Login = props =>
{
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [errors, setErrors] = useState({})
    const [authError, setAuthError] = useState("")


    //Email input changes
    const handleEmailChange = e =>
    {
        setEmail(e.target.value)
        //Clear errors when user starts typing
        if (errors.email) setErrors(prev => { const { email, ...rest } = prev; return rest; });
        if (authError) setAuthError("")
    }


    //password input changes
    const handlePasswordChange = e =>
    {
        setPassword(e.target.value)
        //Clear errors when they type
        if (errors.password) setErrors(prev => { const { password, ...rest } = prev; return rest; });
        if (authError) setAuthError("")
    }


    //Validate form inputs before submission
    const validate = () => {
        const errs = {}
        //Check if email is provided and valid
        if (!email.trim()) errs.email = "Email is required."
        else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Invalid email format."
        //Check if password is provided
        if (!password) errs.password = "Password is required."
        setErrors(errs)
        //Return true if no errors
        return Object.keys(errs).length === 0
    }

    //Handles Submit
    const handleSubmit = e =>
    {
        e.preventDefault()  //Prevent page refresh
        setAuthError("")
        if (!validate()) return  //Stop if validation fails

        //Sending login request to server
        axios.post(`${SERVER_HOST}/users/login/${email}/${password}`)
        .then(res =>
        {
            //Save user data to session storage
            sessionStorage.userId = res.data.userId
            sessionStorage.name = res.data.name
            sessionStorage.email = res.data.email
            sessionStorage.accessLevel = res.data.accessLevel
            sessionStorage.profilePhotoFilename = res.data.profilePhotoFilename || ""

            setIsLoggedIn(true)
        })
        .catch(err =>
        {
            //If login fails, reset user to guest
            sessionStorage.name = "GUEST"
            sessionStorage.email = ""
            sessionStorage.accessLevel = ACCESS_LEVEL_GUEST
            sessionStorage.profilePhotoFilename = ""

            const serverMessage = (err?.response?.data || "").toString()

            //Check if its an authentication error wrong email or password
            if (err?.response?.status === 401 || /invalid login credentials/i.test(serverMessage))
            {
                setAuthError("Incorrect email or password. Please try again.")
            }
            else
            {
                setAuthError(serverMessage || "Unable to log in right now. Please try again.")
            }

            console.log(`${serverMessage || err.message}\n${err}`)
        })
    }


    return (
    <form className="container" noValidate = {true} id = "loginOrRegistrationForm">
        <h2>Login</h2>
    
        {isLoggedIn ? <Redirect to="/DisplayAllProducts"/> : null} 
    
        <input 
            type = "email" 
            name = "email" 
            placeholder = "Email"
            autoComplete="email"
            autoFocus
            value={email} 
            onChange={handleEmailChange}
            className={errors.email || authError ? "error" : ""}
            /><br/>
        {errors.email && <div className="error">{errors.email}</div>}
    
        <input 
            type = "password" 
            name = "password" 
            placeholder = "Password"
            autoComplete="password"
            value={password} 
            onChange={handlePasswordChange}
            className={errors.password || authError ? "error" : ""}
            /><br/>
        {errors.password && <div className="error">{errors.password}</div>}
        {authError && <div className="error">{authError}</div>}<br/><br/>
    
        <Button value="Login" className="btn-green" onClick={handleSubmit}/> 
        <Link className="btn-red" to={"/DisplayAllProducts"}>Cancel</Link>                                      
    </form>
    )
}