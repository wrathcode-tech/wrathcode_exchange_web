import React from "react";


const KycButton = (props) => {
    return (
        <button {...props} type="submit" className=" mt-4  btn w-100 btn-gradient btn-xl  justify-content-center">
            {props.children}
        </button>
    )
}

export default KycButton;