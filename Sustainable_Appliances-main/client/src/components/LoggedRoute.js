
import React from "react";
import { Route, Redirect } from "react-router-dom";
import { ACCESS_LEVEL_GUEST } from "../config/global_constants";

//This creates routes that require login to access if not it redirects to the product page
export const LoggedRoute = ({ component: Component, exact, path, ...rest }) => (
  <Route
    exact={exact}
    path={path}
    render={(props) =>
      //Check if user's access level is higher than GUEST
      sessionStorage.accessLevel > ACCESS_LEVEL_GUEST ? (
        //If logged in, show the requested component
        <Component {...props} {...rest} />
      ) : (
        //If not logged in redirect to products page
        <Redirect to="/DisplayAllProducts" />
      )
    }
  />
);
