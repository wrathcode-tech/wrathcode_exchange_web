import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AuthService from "../../../api/services/AuthService";
import { alertErrorMessage, alertSuccessMessage } from "../../../customComponents/CustomAlertMessage";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import { Helmet } from "react-helmet-async";
import ReCAPTCHA from "react-google-recaptcha";

const RegistrationVerification = () => {
  const { authenticationToken } = useParams()
  const navigate = useNavigate()

  const googlecaptchaRef = useRef(null);

  const [otp, setOtp] = useState("");
  const [disableBtn, setDisbaleBtn] = useState(false);
  const [timer, setTimer] = useState(0);
  const [attemptLeft, setAttemptLeft] = useState("");

  const [signId, setSignId] = useState("");
  const [registeredBy, setRegisteredBy] = useState("");

  const handleLogin = async () => {
    const token = googlecaptchaRef.current.getValue()
    if (!token) {
      alertErrorMessage("Please validate captcha");
      return;
    }
    if (otp?.length < 5) {
      alertErrorMessage("Invalid OTP");
      return
    };

    LoaderHelper.loaderStatus(true);
    try {
      const result = await AuthService.verifyRegistrationOtp(signId, +otp,registeredBy, token);
      if (result?.success) {
        alertSuccessMessage(result?.message);
        navigate(`/account-activate/${authenticationToken}`);
        LoaderHelper.loaderStatus(false);
      } else {
        // recaptchaRef.current.reset();
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result?.message);
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
    } finally { googlecaptchaRef.current.reset(); }
  };



  const handleGetOtp = async () => {
    LoaderHelper.loaderStatus(true);
    await AuthService.registrationOtp(signId, registeredBy).then(async (result) => {
      LoaderHelper.loaderStatus(false);
      if (result?.success) {
        try {
          alertSuccessMessage(result?.message);
          setDisbaleBtn(true);
          setTimer(60);
          setAttemptLeft(result?.attemptsLeft)
        } catch (error) {
          alertErrorMessage(error);
        }
      } else {
        if (result?.message === "No OTP attempt left. Your account has been suspended.") {
          alertErrorMessage(result?.message);
          navigate(`/account-activate/${authenticationToken}`);
        }
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result?.message);
      }
    });
  };

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



  const verifyRegistrationToken = async () => {
    try {
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.verifyRegistrationToken(authenticationToken)
      if (result?.success) {
        if (result?.accountStatus === "Inactive") {
          setSignId(result?.data?.signId);
          setRegisteredBy(result?.data?.registeredBy);
        } else {
          navigate(`/account-activate/${authenticationToken}`);
          // Show account verified page
        }
      } else {
        if (result?.accountStatus === "Blocked") {
          navigate(`/account-activate/${authenticationToken}`);
        }
        alertErrorMessage(result?.message);
      }
    } catch (error) {
      alertErrorMessage(error?.message);
    } finally { LoaderHelper.loaderStatus(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };


  useEffect(() => {
    verifyRegistrationToken()

  }, [authenticationToken]);





  useEffect(() => {
    const currentRecaptchaRef = googlecaptchaRef.current;

    return () => {
      window.location.reload()
      if (currentRecaptchaRef) {
        currentRecaptchaRef.reset();
      }
    };
  }, []);

  return (
    <>
      <Helmet>
        <title> Wrathcode | The world class new generation crypto asset exchange</title>
      </Helmet>


      <div className="login_section m-auto verifiedform">

        <div className="login_form_right account-verification">

          <div className="form_block_login">

            <div className="security_shield_vector">
              <img src="/images/security_shield.svg" alt="security" />
            </div>

            <h4>Please Verify Your Account</h4>

            <p>Make your account 100% secure against unauthorized logins.</p>
            <p>Registered {registeredBy || "---"}: <span>{signId || "---"}</span></p>
            <div className="tab-content" id="myTabContent">
              <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                <form>
                  <div className="row">
                    <div className="col-sm-12 input_block">
                      <label>Email Verification Code*</label>
                      <div className="email_code">
                        <input className="input_filed" type="number" placeholder="Enter Code" value={otp} onChange={(e) => setOtp(e.target.value)} onWheel={(e) => e.target.blur()} />
                        <button className="get_otp otpcode" type="button" disabled={disableBtn} onClick={() => { handleGetOtp(signId, 'registration'); }}>{disableBtn ? `Resend OTP (${timer}s)` : "GET OTP"}</button>
                      </div>
                      {attemptLeft && <small className="text-warning">Verification attempts left: {attemptLeft - 1}</small>}
                    </div>
                    <div className="col-sm-12 input_block">
                      <ReCAPTCHA
                        theme="light"
                        ref={googlecaptchaRef}
                        sitekey={process.env.REACT_APP_GOOGLE_RECAPTCHA_CLIENTID}
                      />
                    </div>

                    <div className="col-sm-12 login_btn">
                      {!signId || otp?.length < 5 ?
                        <input type="button" value="Verify" disabled />
                        :
                        <input
                          value="Verify"
                          type="button"
                          onClick={() => handleLogin()} />
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




    </>
  )
}

export default RegistrationVerification
