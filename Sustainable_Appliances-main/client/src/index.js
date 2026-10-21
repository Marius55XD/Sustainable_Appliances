import React from "react"
import ReactDOM from "react-dom"
import {App} from "./App"

ReactDOM.render(<App/>, document.getElementById(`root`))


window.addEventListener('load', () => 
{
    if ("serviceWorker" in navigator) 
    {
        navigator.serviceWorker.register("/serviceWorker.js")
        .then(() => console.log("Service Worker Registered"))
        .catch(err => console.error("Service Worker Registration Failed", err))
    }
})