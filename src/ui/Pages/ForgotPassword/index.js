import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../../../api/services/AuthService";
import { alertErrorMessage, alertSuccessMessage } from "../../../customComponents/CustomAlertMessage";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import { validateEmail } from "../../../utils/Validation";
import { countriesList, customStyles } from "../../../utils/CountriesList";
import Select from "react-select";
import { isValidPhoneNumber } from "libphonenumber-js";


const ForgotPassword = () => {
    const navigate = useNavigate();
    const [countryCode, setCountryCode] = useState("+91");

    const [inputData, setinputData] = useState({ otp: '', password: '', signId: '' });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setinputData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleForgetPass = async (inputData,type) => {
        await AuthService.forgotPassword(inputData,type,countryCode).then(async result => {
            if (result?.success) {
                try {
                    alertSuccessMessage(result?.message);
                    setinputData({ otp: '', password: '', signId: '' })
                    navigate("/login");
                } catch (error) {
                    alertErrorMessage(error);
                }
            } else {
                alertErrorMessage(result?.message);
            }
        });
    };
    const handleGetOtp = async (signId, type, inputType) => {
        let signIdPaylod;
        if (inputType === "email") {
            if (validateEmail(signId) !== undefined) {
                alertErrorMessage("Please enter valid email address")
                return
            }
            signIdPaylod = signId
        } else {
            const fullPhone = `${countryCode}${signId}`;
            console.log("🚀 ~ handleGetOtp ~ fullPhone:", fullPhone)

            if (!isValidPhoneNumber(fullPhone)) {
                alertErrorMessage("Please enter a valid phone number for the selected country");
                return;
            }
            const fullPhonePayload = `${countryCode} ${signId}`;

            signIdPaylod = fullPhonePayload

        }
        LoaderHelper.loaderStatus(true);
        await AuthService?.getOtp(signIdPaylod, type).then(async result => {
            if (result?.success) {
                LoaderHelper.loaderStatus(false);
                try {
                    alertSuccessMessage(result?.message);
                } catch (error) {
                    alertErrorMessage(error);
                }
            } else {
                LoaderHelper.loaderStatus(false);
                alertErrorMessage(result?.message);
            }
        });
    }
    return (
        <div className="login_section m-auto mt-5 forgot_password">
            <div className="login_form_right">
                <div className="form_block_login">
                    <h2> Forgot Password</h2>
                    <ul className="nav nav-tabs login-pills" id="myTab" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button"
                                role="tab" aria-controls="home" aria-selected="true">

                                Email</button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button className="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile"
                                type="button" role="tab" aria-controls="profile" aria-selected="false">

                                Phone</button>
                        </li>
                    </ul>

                    <div className="tab-content" id="pills-tabContent">
                        <div className="tab-pane show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                            <form>
                                <div className="row">
                                    <div className="col-sm-12 input_block">
                                        <label>Email*</label>
                                        <input className="input_filed" type="email" placeholder="Email" name="signId" onChange={handleInputChange} value={inputData?.signId} />
                                    </div>
                                    <div className="col-sm-12 input_block">
                                        <label>Email Verification Code*</label>
                                        <div className=" email_code" >
                                            <input type="number " name="otp" id="form-otp" className="input_filed" placeholder="Enter Code" onChange={handleInputChange} value={inputData?.otp} onWheel={(e)=>e.target.blur()} />
                                            <div className="get_otp" onClick={() => handleGetOtp(inputData?.signId, 'forgot', "email")}><span> GET OTP </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-12 input_block">
                                        <label>New Password*</label>
                                        <input type="text" name="password" id="form-email" className="input_filed" placeholder="New Password" required onChange={handleInputChange} value={inputData?.password} />
                                    </div>
                                </div>
                                <div className="col-lg-12 col-md-10 col-12 mx-auto mt-4">
                                    <button type="button" className="btn custom-btn w-100 btn-block btn-xl" onClick={() => { handleForgetPass(inputData,"email") }}> Forgot Password </button>
                                </div>
                                <div className="col-sm-12 registration__info  mt-4">
                                    <p>Back to<Link to="/login"> Login</Link></p>
                                </div>
                            </form>
                        </div>


                        <div className="tab-pane" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                            <form>
                                <div className="row">
                                    <div className="col-sm-12 input_block">
                                        <label>Mobile Number*</label>
                                        <Select
                                            styles={customStyles}
                                            inputId="countryCode"         // needed to connect label
                                            name="country_code_select"    // use non-sensitive name
                                            options={countriesList}
                                            onChange={(selected) => setCountryCode(selected?.value)}
                                            value={countriesList.find(option => option.value === countryCode)}
                                        />

                                        <input className="input_filed" type="number" placeholder="Mobile Number" name="signId" onWheel={(e)=>e.target.blur()} onChange={handleInputChange} value={inputData?.signId} />

                                    </div>
                                  <div className="col-sm-12 input_block">
                                        <label>Phone Verification Code*</label>
                                        <div className=" email_code" >
                                            <input type="text" name="otp" id="form-otp" className="input_filed" placeholder="Enter  Code" onChange={handleInputChange} value={inputData?.otp} />
                                            <div className="get_otp" onClick={() => handleGetOtp(inputData?.signId, 'forgot', "phone")}><span> GET OTP </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-sm-12 input_block">
                                        <label>New Password</label>
                                        <input type="text" name="password" id="form-email" className="input_filed" placeholder="New Password" required onChange={handleInputChange} value={inputData?.password} />
                                    </div>
                                </div>
                                <div className="col-lg-12 col-md-10 col-12 mx-auto mt-4">
                                    <button type="button" className="btn custom-btn w-100 btn-block btn-xl" onClick={() => { handleForgetPass(inputData,"phone") }}> Forgot Password </button>
                                </div>
                                <div className="col-sm-12 registration__info  mt-4">
                                    <p>Back to<Link to="/login"> Login</Link></p>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword


