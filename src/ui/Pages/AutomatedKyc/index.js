import React, { useState, useEffect, useContext } from "react";
import { alertErrorMessage, alertSuccessMessage } from "../../../customComponents/CustomAlertMessage";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import AuthService from "../../../api/services/AuthService";
import { ProfileContext } from "../../../context/ProfileProvider";
import SumsubWebSdk from "@sumsub/websdk-react";
import { Link } from "react-router-dom";
import { $ } from "react-jquery-plugin";

const AutomatedKyc = () => {

    const { userDetails, handleUserDetails, newStoredTheme } = useContext(ProfileContext);
    const [sumsubMsgq, setSumsubMsgq] = useState({});
    const [kycRejectReason, setKycRejectReason] = useState(userDetails?.kyc_reject_reason);
    const [accessToken, setAccessToken] = useState("");
    const [kycVerfied, setKycVerfied] = useState();
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
        setKycVerfied(userDetails?.kycVerified)
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




    return (<>
        <div className="tab-pane" id="SecurityPill" role="tabpanel" aria-labelledby="Security-pill">
            <div className="upload-formate d-flex justify-content-center align-items-center">
                <div>
                    <h3 className="mt-1 text-center">
                        KYC Verification
                    </h3>

                </div>
            </div>
            <div className="row ">
                <div className="col-lg-12 mx-auto ">
                    {
                        kycVerfied === 1 ?
                            // pending KYC
                            <div className="container" >
                                <div className="row" >
                                    <div className="col-lg-12 m-auto" >
                                        <div className="create-item-wrapper create-item-wrapper-kyc">
                                            <div className="form-field-wrapper kyc_wrapper ">
                                                <div className="rightsidebox">
                                                    <div className="bt_right d-flex justify-content-center" >
                                                        <img src="/images/kyc.png" alt="" width="200px" className="img-fluid" />
                                                    </div>
                                                    <div className="kyc_nofti kyc_done kyc_trade_link" >
                                                        <div className="sc-bdfBQB sc-kmATbt fOxqyX dzKkzw">
                                                            <div className={`check_bar ${!emailId ? "" : "active"}`}><i className="ri-check-fill"></i>
                                                                <h5> Email</h5>
                                                            </div>
                                                            <div className={`check_bar ${kyc2fa == '0' ? "" : "active"}`}><i className="ri-check-fill"></i>
                                                                <h5> Security </h5>
                                                            </div>
                                                            <div className="check_bar "><i className="ri-check-fill"></i>
                                                                <h5> Welcome </h5>
                                                            </div>
                                                        </div>
                                                        <div className="d-kyc_sec" >
                                                            <div className="text-center">
                                                                <h4 className="text-success"> <strong>KYC Pending</strong></h4>
                                                                <p>Your Wrathcode account is pending for Verification</p>
                                                            </div>
                                                            <Link to="/user_profile" className="btn custom-btn custom-border-btn kyc_trade_link custom-border-btn-white me-2">
                                                                <span> Back to Home </span>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            : kycVerfied === 2 ?
                                //  Verify Approved
                                <div className="container" >
                                    <div className="row" >
                                        <div className="col-lg-12 m-auto" >
                                            <div className="create-item-wrapper create-item-wrapper-kyc">
                                                <div className="form-field-wrapper kyc_wrapper ">
                                                    <div className="rightsidebox">
                                                        <div className="bt_right d-flex justify-content-center" >
                                                            <img src="/images/kyc.png" alt="" width="200px" className="img-fluid" />
                                                        </div>
                                                        <div className="kyc_nofti kyc_done kyc_trade_link" >
                                                            <div className="sc-bdfBQB sc-kmATbt fOxqyX dzKkzw">
                                                                <div className={`check_bar ${!emailId ? "" : "active"}`}><i className="ri-check-fill " value=""></i>
                                                                    <h5> Email</h5>
                                                                </div>
                                                                <div className={`check_bar ${!kyc2fa ? "" : "active"}`}><i className="ri-check-fill "></i>
                                                                    <h5> Security </h5>
                                                                </div>
                                                                <div className="check_bar active"><i className="ri-check-fill "></i>
                                                                    <h5> Welcome </h5>
                                                                </div>
                                                            </div>
                                                            {/* <hr /> */}
                                                            <div className="d-kyc_sec" >
                                                                <div className="text-center">
                                                                    <h4 className="text-success pb-0">Congratulations</h4>
                                                                    <p>Your Wrathcode account Kyc is Approved</p>
                                                                </div>
                                                                <Link to="/trade/KYC" className="btn custom-btn justify-content-center kyc_trade_link"> <span>Start Trading</span> </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                : kycVerfied === 3 ?
                                    // KYC Rejected
                                    <div className="container" >
                                        <div className="row" >
                                            <div className="col-lg-12 m-auto" >
                                                <div className="create-item-wrapper create-item-wrapper-kyc">
                                                    <div className="form-field-wrapper kyc_wrapper ">
                                                        <div className="rightsidebox">
                                                            <div className="bt_right d-flex justify-content-center" >
                                                                <img src="/images/kyc.png" alt="" width="200px" className="img-fluid kyc-image" />
                                                            </div>
                                                            <div className="kyc_nofti kyc_done kyc_trade_link" >
                                                                <div className="sc-bdfBQB sc-kmATbt fOxqyX dzKkzw">
                                                                    <div className={`check_bar ${!emailId ? "" : "active"}`}><i className="ri-check-fill"></i>
                                                                        <h5> Email</h5>
                                                                    </div>
                                                                    <div className={`check_bar ${!kyc2fa ? "" : "active"}`}><i className="ri-check-fill"></i>
                                                                        <h5> Security </h5>
                                                                    </div>
                                                                    <div className="check_bar "><i className="ri-check-fill"></i>
                                                                        <h5> Welcome </h5>
                                                                    </div>
                                                                </div>
                                                                <div className="d-kyc_sec" >
                                                                    <div className="text-center">
                                                                        <h5>Your Wrathcode account Kyc is Rejected</h5>
                                                                        <span className="text-danger mt-3">{FormattedMessage()}</span>
                                                                    </div>
                                                                    <button className="btn custom-btn justify-content-center btn-danger kyc_trade_link" onClick={verifykycAgain} ><span>Verify Again</span></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div> : ""}
                </div>
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

                {((kycVerfied !== 2 && kycVerfied !== 3 && kycVerfied !== 1) && showKycPage === false) &&

                    <div className="cardSkelton loading">

                        <div className="contents">
                            <h4></h4>
                            <div className="description">

                            </div>
                        </div>

                        <div className="contents">
                            <h4></h4>
                            <div className="description">

                            </div>
                        </div>
                        <div className="contents">
                            <h4></h4>

                        </div>

                    </div>}


            </div>
        </div>


        <div className="modal fade" id="p2p_modal" tabIndex="-1" aria-labelledby="p2p_modalLaebl" aria-hidden="true" >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header flex-column px-8">
                        <h3 className="modal-title" id="placeBitLaebl">
                            Important info <i className="ri-information-line me-1"></i>
                        </h3>
                        <button type="button" className="btn-custom-closer" data-bs-dismiss="modal" aria-label="Close">
                            <i className="ri-close-fill"></i>
                        </button>
                    </div>
                    <div className="modal-body px-8 py-2">
                        <>
                            <div className="text-center "> <small className="text-warning">Please do not navigate away, refresh, or close the page while submitting your documents and avoid submitting the same documents for multiple accounts, as this may result in account suspension.</small></div>
                        </>

                    </div>
                </div>
            </div>
        </div>

        <div className="modal fade cnbt_modal" id="deposit-bonus-modal" tabIndex="-1" aria-labelledby="cv_bot_detail_modalLaebl" aria-hidden="true" >
            <div className="modal-dialog modal-dialog-centered  modal-xl">
                <div className="modal-content">
                    <button type="button" className="btn-custom-closer" data-bs-dismiss="modal" aria-label="Close">
                        <i className="ri-close-fill"></i>
                    </button>
                    <div className="modal-body px-8 py-4">
                        <div className="bt_row text-center" >
                            <div className="" >
                                <div className="d-flex flex-row justify-content-center align-items-center">  <h4 className="m-0">Congratulations!!</h4> <img src="/images/emoji3.png" alt="" width="60px" className="img-fluid mx-3" />
                                </div>
                                <p className="m-0">Your KYC has been successfully verified. As a reward, you'll receive a <br /><strong>flat 2.5% instant bonus on deposit of 100 USDT or more</strong>. <hr /> Make your deposit now to claim your bonus and start enjoying the benefits!</p>
                                <br />

                                <strong>Happy Trading!!   </strong>
                            </div>

                            <div className="bt_right" >
                                <img src="/images/kycapproved.svg" alt="" width="200px" className="img-fluid" />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>

    </>
    );
};

export default AutomatedKyc;
