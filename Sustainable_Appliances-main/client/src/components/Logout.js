
import React, {useEffect, useState} from "react"
import {Redirect} from "react-router-dom"
import {ACCESS_LEVEL_GUEST} from "../config/global_constants"

export const Logout = props =>
{
    //track when logout is complete
    const [isLoggedOut, setIsLoggedOut] = useState(false)

    useEffect(() =>
    {
        sessionStorage.clear()
        //Sets user back to guest status
        sessionStorage.name = "GUEST"
        sessionStorage.accessLevel = ACCESS_LEVEL_GUEST
        setIsLoggedOut(true)
    }, [])


    return (
    <div>   

        {isLoggedOut ? <Redirect to="/DisplayAllProducts"/> : null} 
    </div>
    )
}