import React, { useContext, useEffect, useState } from 'react'
import Slider from 'react-slick'
import { ApiConfig } from '../../../api/apiConfig/apiConfig';
import { $ } from 'react-jquery-plugin';
import { alertErrorMessage, alertSuccessMessage } from '../../../customComponents/CustomAlertMessage';
import LoaderHelper from '../../../customComponents/Loading/LoaderHelper';
import AuthService from '../../../api/services/AuthService';
import SumsubWebSdk from "@sumsub/websdk-react";
import { ProfileContext } from '../../../context/ProfileProvider';
import DashboardHeader from '../../../customComponents/DashboardHeader';

const KYCVerification = (props) => {

  const { userDetails, handleUserDetails, newStoredTheme } = useContext(ProfileContext);
  const [sumsubMsgq, setSumsubMsgq] = useState({});
  const [kycRejectReason, setKycRejectReason] = useState(userDetails?.kyc_reject_reason);
  const [accessToken, setAccessToken] = useState("");
  const [kycVerfied, setKycVerfied] = useState(1);
  const [kyc2fa, setKyc2fa] = useState(userDetails?.["2fa"]);
  const [emailId, setEmailId] = useState(userDetails?.emailId);
  const [showKycPage, setShowKycPage] = useState(false);
  const [resubmitKyc, setResubmitKyc] = useState({});

  useEffect(() => {
    handleUserDetails();
  }, []);

  const getAccessToken = async () => {
    setAccessToken("");
    LoaderHelper.loaderStatus(true);
    try {
      const result = await AuthService.accessTokenSumsub()
      if (result.success) {
        setAccessToken(result?.data?.token);
      } else {
        alertErrorMessage("We are unable to generate your access token right now. Please try again after some time. ");
      }
    } catch (error) {
      alertErrorMessage("We are unable to generate your access token right now. Please try again after some time. ");

    } finally {
      LoaderHelper.loaderStatus(false);
    }
  };

  const FormattedMessage = () => {
    const formattedText = kycRejectReason
      .split("-") // Split the text at each "-"
      .map((line, index) => (
        <React.Fragment key={index}>
          {line.trim()}
          {index !== kycRejectReason.split("-").length - 1 && <br />}
        </React.Fragment>
      ));

    return <div>{formattedText}</div>;
  };

  useEffect(() => {
    // setKycVerfied(userDetails?.kycVerified)
    setKycRejectReason(userDetails?.kyc_reject_reason)
    setEmailId(userDetails?.emailId)
    setKyc2fa(userDetails?.["2fa"])
  }, [userDetails]);




  useEffect(() => {
    if (sumsubMsgq === "idCheck.onApplicantStatusChanged") {
      if (resubmitKyc?.reviewStatus === "completed" && resubmitKyc?.reviewResult?.reviewAnswer !== "RED") {
        setShowKycPage(false)
        handleFuncDelay();
      }
    } else if (sumsubMsgq === "idCheck.onApplicantLoaded") {
      setShowKycPage(true)
    }
  }, [sumsubMsgq]);

  const handleFuncDelay = async () => {
    await new Promise((resolve) => {
      setTimeout(() => {
        handleUserDetails()
        resolve();
      }, 1500);
    });

    if (resubmitKyc?.reviewResult?.reviewAnswer === "GREEN") {
      $("#deposit-bonus-modal").modal('show');
      alertSuccessMessage("Kyc verified successfully!!")
    }
    if (resubmitKyc?.reviewResult?.reviewAnswer === "RED") {
      alertErrorMessage("Kyc rejected")
    }
  }
  useEffect(() => {

    if (kycVerfied === 0 && accessToken === "") {
      getAccessToken()
    }
  }, [kycVerfied]);

  const verifykycAgain = async () => {
    setKycVerfied(4);
    setShowKycPage(false)
    setAccessToken("Verify again")
    await getAccessToken();
    setShowKycPage(true)
  }


  const htmlElement = document.documentElement;

  // Retrieve the value of the 'data-theme' attribute
  const Theme = htmlElement.getAttribute('data-theme');
  const [theme, setTheme] = useState(Theme);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const htmlElement = document.documentElement;
    // Retrieve the value of the 'data-theme' attribute
    const Theme = htmlElement.getAttribute('data-theme');
    setTheme(Theme);
    setReloadKey((prevKey) => prevKey + 1);
  }, [newStoredTheme]);

  const toggleTheme = () => {
    // Toggle between two themes
    const newTheme =
      theme.primaryColor === "#3498db"
        ? { primaryColor: "#e74c3c", secondaryColor: "#9b59b6" }
        : { primaryColor: "#3498db", secondaryColor: "#2ecc71" };
    setTheme(newTheme);
    setReloadKey((prevKey) => prevKey + 1); // Change the key to reinitialize the widget
  };


  useEffect(() => {
    if (userDetails?.kycVerified === 0 || userDetails?.kycVerified === 3) {
      $("#p2p_modal").modal('show');
    }

  }, []);




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






        {
          (kycVerfied === 1 || kycVerfied === 0) ?
            // pending KYC
            <div className="dashboard_listing_section Overview_mid">

              <div className="Verify_img">
                <img src="/images/verify_img.svg" alt="verify" />
              </div>

              <div className="Verify_img mobile_view_verify">
                <img src="/images/mobile_verfication.svg" alt="verify" />
              </div>

              <div className="verify_btn"><a href="#/" onClick={() => setKycVerfied(0)}>Verify</a></div>



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
            :
            kycVerfied === 2 ?
              //  Verify Approved
              <div className="dashboard_listing_section Overview_mid">


                <div className="Verify_img">
                  <img src="/images/verify_img2.svg" alt="verify" />
                </div>

                <div className="Verify_img mobile_view_verify">
                  <img src="/images/verification_mobile2.svg" alt="verify" />
                </div>


                <div className="kyc_approval_s">


                  <div className="Verify_img">
                    <img src="/images/kyc.png" alt="verify" />
                  </div>

                  <div className="cnt">
                    <h3>Congratulations</h3>
                    <p>Your Wrathcode account KYC has been successfully approved! You can now access all features and <a href='/trade/kyc'> start  trading</a> seamlessly.</p>
                  </div>


                </div>




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

                </div>



              </div>
              : kycVerfied === 3 ?

                <div className="dashboard_listing_section Overview_mid">


                  <div className="Verify_img">
                    <img src="/images/verify_img.svg" alt="verify" />
                  </div>

                  <div className="Verify_img mobile_view_verify">
                    <img src="/images/mobile_verfication.svg" alt="verify" />
                  </div>


                  <div className="kyc_approval_s rejected">


                    <div className="Verify_img">
                      <img src="/images/kyc_cancel.svg" alt="verify" />
                    </div>

                    <div className="cnt">
                      <h3 className="red">Rejected</h3>
                      <p> Your request was not approved. Sometimes, things don’t go as planned — but don't worry.
                        You can review your details and try again.Ensuring accuracy helps us serve you better.</p>
                      <div className="verify_btn"><a href="#">Try again</a></div>
                    </div>
                  </div>
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

                  </div>



                </div> : ""
        }

        {accessToken && (kycVerfied === 4 || kycVerfied === 0) && <div className={!showKycPage && "d-none"}>
          <SumsubWebSdk
            key={reloadKey}
            testEnv={true}
            accessToken={accessToken}
            expirationHandler={getAccessToken}
            config={{
              lang: "en",
              theme: theme, // Dynamically change theme
            }}

            options={{ addViewportTag: false, adaptIframeHeight: true }}
            onMessage={(data, payload) => {
              setSumsubMsgq(data); setResubmitKyc(payload);
            }}
            onError={(data) => console.log("onError", data)}
          />
          {(kycVerfied === 3 || kycVerfied === 1 || kycVerfied === 0 || kycVerfied === 4) && <div className="text-center mt-2">  <small className="text-warning">Please avoid submitting the same documents for multiple accounts, as this may result in account suspension</small></div>}
        </div>}
      </div>
    </>
  )
}

export default KYCVerification
