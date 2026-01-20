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
import { $ } from 'react-jquery-plugin';
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
    const [activeIndex, setActiveIndex] = useState(0);


    const [previewImages, setPreviewImages] = useState({ "selfie": "", "doc_front": "", "doc_back": "", "pan": "" });




    const [step, setStep] = useState(1);
    const [modalStep, setModalStep] = useState(0);
    const [modalCountry, setModalCountry] = useState("");
    const [modalIdType, setModalIdType] = useState("");

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

    // Add event listeners for country and ID type changes to remove errors
    useEffect(() => {
        const countrySelect = document.getElementById('kycCountry');
        const idTypeInputs = document.querySelectorAll('input[name="kycIdType"]');

        const handleCountryChange = () => {
            const countryError = document.getElementById('countryError');
            const selectBox = document.querySelector('.select_box');
            if (countryError && countrySelect?.value) {
                countryError.classList.add('d-none');
                if (selectBox) selectBox.classList.remove('error');
            }
        };

        const handleIdTypeChange = () => {
            const idTypeError = document.getElementById('idTypeError');
            const idGrid = document.querySelector('.id_grid');
            if (idTypeError) {
                idTypeError.classList.add('d-none');
                if (idGrid) idGrid.classList.remove('error');
            }
        };

        if (countrySelect) {
            countrySelect.addEventListener('change', handleCountryChange);
        }

        idTypeInputs.forEach(input => {
            input.addEventListener('change', handleIdTypeChange);
        });

        return () => {
            if (countrySelect) {
                countrySelect.removeEventListener('change', handleCountryChange);
            }
            idTypeInputs.forEach(input => {
                input.removeEventListener('change', handleIdTypeChange);
            });
        };
    }, [modalStep]);

    const handleChangeIdentity = async (event) => {
        event.preventDefault();
        const file = event.target.files[0];
        if (file) {
            const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (allowedTypes.includes(file.type) && file.size <= maxSize) {
                const imgData = URL.createObjectURL(file);
                setPreviewImages((images) => ({ ...images, doc_front: imgData }));
                setLocalFront(file);
                if (process.env.NODE_ENV === 'development') {
                    console.log("Preview image set for doc_front:", imgData);
                }
                alertSuccessMessage(file?.name);
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
                setPreviewImages((images) => ({ ...images, doc_back: imgData }));
                setLocalBack(file);
                if (process.env.NODE_ENV === 'development') {
                    console.log("Preview image set for doc_back:", imgData);
                }
                alertSuccessMessage(file?.name);
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
                setPreviewImages((images) => ({ ...images, selfie: imgData }));
                setLocalSelfie(file);
                if (process.env.NODE_ENV === 'development') {
                    console.log("Preview image set for selfie:", imgData);
                }
                alertSuccessMessage(file?.name);
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
                setPreviewImages((images) => ({ ...images, pan: imgData }));
                setLocalPanCard(file);
                if (process.env.NODE_ENV === 'development') {
                    console.log("Preview image set for pan:", imgData);
                }
                alertSuccessMessage(file?.name);
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
        try {
            LoaderHelper.loaderStatus(true);
            const result = await AuthService.addkyc(formData);
            if (result?.success) {
                alertSuccessMessage(result?.message || "KYC submitted successfully");
                handleResetInput();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                handleUserDetails();
            } else {
                alertErrorMessage(result?.message || "Failed to submit KYC. Please try again.");
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error("Error in handleKyc:", error);
            }
            alertErrorMessage(error?.response?.data?.message || error?.message || "An error occurred while submitting KYC. Please try again.");
        } finally {
            LoaderHelper.loaderStatus(false);
        }
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
        setLocalPanCard("");
        setPanCard("");
        setPreviewImages({ "selfie": "", "doc_front": "", "doc_back": "", "pan": "" });
    };

    // Modal KYC Submit Handler
    const handleModalKycSubmit = async () => {
        // Validate all required fields
        if (!modalCountry) {
            alertErrorMessage("Please select a country");
            return;
        }
        if (!modalIdType) {
            alertErrorMessage("Please select an ID type");
            return;
        }
        if (!aadhar) {
            alertErrorMessage("Please enter your ID Card number");
            return;
        }
        if (!localFront) {
            alertErrorMessage("Please upload front side of document");
            return;
        }
        if (!localBack) {
            alertErrorMessage("Please upload back side of document");
            return;
        }
        if (!panCard) {
            alertErrorMessage("Please enter Income Tax Identification Number");
            return;
        }
        if (!localPanCard) {
            alertErrorMessage("Please upload Income Tax document");
            return;
        }
        if (!localSelfie) {
            alertErrorMessage("Please upload selfie with ID");
            return;
        }

        const formData = new FormData();
        formData.append("document_front_image", localFront);
        formData.append("document_back_image", localBack);
        formData.append("user_selfie", localSelfie);
        formData.append("pancard_image", localPanCard);
        formData.append("country", modalCountry);
        formData.append("document_number", aadhar);
        formData.append("pancard_number", panCard);
        formData.append("document_type", modalIdType);
        formData.append("first_name", firstName || props?.userDetails?.firstName);
        formData.append("last_name", lastName || props?.userDetails?.lastName);
        formData.append("emailId", emailId);
        formData.append("mobileNumber", mobileNumber);

        try {
            LoaderHelper.loaderStatus(true);
            const result = await AuthService.addkyc(formData);
            if (result?.success) {
                alertSuccessMessage(result?.message || "KYC submitted successfully");
                
                // Close KYC modal
                const modalElement = document.getElementById('kycModal');
                if (modalElement) {
                    const modal = window.bootstrap?.Modal?.getInstance(modalElement);
                    if (modal) {
                        modal.hide();
                    }
                }
                
                // Show success modal
                const submitModalElement = document.getElementById('kycSubmitModal');
                if (submitModalElement) {
                    setTimeout(() => {
                        const submitModal = new window.bootstrap.Modal(submitModalElement);
                        submitModal.show();
                    }, 300);
                }
                
                resetModalForm();
                handleUserDetails();
            } else {
                alertErrorMessage(result?.message || "Failed to submit KYC. Please try again.");
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error("Error in handleModalKycSubmit:", error);
            }
            alertErrorMessage(error?.response?.data?.message || error?.message || "An error occurred. Please try again.");
        } finally {
            LoaderHelper.loaderStatus(false);
        }
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

    // Modal step management functions
    const nextModalStep = () => {
        const steps = document.querySelectorAll('.kyc_step');
        if (modalStep < steps.length - 1) {
            setModalStep((prev) => prev + 1);
        }
    };

    const prevModalStep = () => {
        if (modalStep > 0) {
            setModalStep((prev) => prev - 1);
        }
    };

    const validateModalStep0 = () => {
        let isValid = true;

        // Hide previous errors
        const countryError = document.getElementById('countryError');
        const idTypeError = document.getElementById('idTypeError');
        const selectBox = document.querySelector('.select_box');
        const idGrid = document.querySelector('.id_grid');

        if (countryError) countryError.classList.add('d-none');
        if (idTypeError) idTypeError.classList.add('d-none');
        if (selectBox) selectBox.classList.remove('error');
        if (idGrid) idGrid.classList.remove('error');

        if (!modalCountry || modalCountry === '') {
            if (countryError) countryError.classList.remove('d-none');
            if (selectBox) selectBox.classList.add('error');
            alertErrorMessage('Please select a country');
            isValid = false;
        }

        if (!modalIdType) {
            if (idTypeError) idTypeError.classList.remove('d-none');
            if (idGrid) idGrid.classList.add('error');
            alertErrorMessage('Please select an ID type');
            isValid = false;
        }

        return isValid;
    };

    const resetModalForm = () => {
        setModalStep(0);
        setModalCountry("");
        setModalIdType("");
        setAadhar("");
        setPanCard("");
        setLocalFront("");
        setLocalBack("");
        setLocalSelfie("");
        setLocalPanCard("");
        setPreviewImages({ "selfie": "", "doc_front": "", "doc_back": "", "pan": "" });
    };

    // Initialize modal steps when modal opens
    useEffect(() => {
        const modal = document.getElementById('kycModal');
        if (!modal) return;

        const handleModalShow = () => {
            resetModalForm();
            // Show first step, hide others
            const steps = modal.querySelectorAll('.kyc_step');
            steps.forEach((step, index) => {
                if (index === 0) {
                    step.classList.add('active');
                    step.style.display = 'block';
                } else {
                    step.classList.remove('active');
                    step.style.display = 'none';
                }
            });
            // Update title
            const firstStep = steps[0];
            if (firstStep) {
                const title = firstStep.getAttribute('data-title');
                const titleElement = document.getElementById('kycTitle');
                if (titleElement && title) {
                    titleElement.textContent = title;
                }
            }
        };

        const handleModalHidden = () => {
            resetModalForm();
        };

        // Bootstrap 5 modal events
        modal.addEventListener('show.bs.modal', handleModalShow);
        modal.addEventListener('hidden.bs.modal', handleModalHidden);

        return () => {
            modal.removeEventListener('show.bs.modal', handleModalShow);
            modal.removeEventListener('hidden.bs.modal', handleModalHidden);
        };
    }, []);

    // Update step visibility when modalStep changes
    useEffect(() => {
        const modal = document.getElementById('kycModal');
        if (!modal) return;

        const steps = modal.querySelectorAll('.kyc_step');
        if (steps.length === 0) return;

        steps.forEach((step, index) => {
            if (index === modalStep) {
                step.classList.add('active');
                step.style.display = 'block';
                // Update title
                const title = step.getAttribute('data-title');
                const titleElement = document.getElementById('kycTitle');
                if (titleElement && title) {
                    titleElement.textContent = title;
                }
            } else {
                step.classList.remove('active');
                step.style.display = 'none';
            }
        });
    }, [modalStep]);


    const faqData = [
        {
            q: "What is KYC and why do I need it?",
            a: "KYC is identity verification that confirms you're a real user. Completing it unlocks full access, withdrawals, and keeps the platform safe."
        },
        {
            q: "How does KYC protect my account?",
            a: "KYC prevents unauthorized access and reduces fraud."
        },
        {
            q: "How long does KYC take?",
            a: "Most KYC verifications are completed within a few minutes to 24 hours."
        },
        {
            q: "What documents do I need for KYC?",
            a: "A valid government-issued ID and proof of address are required."
        },
        {
            q: "Can I use the app without completing KYC?",
            a: "Limited features are available, but full access requires KYC."
        },
        {
            q: "Is my personal information secure in the KYC process?",
            a: "Your data is encrypted and handled according to strict security standards."
        }
    ];


    return (
        <>


            <div className="dashboard_right">

                <div className="kyc_verif_bnr_wrapper">

                    <div className="profile_sections" >
                        <div className="row" >
                            <div className="col-md-12" >
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
                                <li><img src="/images/staricon.png" alt="star" /> ID</li>
                                <li><img src="/images/staricon.png" alt="star" /> Facial Recognition</li>
                                <li><img src="/images/staricon.png" alt="star" /> Facial Recognition</li>
                            </ul>

                            <button className="kyc btn" data-bs-toggle="modal" data-bs-target="#kycModal">Verify </button>
                        </div>
                        <div className="kycvector">
                            <img src="/images/kyc_verification_vector.svg" alt="kyc" />
                        </div>

                    </div>

                    <div className="kyc_verif_bnr kyc_seccessfull" style={{ display: "none" }}>
                        <div className="kysbnr_cnt">
                            <h5>KYC</h5>
                            <p>Finish your KYC in just a few minutes and enjoy a seamless experience. Submit your basic details once and get instant access to
                                withdrawals, rewards, and every feature without any delays or limitations.</p>

                            <h6>KYC Verification Requirements</h6>

                            <ul className="kyclist">
                                <li>✅ Deposit & Withdraw Without Limit</li>
                                <li>✅ Spot & Futures Trading Unlock</li>
                                <li>✅ 100% Secure Trading with Verified KYC</li>

                            </ul>

                            {/* <button className="kyc btn" data-bs-toggle="modal" data-bs-target="#kycModal">Verify </button> */}
                        </div>
                        <div className="kycvector">
                            <img src="/images/kyc_success_vector.svg" alt="kyc" />
                        </div>

                    </div>

                    <div className="kyc_verif_bnr kyc_rejected" style={{ display: "none" }}>
                        <div className="kysbnr_cnt">
                            <h5>KYC Rejected </h5>
                            <p>Finish your KYC in just a few minutes and enjoy a seamless experience. Submit your basic details once and get instant access to
                                withdrawals, rewards, and every feature without any delays or limitations.</p>

                            <h6>KYC information is missing or incomplete</h6>

                            <ul className="kyclist">
                                <li>❌ Identity document is unclear or invalid</li>
                                <li>❌ Unable to verify user identity</li>
                                <li>❌ KYC requirements not met</li>
                            </ul>

                            <button className="kyc btn" data-bs-toggle="modal" data-bs-target="#kycModal">Resubmit KYC </button>
                        </div>
                        <div className="kycvector">
                            <img src="/images/rejectvector.png" alt="kyc" />
                        </div>

                    </div>


                    <div className="kyc_account d-flex">
                        <div className="account_benifits">
                            <h5>Account Benefits</h5>

                            <div className="row">
                                <div className="col-sm-4">
                                    <h6>Level</h6>
                                    <ul className="kyclist">
                                        <li><img src="/images/staricon.png" alt="star" /> KYC Level</li>
                                        <li><img src="/images/staricon.png" alt="star" /> Crypto Deposit</li>
                                        <li><img src="/images/staricon.png" alt="star" /> Crypto Withdrawal</li>
                                        <li><img src="/images/staricon.png" alt="star" /> Fiat Trading</li>
                                        <li><img src="/images/staricon.png" alt="star" /> Spot/Futures Trading</li>
                                        <li><img src="/images/staricon.png" alt="star" /> Platform Events</li>
                                    </ul>
                                </div>

                                <div className="col-sm-4">
                                    <h6>Unverified</h6>
                                    <ul className="kyclist">
                                        <li>Unlimited</li>
                                        <li>12 BTC per day</li>
                                        <li><img src="/images/closebtn2.svg" alt="star" /></li>
                                        <li><img src="/images/rightbtn2.svg" alt="star" /></li>
                                        <li><img src="/images/rightbtn2.svg" alt="star" /></li>
                                        <li><img src="/images/rightbtn2.svg" alt="star" /></li>
                                    </ul>
                                </div>

                                <div className="col-sm-4">
                                    <h6>Advanced KYC</h6>
                                    <ul className="kyclist">
                                        <li>Unlimited</li>
                                        <li>100 BTC per day*</li>
                                        <li>30,000 USD per day*</li>
                                        <li><img src="/images/rightbtn2.svg" alt="star" /></li>
                                        <li><img src="/images/rightbtn2.svg" alt="star" /></li>
                                        <li><img src="/images/rightbtn2.svg" alt="star" /></li>
                                    </ul>
                                </div>

                            </div>
                        </div>


                        <div className="faq_section">
                            <h4>Faq</h4>
                            <div className="table-responsive">
                                {faqData.map((item, index) => (
                                    <div
                                        className={`faq_item ${activeIndex === index ? "active" : ""}`}
                                        key={index}
                                    >
                                        <button
                                            className="faq_question"
                                            onClick={() =>
                                                setActiveIndex(activeIndex === index ? null : index)
                                            }
                                        >
                                            {item.q}
                                            <span className="icon"><i class="ri-arrow-down-s-line"></i></span>
                                        </button>

                                        <div className="faq_answer">
                                            <p>{item.a}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                </div>

                {/* 
                <section className="pb-5 kyc_form_s">

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
                                                                            data-multiple-caption="{count} files selected" multiple="" onChange={handleChangeSelfie} accept="image/png,image/jpeg,image/jpg" />
                                                                        {localSelfie === "" ?
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
                                                                    {(previewImages?.selfie && previewImages.selfie !== "") || localSelfie ? (
                                                                        <div className="mt-3" style={{ padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', marginTop: '15px', width: '100%', border: '2px solid #28a745', position: 'relative', zIndex: 10 }}>
                                                                            <h6 className="mb-3 text-center" style={{ fontSize: '14px', fontWeight: '600', color: '#28a745' }}>✓ Image Preview:</h6>
                                                                            <div className="text-center">
                                                                                <img src={previewImages?.selfie || (localSelfie && typeof localSelfie === 'object' ? URL.createObjectURL(localSelfie) : '')} alt="Selfie preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '2px solid #28a745', display: 'block', margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                                                                            </div>
                                                                        </div>
                                                                    ) : null}
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
                                                                            data-multiple-caption="{count} files selected" onChange={handleChangeIdentity} accept="image/png,image/jpeg,image/jpg" />
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
                                                                    {(previewImages?.doc_front && previewImages.doc_front !== "") || localFront ? (
                                                                        <div className="mt-3" style={{ padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', marginTop: '15px', width: '100%', border: '2px solid #28a745', position: 'relative', zIndex: 10 }}>
                                                                            <h6 className="mb-3 text-center" style={{ fontSize: '14px', fontWeight: '600', color: '#28a745' }}>✓ Image Preview:</h6>
                                                                            <div className="text-center">
                                                                                <img src={previewImages?.doc_front || (localFront && typeof localFront === 'object' ? URL.createObjectURL(localFront) : '')} alt="Document front preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '2px solid #28a745', display: 'block', margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                                                                            </div>
                                                                        </div>
                                                                    ) : null}
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
                                                                            data-multiple-caption="{count} files selected" onChange={handleChangeIdentity2} accept="image/png,image/jpeg,image/jpg" />
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
                                                                    {(previewImages?.doc_back && previewImages.doc_back !== "") || localBack ? (
                                                                        <div className="mt-3" style={{ padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', marginTop: '15px', width: '100%', border: '2px solid #28a745', position: 'relative', zIndex: 10 }}>
                                                                            <h6 className="mb-3 text-center" style={{ fontSize: '14px', fontWeight: '600', color: '#28a745' }}>✓ Image Preview:</h6>
                                                                            <div className="text-center">
                                                                                <img src={previewImages?.doc_back || (localBack && typeof localBack === 'object' ? URL.createObjectURL(localBack) : '')} alt="Document back preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '2px solid #28a745', display: 'block', margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                                                                            </div>
                                                                        </div>
                                                                    ) : null}
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
                                                                            data-multiple-caption="{count} files selected" multiple="" onChange={handleChangePanCard} accept="image/png,image/jpeg,image/jpg" />
                                                                        {localPanCard === '' ?
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
                                                                    {(previewImages?.pan && previewImages.pan !== "") || localPanCard ? (
                                                                        <div className="mt-3" style={{ padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', marginTop: '15px', width: '100%', border: '2px solid #28a745', position: 'relative', zIndex: 10 }}>
                                                                            <h6 className="mb-3 text-center" style={{ fontSize: '14px', fontWeight: '600', color: '#28a745' }}>✓ Image Preview:</h6>
                                                                            <div className="text-center">
                                                                                <img src={previewImages?.pan || (localPanCard && typeof localPanCard === 'object' ? URL.createObjectURL(localPanCard) : '')} alt="PAN card preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '2px solid #28a745', display: 'block', margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                                                                            </div>
                                                                        </div>
                                                                    ) : null}
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
            </div>


            {/* <!-- Modal kyc Start --> */}

            <div className="modal fade kyc_modal" id="kycModal" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">


                        <div className="modal-header">
                            <h5 className="modal-title" id="kycTitle">Select Country and ID Type</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>


                        <div className="modal-body">


                            <div className="kyc_step active" data-title="Select Country and ID Type">
                                <label className="label">🌟 Country/Region (Please select the issuing country of the document) <span className="text-danger">*</span></label>
                                <div className="select_box">
                                    <select id="kycCountry" value={modalCountry} onChange={(e) => setModalCountry(e.target.value)} required>
                                        <option value="">Select Country</option>
                                        <option value="India">🇮🇳 India</option>
                                        <option value="USA">🇺🇸 USA</option>
                                        <option value="UK">🇬🇧 United Kingdom</option>
                                        <option value="Canada">🇨🇦 Canada</option>
                                        <option value="Australia">🇦🇺 Australia</option>
                                    </select>
                                </div>
                                <small className="text-danger d-none" id="countryError">Please select a country</small>

                                <label className="label mt-4">ID Type <span className="text-danger">*</span></label>
                                <div className="id_grid">
                                    <label className={`id_item ${modalIdType === 'ID Card' ? 'selected' : ''}`}>
                                        <input type="radio" name="kycIdType" value="ID Card" checked={modalIdType === 'ID Card'} onChange={(e) => setModalIdType(e.target.value)} required />
                                        ID Card
                                    </label>
                                    <label className={`id_item ${modalIdType === 'Passport' ? 'selected' : ''}`}>
                                        <input type="radio" name="kycIdType" value="Passport" checked={modalIdType === 'Passport'} onChange={(e) => setModalIdType(e.target.value)} />
                                        Passport
                                    </label>
                                    <label className={`id_item ${modalIdType === 'Driving License' ? 'selected' : ''}`}>
                                        <input type="radio" name="kycIdType" value="Driving License" checked={modalIdType === 'Driving License'} onChange={(e) => setModalIdType(e.target.value)} />
                                        Driving license
                                    </label>
                                    <label className={`id_item ${modalIdType === 'Residence Permit' ? 'selected' : ''}`}>
                                        <input type="radio" name="kycIdType" value="Residence Permit" checked={modalIdType === 'Residence Permit'} onChange={(e) => setModalIdType(e.target.value)} />
                                        Residence Permit
                                    </label>
                                </div>
                                <small className="text-danger d-none" id="idTypeError">Please select an ID type</small>

                                <button type="button" className="primary_btn nextStep" onClick={(e) => {
                                    e.preventDefault();
                                    if (validateModalStep0()) {
                                        nextModalStep();
                                    }
                                }}>Next</button>
                            </div>


                            <div className="kyc_step" data-title="Take a Photo of Your ID Card">
                                <div className="id_preview">
                                    <img src="/images/photoid_vector.png" alt="ID card" />
                                </div>

                                <div className="tips photomini">
                                    <p><img src="/images/photoidmini.png" alt="tip 1" /></p>
                                    <p><img src="/images/photoidmini2.png" alt="tip 2" /></p>
                                    <p><img src="/images/photoidmini3.png" alt="tip 3" /></p>
                                </div>

                                <h6>The selected country/region and ID type are as follows:</h6>

                                <div className="info_text">
                                    <ul className="d-flex gap-3">
                                        <li>
                                            {modalCountry === 'India' && '🇮🇳'}
                                            {modalCountry === 'USA' && '🇺🇸'}
                                            {modalCountry === 'UK' && '🇬🇧'}
                                            {modalCountry === 'Canada' && '🇨🇦'}
                                            {modalCountry === 'Australia' && '🇦🇺'}
                                            {' '}{modalCountry || 'Not Selected'}
                                        </li>
                                        <li><img src="/images/idcard.png" alt="ID Card" /> {modalIdType || 'Not Selected'}</li>
                                    </ul>
                                </div>
                                <p>Please upload a valid ID matching your selected country/region and ID type to avoid verification failure.</p>

                                <input className="input" placeholder="ID Card Number" value={aadhar} onChange={(e) => setAadhar(e.target.value)} />

                                <div className="upload_grid">

                                    <div className="upload-box">
                                        <input type="file" id="modalDocFront" hidden accept="image/png,image/jpeg,image/jpg" onChange={handleChangeIdentity} />
                                        <label htmlFor="modalDocFront" className="upload-label">
                                            {previewImages?.doc_front ? (
                                                <img src={previewImages.doc_front} alt="Document Front" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }} />
                                            ) : (
                                                <img className="upload_back_img" src="/images/fileback_vector.png" alt="upload background" />
                                            )}
                                            <div className="icon">
                                                <img src="/images/uploadvector.svg" alt="upload" />
                                            </div>
                                            <h3>{localFront ? '✓ Uploaded' : 'Front Side'}</h3>
                                            <p>{localFront?.name || 'Drag or choose file'}</p>
                                        </label>
                                    </div>

                                    <div className="upload-box">
                                        <input type="file" id="modalDocBack" hidden accept="image/png,image/jpeg,image/jpg" onChange={handleChangeIdentity2} />
                                        <label htmlFor="modalDocBack" className="upload-label">
                                            {previewImages?.doc_back ? (
                                                <img src={previewImages.doc_back} alt="Document Back" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }} />
                                            ) : (
                                                <img className="upload_back_img" src="/images/fileback_vector.png" alt="upload background" />
                                            )}
                                            <div className="icon">
                                                <img src="/images/uploadvector.svg" alt="upload" />
                                            </div>
                                            <h3>{localBack ? '✓ Uploaded' : 'Back Side'}</h3>
                                            <p>{localBack?.name || 'Drag or choose file'}</p>
                                        </label>
                                    </div>

                                </div>

                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                                    <button className="primary_btn prevStep" onClick={(e) => {
                                        e.preventDefault();
                                        prevModalStep();
                                    }}>Back</button>
                                    <button className="primary_btn nextStep" onClick={(e) => {
                                        e.preventDefault();
                                        if (!localFront || !localBack) {
                                            alertErrorMessage('Please upload both front and back images of your ID card');
                                            return;
                                        }
                                        nextModalStep();
                                    }}>Next</button>
                                </div>
                            </div>


                            <div className="kyc_step" data-title="Income Tax & Selfie">
                                <div className="d-flex gap-4 flex-column">
                                    <div>
                                        <label className="label mb-2">Income Tax Identification Number <span className="text-danger">*</span></label>
                                        <input className="input" placeholder="Income Tax Identification Number" value={panCard} onChange={(e) => setPanCard(e.target.value)} />
                                    </div>

                                    <div>
                                        <h5 className="mb-2">Upload Income Tax Document <span className="text-danger">*</span></h5>
                                        <span className="small text-muted">(Only JPEG, PNG & JPG formats and file size upto 5MB are supported)</span>
                                        <div className="upload-box mt-2">
                                            <input type="file" id="modalPanCard" hidden accept="image/png,image/jpeg,image/jpg" onChange={handleChangePanCard} />
                                            <label htmlFor="modalPanCard" className="upload-label">
                                                {previewImages?.pan ? (
                                                    <img src={previewImages.pan} alt="PAN Card" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }} />
                                                ) : (
                                                    <>
                                                        <div className="icon">
                                                            <img src="/images/uploadvector.svg" alt="upload" />
                                                        </div>
                                                    </>
                                                )}
                                                <h3>{localPanCard ? '✓ Uploaded' : 'Choose a File'}</h3>
                                                <p>{localPanCard?.name || 'Drag or choose your file to upload'}</p>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <h5 className="mb-2">Upload Selfie with ID <span className="text-danger">*</span></h5>
                                        <span className="small text-muted">(Only JPEG, PNG & JPG formats and file size upto 5MB are supported)</span>

                                        <div className="upload-box mt-2">
                                            <input type="file" id="modalSelfie" hidden accept="image/png,image/jpeg,image/jpg" onChange={handleChangeSelfie} />
                                            <label htmlFor="modalSelfie" className="upload-label">
                                                {previewImages?.selfie ? (
                                                    <img src={previewImages.selfie} alt="Selfie" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }} />
                                                ) : (
                                                    <>
                                                        <div className="icon">
                                                            <img src="/images/uploadvector.svg" alt="upload" />
                                                        </div>
                                                        <div className="selfie_circle">
                                                            <img src="/images/selefvector.png" alt="selfie guide" />
                                                        </div>
                                                    </>
                                                )}
                                                <h3>{localSelfie ? '✓ Uploaded' : 'Choose a File'}</h3>
                                                <p>{localSelfie?.name || 'Drag or choose your file to upload'}</p>
                                            </label>
                                        </div>
                                    </div>

                                </div>

                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', marginTop: '20px' }}>
                                    <button className="primary_btn prevStep" onClick={(e) => {
                                        e.preventDefault();
                                        prevModalStep();
                                    }}>Back</button>
                                    <button className="primary_btn nextStep" onClick={(e) => {
                                        e.preventDefault();
                                        if (!panCard) {
                                            alertErrorMessage('Please enter Income Tax Identification Number');
                                            return;
                                        }
                                        if (!localPanCard) {
                                            alertErrorMessage('Please upload Income Tax document');
                                            return;
                                        }
                                        if (!localSelfie) {
                                            alertErrorMessage('Please upload selfie with ID');
                                            return;
                                        }
                                        nextModalStep();
                                    }}>Next</button>
                                </div>
                            </div>

                            <div className="kyc_step text-center" data-title="Face Verification">
                                <div className="face_circle" style={{ width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 20px', border: '3px solid #28a745' }}>
                                    {previewImages?.selfie ? (
                                        <img src={previewImages.selfie} alt="Your Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <img src="/images/selefvector.png" alt="selfie placeholder" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )}
                                </div>
                                <h5 className="text-success mb-3">✓ Face Captured Successfully</h5>
                                <p className="text-muted">Your selfie has been uploaded. Click Next to review your information.</p>

                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', marginTop: '20px' }}>
                                    <button className="primary_btn prevStep" onClick={(e) => {
                                        e.preventDefault();
                                        prevModalStep();
                                    }}>Back</button>
                                    <button className="primary_btn nextStep" onClick={(e) => {
                                        e.preventDefault();
                                        nextModalStep();
                                    }}>Next</button>
                                </div>
                            </div>


                            <div className="kyc_step" data-title="Review Your Information">
                                <div className="table-responsive pt-3">
                                    <div className="kyc_information_del">
                                        <div className="userinfolft">
                                            <div className="face_circle" style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #28a745' }}>
                                                {previewImages?.selfie ? (
                                                    <img src={previewImages.selfie} alt="Your Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <img src="/images/selefvector.png" alt="selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                )}
                                            </div>
                                            <h5>{firstName} {lastName}</h5>
                                        </div>

                                        <div className="info_list">
                                            <ul>
                                                <li>Full Name <span>{firstName} {lastName}</span></li>
                                                <li>Email <span>{emailId}</span></li>
                                                <li>Mobile Number <span>{mobileNumber}</span></li>
                                                <li>Document No. <span>{aadhar}</span></li>
                                                <li>Tax ID <span>{panCard}</span></li>
                                            </ul>
                                        </div>

                                    </div>

                                    <div className="documentnumber_s">
                                        <ul>
                                            <li><span>ID Card Number:</span>{aadhar || 'N/A'}</li>
                                        </ul>
                                    </div>

                                    <div className="picture_front_bl" style={{ display: 'flex', gap: '20px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                        <div className="document_front_bl" style={{ flex: '1', minWidth: '150px' }}>
                                            <p>Document (Front)</p>
                                            <div className="front_img" style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                                                {previewImages?.doc_front ? (
                                                    <img src={previewImages.doc_front} alt="Document Front" style={{ width: '100%', maxHeight: '120px', objectFit: 'cover' }} />
                                                ) : (
                                                    <img src="/images/document_front.png" alt="Document Front" style={{ width: '100%' }} />
                                                )}
                                            </div>
                                        </div>
                                        <div className="document_front_bl" style={{ flex: '1', minWidth: '150px' }}>
                                            <p>Document (Back)</p>
                                            <div className="front_img" style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                                                {previewImages?.doc_back ? (
                                                    <img src={previewImages.doc_back} alt="Document Back" style={{ width: '100%', maxHeight: '120px', objectFit: 'cover' }} />
                                                ) : (
                                                    <img src="/images/document_front.png" alt="Document Back" style={{ width: '100%' }} />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="documentnumber_s mt-3">
                                        <ul>
                                            <li><span>Tax ID:</span>{panCard || 'N/A'}</li>
                                        </ul>
                                    </div>

                                    <div className="picture_front_bl" style={{ display: 'flex', gap: '20px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                        <div className="document_front_bl" style={{ flex: '1', minWidth: '150px' }}>
                                            <p>Income Tax Document</p>
                                            <div className="front_img" style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                                                {previewImages?.pan ? (
                                                    <img src={previewImages.pan} alt="Tax Document" style={{ width: '100%', maxHeight: '120px', objectFit: 'cover' }} />
                                                ) : (
                                                    <img src="/images/document_front.png" alt="Tax Document" style={{ width: '100%' }} />
                                                )}
                                            </div>
                                        </div>
                                        <div className="document_front_bl" style={{ flex: '1', minWidth: '150px' }}>
                                            <p>Selfie with ID</p>
                                            <div className="front_img" style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                                                {previewImages?.selfie ? (
                                                    <img src={previewImages.selfie} alt="Selfie" style={{ width: '100%', maxHeight: '120px', objectFit: 'cover' }} />
                                                ) : (
                                                    <img src="/images/document_front.png" alt="Selfie" style={{ width: '100%' }} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                                    <button type="button" className="primary_btn prevStep" onClick={(e) => {
                                        e.preventDefault();
                                        prevModalStep();
                                    }}>Back</button>
                                    <button
                                        type="button"
                                        className="primary_btn kyc-submit-btn"
                                        onClick={handleModalKycSubmit}
                                    >
                                        Submit KYC
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>


            {/* <!-- Modal kyc End --> */}

            {/* KYC Submit Confirmation Modal */}
            <div className="modal fade" id="kycSubmitModal" tabIndex="-1" aria-labelledby="kycSubmitModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content kyc_modal">
                        <div className="modal-header">
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body text-center">
                            <div className="mb-4">
                                <div className="success_icon_wrapper mb-3">
                                    <img src="/images/verifing_vector.png" alt="photo" />
                                </div>
                                <h4 className="mb-3">Verifying</h4>
                                <p className="text-muted mb-2">
                                    Hang tight, your review will be completed within the next 48 hours.
                                </p>

                                <p className="text-muted mb-2">Continue exploring Exchange while you wait. We'll notify you once
                                    verification is complete.</p>
                            </div>
                            <div className="d-flex gap-3 justify-content-center mt-4">
                                <button type="button" className="primary_btn" style={{ width: 'auto', padding: '10px 30px' }}
                                    onClick={() => {
                                        const submitModalElement = document.getElementById('kycSubmitModal');
                                        const kycModalElement = document.getElementById('kycModal');

                                        if (submitModalElement) {
                                            const submitModal = window.bootstrap?.Modal?.getInstance(submitModalElement);
                                            if (submitModal) {
                                                submitModal.hide();
                                            }
                                        }

                                        // Close KYC modal
                                        setTimeout(() => {
                                            if (kycModalElement) {
                                                const kycModal = window.bootstrap?.Modal?.getInstance(kycModalElement);
                                                if (kycModal) {
                                                    kycModal.hide();
                                                }
                                            }
                                        }, 300);

                                        // Call actual submit function
                                        handleKyc();
                                    }}>
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



        </>
    );
}

export default KycPage


