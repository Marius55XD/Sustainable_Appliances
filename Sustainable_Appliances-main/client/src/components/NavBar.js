
import React, {useState} from "react";
import {Link} from "react-router-dom"
import {ACCESS_LEVEL_ADMIN, ACCESS_LEVEL_GUEST, SERVER_HOST} from "../config/global_constants";

export const NavBar = props =>
{
    const accessLevel = Number(sessionStorage.accessLevel ?? ACCESS_LEVEL_GUEST)
    const isLoggedIn = accessLevel > ACCESS_LEVEL_GUEST
    const cartCount = props.cart ? props.cart.length : 0
    const profilePhotoFilename = sessionStorage.profilePhotoFilename || ""
    const userName = sessionStorage.name || "Guest"
    const [isMenuOpen, setIsMenuOpen] = useState(false)


    const toggleMenu = () =>
    {
        setIsMenuOpen(!isMenuOpen)
    }


    const closeMenu = () =>
    {
        setIsMenuOpen(false)
    }

    return (
    <nav className="main-nav">
           {/*hamburger*/}
           <button
               type="button"
               className="nav-toggle"
               onClick={toggleMenu}
               aria-expanded={isMenuOpen}
               aria-label="Toggle navigation menu"
           >
               ☰ Menu
           </button>

           {/*Navigation links*/}
           <div className={`nav-links ${isMenuOpen ? "is-open" : ""}`}>
               {!isLoggedIn ? <Link className="nav-btn" to={"/Register"} onClick={closeMenu}>Register</Link> : null}
               {!isLoggedIn ? <Link className="nav-btn" to={"/Login"} onClick={closeMenu}>Login</Link>: null}
               
               {isLoggedIn ? <Link className="nav-btn" to={"/Logout"} onClick={closeMenu}>Logout</Link> : null}
               
               {accessLevel === ACCESS_LEVEL_ADMIN ? <Link className="nav-btn" to={"/ResetDatabase"} onClick={closeMenu}>Reset Database</Link> : null}
               
               {/* Always shows*/}
               <Link className="nav-btn" to={"/DisplayAllProducts"} onClick={closeMenu}>Display All Products</Link>
               <Link className="nav-btn" to={"/ShoppingCart"} onClick={closeMenu}>🛒 Cart ({cartCount})</Link>

               {isLoggedIn ? <Link className="nav-btn" to={"/PurchaseHistory"} onClick={closeMenu}>📜 Purchase History</Link> : null}
               
               {/*Show Customers page only for admin*/}
               {accessLevel === ACCESS_LEVEL_ADMIN ? <Link className="nav-btn" to={"/Customers"} onClick={closeMenu}>👥 Customers</Link> : null}
               
               {/*Show profile photo*/}
               {isLoggedIn && profilePhotoFilename && (
                   <Link to="/EditProfile" className="nav-profile-link" title={`Edit ${userName}'s profile`} onClick={closeMenu}>
                       <img 
                           src={`${SERVER_HOST}/uploads/${profilePhotoFilename}`} 
                           alt={userName}
                           className="nav-profile-photo"
                       />
                   </Link>
               )}
               
               {/*Show initial letter if no profile photo*/}
               {isLoggedIn && !profilePhotoFilename && (
                   <Link to="/EditProfile" className="nav-profile-link nav-profile-placeholder" title={`Edit ${userName}'s profile`} onClick={closeMenu}>
                       <span className="profile-initials">{userName.charAt(0).toUpperCase()}</span>
                   </Link>
               )}
           </div>
    </nav>
    )
}   