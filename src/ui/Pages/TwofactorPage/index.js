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
              <button className="btn">Manage</button>

            </div>

            <div className="factor_bl">
              <div className="lftcnt">
                <h6><img src="/images/email_icon2.svg" alt="Email Verification" /> Email Verification</h6>
                <p>SeLink your email address to your account for login, password recovery and withdrawal confirmation.cure your account and withdrawals with a passkey</p>
              </div>

              <div className="enable"><img src="/images/verified_icon.svg" alt="Email Verification" /> pl***9@gmail.com</div>
              <button className="btn">Change</button>

            </div>

            <div className="factor_bl">
              <div className="lftcnt">
                <h6><img src="/images/mobile_icon.svg" alt="Mobile Verification" /> Mobile Verification</h6>
                <p>Link your mobile number to your account to receive verification codes via SMS for confirmations on withdrawal, password change, and security settings.</p>
              </div>

              <div className="enable"><img src="/images/enabled_icon.svg" alt="Not Enabled" />Not Enabled</div>
              <button className="btn">Set Up</button>

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



        {/* <div className="dashboard_listing_section Overview_mid">


          <div className="kyc_approval_s activity_logs twofactor_outer_s">

            <div className="row">

              <div className="col-sm-8">


                <div className="cnt">
                  <h3>2FA Security</h3>
                  <p>Setup 2FA for more security</p>

                  <div className="Security_factor">

                    <p>Select Two Factor Authentication for your security.</p>

                    <div className="two_factor_list">

                      <div className="factor_bl">
                        Authenticator App
                        <label className="switch">
                          <input type="checkbox" id="twoFactorSwitch" onClick={() => setCheckedAuth(2)} checked={checkedAuth === 2} />
                          <span className="slider round"></span>
                        </label>
                      </div>

                      <div className="factor_bl">
                        Email OTP
                        <label className="switch">
                          <input type="checkbox" id="twoFactorSwitch" onClick={() => setCheckedAuth(1)} checked={checkedAuth === 1} disabled={!emailID} />
                          <span className="slider round"></span>
                        </label>
                      </div>

                      <div className="factor_bl">
                        Mobile OTP
                        <label className="switch">
                          <input type="checkbox" id="twoFactorSwitch" onClick={() => setCheckedAuth(3)} checked={checkedAuth === 3} disabled={!props?.userDetails?.mobileNumber} />
                          <span className="slider round"></span>
                        </label>
                      </div>

                      <div className="factor_bl">
                        None
                        <label className="switch">
                          <input type="checkbox" id="twoFactorSwitch" onClick={() => setCheckedAuth(0)} checked={checkedAuth === 0} />
                          <span className="slider round"></span>
                        </label>
                      </div>


                    </div>

                    <button className="save_btn" type="button" disabled={checkedAuth === props?.userDetails['2fa']} onClick={() => checkType()}>Save Settings</button>
                    <button className="save_btn" type="button" data-bs-toggle="modal" data-bs-target="#scaner_code">email Settings</button>




             
                    <div className="modal fade scaner_pop_up" id="scaner" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                      <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h2>Authenticator App</h2>

                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">x</button>
                          </div>
                          <div className="modal-body">

                            <div className="scaner_img">
                              <img src={googleQr} alt="scan" />
                            </div>

                            <input type="text" className="code_scaner" value={googleCode} />
                            <small onClick={copyCode}>Click to copy code</small>

                            <button className="save_btn" type="button" onClick={() => hideStep()}>Next</button>

                          </div>

                        </div>
                      </div>
                    </div>





                   Modal Select Two Factor Authentication for your security scaner pop-up 
                    <div className="modal fade scaner_pop_up" id="scaner_code" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                      <div className="modal-dialog verifypop modal-dialog-centered">
                        <div className="modal-content">
                          <div className="modal-header">
                            <img src="/images/smartphone_icon.svg" alt="Verify smartphone" />
                            <h2>Authenticator App</h2>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">x</button>
                          </div>
                          <div className="modal-body">

                            <input type="text" className="input_text" placeholder="Enter Code.." value={vCode} onChange={(e) => { setVcode(e.target.value) }} />

                            <button className="save_btn" type="button" disabled={!vCode} onClick={() => Update2Fa(checkedAuth, vCode, checkedAuth === 0 ? emailID : checkedAuth === 1 ? emailID : checkedAuth === 2 ? emailID : mobileNumber)}>Submit</button>

                          </div>

                        </div>
                      </div>
                    </div>


                   Modal Select Email/mobile otp
                    <div className="modal fade scaner_pop_up" id="otp" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                      <div className="modal-dialog verifypop modal-dialog-centered">
                        <div className="modal-content">
                          <div className="modal-header">
                            <img src="/images/smartphone_icon.svg" alt="Verify smartphone" />
                            <h2>Verify  OTP</h2>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">x</button>
                          </div>
                          <div className="modal-body">

                            <input type="text" className="input_text" placeholder="Enter Code.." value={vCode} onChange={(e) => { setVcode(e.target.value) }} />

                            {checkedAuth === 0 ? <button className="save_btn" type="button" onClick={() => Update2Fa(checkedAuth, vCode, props?.userDetails['2fa'] === 0 ? emailID : props?.userDetails['2fa'] === 1 ? emailID : props?.userDetails['2fa'] === 2 ? (emailID || mobileNumber) : mobileNumber)} disabled={!vCode}>Submit</button> :
                              <button className="save_btn" type="button" onClick={() => Update2Fa(checkedAuth, vCode, checkedAuth === 0 ? emailID : checkedAuth === 1 ? emailID : checkedAuth === 2 ? emailID : mobileNumber)} disabled={!vCode}>Submit</button>}



                          </div>

                        </div>
                      </div>
                    </div>



                  </div>


                </div>

              </div>

              <div className="col-sm-4">
                <div className="serurity_vector">
                  <img src="/images/security_icon2.svg" alt="icon" />
                </div>
              </div>


            </div>


          </div>

        
        </div> */}

      </div>


    </>
  );
};

export default TwofactorPage;
