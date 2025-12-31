import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../../../api/services/AuthService";
import { alertErrorMessage, alertSuccessMessage } from "../../../customComponents/CustomAlertMessage";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import Select from "react-select";
import { Helmet } from "react-helmet-async";
import ReCAPTCHA from "react-google-recaptcha";
import { isValidPhoneNumber } from 'libphonenumber-js';
import { useGoogleLogin } from "@react-oauth/google";
import { countriesList, customStyles } from "../../../utils/CountriesList";
import { $ } from "react-jquery-plugin";

const SignupPage = () => {
    $("body").addClass("signupbg");
    const navigate = useNavigate();
    const ref1 = window.location.href.split("=")[0];
    console.log("🚀 ~ SignupPage ~ ref1:", ref1)
    const ref = window.location.href.split("=")[1];
    console.log("🚀 ~ SignupPage ~ ref:", ref)
    const googlecaptchaRef = useRef()
    const recaptchaRef = useRef()
    const recaptchaRef2 = useRef()
    const [invitation, setInvitation] = useState(ref1?.includes("reffcode") ? ref : "");
    console.log("🚀 ~ SignupPage ~ invitation:", invitation)
    const [password, setPassword] = useState("");
    const [countryCode, setCountryCode] = useState("+91");
    const [signId, setSignId] = useState(ref1?.includes("emailId") ? ref : "");
    const [checkButton, setCheckButton] = useState(true);
    const [checkButton2, setCheckButton2] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isNumb, setisNumb] = useState(false);
    const [passLength, setpassLength] = useState(false);
    const [specialCharacter, setspecialCharacter] = useState(false);
    const [capitalLetter, setCapitalLetter] = useState(false);
    const [showPassModal, setshowPassModal] = useState(false);
    const [googleToken, setGoogleToken] = useState();

    const passwordInputType = showPassword ? "text" : "password";

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    var matches = password.match(/\d+/g);
    var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;



    useEffect(() => {
        if (matches != null) {
            setisNumb(true);
        } else {
            setisNumb(false);
        }
        if (password.length >= 8) {
            setpassLength(true)
        } else {
            setpassLength(false)
        }
        if (password.match(format)) {
            setspecialCharacter(true);
        } else {
            setspecialCharacter(false);
        }
        if (password.match(/[A-Z]/)) {
            setCapitalLetter(true);
        } else {
            setCapitalLetter(false);
        }
    }, [password]);




    const handleEmailRegister = async () => {
        if (!signId) {
            alertErrorMessage("Please enter your email");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(signId)) {
            alertErrorMessage("Please enter a valid email address");
            return;
        }

        else if (!password) {
            alertErrorMessage("Please enter your password");
            return;
        }


        else if (!password.match('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')) {
            alertErrorMessage("Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character."
            );
            return;
        }

        else if (!checkButton) {
            alertErrorMessage("Please agree to Wrathcode Terms and Use");
            return;
        }

        const token = recaptchaRef.current.getValue()

        if (!token) {
            alertErrorMessage("Please validate captcha");
            return;
        }


        LoaderHelper.loaderStatus(true);
        try {
            const result = await AuthService.registerEmail(signId, password, invitation, token)
            if (result?.success) {
                LoaderHelper.loaderStatus(false);
                alertSuccessMessage(result?.message)
                handleReset("");
                navigate(`/account-verification/${result?.token}`);
            } else {
                alertErrorMessage(result?.message);
            }
        } catch (error) {
            alertErrorMessage(error?.message);
        } finally { LoaderHelper.loaderStatus(false); recaptchaRef.current.reset(); }
    };


    const handlePhoneRegister = async () => {

        const fullPhone = `${countryCode}${signId}`;
        if (!isValidPhoneNumber(fullPhone)) {
            alertErrorMessage("Please enter a valid phone number for the selected country");
            return;
        }
        if (!password) {
            alertErrorMessage("Please enter your password");
            return;
        }

        if (!password.match('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')) {
            alertErrorMessage("Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character"
            );
            return;
        }

        if (!checkButton2) {
            alertErrorMessage("Please agree to Wrathcode Terms and Use");
            return;
        };

        const token = recaptchaRef2.current.getValue()

        if (!token) {
            alertErrorMessage("Please validate captcha");
            return;
        }


        LoaderHelper.loaderStatus(true);
        try {
            const result = await AuthService.registerPhone(+signId, password, invitation, countryCode, token)
            if (result?.success) {
                LoaderHelper.loaderStatus(false);
                alertSuccessMessage(result?.message)
                handleReset("");
                navigate(`/account-verification/${result?.token}`);
            } else {

                alertErrorMessage(result?.message);
            }
        } catch (error) {
            alertErrorMessage(error?.message);
        } finally { LoaderHelper.loaderStatus(false); recaptchaRef2.current.reset(); }
    };

    const SignupwithGoogle = useGoogleLogin({
        onSuccess: tokenResponse => {
            if (tokenResponse.access_token) {
                setGoogleToken(tokenResponse)
                if (googlecaptchaRef.current) {
                    googlecaptchaRef.current.showCaptcha();
                }
                handleSignupGoogle(tokenResponse)
            }
        }
    });

    const handleSignupGoogle = async (tokenResponse, captchaData) => {
        LoaderHelper.loaderStatus(true);
        try {
            const result = await AuthService.signupwithGoogle(tokenResponse, captchaData, invitation);
            if (result?.success) {
                alertSuccessMessage(result?.message)
                handleReset("");
                navigate(`/account-verification/${result?.token}`);

            } else {
                alertErrorMessage(result?.message);
                LoaderHelper.loaderStatus(false);
            }
        } catch (error) {
            alertErrorMessage(error?.message);
            LoaderHelper.loaderStatus(false);
        }
    };



    const handleReset = () => {
        setPassword('')
        setSignId('')
    };

    const tabChange = () => {
        setSignId("");
        setPassword("");
        setshowPassModal(false);
    }

    useEffect(() => {

        return () => {
            window.location.reload()

        };
    }, []);


    return (
        <>
            <Helmet>
                <title>Sign Up at Wrathcode – Start Crypto Trading Today</title>

                <meta
                    name="description"
                    content="Register for Ga tBits: create your account, complete KYC and start trading with minimal fees in a trusted environment."
                />

                <meta
                    name="keywords"
                    content="register crypto exchange, sign up Wrathcode, crypto account registration, trade crypto Wrathcode"
                />
            </Helmet>


            <div className="login_section bgsignup">
                <div class="left_bar_login">

                    <div class="login_cnt">

                        <h1>Exciting Welcome Rewards</h1>
                        <p>Grab up to $100 Welcome Rewards to kickstart your crypto investing journey!</p>
                        <ul>
                            <li>     Create your account today and we’ll top you up with  <span>$0.50 </span>instantly</li>
                        </ul>

                        <div class="rewards_vector">
                            <img src="/images/loginBg.png" />
                        </div>
                        <div className="allchains">All Chains, All Coins</div>

                        <p>Register Now,Enjoy Surprise Rates</p>
                    </div>
                </div>
                <div className="login_form_right">
                    <div className="form_block_login">
                        <h2>Register to Wrathcode</h2>


                        <ul className="nav nav-tabs login-pills" id="myTab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button"
                                    role="tab" aria-controls="home" aria-selected="true" onClick={tabChange}>
                                    Email</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile"
                                    type="button" role="tab" aria-controls="profile" aria-selected="false" onClick={tabChange}>
                                    Mobile</button>
                            </li>
                        </ul>



                        <div className="tab-content" id="myTabContent">
                            <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">


                                <form>
                                    <div className="row">

                                        <div className="col-sm-12 input_block">
                                            <label>Email Address*</label>
                                            <div className="email_code">
                                                <input className="input_filed" type="email" placeholder="Please enter your email" value={signId} onChange={(e) => setSignId(e.target.value)} onBlur={(e) => setSignId(e.target.value.trim())} />
                                            </div>

                                        </div>

                                        <div className="col-sm-12 input_block">
                                            <label>Password*</label>
                                            <div className="email_code">
                                                <input className="input_filed" placeholder="Please enter your password" type={passwordInputType}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    onClick={() => setshowPassModal(true)} />


                                                <div className='get_otp otp2' onClick={handleTogglePassword}  >

                                                    {
                                                        showPassword ?
                                                            <i className="ri-eye-line"></i>
                                                            :
                                                            <i className="ri-eye-close-line"></i>
                                                    }
                                                </div>
                                                <div className="pass_conditions" style={{ display: showPassModal ? '' : 'none' }}>
                                                    <div className="d-flex align-items-center">
                                                        <i className={isNumb ? "ri-check-double-line text-success" : "ri-close-fill text-danger"}></i>
                                                        <span style={{ fontSize: "small" }}>At least 1 number</span>
                                                    </div>
                                                    <div className="d-flex align-items-center"><i className={specialCharacter ? "ri-check-double-line text-success" : "ri-close-fill text-danger"}></i>
                                                        <span style={{ fontSize: "small" }}>At least 1 special character</span>
                                                    </div>
                                                    <div className="d-flex align-items-center"><i className={capitalLetter ? "ri-check-double-line text-success" : "ri-close-fill text-danger"}></i>
                                                        <span style={{ fontSize: "small" }}>At least 1 capital (uppercase) letter</span>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <i className={passLength ? "ri-check-double-line text-success" : "ri-close-fill text-danger"}></i>
                                                        <span style={{ fontSize: "small" }}>Minimum 8 characters</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-12 input_block">
                                            <label>Invite Code (Optional)</label>
                                            <input className="input_filed" type="text" placeholder="Invite Code (Optional)" value={invitation} onChange={(e) => setInvitation(e.target.value)} disabled={ref} />
                                        </div>

                                        <div className="col-sm-12 agreetext">
                                            <label className="forgot_password"><input type="checkbox" checked={checkButton} onClick={() => setCheckButton((checkButton) => !checkButton)} /> I agree to Wrathcode <a target="_blank" rel="noreferrer" href="/TermsofUse" className="btn-link"> Terms and Use </a>

                                            </label>
                                        </div>

                                        <div className="col-sm-12 input_block">
                                            <ReCAPTCHA
                                                theme="light"
                                                ref={recaptchaRef}
                                                sitekey={process.env.REACT_APP_GOOGLE_RECAPTCHA_CLIENTID}
                                            />
                                        </div>

                                        <div className="col-sm-12 login_btn">
                                            {/* <input type="button" value=" Signup – Coming Soon" /> */}
                                            <input type="button" value="Register" onClick={() => { handleEmailRegister() }} />
                                        </div>
                                        <div class="col-sm-12"><button class="google_btn" type="button" onClick={SignupwithGoogle}><img src="/images/google_icon.svg" alt="google" />Sign up with Google</button></div>

                                        <div className="col-sm-12 registration__info agreetext">
                                            <p>Already have an account? <Link to="/login">Login</Link></p>
                                        </div>
                                    </div>
                                </form>

                            </div>
                            <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">

                                <form>
                                    <div className="row">

                                        <div className="col-sm-12 input_block" autoComplete="off">
                                            <label>Country Code*</label>

                                            <div>
                                                <Select
                                                    styles={customStyles}
                                                    inputId="countryCode"         // needed to connect label
                                                    name="country_code_select"    // use non-sensitive name
                                                    options={countriesList}
                                                    onChange={(selected) => setCountryCode(selected?.value)}
                                                    value={countriesList.find(option => option.value === countryCode)}
                                                />
                                            </div>

                                        </div>

                                        <div className="col-sm-12 input_block">
                                            <label>Mobile Number*</label>

                                            <div class="phone-input-wrapper">

                                                <input className="input_filed" type="number" onWheel={(e) => e.target.blur()} placeholder="Enter mobile number" value={signId} onChange={(e) => setSignId(e.target.value)} />
                                            </div>

                                        </div>


                                        <div className="col-sm-12 input_block">
                                            <label>Password*</label>
                                            <div className="email_code">
                                                <input className="input_filed" placeholder="Please enter your password" type={passwordInputType}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    onClick={() => setshowPassModal(true)} />


                                                <div className='get_otp otp2' onClick={handleTogglePassword}  >

                                                    {
                                                        showPassword ?
                                                            <i className="ri-eye-line"></i>
                                                            :
                                                            <i className="ri-eye-close-line"></i>
                                                    }
                                                </div>
                                                <div className="pass_conditions" style={{ display: showPassModal ? '' : 'none' }}>
                                                    <div className="d-flex align-items-center">
                                                        <i className={isNumb ? "ri-check-double-line text-success" : "ri-close-fill text-danger"}></i>
                                                        <span style={{ fontSize: "small" }}>At least 1 number</span>
                                                    </div>
                                                    <div className="d-flex align-items-center"><i className={specialCharacter ? "ri-check-double-line text-success" : "ri-close-fill text-danger"}></i>
                                                        <span style={{ fontSize: "small" }}>At least 1 special character</span>
                                                    </div>
                                                    <div className="d-flex align-items-center"><i className={capitalLetter ? "ri-check-double-line text-success" : "ri-close-fill text-danger"}></i>
                                                        <span style={{ fontSize: "small" }}>At least 1 capital (uppercase) letter</span>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <i className={passLength ? "ri-check-double-line text-success" : "ri-close-fill text-danger"}></i>
                                                        <span style={{ fontSize: "small" }}>Minimum 8 characters</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>



                                        <div className="col-sm-12 input_block">
                                            <label>Invite Code (Optional)</label>
                                            <input className="input_filed" type="text" placeholder="Invite Code (Optional)" value={invitation} onChange={(e) => setInvitation(e.target.value)} disabled={ref} />
                                        </div>

                                        <div className="col-sm-12 agreetext">
                                            <label className="forgot_password"><input type="checkbox" checked={checkButton2} onClick={() => setCheckButton2((checkButton2) => !checkButton2)} /> I agree to Wrathcode <a target="_blank" rel="noreferrer" href="/TermsofUse" className="btn-link"> Terms and Use </a>

                                            </label>
                                        </div>

                                        <div className="col-sm-12 input_block">
                                            <ReCAPTCHA
                                                theme="light"
                                                ref={recaptchaRef2}
                                                sitekey={process.env.REACT_APP_GOOGLE_RECAPTCHA_CLIENTID}
                                            />
                                        </div>

                                        <div className="col-sm-12 login_btn">
                                            {/* <input type="button" value=" Signup – Coming Soon" /> */}
                                            <input type="button" value="Register" onClick={() => { handlePhoneRegister() }} />
                                        </div>
                                        <div class="col-sm-12"><button class="google_btn" type="button"><img src="/images/google_icon.svg" alt="google" />Sign up with Google</button></div>

                                        <div className="col-sm-12 registration__info agreetext">
                                            <p>Already have an account? <Link to="/login">Login</Link></p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>



                    </div>
                </div>
            </div>

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
        </>
    )
}

export default SignupPage


