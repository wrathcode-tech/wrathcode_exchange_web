import React, { useState, useEffect, useContext } from "react";
import { alertErrorMessage, alertSuccessMessage, } from "../../../customComponents/CustomAlertMessage";
import AuthService from "../../../api/services/AuthService";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import { $ } from "react-jquery-plugin";
import { ProfileContext } from "../../../context/ProfileProvider";
import Slider from "react-slick";
import { ApiConfig } from "../../../api/apiConfig/apiConfig";
import DashboardHeader from "../../../customComponents/DashboardHeader";
const TwofactorPage = (props) => {
  const { handleUserDetails } = useContext(ProfileContext);

  const [checkedAuth, setCheckedAuth] = useState(props?.userDetails['2fa']);
  const [vCode, setVcode] = useState("");
  const [googleQr, setGoogleQr] = useState({});
  const [googleCode, setGoogleCode] = useState();
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailID, setEmailId] = useState("");




  const checkType = () => {
    setVcode('')
    if (checkedAuth === 2) {
      getGoogleQr();
    } else if (checkedAuth === 3) {
      handleGetOtp(mobileNumber)
    }
    else if (checkedAuth === 1) {
      handleGetOtp(emailID)
    }
    else if (checkedAuth === 0) {
      if (props?.userDetails['2fa'] === 1) {
        handleGetOtp(emailID)
      }
      else if (props?.userDetails['2fa'] === 3) {
        handleGetOtp(mobileNumber)
      } else if (props?.userDetails['2fa'] === 2) {
        handleGetOtp(emailID || mobileNumber)
      }
    }
  };

  const handleGetOtp = async (checkedAuth, resend) => {
    LoaderHelper.loaderStatus(true);
    await AuthService.getOtp(checkedAuth, resend).then(async (result) => {
      LoaderHelper.loaderStatus(false);
      if (result.success) {
        try {
          alertSuccessMessage(`OTP has been sent to ${checkedAuth}`);
          $("#otp").modal('show');
        } catch (error) {
          alertErrorMessage(error);
        }
      } else {
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result.message);
      }
    });
  };


  const Update2Fa = async (checkedAuth, vCode, signId) => {
    LoaderHelper.loaderStatus(true);
    await AuthService.update2fa(checkedAuth, vCode, signId).then(async result => {
      LoaderHelper.loaderStatus(false);
      if (result.success) {
        try {
          alertSuccessMessage(result.message);
          $("#scaner_code").modal('hide');
          $("#otp").modal('hide');
          handleUserDetails();
        } catch (error) {
          alertErrorMessage(error);
        }
      } else {
        alertErrorMessage(result.message);
      }
    });
  }


  const getGoogleQr = async () => {
    LoaderHelper.loaderStatus(true);
    await AuthService.googleAuth().then(async result => {
      LoaderHelper.loaderStatus(false);
      if (result.success) {
        try {
          setGoogleQr(result.data.qr_code);
          setGoogleCode(result.data.secret.base32)
          $("#scaner").modal('show');
        } catch (error) {
          alertErrorMessage(error);
        }
      } else {
        alertErrorMessage(result.message);
      }
    });
  };

  function hideStep() {
    // const pop = document.querySelector(".step_1");
    // pop.classList.add("d-none");
    // const pop2 = document.querySelector(".step_2");
    // pop2.classList.remove("d-none");
    $("#scaner").modal('hide');
    $("#scaner_code").modal('show');

  };


  const copyCode = () => {
    navigator.clipboard
      .writeText(googleCode)
      .then(() => {
        alertSuccessMessage("Copied!!");
      })
      .catch(() => {
        alertErrorMessage("Something went wrong");
      });
  };


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCheckedAuth(props?.userDetails['2fa'])
    setMobileNumber(`${props?.userDetails?.country_code} ${props?.userDetails?.mobileNumber}`)
    setEmailId(props?.userDetails?.emailId)
  }, [props]);

  const bannerSettings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 2000
  };


  return (
    <>


      <div className="dashboard_right">



        <DashboardHeader props={props} />


        <div className="twofactor_outer_s">
          <h5>Two-Factor Authentication (2FA)</h5>
          <p>To protect your account, we recommend that you enable at least one 2FA</p>

          <div className="security_level">
            <p>Security Level：<span>Low</span></p>
          </div>

          <div className="two_factor_list">

            <div className="factor_bl active">
              <div className="lftcnt">
                <h6><img src="/images/lock_icon.svg" alt="Authenticator App" /> Authenticator App</h6>
                <p>Secure your account and withdrawals with a passkey</p>
              </div>

              <div className="enable"><img src="/images/enabled_icon.svg" alt="Not Enabled" />Not Enabled</div>
              <button className="btn" data-bs-toggle="modal" data-bs-target="#twofaInfoModal">Manage</button>

            </div>

            <div className="factor_bl">
              <div className="lftcnt">
                <h6><img src="/images/email_icon2.svg" alt="Email Verification" /> Email Verification</h6>
                <p>SeLink your email address to your account for login, password recovery and withdrawal confirmation.cure your account and withdrawals with a passkey</p>
              </div>

              <div className="enable"><img src="/images/verified_icon.svg" alt="Email Verification" /> pl***9@gmail.com</div>
              <button className="btn" data-bs-toggle="modal" data-bs-target="#emailverifyModal">Change</button>

            </div>

            <div className="factor_bl">
              <div className="lftcnt">
                <h6><img src="/images/mobile_icon.svg" alt="Mobile Verification" /> Mobile Verification</h6>
                <p>Link your mobile number to your account to receive verification codes via SMS for confirmations on withdrawal, password change, and security settings.</p>
              </div>

              <div className="enable"><img src="/images/enabled_icon.svg" alt="Not Enabled" />Not Enabled</div>
              <button className="btn" data-bs-toggle="modal" data-bs-target="#verifymobileModal">Set Up</button>

            </div>

            <div className="factor_bl">
              <div className="lftcnt">
                <h6><img src="/images/noneicon.svg" alt="Mobile Verification" /> None</h6>
                <p>Set up your Google Authenticator to provide an extra layer of security when withdrawing funds or configuring your security settings.</p>
              </div>

              <div className="enable"><img src="/images/enabled_icon.svg" alt="Not Enabled" />Not Enabled</div>
              <button className="btn">Set Up</button>

            </div>

          </div>
        </div>
      </div>



      <div className="modal fade search_form" id="twofaInfoModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered ">
            <div className="modal-content">
              <div className="modal-header">

                <h5 className="modal-title" id="exampleModalLabel">Verify Authenticator</h5>
                <p>Check your inbox and type the OTP to confirm your email address securely.</p>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">

              <div className="verify_authenticator_s">  
                <img src="/images/verifylock.svg" alt="Verify" />
                <p>Enter the 6-digit code from your authenticator 
                app to complete verification .</p>
              </div>

              <div className="verify_authenticator_form">

                <form className="profile_form">

                  <div className="emailinput">
                    <label>Enter code </label>
                    <div className="d-flex">
                      <input type="text" placeholder="123456" />
                    </div>
                  </div>

                  <button className="submit">Submit</button>

                </form>


              </div>

            </div>
          </div>
        </div>

      </div>


      <div className="modal fade search_form" id="emailverifyModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered ">
            <div className="modal-content">
              <div className="modal-header">

                <h5 className="modal-title" id="exampleModalLabel">Verify Email OTP</h5>
                <p>Check your inbox and type the OTP to confirm your email address securely.</p>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">

              <div className="verify_authenticator_s">  
                <img src="/images/verifyemail.svg" alt="Verify" />
                <p>We ‘ve sent a verification code to your 
                email pa***64@gmail.com </p>
              </div>

              <div className="verify_authenticator_form">

                <form className="profile_form">

                  <div className="emailinput">
                    <label>Enter verification code</label>
                    <div className="d-flex">
                      <input type="text" placeholder="123456" />
                      <div class="getotp">Resend Code</div>
                    </div>
                  </div>

                  <button className="submit">Submit</button>

                </form>


              </div>

            </div>
          </div>
        </div>

      </div>


      <div className="modal fade search_form" id="verifymobileModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered ">
            <div className="modal-content">
              <div className="modal-header">

                <h5 className="modal-title" id="exampleModalLabel">Verify Mobile OTP</h5>
                <p>Check your inbox and type the OTP to confirm your email address securely.</p>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">

              <div className="verify_authenticator_s">  
                <img src="/images/verifymobile.svg" alt="Verify" />
                <p>We've sent a verification code to your mobile 
                number ending in 8820</p>
              </div>

              <div className="verify_authenticator_form">

                <form className="profile_form">

                  <div className="emailinput">
                    <label>Enter verification code</label>
                    <div className="d-flex">
                      <input type="text" placeholder="123456" />
                      <div class="getotp">Resend Code</div>
                    </div>
                  </div>

                  <button className="submit">Submit</button>

                </form>


              </div>

            </div>
          </div>
        </div>

      </div>


    </>
  );
};

export default TwofactorPage;
