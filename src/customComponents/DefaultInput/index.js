import React from "react";

const DefaultInput = (props) => {
    const { errorstatus, errormessage } = props;
    return (
        <>
            <input {...props}  />
            {errorstatus &&
                <p className="errorText">{errormessage}</p>
            }
        </>

    )
}

export default DefaultInput;