
import React from "react";

export const PopUp = (props) => {

  const { message, show } = props;

  return (
    <div className={`popup ${show ? "popup-show" : ""}` }>
      ✓ {message}
    </div>
  );
};
