import React, { useState, useEffect, useMemo, useContext } from "react";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import { alertErrorMessage, alertSuccessMessage } from "../../../customComponents/CustomAlertMessage";
import { notEqualsZero, aadharNum, email, passport, panCardNum } from "../../../utils/Validation";
import AuthService from "../../../api/services/AuthService";
import countryList from 'react-select-country-list';
import DefaultInput from "../../../customComponents/DefaultInput";
import { drivingLicense, documentNum } from "../../../utils/Validation";
import moment from "moment";
import { Link } from "react-router-dom";
import { ProfileContext } from "../../../context/ProfileProvider";


const KycPage = (props) => {

    const { handleUserDetails } = useContext(ProfileContext);

    const options = useMemo(() => countryList().getData(), []);
    const [kycVerfied, setKycVerified] = useState("");
    const [infoCountry, setInfoCountry] = useState("India");
    const [kycType, setKycType] = useState("Personal");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [infoDob, setInfoDob] = useState("");
    const [docType, setDocType] = useState("Aadhaar");
    const [address, setAddress] = useState("");
    const [infoState, setInfoState] = useState("");
    const [city, setCity] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [aadhar, setAadhar] = useState("");
    const [localFront, setLocalFront] = useState("");
    const [localBack, setLocalBack] = useState("");
    const [localSelfie, setLocalSelfie] = useState("");
    const [panCard, setPanCard] = useState("");
    const [localPanCard, setLocalPanCard] = useState("");
    const [kyc2fa, setKyc2fa] = useState("");
    const [emailId, setEmailId] = useState("");
    const [gender, setGender] = useState("male");
    const [reason, setReason] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [disableBtn2, setDisbaleBtn2] = useState(false);
    const [emailOtp, setemailOtp] = useState();
    const [isShow, setIsShow] = useState(1);
    const [signupBy, setSignupBy] = useState("");


    const [previewImages, setPreviewImages] = useState({ "selfie": "", "doc_front": "", "doc_back": "", "pan": "" });




    const [step, setStep] = useState(1);

    useEffect(() => {
        setKycVerified(props?.userDetails?.kycVerified);
        setKyc2fa(props?.userDetails?.["2fa"]);
        setEmailId(props?.userDetails?.emailId);
        setMobileNumber(`${props?.userDetails?.country_code} ${props?.userDetails?.mobileNumber}`);
        setFirstName(props?.userDetails?.firstName);
        setLastName(props?.userDetails?.lastName);
        setReason(props?.userDetails?.kyc_reject_reason);
        setSignupBy(props?.userDetails?.registeredBy);
    }, [props]);

    const handleChangeIdentity = async (event) => {
        event.preventDefault();
        const file = event.target.files[0];
        if (file) {
            const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (allowedTypes.includes(file.type) && file.size <= maxSize) {
                const imgData = URL.createObjectURL(file);
                setPreviewImages((images) => ({ ...images, doc_front: imgData }))
                setLocalFront(file);
                alertSuccessMessage(file?.name)
            } else {
                if (!allowedTypes.includes(file.type)) {
                    alertErrorMessage("Only PNG, JPEG, and JPG file types are allowed.");
                } else {
                    alertErrorMessage("Max image size is 2MB.");
                }
                setPreviewImages((images) => ({ ...images, doc_front: "" }))
                setLocalFront("");
            }
        }
    };


    const handleChangeIdentity2 = async (event) => {
        event.preventDefault();
        const file = event.target.files[0];
        if (file) {
            const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (allowedTypes.includes(file.type) && file.size <= maxSize) {
                const imgData = URL.createObjectURL(file);
                setLocalBack(file);
                alertSuccessMessage(file?.name)
                setPreviewImages((images) => ({ ...images, doc_back: imgData }))
            } else {
                if (!allowedTypes.includes(file.type)) {
                    alertErrorMessage("Only PNG, JPEG, and JPG file types are allowed.");
                } else {
                    alertErrorMessage("Max image size is 2MB.");
                }
                setPreviewImages((images) => ({ ...images, doc_back: "" }))
                setLocalBack("");
            }
        }
    };


    const handleChangeSelfie = async (event) => {
        event.preventDefault();
        const file = event.target.files[0];
        if (file) {
            const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (allowedTypes.includes(file.type) && file.size <= maxSize) {
                const imgData = URL.createObjectURL(file);
                setLocalSelfie(file);
                alertSuccessMessage(file?.name)
                setPreviewImages((images) => ({ ...images, selfie: imgData }))
            } else {
                if (!allowedTypes.includes(file.type)) {
                    alertErrorMessage("Only PNG, JPEG, and JPG file types are allowed.");
                } else {
                    alertErrorMessage("Max image size is 2MB.");
                }
                setPreviewImages((images) => ({ ...images, selfie: "" }))

                setLocalSelfie("");
            }
        }
    };

    const handleChangePanCard = async (event) => {
        event.preventDefault();
        const file = event.target.files[0];
        if (file) {
            const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (allowedTypes.includes(file.type) && file.size <= maxSize) {
                const imgData = URL.createObjectURL(file);
                setLocalPanCard(file);
                alertSuccessMessage(file?.name)
                setPreviewImages((images) => ({ ...images, pan: imgData }))
            } else {
                if (!allowedTypes.includes(file.type)) {
                    alertErrorMessage("Only PNG, JPEG, and JPG file types are allowed.");
                } else {
                    alertErrorMessage("Max image size is 2MB.");
                }
                setPreviewImages((images) => ({ ...images, pan: "" }))

            }
        }
    };


    const handleKyc = async () => {
        if (!infoCountry) {
            alertErrorMessage("Please select your country.");
            return;
        }
        if (!firstName) {
            alertErrorMessage("Please enter your first name.");
            return;
        }
        if (!lastName) {
            alertErrorMessage("Please enter your last name.");
            return;
        }
        if (!gender) {
            alertErrorMessage("Please select your gender.");
            return;
        }
        if (!infoDob) {
            alertErrorMessage("Please enter your date of birth.");
            return;
        }
        if (!address) {
            alertErrorMessage("Please enter your address.");
            return;
        }
        if (!infoState) {
            alertErrorMessage("Please enter your state.");
            return;
        }
        if (!city) {
            alertErrorMessage("Please enter your city.");
            return;
        }
        if (!zipCode) {
            alertErrorMessage("Please enter your zip code.");
            return;
        }
        if (!aadhar) {
            alertErrorMessage("Please enter your Aadhar number.");
            return;
        }
        if (!localFront) {
            alertErrorMessage("Please upload front side of document.");
            return;
        }
        if (!localBack) {
            alertErrorMessage("Please upload back side of document.");
            return;
        }
        if (!localSelfie) {
            alertErrorMessage("Please upload a selfie with document.");
            return;
        }
        if (!docType) {
            alertErrorMessage("Please select document type.");
            return;
        }

        var formData = new FormData();
        formData.append("document_front_image", localFront);
        formData.append("document_back_image", localBack);
        formData.append("user_selfie", localSelfie);
        formData.append("pancard_image", localPanCard);
        formData.append("address", address);
        formData.append("city", city);
        formData.append("state", infoState);
        formData.append("country", infoCountry);
        formData.append("document_number", aadhar);
        formData.append("pancard_number", panCard);
        formData.append("dob", infoDob);
        formData.append("zip_code", zipCode);
        formData.append("first_name", firstName);
        formData.append("last_name", lastName);
        formData.append("kyc_type", kycType);
        formData.append("gender", gender);
        formData.append("document_type", docType);
        formData.append("eotp", emailOtp);
        formData.append("emailId", emailId);
        formData.append("mobileNumber", mobileNumber);
        LoaderHelper.loaderStatus(true);
        await AuthService.addkyc(formData).then(async (result) => {
            if (result?.success) {
                LoaderHelper.loaderStatus(false);
                try {
                    alertSuccessMessage(result?.message);
                    handleResetInput();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    handleUserDetails();
                } catch (error) {
                    alertErrorMessage(result?.message);
                }
            } else {
                LoaderHelper.loaderStatus(false);
                alertErrorMessage(result?.message);
            }
        });
    };

    const handleResetInput = () => {
        setInfoCountry("");
        setFirstName("");
        setLastName("");
        setInfoDob("");
        setAddress("");
        setInfoState("");
        setCity("");
        setZipCode("");
        setAadhar("");
        setLocalFront("");
        setLocalBack("");
        setLocalSelfie("");
        setPanCard("");
    };

    const handleSelected = (type) => {
        setIsShow(type);
    };

    const getEighteenYearsAgoDate = () => {
        let eighteenYearsAgo = new Date();
        eighteenYearsAgo = eighteenYearsAgo.setFullYear(
            eighteenYearsAgo.getFullYear() - 18
        );
        eighteenYearsAgo = moment(eighteenYearsAgo).format("YYYY-MM-DD");
        return eighteenYearsAgo;
    };

    const verifyAgain = () => {
        setKycVerified("4");
        setStep(1)
    };

    const handleGetOtp = async (signId, type) => {
        LoaderHelper.loaderStatus(true);
        await AuthService.getOtp(signId, type).then(async (result) => {
            LoaderHelper.loaderStatus(false);
            if (result.success) {
                try {
                    alertSuccessMessage(result.message);
                } catch (error) {
                    alertErrorMessage(error);
                }
            } else {
                LoaderHelper.loaderStatus(false);
                alertErrorMessage(result.message);
            }
        });
    };

    const nextStep = () => {
        if (step >= 4) {

        } else {
            setStep((prev) => prev + 1)
        }
    }
    const prevStep = () => {
        if (step <= 1) {

        } else {
            setStep((prev) => prev - 1)
        }
    }



    return (
        <>


            <div className="dashboard_right">
                <div className="profile_sections" >
                    <div className="row" >
                        <div className="col-md-6" >
                            <h2 className="mb-0 pb-0"> KYC Verification </h2>
                        </div>

                    </div>

                </div>

                <div className="kyc_verif_bnr">
                    <div className="kysbnr_cnt">
                        <h5>KYC</h5>
                        <p>Finish your KYC in just a few minutes and enjoy a seamless experience. Submit your basic details once and get instant access to
                            withdrawals, rewards, and every feature without any delays or limitations.</p>

                        <h6>KYC Verification Requirements</h6>

                        <ul className="kyclist">
                            <li>⭐ID</li>
                            <li>⭐ Facial Recognition</li>
                            <li>⭐ Facial Recognition</li>
                        </ul>

                        <button className="kyc btn">Verify </button>
                    </div>
                    <div className="kycvector">
                        <img src="/images/kyc_verification_vector.svg" alt="kyc" />
                    </div>

                </div>


                <div className="kyc_account d-flex">
                    <div className="account_benifits">
                        <h4>Account Benefits</h4>

                        <div className="row">
                            <div className="col-sm-4">
                                <ul>
                                    <li>⭐ KYC Level</li>
                                    <li>⭐ Crypto Deposit</li>
                                    <li>⭐ Crypto Withdrawal</li>
                                    <li>⭐ Fiat Trading</li>
                                    <li>⭐ Spot/Futures Trading</li>
                                    <li>⭐ Platform Events</li>
                                </ul>
                            </div>

                                <div className="col-sm-4">
                                    <h6>Unverified</h6>
                                <ul>
                                    <li>Unlimited</li>
                                    <li>12 BTC per day</li>
                                    <li>⭐ Crypto Withdrawal</li>
                                    <li>⭐ Fiat Trading</li>
                                    <li>⭐ Spot/Futures Trading</li>
                                    <li>⭐ Platform Events</li>
                                </ul>
                            </div>

                                <div className="col-sm-4">
                                     <h6>Advanced KYC</h6>
                                <ul>
                                    <li>Unlimited</li>
                                    <li>100 BTC per day*</li>
                                    <li>30,000 USD per day*</li>
                                    <li>⭐ Fiat Trading</li>
                                    <li>⭐ Spot/Futures Trading</li>
                                    <li>⭐ Platform Events</li>
                                </ul>
                            </div>

                        </div>
                    </div>

                 <div class="faq_section">
                    <h4>Faq</h4>
  <div class="faq_item active">
    <button class="faq_question">
      What is KYC and why do I need it?
      <span class="icon">⌄</span>
    </button>
    <div class="faq_answer">
      <p>
        KYC is identity verification that confirms you're a real user.
        Completing it unlocks full access, withdrawals, and keeps the platform safe for everyone.
      </p>
    </div>
  </div>

  <div class="faq_item">
    <button class="faq_question">
      How does KYC protect my account?
      <span class="icon">⌄</span>
    </button>
    <div class="faq_answer">
      <p>
        KYC prevents unauthorized access and reduces fraud by verifying user identity.
      </p>
    </div>
  </div>

  <div class="faq_item">
    <button class="faq_question">
      How long does KYC take?
      <span class="icon">⌄</span>
    </button>
    <div class="faq_answer">
      <p>Most KYC verifications are completed within a few minutes to 24 hours.</p>
    </div>
  </div>

  <div class="faq_item">
    <button class="faq_question">
      What documents do I need for KYC?
      <span class="icon">⌄</span>
    </button>
    <div class="faq_answer">
      <p>A valid government-issued ID and proof of address are required.</p>
    </div>
  </div>

  <div class="faq_item">
    <button class="faq_question">
      Can I use the app without completing KYC?
      <span class="icon">⌄</span>
    </button>
    <div class="faq_answer">
      <p>Limited features may be available, but full access requires KYC.</p>
    </div>
  </div>

  <div class="faq_item">
    <button class="faq_question">
      Is my personal information secure in the KYC process?
      <span class="icon">⌄</span>
    </button>
    <div class="faq_answer">
      <p>Your data is encrypted and handled according to strict security standards.</p>
    </div>
  </div>
</div>

                </div>


                {/* <section className="pb-5 kyc_form_s">

                    <div className="row">
                        <div className="col-lg-12">
                            {
                                kycVerfied == "1" ?
                                   
                                    <div className=" mb-5" >
                                        <div className="card-body create-item-wrapper create-item-wrapper-kyc">
                                            <div className="form-field-wrapper kyc_wrapper ">
                                                <div className="rightsidebox">
                                                    <div className="kyc_nofti kyc_done" >
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
                                                        <hr />
                                                        <div className="d-kyc_sec" >
                                                            <div>
                                                                <h4 className="text-success"> <strong>KYC Pending</strong></h4>
                                                                <p>Your Wrathcode account is pending for Verification</p>
                                                            </div>
                                                            <Link to="/user_profile/dashboard" className="btn custom-btn custom-border-btn  custom-border-btn-white me-2">
                                                                <span> Back to Home </span>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    : kycVerfied == "2" ?
                                        
                                        <div className="container" >
                                            <div className="row" >
                                                <div className="col-lg-10 m-auto" >
                                                    <div className="create-item-wrapper create-item-wrapper-kyc">
                                                        <div className="form-field-wrapper kyc_wrapper ">
                                                            <div className="rightsidebox">
                                                                <div className="kyc_nofti kyc_done" >
                                                                    <div className="sc-bdfBQB sc-kmATbt fOxqyX dzKkzw">
                                                                        <div className={`check_bar ${!emailId ? "" : "active"}`}><i className="ri-check-fill " value={email === "undefined" ? "" : email}></i>
                                                                            <h5> Email</h5>
                                                                        </div>
                                                                        <div className={`check_bar ${!kyc2fa ? "" : "active"}`}><i className="ri-check-fill "></i>
                                                                            <h5> Security </h5>
                                                                        </div>
                                                                        <div className="check_bar active"><i className="ri-check-fill "></i>
                                                                            <h5> Welcome </h5>
                                                                        </div>
                                                                    </div>
                                                                    <hr />
                                                                    <div className="d-kyc_sec" >
                                                                        <div>
                                                                            <h4 className="text-success pb-0">Congratulations</h4>
                                                                            <p>Your Wrathcode account Kyc is Approved</p>
                                                                        </div>
                                                                        <Link to="/trade/KYC" className="btn custom-btn justify-content-center "> <span>Start Trading</span> </Link>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        : kycVerfied == "3" ?
                                           
                                            <div className="container" >
                                                <div className="row" >
                                                    <div className="col-lg-10 m-auto" >
                                                        <div className="create-item-wrapper create-item-wrapper-kyc">
                                                            <div className="form-field-wrapper kyc_wrapper ">
                                                                <div className="rightsidebox">
                                                                    <div className="kyc_nofti kyc_done" >
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
                                                                        <hr />
                                                                        <div className="d-kyc_sec" >
                                                                            <div>
                                                                                <h5>Your Wrathcode account Kyc is Rejected</h5>
                                                                                <span className="text-danger mt-3">{reason}</span>
                                                                            </div>
                                                                            <button className="btn custom-btn justify-content-center btn-danger" onClick={verifyAgain}><span>Verify Again</span></button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            :

                                            
                                            <div className="form-container kyc_form_multistep">

                                                <div className="step-indicator">
                                                    <div className="step-circle active">
                                                        <h6>Personal Information</h6>
                                                        <p>Browse and upload</p>
                                                        <span>1</span>
                                                    </div>

                                                    <div className={`step-circle ${step >= 2 && "active"}`}>
                                                        <h6>Document Verification</h6>
                                                        <p>Browse and upload</p>
                                                        <span>2</span>
                                                    </div>

                                                    <div className={`step-circle ${step >= 3 && "active"}`}>
                                                        <h6>Email & Mobile Verification</h6>
                                                        <p>Browse and upload</p>
                                                        <span>3</span>
                                                    </div>

                                                    <div className={`step-circle ${step >= 4 && "active"}`}>
                                                        <h6>Review</h6>
                                                        <p>Browse and upload</p>
                                                        <span>4</span>
                                                    </div>
                                                </div>

                                                <form id="multiStepForm">
                                                    {step === 1 && (
                                                        <>
                                                            <div className="form-step active">

                                                                <h2>Region or KYC Type *</h2>

                                                                <div className="form_bl_step">

                                                                    <div className="row">

                                                                        <div className="col-sm-6">
                                                                            <div className="inquery_fill">
                                                                                <label>Select country <span className="text-danger">*</span></label>
                                                                                <select value={infoCountry} name="infoCountry" onChange={(event) => { setInfoCountry(event.target.value); setDocType("Passport"); setIsShow(4); }}>
                                                                                    <option defaultValue>India</option>
                                                                                    {options.map((item, index) =>
                                                                                        <option value={item.label} key={index}>{item.label}</option>,
                                                                                    )}
                                                                                </select>
                                                                            </div>
                                                                        </div>

                                                                        <div className="col-sm-6">

                                                                            <div className="inquery_fill">
                                                                                <label>KYC Type <span className="text-danger">*</span></label>
                                                                                <select value={kycType} >
                                                                                    <option>Personal</option>
                                                                                  
                                                                                </select>
                                                                            </div>

                                                                        </div>
                                                                    </div>

                                                                </div>


                                                                <h2>Personal Information</h2>

                                                                <div className="form_bl_step">
                                                                    <div className="row">
                                                                        <div className="col-sm-6">
                                                                            <div className="inquery_fill">
                                                                                <label>First Name <span className="text-danger">*</span></label>
                                                                                <input type="text" placeholder="" value={firstName === "undefined" ? "" : firstName} onChange={(event) => setFirstName(event.target.value)} />
                                                                            </div>
                                                                        </div>




                                                                        <div className="col-sm-6">
                                                                            <div className="inquery_fill">
                                                                                <label>Last Name <span className="text-danger">*</span></label>
                                                                                <input type="text" placeholder="" value={lastName === "undefined" ? "" : lastName} onChange={(event) => setLastName(event.target.value)} />
                                                                            </div>
                                                                        </div>

                                                                        <div className="col-sm-6">
                                                                            <div className="inquery_fill">
                                                                                <label >Date of birth</label>
                                                                                <input id="name" type="date" max={getEighteenYearsAgoDate()} value={infoDob} name="infoDob" onChange={(event) => setInfoDob(event.target.value)} required />
                                                                            </div>
                                                                        </div>

                                                                        <div className="col-sm-6">
                                                                            <div className="inquery_fill">
                                                                                <label>Gender <span className="text-danger">*</span></label>
                                                                                <div className="d-flex align-items-center gender_radio">
                                                                                    <div className="form-check ">
                                                                                        <input id="male" className="form-check-input" type="radio" name="gender"
                                                                                            readonly="" value="male" data-gtm-form-interact-field-id="1" onClick={(event) => {
                                                                                                if (event.target.value !== gender) {
                                                                                                    setGender(event.target.value);
                                                                                                }
                                                                                            }}
                                                                                            checked={gender === "male"} />
                                                                                        <label className="form-check-label " for="male">Male</label>
                                                                                    </div>
                                                                                    <div className="form-check">
                                                                                        <input id="female" className="form-check-input" type="radio" name="gender"
                                                                                            readonly="" value="female" data-gtm-form-interact-field-id="0" onClick={(event) => {
                                                                                                if (event.target.value !== gender) {
                                                                                                    setGender(event.target.value);
                                                                                                }
                                                                                            }}
                                                                                            checked={gender === "female"} />
                                                                                        <label className="form-check-label " for="female">Female</label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>


                                                                        <div className="col-sm-4">
                                                                            <div className="inquery_fill">
                                                                                <label>Pin Code <span className="text-danger">*</span></label>
                                                                                <input type="number" placeholder="" value={zipCode} name="city" onWheel={(e) => e.target.blur()} onChange={(event) => setZipCode(event.target.value)} />
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-sm-4">
                                                                            <div className="inquery_fill">
                                                                                <label>City <span className="text-danger">*</span></label>
                                                                                <input type="text" placeholder="" value={city} name="city" onChange={(e) => setCity(e.target.value)} />
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-sm-4">
                                                                            <div className="inquery_fill">
                                                                                <label>State <span className="text-danger">*</span></label>
                                                                                <input type="text" placeholder="" value={infoState} name="State" onChange={(e) => setInfoState(e.target.value)} />
                                                                            </div>
                                                                        </div>

                                                                        <div className="col-sm-12">
                                                                            <div className="inquery_fill">
                                                                                <label>Address <span className="text-danger">*</span></label>
                                                                                <input type="text" placeholder="" name="address" value={address} onChange={(event) => setAddress(event.target.value)} />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="step-buttons">

                                                                <button type="button" id="prevBtn" disabled onClick={prevStep}><i className="ri-arrow-left-s-line"></i></button>

                                                                <button type="button" id="nextBtn" disabled={!firstName || !lastName || !infoDob || !gender || !zipCode || !city || !infoState || !address || !infoCountry} onClick={nextStep}> <i className="ri-arrow-right-s-line"></i></button>
                                                            </div></>
                                                    )}

                                                    {step === 2 && (
                                                        <>    <div className="form-step">
                                                            <div className="row">
                                                                <div className="col-md-12 upload-area">
                                                                    <div class7="upload-formate mb-3">
                                                                        <h6 className="title mb-1">Upload Selfie with ID<span className="text-danger">*</span>
                                                                            <div className=" text-smallest mb-1">
                                                                                <span> (Only JPEG, PNG & JPG formats and file size upto 5MB are
                                                                                    supported)</span>
                                                                            </div>
                                                                        </h6>
                                                                    </div>
                                                                    <div className="brows-file-wrapper">
                                                                        <input name="file" id="file" type="file" className="inputfile"
                                                                            data-multiple-caption="{count} files selected" multiple="" onChange={handleChangeSelfie} />{localSelfie === "" ?
                                                                                <label for="file" title="No File Choosen"><i className="ri-upload-cloud-line"></i><span
                                                                                    className="text-center mb-2">Choose a File</span>
                                                                                    <span className="file-type text-center mt--10">Drag or choose your file to
                                                                                        upload</span></label>
                                                                                :
                                                                                <label htmlFor="file3" title="No File Choosen">
                                                                                    <i className=" text-success ri-check-double-fill"></i>
                                                                                    <span className="text-center mb-2">File Uploaded</span>
                                                                                    <span className="file-type text-center mt--10" >{localSelfie?.name}</span>
                                                                                </label>}
                                                                    </div>
                                                                </div>
                                                                <div className="col-sm-6">
                                                                    <div className="inquery_fill">
                                                                        <label>Select Document Type <span className="text-danger">*</span></label>
                                                                        <select onChange={(event) => {
                                                                            setAadhar("");
                                                                            setDocType(event.target.value)
                                                                            handleSelected(event.target.value === "Aadhaar" ? 1 : event.target.value === "Driving License" ? 2 : event.target.value === "Other" ? 3 : event.target.value === 'Passport' ? 4 : undefined)
                                                                        }}  >
                                                                            {infoCountry === "India" ? <>
                                                                                <option defaultValue value="Aadhaar">Aadhar card </option>
                                                                                <option value="Driving License">Driving License</option>
                                                                                <option defaultValue value="Passport">Passport</option></>
                                                                                :
                                                                                <>   <option defaultValue value="Passport">Passport</option>
                                                                                    <option value="Other">Any National ID</option></>
                                                                            }

                                                                        </select>
                                                                    </div>
                                                                </div>

                                                                <div className="col-sm-6">
                                                                    <div
                                                                        className={`field-box ${(isShow !== 1 || infoCountry !== "India") && "d-none"}`}
                                                                        id="aadhar" >
                                                                        <label htmlFor="name" className="form-label">
                                                                            Aadhar Number
                                                                            <span style={{ color: "red" }}>*</span>
                                                                        </label>
                                                                        <DefaultInput id="name" type="text" className="form-control"
                                                                            required name="aadhar" value={aadhar}
                                                                            errorstatus={aadharNum(aadhar) !== undefined && notEqualsZero(aadhar)}
                                                                            errormessage={aadharNum(aadhar)}
                                                                            onChange={(event) => setAadhar(event.target.value)} />
                                                                    </div>
                                                                    <div className={`field-box ${(isShow !== 2 || infoCountry !== "India") && "d-none"}`}>
                                                                        <label htmlFor="name" className="form-label">
                                                                            Driving License  Number
                                                                        </label>
                                                                        <DefaultInput id="name" type="text" className="form-control" required name="aadhar" value={aadhar}
                                                                            errorstatus={drivingLicense(aadhar) !== undefined && notEqualsZero(aadhar)}
                                                                            errormessage={drivingLicense(aadhar)}
                                                                            onChange={(event) => setAadhar(event.target.value.toUpperCase())} />
                                                                    </div>
                                                                    <div className={`field-box ${(isShow !== 4) && "d-none"}`}>
                                                                        <label htmlFor="name" className="form-label">
                                                                            Passport Number
                                                                        </label>
                                                                        <DefaultInput id="name" type="text" className="form-control" required name="aadhar" value={aadhar}
                                                                            errorstatus={passport(aadhar) !== undefined && notEqualsZero(aadhar)}
                                                                            errormessage={passport(aadhar)}
                                                                            onChange={(event) => setAadhar(event.target.value.toUpperCase())} />
                                                                    </div>
                                                                    <div
                                                                        className={`field-box ${isShow !== 3 && "d-none"}`}
                                                                    >
                                                                        <label htmlFor="name" className="form-label">
                                                                           National ID
                                                                        </label>
                                                                        <DefaultInput id="name" type="text" className="form-control" required name="aadhar" value={aadhar} errorstatus={documentNum(aadhar) !== undefined && notEqualsZero(aadhar)} errormessage={documentNum(aadhar)} onChange={(event) => setAadhar(event.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>




                                                                <div className="col-md-6 upload-area">
                                                                    <div className="upload-formate mb-3">
                                                                        <h6 className="title mb-1">Front Image<span className="text-danger">*</span>
                                                                            <div className=" text-smallest mb-1">
                                                                                <span> (Only JPEG, PNG &amp; JPG formats and file size upto 5MB are
                                                                                    supported)</span>
                                                                            </div>
                                                                        </h6>
                                                                    </div>
                                                                    <div className="brows-file-wrapper">
                                                                        <input name="file" type="file" required="" className="inputfile"
                                                                            data-multiple-caption="{count} files selected" onChange={handleChangeIdentity} />
                                                                        {localFront === '' ?
                                                                            <label for="file" title="No File Choosen"><i className="ri-upload-cloud-line"></i><span
                                                                                className="text-center mb-2">Choose a File</span>
                                                                                <span className="file-type text-center mt--10">Drag or choose your file to
                                                                                    upload</span></label>
                                                                            :
                                                                            <label htmlFor="file3" title="No File Choosen">
                                                                                <i className=" text-success ri-check-double-fill"></i>
                                                                                <span className="text-center mb-2">File Uploaded</span>
                                                                                <span className="file-type text-center mt--10" >{localFront?.name}</span>
                                                                            </label>}
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-6 upload-area">
                                                                    <div className="upload-formate mb-3">
                                                                        <h6 className="title mb-1">Front Image<span className="text-danger">*</span>
                                                                            <div className=" text-smallest mb-1">
                                                                                <span> (Only JPEG, PNG &amp; JPG formats and file size upto 5MB are
                                                                                    supported)</span>
                                                                            </div>
                                                                        </h6>
                                                                    </div>
                                                                    <div className="brows-file-wrapper">
                                                                        <input name="file" type="file" required="" className="inputfile"
                                                                            data-multiple-caption="{count} files selected" onChange={handleChangeIdentity2} />
                                                                        {localBack === '' ? <label for="file" title="No File Choosen"><i className="ri-upload-cloud-line"></i><span
                                                                            className="text-center mb-2">Choose a File</span>
                                                                            <span className="file-type text-center mt--10">Drag or choose your file to
                                                                                upload</span></label>
                                                                            :
                                                                            <label htmlFor="file3" title="No File Choosen">
                                                                                <i className=" text-success ri-check-double-fill"></i>
                                                                                <span className="text-center mb-2">File Uploaded</span>
                                                                                <span className="file-type text-center mt--10" >{localBack?.name}</span>
                                                                            </label>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="row">
                                                                <div className="col-sm-12">
                                                                    <div className="inquery_fill">
                                                                        <label>Income Tax Identification Number <span className="text-danger">*</span></label>
                                                                        <input type="text" placeholder="" name="text" onChange={(event) => setPanCard(event.target.value)} value={panCard} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-12 upload-area">
                                                                    <div className="upload-formate mb-3">
                                                                        <h6 className="title mb-1">Upload Item File<span className="text-danger">*</span>
                                                                            <div className=" text-smallest mb-1">
                                                                                <span> (Only JPEG, PNG & JPG formats and file size upto 5MB are
                                                                                    supported)</span>
                                                                            </div>
                                                                        </h6>
                                                                    </div>
                                                                    <div className="brows-file-wrapper">
                                                                        <input name="file" id="file" type="file" className="inputfile"
                                                                            data-multiple-caption="{count} files selected" multiple="" onChange={handleChangePanCard} />{localPanCard === '' ?
                                                                                <label for="file" title="No File Choosen"><i className="ri-upload-cloud-line"></i><span
                                                                                    className="text-center mb-2">Choose a File</span>
                                                                                    <span className="file-type text-center mt--10">Drag or choose your file to
                                                                                        upload</span></label>

                                                                                :
                                                                                <label htmlFor="file3" title="No File Choosen">
                                                                                    <i className=" text-success ri-check-double-fill"></i>
                                                                                    <span className="text-center mb-2">File Uploaded</span>
                                                                                    <span className="file-type text-center mt--10" >{localPanCard?.name}</span>
                                                                                </label>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                            <div className="step-buttons">

                                                                <button type="button" id="prevBtn" onClick={prevStep}><i className="ri-arrow-left-s-line"></i></button>

                                                                <button type="button" id="nextBtn" disabled={!localSelfie || !aadhar || !localFront || !localBack || !panCard || !localPanCard} onClick={nextStep}> <i className="ri-arrow-right-s-line"></i></button>
                                                            </div>
                                                        </>

                                                    )}

                                                    {step === 3 && (
                                                        <><div className="form-step verificationform">
                                                            <h2>OTP Verification</h2>
                                                            {signupBy === "phone" ?
                                                                <div className="inquery_fill">
                                                                    <label>Mobile Number <span className="text-danger">*</span></label>
                                                                    <div className="row">
                                                                    <div className="col-md-8 mb-4">
                                                                            <div className="field-box field-otp-box"><input required="" errorstatus="false"
                                                                                name="email" type="email" 
                                                                                value={mobileNumber} disabled/><button type="button"
                                                                                    className="btn btn-sm btn-gradient" onClick={() => { handleGetOtp(mobileNumber, "kyc"); setDisbaleBtn2(true); }} ><span>  <span> {disableBtn2 ? 'Resend OTP' : 'GET OTP '}</span> </span></button></div>
                                                                        </div>

                                                                       
                                                                       
                                                                        <div className="col-md-4 mb-3">
                                                                            <div className="field-box"><input id="emailOTP" name="emailOTP" type="number"
                                                                                placeholder="Enter Mobile OTP" value={emailOtp} onChange={(e) => { setemailOtp(e.target.value) }} /></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                :
                                                                <div className="inquery_fill">
                                                                    <label>Email ID <span className="text-danger">*</span></label>
                                                                    <div className="row">
                                                                        <div className="col-md-8 mb-4">
                                                                            <div className="field-box field-otp-box"><input required="" errorstatus="false"
                                                                                name="email" type="email" placeholder="Enter Email ID"
                                                                                value={emailId} disabled/><button type="button"
                                                                                    className="btn btn-sm btn-gradient" onClick={() => { handleGetOtp(emailId, "kyc"); setDisbaleBtn2(true); }} ><span>  <span> {disableBtn2 ? 'Resend OTP' : 'GET OTP '}</span> </span></button></div>
                                                                        </div>

                                                                        <div className="col-md-4 mb-3">
                                                                            <div className="field-box"><input id="emailOTP" name="emailOTP" type="number"
                                                                                placeholder="Enter Email OTP" value={emailOtp} onChange={(e) => { setemailOtp(e.target.value) }} /></div>
                                                                        </div>

                                                                    </div>

                                                                </div>

                                                            }



                                                        </div>

                                                            <div className="step-buttons">

                                                                <button type="button" id="prevBtn" onClick={prevStep}><i className="ri-arrow-left-s-line"></i></button>

                                                                <button type="button" id="nextBtn" disabled={ !emailOtp} onClick={nextStep}> <i className="ri-arrow-right-s-line"></i></button>
                                                            </div>
                                                        </>
                                                    )}

                                                    {step === 4 && (
                                                        <>  <div className="form-step">

                                                            <div id="previewSection">


                                                                <div className="review_information">

                                                                    <div className="row">
                                                                        <div className="col-xl-4 mb-4">
                                                                            <div className="card mb-4 mb-xl-0">
                                                                                <div className="card-body py-5 pb-0">
                                                                                    <div className="text-center">
                                                                                        <img className="img-account-profile rounded-circle mb-4" src={previewImages?.selfie} alt="" />
                                                                                        <h3 className="fw-bolder fs-2 mb-0">{firstName} {lastName}</h3>
                                                                                    </div>
                                                                                    <div className="doc_img py-5 px-4 my-4">
                                                                                        <div className="row mb-3">
                                                                                            <label className="col-lg-5 fw-bold text-muted">UserID:</label>
                                                                                            <div className="col-lg-7"><span className="fw-bolder fs-6 text-dark"> {props?.userDetails?.uuid}</span></div>
                                                                                        </div>
                                                                                        <div className="row mb-3">
                                                                                            <label className="col-lg-5 fw-bold text-muted">Full Name:</label>
                                                                                            <div className="col-lg-7"><span className="fw-bolder fs-6 text-dark"> {firstName} {lastName}</span></div>
                                                                                        </div>
                                                                                        <div className="row mb-3">
                                                                                            <label className="col-lg-5 fw-bold text-muted">Mobile Number:</label>

                                                                                            <div className="col-lg-7"><span className="fw-bold fs-6 text-dark">       {mobileNumber}</span></div>
                                                                                        </div>
                                                                                        <div className="row mb-3">
                                                                                            <label className="col-lg-5 fw-bold text-muted">Address:</label>
                                                                                            <div className="col-lg-7 fv-row"><span className="fw-bold fs-6 text-dark"> {address} </span></div>
                                                                                        </div>
                                                                                        <div className="row mb-3">
                                                                                            <label className="col-lg-5 fw-bold text-muted">City:</label>
                                                                                            <div className="col-lg-7 fv-row"><span className="fw-bold fs-6 text-dark">{city}</span></div>
                                                                                        </div>
                                                                                        <div className="row mb-3">
                                                                                            <label className="col-lg-5 fw-bold text-muted">State:</label>
                                                                                            <div className="col-lg-7 fv-row"><span className="fw-bold fs-6 text-dark">{infoState}</span></div>
                                                                                        </div>
                                                                                        <div className="row mb-3">
                                                                                            <label className="col-lg-5 fw-bold text-muted">Zip Code:</label>
                                                                                            <div className="col-lg-7 fv-row"><span className="fw-bold fs-6 text-dark">{zipCode}</span></div>
                                                                                        </div>
                                                                                        <div className="row mb-3">
                                                                                            <label className="col-lg-5 fw-bold text-muted"> Date of Birth: </label>
                                                                                            <div className="col-lg-7"><span className="fw-bold fs-6 text-dark">{infoDob}</span></div>
                                                                                        </div>
                                                                                        <div className="row mb-3">
                                                                                            <label className="col-lg-5 fw-bold text-muted">Registration Date:</label>
                                                                                            <div className="col-lg-7"><span className="fw-bold fs-6 text-dark text-hover-primary">{moment(props?.userDetails?.createdAt).format("YYYY-MM-DD")} </span></div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-xl-8">
                                                                            <div className="card card-header-actions mb-4">
                                                                                <div className="card-body">
                                                                                    <div className="row">
                                                                                        <div className="col-6  mb-3">
                                                                                            <div className="doc_img">
                                                                                                <div className="row mb-3">
                                                                                                    <div className="col"> Document <small> (Front) </small> </div>
                                                                                                </div>
                                                                                                <div className="ratio ratio-16x9"><img src={previewImages?.doc_front} alt="" className="w-100 cursor_pointer" /></div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="col-6 mb-3">
                                                                                            <div className="doc_img">
                                                                                                <div className="row mb-3">
                                                                                                    <div className="col"> Document <small> (Back) </small> </div>
                                                                                                </div>
                                                                                                <div className="ratio ratio-16x9"><img src={previewImages?.doc_back} alt="" className="w-100 cursor_pointer" /></div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="col-sm-12">
                                                                                            <div className="doc_img">
                                                                                                <div className="row mb-3">
                                                                                                    <div className="col">Document No. : {aadhar}</div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="row mt-4">
                                                                                        <div className="col-6  mb-3">
                                                                                            <div className="doc_img">
                                                                                                <div className="row mb-3">
                                                                                                    <div className="col"> Income Tax Identification  </div>
                                                                                                </div>
                                                                                                <div className="ratio ratio-16x9"><img src={previewImages?.pan} alt="" className="w-100 cursor_pointer" /></div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="col-6  mb-3">
                                                                                            <div className="doc_img">
                                                                                                <div className="row mb-3">
                                                                                                    <div className="col"><small>Selfie</small></div>
                                                                                                </div>
                                                                                                <div className="ratio ratio-16x9"><img src={previewImages?.selfie} alt="" className="w-100 cursor_pointer" /></div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="col-sm-12">
                                                                                            <div className="doc_img">
                                                                                                <div className="row mb-3">
                                                                                                    <div className="col">Income Tax Identification Number: {panCard}</div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                               
                                                            </div>
                                                        </div>

                                                            <div className="step-buttons">

                                                                <button type="button" id="prevBtn" onClick={prevStep}><i className="ri-arrow-left-s-line"></i></button>
                                                                {step === 4 && (<button type="button" id="submitBtn" onClick={handleKyc}>Submit</button>)}

                                                                <button type="button" id="nextBtn" disabled onClick={nextStep}><i className="ri-arrow-right-s-line"></i></button>
                                                            </div> </>
                                                    )}

                                                </form>
                                            </div>
                            }
                        </div>
                    </div >
                </section > */}
            </div >
        </>
    );
}

export default KycPage


