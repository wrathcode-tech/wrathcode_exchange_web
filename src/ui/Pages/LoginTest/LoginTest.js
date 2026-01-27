import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../../../api/services/AuthService";
import { alertErrorMessage, alertSuccessMessage } from "../../../customComponents/CustomAlertMessage";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import { $ } from "react-jquery-plugin";
import { isGlobalEmailDomain, validateEmail, validPassword } from "../../../utils/Validation"
import { ProfileContext } from "../../../context/ProfileProvider";
import { useGoogleLogin } from '@react-oauth/google';
import ReCAPTCHA from "react-google-recaptcha";

import { Helmet } from "react-helmet-async";


const LoginTest = () => {


    const googlecaptchaRef = useRef(null);

    const [signId, setSignId] = useState("");
    const [password, setPassword] = useState("");
    const [userDetails, setuserDetails] = useState();
    const [vCode, setVCode] = useState("");
    const [googleToken, setGoogleToken] = useState();
    const [authType, setauthType] = useState();
    const [showPassword, setShowPassword] = useState(false);

    const recaptchaRef = useRef(null);

    const navigate = useNavigate();

    const { setLoginDetails } = useContext(ProfileContext);

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async (signId, password,) => {
        // const token = recaptchaRef.current.getValue()
        // if (!token) {
        //   return;
        // }

        LoaderHelper.loaderStatus(true);
        try {
            const result = await AuthService.login(signId, password, "token");
            if (result.success) {
                LoaderHelper.loaderStatus(false);
                if (result?.data?.['2fa'] === 0) {
                    alertSuccessMessage(result.message);
                    localStorage.setItem("token", result.data.token);
                    localStorage.setItem("userId", result.data.userId);
                    setLoginDetails(result.data);


                    navigate("/user_profile/dashboard");
                    window.location.reload()
                } else {
                    $("#Confirmation_model").modal('show');
                    setauthType(result?.data?.['2fa']);
                    setuserDetails(result?.data);
                    setLoginDetails(result.data);
                }
            } else {
                // recaptchaRef.current.reset();
                LoaderHelper.loaderStatus(false);
                alertErrorMessage(result.message);
            }
        } catch (error) {
            if (error.response) {
                // Handle specific HTTP response errors
                alertErrorMessage(error.response.data.message);
                LoaderHelper.loaderStatus(false);
            } else if (error.request) {
                // Handle network connection errors
                alertErrorMessage("Network error. Please check your internet connection.");
                LoaderHelper.loaderStatus(false);
            } else {
                // Handle other errors
                alertErrorMessage("An error occurred. Please try again later.");
                LoaderHelper.loaderStatus(false);
            }
        }
    };

    const handleAuthVerify = async (authType, vCode) => {
        LoaderHelper.loaderStatus(true);
        await AuthService.getCode(authType === 1 ? userDetails?.emailId : authType === 3 ? userDetails?.mobileNumber : signId, authType, vCode).then(async (result) => {
            if (result.success) {
                try {
                    alertSuccessMessage(result.message);
                    localStorage.setItem("token", result.data.token);
                    localStorage.setItem("userId", result.data.userId);
                    setLoginDetails(result.data);
                    $("#Confirmation_model").modal('hide');
                    navigate("/user_profile/dashboard");
                    window.location.reload()
                    LoaderHelper.loaderStatus(false);
                } catch (error) {
                    LoaderHelper.loaderStatus(false);
                    alertErrorMessage(error);
                }
            } else {
                LoaderHelper.loaderStatus(false);
                alertErrorMessage(result.message);
            }
        });
    };

    const mySubmitFunction = async (event) => {
        event.preventDefault()
        return true
    }

    const handleReset = () => {
        setPassword('')
        setSignId('')
    }

    const loginWithGoogle = useGoogleLogin({
        onSuccess: tokenResponse => {
            if (tokenResponse.access_token) {
                setGoogleToken(tokenResponse)
                if (googlecaptchaRef.current) {
                    googlecaptchaRef.current.showCaptcha();
                }
                handleLoginGoogle(tokenResponse)
            }
        }
    });

    const handleLoginGoogle = async (tokenResponse, captchaData) => {
        LoaderHelper.loaderStatus(true);
        try {
            const result = await AuthService.googleLogin(tokenResponse, captchaData);
            if (result?.success) {
                alertSuccessMessage(result?.message);
                localStorage.setItem("token", result.data.token);
                localStorage.setItem("userId", result.data.userId);
                setLoginDetails(result?.data);
                navigate("/user_profile/dashboard");
                window.location.reload()
                LoaderHelper.loaderStatus(false);
            } else {
                alertErrorMessage(result?.message);
                LoaderHelper.loaderStatus(false);
            }
        } catch (error) {
            alertErrorMessage(error?.message);
            LoaderHelper.loaderStatus(false);
        }
    };


    return (
        <>
            <Helmet>
                <title> Wrathcode | The world class new generation crypto asset exchange</title>
            </Helmet>





            <div className="login_section m-auto verifiedform">

                <div className="login_form_right">

                    <div className="form_block_login">

                        <div className="security_shield_vector">
                            <img src="images/security_shield.svg" alt="security" />
                        </div>

                        <sup>Hi <span>User Name,</span></sup>
                        <h4>Please Verify Your Account</h4>
                        <p>Make your account 100% secure against unauthorijed logins.</p>
                        <p>Register email: <span>user@gmail.com</span></p>
                        <div className="tab-content" id="myTabContent">
                            <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                                <form>
                                    <div className="row">
                                        <div className="col-sm-12 input_block">
                                            <label>Email Verification Code*</label>
                                            <div className="email_code">
                                                <input className="input_filed" type="nuber" placeholder="Enter Code" />
                                                <div className="get_otp otpcode">GET OTP</div>
                                            </div>
                                        </div>
                                        <div className="col-sm-12 login_btn" data-bs-toggle="modal" data-bs-target="#Confirmation_model">
                                            {!signId || !password || validateEmail(signId) !== undefined || validPassword(password) !== undefined || !isGlobalEmailDomain(signId) ?
                                                <input type="button" value="Verified" />
                                                :
                                                <input
                                                    value="Log In"
                                                    type="button"
                                                    onClick={() => {
                                                        if (validateEmail(signId) !== undefined) {
                                                            alertErrorMessage("Invalid Email");
                                                            return;
                                                        }
                                                        else {
                                                            handleLogin(signId, password);
                                                        }
                                                    }} />
                                            }
                                        </div>
                                        <div className="col-sm-12 registration__info bottom">
                                            <p>Already have an account? <Link to="/Login">Login</Link></p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>






              {/* <!-- Modal Network Pop Up Start --> */}

             

            <div className="modal fade scaner_pop_up thankyou_s" id="Confirmation_model" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="thanky_top_hd">
                        <img src="/images/certified_vector.svg" alt="thankyou" />


                            <h2>Thank you for signing up with us!</h2>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">x</button>
                        </div>
                        <div className="modal-body">
                           <p>To complete your registration and activate your account, please verify your email address by clicking the link we’ve sent to your inbox.</p>
                           <p>✅ Check your email and click on the verification link to proceed.</p>
                           <p>If you didn’t receive the email, please check your spam or junk folder. You can also request a new verification link if needed.</p>
                           <p>Thank you for being a part of our community!</p>
                        
                        </div>

<div className="okbtn">
                            <button className="save_btn" type="button"><Link to="#">Ok</Link></button>
                            </div>
                    </div>
                </div>
            </div>

              {/* <!-- Modal Network Pop Up End --> */}






<div className="container">

<div className="register_verified_form">
    <div className="register_verified_vector">
        <img src="images/register_verified_vector.svg" alt="register"/>
    </div>
    <h1>Welcome to Wrathcode</h1>
    <p>Thank you for Choosing Us!</p>
    <p className="dark_yellow">Existing account or Account already activated.</p>
    <p className="dark_yellow">Please log in,</p>
    <p className="light_red">Please login with your credentials to 
access your account.</p>
<p className="yellow">Happy Trading !!!,</p>

<button><Link to="#">Login with Us</Link></button>
</div>

</div>



            <div className="container">

                <div className="register_verified_form">
                    <div className="register_verified_vector">
                        <img src="images/register_reject_vector.svg" alt="register" />
                    </div>
                    <h1>Welcome to Wrathcode</h1>
                    <p>Thank you for Choosing Us!</p>
                    <p className="dark_yellow">Existing account or Account already activated.</p>
                    <p className="dark_yellow">Please log in,</p>
                    <p className="light_red">Please login with your credentials to
                        access your account.</p>
                    <p className="yellow">Happy Trading !!!,</p>

                    <button><Link to="#">Login with Us</Link></button>
                </div>

            </div>

        </>

    )
}

export default LoginTest


