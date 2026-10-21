import React, { useState, useEffect } from "react"
import {BrowserRouter, Switch, Route} from "react-router-dom"
import {Register} from "./components/Register"
import {ResetDatabase} from "./components/ResetDatabase"
import {AddProduct} from "./components/AddProduct"
import {EditProduct} from "./components/EditProduct"
import {DeleteProduct} from "./components/DeleteProduct"
import {DisplayAllProducts} from "./components/DisplayAllProducts"
import {ViewProduct} from "./components/ViewProduct"
import {ShoppingCart} from "./components/ShoppingCart"
import {PopUp} from "./components/PopUp"
import {ACCESS_LEVEL_GUEST} from "./config/global_constants"
import {LoggedRoute} from "./components/LoggedRoute"
import {Logout} from "./components/Logout"
import {Login} from "./components/Login"
import {BuyProduct} from "./components/BuyProduct"
import {PayMsg} from "./components/PayMsg"
import {PurchaseHistory} from "./components/PurchaseHistory"
import {Customers} from "./components/Customers"
import {EditProfile} from "./components/EditProfile"

//Importing CSS styles
import "./css/App.css"

//SESSION STORAGE
//If user is not logged in, set them as GUEST
if (typeof sessionStorage.accessLevel === "undefined")
{
    sessionStorage.name = "GUEST"
    sessionStorage.accessLevel = ACCESS_LEVEL_GUEST
}

//MAIN APP COMPONENT
export const App = props =>
{
    const [cart, setCart] = useState([])
    const [popupMessage, setPopupMessage] = useState("")
    const [showPopup, setShowPopup] = useState(false)

    //Loads saved cart from browser storage when app starts
    useEffect(() => {
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
            setCart(JSON.parse(savedCart))
        }
    }, [])

    //Saves cart to browser storage whenever it changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart))
    }, [cart])

    const addToCart = (product) => {
        //Checks if product is already in cart
        const found = cart.find((item) => item._id === product._id)
        if (found) {
            found.quantity += 1
            setCart([...cart])
            setPopupMessage(`${product.name} quantity increased!`)
        } else {
            setCart([...cart, { ...product, quantity: 1 }])
            setPopupMessage(`${product.name} added to cart!`)
        }
        //Show success popup for 3 seconds
        setShowPopup(true)
        setTimeout(() => setShowPopup(false), 3000)
    }

    //Remove a product from cart
    const removeFromCart = (productId) => {
        setCart(cart.filter((item) => item._id !== productId))
    }

    //Remove all items from cart
    const clearCart = () => {
        setCart([])
    }

    return (
    <>
        <PopUp message={popupMessage} show={showPopup} />
        
        <BrowserRouter>
            <Switch>
            <Route exact path="/Register" component={Register} />
            <Route exact path="/ResetDatabase" component={ResetDatabase} />                    
            <Route exact path="/" render={() => <DisplayAllProducts cart={cart} addToCart={addToCart} />} />
            
            <LoggedRoute exact path="/AddProduct" component={AddProduct} />
            <LoggedRoute exact path="/EditProduct/:id" component={EditProduct} />
            <LoggedRoute exact path="/DeleteProduct/:id" component={DeleteProduct} />

            <Route exact path="/ViewProduct/:id" component={ViewProduct} />
            <Route exact path="/DisplayAllProducts" render={() => <DisplayAllProducts cart={cart} addToCart={addToCart} />}/> 
            <Route exact path="/ShoppingCart" render={() => (
                <ShoppingCart cart={cart} removeCart={removeFromCart} clearCart={clearCart} />
            )} />
            
            <LoggedRoute exact path="/Logout" component={Logout} />
            <Route exact path="/Login" component={Login} />

            <Route exact path="/BuyProduct/:id" component={BuyProduct} />
            <Route exact path="/PayPalMessage/:messageType/:payPalPaymentID" component={PayMsg}/>
            <Route exact path="/PurchaseHistory" render={() => <PurchaseHistory cart={cart} />} />
            
            <Route exact path="/Customers" render={() => <Customers cart={cart} />} />
            <LoggedRoute exact path="/EditProfile" component={EditProfile} cart={cart} />
            
            <Route path="*" render={() => <DisplayAllProducts cart={cart} addToCart={addToCart} />}/>
            </Switch>
        </BrowserRouter>
    </>
    )
}