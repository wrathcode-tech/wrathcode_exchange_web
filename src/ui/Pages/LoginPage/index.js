import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthService from "../../../api/services/AuthService";
import { alertErrorMessage, alertSuccessMessage } from "../../../customComponents/CustomAlertMessage";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import { $ } from "react-jquery-plugin";
import Select from "react-select";
import { ProfileContext } from "../../../context/ProfileProvider";
import { useGoogleLogin } from '@react-oauth/google';
import ReCAPTCHA from "react-google-recaptcha";

import { Helmet } from "react-helmet-async";
import { isValidPhoneNumber } from "libphonenumber-js";
import { countriesList, customStyles } from "../../../utils/CountriesList";


const LoginPage = () => {
  $("body").addClass("loginbg");
  const location = useLocation();
  const googlecaptchaRef = useRef(null);

  const [signId, setSignId] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [userDetails, setuserDetails] = useState();
  const [vCode, setVCode] = useState("");
  const [googleToken, setGoogleToken] = useState();
  const [authType, setauthType] = useState();
  const [showPassword, setShowPassword] = useState(false);

  const recaptchaRef = useRef(null);
  const recaptchaRef2 = useRef(null);

  const navigate = useNavigate();

  const { setLoginDetails } = useContext(ProfileContext);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  console.log(process.env.REACT_APP_GOOGLE_RECAPTCHA_CLIENTID, "lkjhgf");

  const handleLogin = async (signId, password, token) => {

    LoaderHelper.loaderStatus(true);
    try {
      const result = await AuthService.login(signId, password, token);
      if (result?.success) {
        if (result?.data?.['2fa'] === 0) {
          alertSuccessMessage(result.message);
          sessionStorage.setItem("token", result.data.token);
          sessionStorage.setItem("userId", result.data.userId);
          setLoginDetails(result.data);
          const redirectPath = location?.state?.redirectTo || "/user_profile/dashboard";
          navigate(redirectPath, { replace: true });
          window.location.reload()

        } else {
          $("#Confirmation_model").modal('show');
          setauthType(result?.data?.['2fa']);
          setuserDetails(result?.data);
          setLoginDetails(result.data);
        }
      } else {
        if (result?.message === "Your account has not been activated yet. Please verify your account to continue using the platform.") {
          navigate(`/account-verification/${result?.data}`);
          return
        }
        recaptchaRef.current.reset();
        alertErrorMessage(result?.message);
      }
    } catch (error) {
      alertErrorMessage("An error occurred. Please try again later.");

    } finally { LoaderHelper.loaderStatus(false); }
  };

  const handleAuthVerify = async (authType, vCode) => {
    LoaderHelper.loaderStatus(true);
    await AuthService.getCode(authType === 1 ? userDetails?.emailId : authType === 3 ? userDetails?.mobileNumber : signId, authType, vCode).then(async (result) => {
      if (result.success) {
        try {
          alertSuccessMessage(result.message);
          sessionStorage.setItem("token", result.data.token);
          sessionStorage.setItem("userId", result.data.userId);
          setLoginDetails(result.data);
          $("#Confirmation_model").modal('hide');
          const redirectPath = location?.state?.redirectTo || "/user_profile/dashboard";
          navigate(redirectPath, { replace: true });
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


  const handleEmailLogin = async () => {
    if (!signId) {
      alertErrorMessage("Please enter your email");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(signId)) {
      alertErrorMessage("Please enter a valid email address");
      return;
    }
    if (!password) {
      alertErrorMessage("Please enter your password");
      return;
    }

    if (!password.match('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')) {
      alertErrorMessage("Invalid password format"
      );
      return;
    }

    const token = recaptchaRef.current.getValue()

    if (!token) {
      alertErrorMessage("Please validate captcha to login");
      return;
    }

    await handleLogin(signId, password, token)
    recaptchaRef.current.reset();
  };

  const handlePhoneLogin = async () => {
    if (!signId) {
      alertErrorMessage("Please enter your mobile number");
      return;
    }

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
      alertErrorMessage("Invalid password format"
      );
      return;
    }

    const token = recaptchaRef2.current.getValue()

    if (!token) {
      alertErrorMessage("Please validate captcha to login");
      return;
    }

    await handleLogin(signId, password, token)
    recaptchaRef2.current.reset();
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
        sessionStorage.setItem("token", result.data.token);
        sessionStorage.setItem("userId", result.data.userId);
        setLoginDetails(result?.data);
        const redirectPath = location?.state?.redirectTo || "/user_profile/dashboard";
        navigate(redirectPath, { replace: true });
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


  const handleRecaptchaError = () => {
    // Inform the user and possibly retry
  };

  const tabChange = () => {
    setSignId("");
    setPassword("");
    setShowPassword(false);
  }

//  useEffect(() => {
 //   const currentRecaptchaRef = recaptchaRef.current;

  //  return () => {
    //  window.location.reload()
  //    if (currentRecaptchaRef) {
    //   currentRecaptchaRef.reset();
    //  }
  //  };
//  }, []);





  return (
    <>
      <Helmet>
        <title>Wrathcode User Login – Trade Crypto Instantly</title>

        <meta
          name="description"
          content="Sign in to your Wrathcode account and start trading Bitcoin, Ethereum and altcoins in minutes."
        />

        <meta
          name="keywords"
          content="login crypto exchange, Wrathcode sign in, crypto trading portal, secure account Wrathcode"
        />
      </Helmet>





      <div className="login_section login_fullhieght">

        <div class="left_bar_login">

          <div class="login_cnt">


            <h1>Exciting Welcome Rewards</h1>
            <p>Grab up to $100 Welcome Rewards to kickstart your crypto investing journey!</p>
            <ul>
              <li>     Get verified, get rewarded! Complete KYC and  <span>grab $0.50 </span></li>
            </ul>

            <div class="rewards_vector">
              <img src="/images/loginBg.png" />
            </div>

            <div className="allchains">All Chains, All Coins</div>

            <p className="registertext">Register Now,Enjoy Surprise Rates</p>

          </div>

        </div>

        <div className="login_form_right">
          <div className="form_block_login">
            <h2>Welcome To Wrathcode</h2>
            <div className="login-header">
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
            </div>
            <div className="tab-content" id="myTabContent">
              <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                <form>
                  <div className="row">
                    <div className="col-sm-12 input_block">
                      <label>Email*</label>
                      <input className="input_filed" type="email" placeholder="Please enter your email" value={signId} onChange={(e) => setSignId(e.target.value)} onBlur={(e) => setSignId(e.target.value.trim())} />

                    </div>
                    <div className="col-sm-12 input_block">
                      <label>Password*</label>
                      <div className="email_code">

                        <input className="input_filed" type={`${showPassword ? "text" : "password"}`} placeholder="Please enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <div className='get_otp' onClick={handleTogglePassword}  >
                          {
                            showPassword ?
                              <i className="ri-eye-line"></i>
                              :
                              <i className="ri-eye-close-line"></i>
                          }
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-12">
                      <Link to="/forgot_password" className="forgot_password">Forgot Password?</Link>
                    </div>

                    <div className="col-sm-12 input_block">
                      <ReCAPTCHA
                        theme="light"
                        ref={recaptchaRef}
                        sitekey={process.env.REACT_APP_GOOGLE_RECAPTCHA_CLIENTID}
                        onErrored={handleRecaptchaError}
                      />
                    </div>



                    <div className="col-sm-12 login_btn">

                      {!signId || !password ?
                        <input type="button" value="Log In" disabled />
                        :
                        <input
                          value="Log In"
                          type="button"
                          onClick={handleEmailLogin}
                        />
                      }
                    </div>
                    <div className="col-sm-12 registration__info">
                      <p>Or continue with</p>
                    </div>

                    <div className="col-sm-12">
                      <button className="google_btn" type="button" onClick={() => loginWithGoogle()}><img src="/images/google_icon.svg" alt="google" />Sign in with Google</button>

                    </div>
                    <div className="col-sm-12 registration__info bottom agreetext">
                      <p>Do you have an account? <Link to="/signup">Register</Link></p>
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
                      <label>Mobile*</label>

                      <div class="phone-input-wrapper">

                        <input className="input_filed" type="number" placeholder="Enter mobile number" onWheel={(e) => e.target.blur()} value={signId} onChange={(e) => setSignId(e.target.value)} onBlur={(e) => setSignId(e.target.value.trim())} />
                      </div>

                    </div>
                    <div className="col-sm-12 input_block">
                      <label>Password*</label>
                      <div className="email_code">

                        <input className="input_filed" type={`${showPassword ? "text" : "password"}`} placeholder="Please enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <div className='get_otp' onClick={handleTogglePassword}  >
                          {
                            showPassword ?
                              <i className="ri-eye-line"></i>
                              :
                              <i className="ri-eye-close-line"></i>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-12">
                      <Link to="/forgot_password" className="forgot_password">Forgot Password?</Link>
                    </div>

                    <div className="col-sm-12 input_block">
                      <ReCAPTCHA
                        theme="light"
                        ref={recaptchaRef2}
                        sitekey={process.env.REACT_APP_GOOGLE_RECAPTCHA_CLIENTID}
                        onErrored={handleRecaptchaError}
                      />
                    </div>
                    <div className="col-sm-12 login_btn">
                      <input type="button" value="Login" onClick={handlePhoneLogin} />
                    </div>
                    <div className="col-sm-12 registration__info">
                      <p>Or continue with</p>
                    </div>
                    <div className="col-sm-12">
                      <button className="google_btn" type="button" onClick={() => loginWithGoogle()}><img src="/images/google_icon.svg" alt="google" />Sign in with Google</button>
                    </div>
                    <div className="col-sm-12 registration__info agreetext">
                      <p>Do you have an account? <a href="#">Register</a></p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="modal fade" id="Confirmation_model" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <form className="modal-content" onSubmit={mySubmitFunction}>
            <div className="modal-header flex-column px-8">
              <h3 className="modal-title" id="placeBitLaebl">Verify {authType === 1 ? 'Email OTP' : authType === 3 ? 'Mobile OTP' : 'Authenticator Code'}</h3>
              <div className="d-flex justify-content-start align-items-center mt-3">
                {authType === 1 && `Code will be sent to ${userDetails?.emailId} `}
                {authType === 2 && 'Code will be sent to Google Authenticator App'}
                {authType === 3 && `Code will be sent to ${userDetails?.mobileNumber} `}
              </div>
              <button type="button" className="btn-custom-closer" data-bs-dismiss="modal" aria-label="Close"><i className="ri-close-fill"></i></button>
            </div>
            <div className="modal-body">
              <div className="step_2 " >
                <div className="col-md-12 m-auto mb-5 text-center" >
                  <div className="pt-4" >
                    <input type="text" className="mb-3 form-control " placeholder="Enter Your OTP" value={vCode} onChange={(e) => setVCode(e.target.value)} />
                  </div>
                  <button type="submit" onClick={() => handleAuthVerify(authType, vCode)} className="next_btn btn-gradient m-auto btn px-5 mt-2 w-50 py-3"> <span>Submit</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div> */}

      <div className="modal fade scaner_pop_up" id="Confirmation_model" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog verifypop modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <img src="/images/smartphone_icon.svg" alt="Verify smartphone" />
              <h2>Verify {authType === 1 ? 'Email OTP' : authType === 3 ? 'Mobile OTP' : 'Authenticator Code'}</h2>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">x</button>
            </div>
            <div className="modal-body">
              <input type="text" className="input_text" placeholder="Enter Code.." value={vCode} onChange={(e) => { setVCode(e.target.value) }} />
              <button className="save_btn" type="button" onClick={() => handleAuthVerify(authType, vCode)} disabled={!vCode}>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </>

  )
}

export default LoginPage


