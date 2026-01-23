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
  const location = useLocation();
  const googlecaptchaRef = useRef(null);

  const [signId, setSignId] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [showPassword, setShowPassword] = useState(false);

  // Enhanced 2FA Login states
  const [selectedAuthMethod, setSelectedAuthMethod] = useState(1); // 1=email, 2=google, 3=mobile
  const [availableMethods, setAvailableMethods] = useState([]);
  const [resendTimer, setResendTimer] = useState(0);
  const [loginSignId, setLoginSignId] = useState(""); // Store the signId used for login
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  const recaptchaRef = useRef(null);
  const recaptchaRef2 = useRef(null);

  const navigate = useNavigate();

  const { setLoginDetails } = useContext(ProfileContext);

  // Add loginbg class on mount
  useEffect(() => {
    $("body").addClass("loginbg");
    return () => {
      $("body").removeClass("loginbg");
    };
  }, []);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Get combined OTP code
  const getOtpCode = () => otpDigits.join('');

  // Determine available verification methods based on backend response
  const determineAvailableMethods = (responseData) => {
    if (responseData?.availableMethods && responseData.availableMethods.length > 0) {
      return responseData.availableMethods.map(m => ({
        ...m,
        icon: m.type === 1 ? 'ri-mail-line' : m.type === 2 ? 'ri-shield-keyhole-line' : 'ri-smartphone-line',
        description: m.type === 1 ? 'Receive verification codes via email' : 
                     m.type === 2 ? 'Use Google Authenticator app' : 
                     'Receive verification codes via SMS'
      }));
    }
    return [];
  };

  // Send OTP for login verification (resend)
  const sendLoginOtp = async (method) => {
    try {
      // Google Auth doesn't need OTP sending
      if (method === 2) {
        return true;
      }
      
      LoaderHelper.loaderStatus(true);
      
      // Determine sendTo based on verification method
      // method 1 = email, method 3 = mobile
      const sendTo = method === 3 ? 'mobile' : 'email';
      
      const result = await AuthService.getOtp(loginSignId, 'login', sendTo);
      if (result?.success) {
        alertSuccessMessage(result?.message || 'OTP sent successfully');
        setResendTimer(60);
        return true;
      } else {
        alertErrorMessage(result?.message || 'Failed to send OTP');
        return false;
      }
    } catch (error) {
      alertErrorMessage(error?.message || 'Failed to send OTP');
      return false;
    } finally {
      LoaderHelper.loaderStatus(false);
    }
  };

  // Handle login - Step 1: Validate credentials
  const handleLogin = async (inputSignId, loginPassword, token) => {
    LoaderHelper.loaderStatus(true);
    try {
      const result = await AuthService.login(inputSignId, loginPassword, token);
      if (result?.success) {
        const responseData = result?.data;
        
        if (responseData?.requiresVerification) {
          setLoginSignId(inputSignId);
          
          const methods = determineAvailableMethods(responseData);
          setAvailableMethods(methods);
          
          const defaultMethod = responseData?.defaultMethod || 1;
          setSelectedAuthMethod(defaultMethod);
          
          // Reset OTP digits
          setOtpDigits(['', '', '', '', '', '']);
          setResendTimer(defaultMethod !== 2 ? 60 : 0);
          
          // Show verification modal
          $("#Confirmation_model").modal('show');
        } else {
          if (responseData?.token) {
            alertSuccessMessage(result.message);
            sessionStorage.setItem("token", responseData.token);
            sessionStorage.setItem("userId", responseData.userId);
            const redirectPath = location?.state?.redirectTo || "/user_profile/dashboard";
            navigate(redirectPath, { replace: true });
            window.location.reload();
          }
        }
        
      } else {
        if (result?.message === "Your account has not been activated yet. Please verify your account to continue using the platform.") {
          navigate(`/account-verification/${result?.data}`);
          return;
        }
        if (recaptchaRef.current) recaptchaRef.current.reset();
        if (recaptchaRef2.current) recaptchaRef2.current.reset();
        alertErrorMessage(result?.message);
      }
    } catch (error) {
      alertErrorMessage("An error occurred. Please try again later.");
    } finally {
      LoaderHelper.loaderStatus(false);
    }
  };

  // Open verification options popup (close main modal first)
  const handleOpenOptionsPopup = () => {
    $("#Confirmation_model").modal('hide');
    setTimeout(() => {
      $("#VerificationOptionsModal").modal('show');
    }, 100);
  };

  // Switch verification method from options popup
  const handleSelectMethod = async (method) => {
    setSelectedAuthMethod(method.type);
    setOtpDigits(['', '', '', '', '', '']);
    
    // Reset resend timer so "GET OTP" button is shown (don't auto-send)
    setResendTimer(0);
    
    // Close options popup
    $("#VerificationOptionsModal").modal('hide');
    
    // Reopen verification modal after a short delay
    setTimeout(() => {
      $("#Confirmation_model").modal('show');
    }, 100);
    
    // Don't auto-send OTP - let user click "GET OTP" button
  };

  // Close options popup and reopen verification modal
  const handleCloseOptionsPopup = () => {
    $("#VerificationOptionsModal").modal('hide');
    setTimeout(() => {
      $("#Confirmation_model").modal('show');
    }, 100);
  };

  // Verify OTP/Code and complete login
  const handleAuthVerify = async () => {
    const otpCode = getOtpCode();
    if (!otpCode || otpCode.length < 6) {
      alertErrorMessage("Please enter a valid 6-digit code");
      return;
    }
    
    LoaderHelper.loaderStatus(true);
    try {
      const result = await AuthService.getCode(loginSignId, selectedAuthMethod, otpCode);
      
      if (result?.success) {
        alertSuccessMessage(result.message);
        sessionStorage.setItem("token", result.data.token);
        sessionStorage.setItem("userId", result.data.userId);
        setLoginDetails(result.data);
        $("#Confirmation_model").modal('hide');
        const redirectPath = location?.state?.redirectTo || "/user_profile/dashboard";
        navigate(redirectPath, { replace: true });
        window.location.reload();
      } else {
        alertErrorMessage(result?.message || "Verification failed");
      }
    } catch (error) {
      alertErrorMessage("Verification failed. Please try again.");
    } finally {
      LoaderHelper.loaderStatus(false);
    }
  };

  // Email login handler
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
      alertErrorMessage("Invalid password format");
      return;
    }

    const token = recaptchaRef.current ? recaptchaRef.current.getValue() : "";

    // if (!token) {
    //   alertErrorMessage("Please validate captcha to login");
    //   return;
    // }

    await handleLogin(signId, password, token);
    if (recaptchaRef.current) recaptchaRef.current.reset();
  };

  // Phone login handler
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
      alertErrorMessage("Invalid password format");
      return;
    }

    const token = recaptchaRef2.current ? recaptchaRef2.current.getValue() : "";

    // if (!token) {
    //   alertErrorMessage("Please validate captcha to login");
    //   return;
    // }

    await handleLogin(signId, password, token);
    if (recaptchaRef2.current) recaptchaRef2.current.reset();
  };

  // Google login
  const loginWithGoogle = useGoogleLogin({
    onSuccess: tokenResponse => {
      if (tokenResponse.access_token) {
        if (googlecaptchaRef.current) {
          googlecaptchaRef.current.showCaptcha();
        }
        handleLoginGoogle(tokenResponse);
      }
    }
  });

  const handleLoginGoogle = async (tokenResponse, captchaData) => {
    LoaderHelper.loaderStatus(true);
    try {
      const result = await AuthService.googleLogin(tokenResponse, captchaData);
      if (result?.success) {
        const responseData = result?.data;
        
        if (responseData?.requiresVerification) {
          const methods = determineAvailableMethods(responseData);
          setLoginSignId(responseData?.signId || "");
          setAvailableMethods(methods);
          
          const defaultMethod = responseData?.defaultMethod || 1;
          setSelectedAuthMethod(defaultMethod);
          setOtpDigits(['', '', '', '', '', '']);
          setResendTimer(defaultMethod !== 2 ? 60 : 0);
          
          $("#Confirmation_model").modal('show');
        } else if (responseData?.token) {
          alertSuccessMessage(result?.message);
          sessionStorage.setItem("token", responseData.token);
          sessionStorage.setItem("userId", responseData.userId);
          setLoginDetails(responseData);
          const redirectPath = location?.state?.redirectTo || "/user_profile/dashboard";
          navigate(redirectPath, { replace: true });
          window.location.reload();
        }
      } else {
        alertErrorMessage(result?.message);
      }
    } catch (error) {
      alertErrorMessage(error?.message || "Login failed");
    } finally {
      LoaderHelper.loaderStatus(false);
    }
  };

  const handleRecaptchaError = () => {
    // Handle recaptcha error silently
  };

  const tabChange = () => {
    setSignId("");
    setPassword("");
    setShowPassword(false);
  };

  // Get verification title based on method
  const getVerificationTitle = () => {
    switch (selectedAuthMethod) {
      case 1: return 'Email Verification Code';
      case 2: return 'Authenticator Code';
      case 3: return 'Phone Verification Code';
      default: return 'Verification Code';
    }
  };

  // Get verification description
  const getVerificationDescription = () => {
    const selectedMethod = availableMethods.find(m => m.type === selectedAuthMethod);
    const maskedValue = selectedMethod?.maskedValue;
    
    if (selectedAuthMethod === 1) {
      return `Enter the 6-digit code sent to ${maskedValue || 'your email'}`;
    } else if (selectedAuthMethod === 2) {
      return 'Enter the 6-digit code generated by the authenticator app';
    } else if (selectedAuthMethod === 3) {
      return `Enter the 6-digit code sent to ${maskedValue || 'your phone'}`;
    }
    return 'Enter your verification code';
  };

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

      <div className="login_fullhieght">
        <div className="login_section">
          <div className="login_form_right">
            <div className="form_block_login">
              <img className='lightlogo' src="/images/logo_light.svg" alt="logo" />
              <h2>Login</h2>
              <div className="login-header">
                <ul className="nav nav-tabs login-pills" id="myTab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button"
                      role="tab" aria-controls="home" aria-selected="true" onClick={tabChange}>
                      Email
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile"
                      type="button" role="tab" aria-controls="profile" aria-selected="false" onClick={tabChange}>
                      Mobile
                    </button>
                  </li>
                </ul>
              </div>
              <div className="tab-content" id="myTabContent">
                {/* Email Login Tab */}
                <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="row">
                      <div className="col-sm-12 input_block">
                        <input 
                          className="input_filed" 
                          type="email" 
                          placeholder="Please enter your email" 
                          value={signId} 
                          onChange={(e) => setSignId(e.target.value)} 
                          onBlur={(e) => setSignId(e.target.value.trim())} 
                        />
                      </div>
                      <div className="col-sm-12 input_block">
                        <div className="email_code">
                          <input 
                            className="input_filed" 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Please enter your password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                          />
                          <div className='get_otp' onClick={handleTogglePassword}>
                            {showPassword ? <i className="ri-eye-line"></i> : <i className="ri-eye-close-line"></i>}
                          </div>
                        </div>
                      </div>

                      <div className="col-sm-12 forgot_password">
                        <Link to="/forgot_password">Forgot Password?</Link>
                      </div>

                      <div className="col-sm-12 input_block">
                        <ReCAPTCHA
                          theme="dark"
                          ref={recaptchaRef}
                          sitekey={process.env.REACT_APP_GOOGLE_RECAPTCHA_CLIENTID}
                          onErrored={handleRecaptchaError}
                        />
                      </div>

                      <div className="col-sm-12 login_btn">
                        <input 
                          type="button" 
                          value="Log In" 
                          onClick={handleEmailLogin}
                          disabled={!signId || !password}
                        />
                      </div>
                      <div className="col-sm-12 registration__info">
                        <p>Or continue with</p>
                      </div>

                      <div className="col-sm-12">
                        <button className="google_btn" type="button" onClick={() => loginWithGoogle()}>
                          <img src="/images/google_icon.svg" alt="google" />Sign in with Google
                        </button>
                      </div>
                      <div className="col-sm-12 registration__info bottom agreetext">
                        <p>Do you have an account? <Link to="/signup">Register</Link></p>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Mobile Login Tab */}
                <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="row">
                      <div className="col-sm-12 input_block">
                        <div>
                          <Select
                            styles={customStyles}
                            inputId="countryCode"
                            name="country_code_select"
                            options={countriesList}
                            onChange={(selected) => setCountryCode(selected?.value)}
                            value={countriesList.find(option => option.value === countryCode)}
                          />
                        </div>
                      </div>
                      <div className="col-sm-12 input_block">
                        <div className="phone-input-wrapper">
                          <input 
                            className="input_filed" 
                            type="number" 
                            placeholder="Enter mobile number" 
                            onWheel={(e) => e.target.blur()} 
                            value={signId} 
                            onChange={(e) => setSignId(e.target.value)} 
                            onBlur={(e) => setSignId(e.target.value.trim())} 
                          />
                        </div>
                      </div>
                      <div className="col-sm-12 input_block">
                        <div className="email_code">
                          <input 
                            className="input_filed" 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Please enter your password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                          />
                          <div className='get_otp' onClick={handleTogglePassword}>
                            {showPassword ? <i className="ri-eye-line"></i> : <i className="ri-eye-close-line"></i>}
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-12 forgot_password">
                        <Link to="/forgot_password">Forgot Password?</Link>
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
                        <button className="google_btn" type="button" onClick={() => loginWithGoogle()}>
                          <img src="/images/google_icon.svg" alt="google" />Sign in with Google
                        </button>
                      </div>
                      <div className="col-sm-12 registration__info agreetext">
                        <p>Do you have an account? <Link to="/signup">Register</Link></p>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Verification Modal - Same structure as SettingsPage */}
      <div className="modal fade search_form" id="Confirmation_model" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" data-bs-backdrop="static">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">{getVerificationTitle()}</h5>
              <p>{getVerificationDescription()}</p>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form className="profile_form" onSubmit={(e) => e.preventDefault()}>
                
                <div className="emailinput">
                  <label>Enter 6-digit Code</label>
                  <div className="d-flex">
                    <input 
                      type="text" 
                      placeholder="Enter OTP here..."
                      value={getOtpCode()}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        const newDigits = value.split('').concat(Array(6).fill('')).slice(0, 6);
                        setOtpDigits(newDigits);
                      }}
                      maxLength={6}
                    />
                    {/* Resend button for Email/Mobile OTP */}
                    {selectedAuthMethod !== 2 && (
                      resendTimer > 0 ? (
                        <div className="resend otp-button-disabled">Resend ({resendTimer}s)</div>
                      ) : (
                        <button
                          type="button"
                          className="getotp otp-button-enabled getotp_mobile"
                          onClick={() => sendLoginOtp(selectedAuthMethod)}
                        >
                          GET OTP
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Switch verification option link - only show if multiple methods */}
                {availableMethods.length > 1 && (
                
                    <div className="cursor-pointer"   onClick={(e) => { e.preventDefault(); handleOpenOptionsPopup(); }}>
                      <small className="text-white">  Switch to Another Verification Option<i class="ri-external-link-line"></i></small>
                    </div>  
                )}

                <button
                  className="submit"
                  type="button"
                  onClick={handleAuthVerify}
                  disabled={getOtpCode().length < 6}
                >
                  Confirm
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Options Modal - Same structure as SettingsPage */}
      <div className="modal fade search_form" id="VerificationOptionsModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">Select a Verification Option</h5>
              <p>Choose how you want to verify your identity</p>
              <button type="button" className="btn-close" onClick={handleCloseOptionsPopup} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form className="profile_form" onSubmit={(e) => e.preventDefault()}>
                
                {availableMethods.map((method) => (
                  <div className="" key={method.type}>
                    <div 
                      className="d-flex align-items-center justify-content-between text-white" 
                      onClick={() => handleSelectMethod(method)}
                      role="button"
                    >
                      <div className="d-flex align-items-center">
                        <i className={`${method.icon} me-3`}></i>
                        <div>
                          <strong>{method.label}</strong>
                          <p className="mb-0  small">{method.description}</p>
                        </div>
                      </div>
                      <i className="ri-arrow-right-s-line"></i>
                    </div>
                  </div>
                ))}

              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
