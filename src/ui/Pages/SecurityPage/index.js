import React, { useEffect, useState } from "react";
import { validPassword, notEqualsZero, matchPassword } from "../../../utils/Validation";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import AuthService from "../../../api/services/AuthService";
import { alertErrorMessage, alertSuccessMessage } from "../../../customComponents/CustomAlertMessage";
import { Link } from "react-router-dom";
import DashboardHeader from "../../../customComponents/DashboardHeader";

const SecurityPage = (props) => {
    const [password, setPassword] = useState('');
    const [signupBy, setSignupBy] = useState("");

    const [conPassword, setConPassword] = useState('');
    const [verificationcode, setVerificationcode] = useState('');
    const [email_or_phone, setEmailorPhone] = useState();
    const [timer, setTimer] = useState(0);
    const [disableBtn, setDisbaleBtn] = useState(false);

    const [registeredSignId, setregisteredSignId] = useState("");
    console.log("🚀 ~ SecurityPage ~ registeredSignId:", registeredSignId)


    useEffect(() => {
        setEmailorPhone(props?.userDetails?.mobileNumber);
        setSignupBy(props?.userDetails?.registeredBy);

        if (props?.userDetails?.registeredBy === "phone") {
            setregisteredSignId(`${props?.userDetails?.country_code} ${props?.userDetails?.mobileNumber}`)
        }else{
            setregisteredSignId(props?.userDetails?.emailId)
        }

    }, [props]);



    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setDisbaleBtn(false);
        }
        return () => clearInterval(interval);
    }, [timer]);


    const handleInputChange = (event) => {
        switch (event.target.name) {
            case "password":
                setPassword(event.target.value);
                break;
            case "conPassword":
                setConPassword(event.target.value);
                break;
            case "verificationcode":
                setVerificationcode(event.target.value);
                break;
            case "email_or_phone":
                setEmailorPhone(event.target.value);
                break;
            default:
                break;
        }
    }

    const handleGetOtp = async (email_or_phone, resend) => {
        if (!email_or_phone || email_or_phone === "") {
            alertErrorMessage("Please update your phone number")
            return;
        }
        LoaderHelper.loaderStatus(true);
        await AuthService.getOtp(email_or_phone, resend).then(async (result) => {
            LoaderHelper.loaderStatus(false);
            if (result.success) {
                try {
                    alertSuccessMessage(result.message);
                    setDisbaleBtn(true);
                    setTimer(30);
                } catch (error) {
                    alertErrorMessage(error);
                }
            } else {
                LoaderHelper.loaderStatus(false);
                alertErrorMessage(result.message);
            }
        });
    };


    const handleSecurity = async ( password, conPassword, verificationcode, email_or_phone) => {
    

        if (validPassword(password) !== undefined || !password) {
            alertErrorMessage("Password should contain at least one number, one special character, and be at least 8 characters long")
            return;
        }

        if (matchPassword(password, conPassword) !== undefined) {
            alertErrorMessage("New password and confirm password must match")
            return;
        }
        if (!verificationcode || verificationcode?.length < 5) {
            alertErrorMessage("Invalid verification code")
            return;
        }

        LoaderHelper.loaderStatus(true)
        await AuthService.setSecurity( password, conPassword, verificationcode, registeredSignId).then(async result => {
            if (result.success) {
                LoaderHelper.loaderStatus(false)
                try {
                    alertSuccessMessage(result.message);
                    setPassword("");
                    setConPassword("");
                    setVerificationcode("");
                } catch (error) {
                    alertErrorMessage(error);
                }
            } else {
                LoaderHelper.loaderStatus(false)
                alertErrorMessage(result.message);
            }
        });
    }


    return (

        <div className="dashboard_right">



            <DashboardHeader props={props} />

            <div className="dashboard_listing_section Overview_mid">


                <div className="currency_preference_outer password_security_s">

                    <div className="kyc_approval_s securityform_s">

                        <div className="row">

                            <div className="col-sm-4">
                                <div className="security_vector">
                                    <img src="/images/reset_vector.svg" className="img-fluid" alt="" />
                                </div>
                            </div>

                            <div className="col-sm-8">

                                <div className="cnt">


                                    <h3>Security</h3>
                                    <p>Fill the form below to change your password.</p>
                                    <div className="dashboard_summary">


                                        <div className="security_form security_mobile">

                                            <form className="row">
                                                <div className="col-sm-6">
                                                    <label>Registered {signupBy==="phone"?"Mobile Number":"Email Address"}*</label>
                                                    <input type="text" disabled
                                                       value={registeredSignId}  />
                                                </div>

                                                <div className="col-sm-6">
                                                    <label>Enter Verification Code*</label>
                                                    <div className="otp_code_in2">
                                                        <input type="number" name="verificationcode" placeholder="Enter Verification Code" value={verificationcode} onChange={handleInputChange} />
                                                        <button disabled={disableBtn} type="button" className="btn btn-xs  custom-btn" onClick={() => handleGetOtp(registeredSignId)}><span> {disableBtn ? `Resend OTP (${timer}s)` : "GET OTP"}  </span></button>
                                                    </div>
                                                    {/* {!email_or_phone && <small className="red"><Link to="/user_profile/profile_setting">  Update phone number </Link>to reset password</small>} */}
                                                </div>

                                                <div className="col-sm-6">
                                                    <label>New Password*</label>
                                                    <input type="password" name="password" placeholder="Enter New Password" value={password} errorstatus={validPassword(password) !== undefined && notEqualsZero(password)} errormessage={validPassword(password)} onChange={handleInputChange} />
                                                </div>
                                                <div className="col-sm-6">
                                                    <label>Confirm Password*</label>
                                                    <input type="password" name="conPassword" placeholder="Enter Confirm Password" value={conPassword} errorstatus={validPassword(conPassword) !== undefined && notEqualsZero(conPassword) || matchPassword(password, conPassword)} errormessage={validPassword(conPassword) || matchPassword(password, conPassword)} onChange={handleInputChange} />
                                                </div>

                                                <div className="col-sm-12">

                                                    <input type="button" value="Submit" onClick={() => handleSecurity(password, conPassword, verificationcode, email_or_phone)} />
                                                </div>
                                            </form>
                                        </div>
                                    </div>

                                </div>


                            </div>

                            {/* <div className="col-sm-6">
<div className="password_security_img">
        <img src="/images/password_security.png" alt="security" />
 </div>  
</div> */}

                        </div>


                    </div>

                    {/*                     
                    <div className="dashboard_right_side profileslider">
                        <div className="slider dashboard_slider">
                            <Slider {...bannerSettings}>
                                <div className="banner_img_add">

                                    <div className="cnt_slider_f">
                                        <h6>Wrathcode Landing Protocol</h6>
                                        <p>Borrow Low, Earn High</p>
                                    </div>

                                    <div className="cv_trade_img">
                                        <img src="/images/cvtrade_bitcoin.svg" alt="bitcoin" />
                                    </div>

                                </div>
                                <div className="banner_img_add">

                                    <div className="cnt_slider_f">
                                        <h6>Wrathcode Landing Protocol</h6>
                                        <p>Borrow Low, Earn High</p>
                                    </div>

                                    <div className="cv_trade_img">
                                        <img src="/images/cvtrade_bitcoin.svg" alt="bitcoin" />
                                    </div>

                                </div>

                                <div className="banner_img_add">

                                    <div className="cnt_slider_f">
                                        <h6>Wrathcode Landing Protocol</h6>
                                        <p>Borrow Low, Earn High</p>
                                    </div>

                                    <div className="cv_trade_img">
                                        <img src="/images/cvtrade_bitcoin.svg" alt="bitcoin" />
                                    </div>

                                </div>

                                <div className="banner_img_add">

                                    <div className="cnt_slider_f">
                                        <h6>Wrathcode Landing Protocol</h6>
                                        <p>Borrow Low, Earn High</p>
                                    </div>

                                    <div className="cv_trade_img">
                                        <img src="/images/cvtrade_bitcoin.svg" alt="bitcoin" />
                                    </div>

                                </div>

                                <div className="banner_img_add">

                                    <div className="cnt_slider_f">
                                        <h6>Wrathcode Landing Protocol</h6>
                                        <p>Borrow Low, Earn High</p>
                                    </div>

                                    <div className="cv_trade_img">
                                        <img src="/images/cvtrade_bitcoin.svg" alt="bitcoin" />
                                    </div>

                                </div>
                            </Slider>
                        </div>
                    </div> */}

                </div>

            </div>

        </div>
    );
}

export default SecurityPage;