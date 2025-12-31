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
      {/* <div className="tab-pane" id="AuthencationPill" role="tabpanel" aria-labelledby="Authencation-pill">
        <div className="row">
          <div className="col-md-12 col-lg-10 m-auto ">
            <div className="card twofa_card">

              <div className="card-body" >

                <div className="card-header" >
                  <h3>2FA Security</h3>
                  <p className="mb-0 text-muted" >Setup 2FA for more security</p>
                </div>
                <div className="card-body_inner mt-4 mt-md-5" >
                  <p className="mb-0 text-muted" >Select Two Factor Authentication for your security.</p>
                  <hr />
                  <div className=" twofa_list d-flex align-items-center justify-space-between">
                    <h6 className="mb-0 w-100">Authenticator App</h6>
                    <div className="form-check  switch_btns form-switch">
                      <input className="form-check-input" type="checkbox" name="Two-Factor" id="1" onClick={() => setCheckedAuth(2)} checked={checkedAuth === 2} />
                    </div>
                  </div>
                  <div className="twofa_list d-flex align-items-center justify-space-between">
                    <h6 className="mb-0 w-100">Email OTP </h6>
                    <div className="form-check  switch_btns form-switch">
                      <input className="form-check-input" type="checkbox" name="Two-Factor" id="1" onChange={() => setCheckedAuth(1)} checked={checkedAuth === 1} disabled={!emailID} />
                    </div>
                  </div>
                  <div className="twofa_list d-flex align-items-center justify-space-between">
                    <h6 className="mb-0 w-100">Mobile OTP </h6>
                    <div className="form-check  switch_btns form-switch">
                      <input className="form-check-input" type="checkbox" name="Two-Factor" id="4" onChange={() => setCheckedAuth(3)} checked={checkedAuth === 3} disabled={!mobileNumber} />
                    </div>
                  </div>
                  <div className="twofa_list d-flex align-items-center justify-space-between">
                    <h6 className="mb-0 w-100">None</h6>
                    <div className="form-check  switch_btns form-switch">
                      <input className="form-check-input" type="checkbox" name="Two-Factor" id="3" onChange={() => setCheckedAuth(0)} checked={checkedAuth === 0} />
                    </div>
                  </div>
                </div>
                <hr />


                <div className="col-md-12 ">
                  <div className="field-box text-end pt-2">
                    <button className="btn  custom-btn px-4 px-5 btn-xl  justify-content-center btn-medium mb-0" type="button" data-toggle="modal" onClick={() => checkType()}><span>Save Settings</span></button>
                  </div>
                </div>




              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="google_modal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <form className="modal-content">
            <div className="modal-header flex-column px-8">
              <h3 className="modal-title" id="placeBitLaebl"> Authenticator App </h3>
              <button type="button" className="btn-custom-closer" data-bs-dismiss="modal" aria-label="Close"><i
                className="ri-close-fill"></i></button>
            </div>
            <div className="modal-body conin_purchase">
              <div className="step_1 " >
                <div className="col-md-12 m-auto mb-2 text-center" >
                  <img className="img-fluid qr_img w-50" src={googleQr} />
                  <div className="field-box field-otp-box mb-2">
                    <input readOnly name="text" className="form-control cursor-pointer" type="text" value={googleCode} onClick={() => copyCode()} />
                  </div>
                  <small className="d-block text-center w-100 mb-4" >Click to copy code</small>
                  <button type="button" className="text-center next_btn btn-gradient m-auto w-100 btn btn-block" onClick={() => hideStep()}> Next </button>
                </div>
              </div>
              <div className="step_2 d-none" >
                <div className="col-md-8 m-auto mb-5 text-center" >
                  <div className="pt-2 mb-3" >
                    <input type="text" className="mb-3 form-control" value={vCode} placeholder="Enter Code.." onChange={(event) => setVcode(event.target.value)} />
                  </div>
                  <button
                    type="button"
                    className="text-center next_btn btn-gradient m-auto w-100 btn btn-block"
                    onClick={() => Update2Fa(
                      checkedAuth,
                      vCode,
                      checkedAuth === 0 ? emailID : checkedAuth === 1 ? emailID : checkedAuth === 2 ? emailID : mobileNumber

                    )}
                  >
                    <span>Submit</span>
                  </button>

                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="modal fade" id="otp" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <form className="modal-content">
            <div className="modal-header flex-column px-8">
              <h3 className="modal-title" id="placeBitLaebl">Verify {(checkedAuth == 3) ? 'Mobile' : (checkedAuth == 1) ? 'Email' : " "}  OTP</h3>
              <button type="button" className="btn-custom-closer" data-bs-dismiss="modal" aria-label="Close"><i
                className="ri-close-fill"></i></button>
            </div>
            <div className="modal-body conin_purchase">
              <div className="step_2 " >
                <div className="col-md-8 m-auto mb-5 text-center" >
                  <div className="pt-2" >
                    <input type="text" className="mb-3 form-control " placeholder="Enter OTP" value={vCode} onChange={(e) => { setVcode(e.target.value) }} />
                  </div>
                  <button type="button" onClick={() => Update2Fa(checkedAuth, vCode, checkedAuth === 0 ? emailID : checkedAuth === 1 ? emailID : checkedAuth === 2 ? emailID : mobileNumber)} disabled={!vCode} className="next_btn btn-gradient m-auto w-100 btn btn-block mt-3"> <span>Submit</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div> */}

      <div className="dashboard_right">



        <DashboardHeader props={props} />

        <div className="dashboard_listing_section Overview_mid">


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
                    {/* <button className="save_btn" type="button" data-bs-toggle="modal" data-bs-target="#scaner_code">email Settings</button> */}




                    {/* <!-- Modal Select Two Factor Authentication for your security scaner pop-up --> */}
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





                    {/* <!-- Modal Select Two Factor Authentication for your security scaner pop-up --> */}
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


                    {/* <!-- Modal Select Email/mobile otp--> */}
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


    </>
  );
};

export default TwofactorPage;
