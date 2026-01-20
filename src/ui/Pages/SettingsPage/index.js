import React, { useState, useEffect, useContext } from "react";
import { validateEmail, matchPassword } from "../../../utils/Validation";
import { alertErrorMessage, alertSuccessMessage } from "../../../customComponents/CustomAlertMessage";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import AuthService from "../../../api/services/AuthService";
import { ApiConfig } from "../../../api/apiConfig/apiConfig";
import { ProfileContext } from "../../../context/ProfileProvider";
import { $ } from "react-jquery-plugin";
import DashboardHeader from "../../../customComponents/DashboardHeader";
import { isValidPhoneNumber } from "libphonenumber-js";
import "./SettingsPage.css";

const SettingsPage = (props) => {

  const { userDetails, handleUserDetails } = useContext(ProfileContext);

  const [emailId, setEmailId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState();
  const [countryCode, setCountryCode] = useState("+91");
  const [myfile, setMyfile] = useState('');
  const [localSelfy, setLocalSelfy] = useState("");
  const [disableBtn, setDisbaleBtn] = useState(false);
  const [disableBtn2, setDisbaleBtn2] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const [timer2, setTimer2] = useState(0);


  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState();
  const [newCountryCode, setNewCountryCode] = useState("+91");
  const [currencyType, setCurrencyType] = useState();
  const [password, setPassword] = useState('');
  const [conPassword, setConPassword] = useState('');
  const [passwordOtp, setPasswordOtp] = useState('');
  const [passwordTimer, setPasswordTimer] = useState(0);
  const [passwordDisableBtn, setPasswordDisableBtn] = useState(false);
  const [registeredSignId, setRegisteredSignId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConPassword, setShowConPassword] = useState(false);


  useEffect(() => {
    setEmailId(props?.userDetails?.emailId);
    setMobile(props?.userDetails?.mobileNumber);
    setFirstName(props?.userDetails?.firstName);
    setLastName(props?.userDetails?.lastName);
    setMyfile(props?.userDetails?.profilepicture);
    setCountryCode(props?.userDetails?.country_code);
    setCurrencyType(userDetails?.currency_prefrence || props?.userDetails?.currency_prefrence || "USDT");
  }, [props, userDetails]);

  useEffect(() => {
    // Set registered sign ID for password change
    const currentUserDetails = userDetails || props?.userDetails;
    if (currentUserDetails?.registeredBy === "phone") {
      const countryCode = currentUserDetails?.country_code || "+91";
      const mobileNumber = currentUserDetails?.mobileNumber || mobile;
      setRegisteredSignId(mobileNumber ? `${countryCode} ${mobileNumber}` : "");
    } else {
      const email = currentUserDetails?.emailId || emailId;
      setRegisteredSignId(email || "");
    }
  }, [userDetails, props?.userDetails, mobile, emailId]);

  const modalBackdropRemove = () => {
    try {
      if (typeof $ !== 'undefined') {
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
      } else if (document && document.body) {
        document.body.classList.remove('modal-open');
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error removing modal backdrop:', error);
      }
    }
  }

  const handleChangeSelfie = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (allowedTypes.includes(file.type) && file.size <= maxSize) {
        const imgData = URL.createObjectURL(file);
        setLocalSelfy(imgData);
        setMyfile(file);

        // First close any open modals (like profilepop)
        const profileModal = document.getElementById('profilepop');
        if (profileModal) {
          const profileModalInstance = window.bootstrap?.Modal?.getInstance(profileModal);
          if (profileModalInstance) {
            profileModalInstance.hide();
          }
        }

        // Remove any modal backdrops
        modalBackdropRemove();

        // Open the preview modal after a short delay
        setTimeout(() => {
          const modalElement = document.getElementById('editAvatarModal');
          if (modalElement) {
            const modal = new window.bootstrap.Modal(modalElement);
            modal.show();
          }
        }, 300);
      } else {
        if (!allowedTypes.includes(file.type)) {
          alertErrorMessage("Only PNG, JPEG, and JPG file types are allowed.");
        } else {
          alertErrorMessage("Max image size is 5MB.");
        }
        // Reset file input
        event.target.value = "";
      }
    }
  };


  const handleGetOtp = async (emailorMobile, type, inputType) => {
    try {
      let signId;
      if (inputType === "email") {
        if (validateEmail(newEmail) !== undefined) {
          alertErrorMessage("Please enter valid email address");
          return;
        }
        signId = newEmail;
      } else {
        const fullPhone = `${newCountryCode}${newPhone}`;

        if (!isValidPhoneNumber(fullPhone)) {
          alertErrorMessage("Please enter a valid phone number for the selected country");
          return;
        }
        const fullPhonePayload = `${newCountryCode} ${newPhone}`;
        signId = fullPhonePayload;
      }

      LoaderHelper.loaderStatus(true);
      const result = await AuthService.getOtp(signId, type);
      LoaderHelper.loaderStatus(false);

      if (result?.success) {
        alertSuccessMessage(result?.message || "OTP sent successfully");
        if (inputType === "email") {
          setDisbaleBtn(true);
          setTimer(30);
        } else {
          setDisbaleBtn2(true);
          setTimer2(30);
        }
      } else {
        alertErrorMessage(result?.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      LoaderHelper.loaderStatus(false);
      if (process.env.NODE_ENV === 'development') {
        console.error("Error in handleGetOtp:", error);
      }
      alertErrorMessage(error?.response?.data?.message || error?.message || "An error occurred while sending OTP. Please try again.");
    }
  };


  const editavatar = async () => {
    try {
      if (!myfile || typeof myfile === 'string') {
        return Promise.resolve(false); // No file to upload
      }

      const formData = new FormData();
      formData.append("profilepicture", myfile);

      LoaderHelper.loaderStatus(true);
      const result = await AuthService.editavatar(formData);
      LoaderHelper.loaderStatus(false);

      if (result?.success) {
        alertSuccessMessage(result?.message || "Profile picture updated successfully");
        // Update local state immediately
        if (result?.data?.profilepicture) {
          setMyfile(result.data.profilepicture);
        }
        // Refresh user details from API
        await handleUserDetails();
        return true;
      } else {
        alertErrorMessage(result?.message || "Failed to update profile picture. Please try again.");
        return false;
      }
    } catch (error) {
      LoaderHelper.loaderStatus(false);
      if (process.env.NODE_ENV === 'development') {
        console.error("Error in editavatar:", error);
      }
      alertErrorMessage(error?.response?.data?.message || error?.message || "An error occurred while updating profile picture. Please try again.");
      return false;
    }
  };

  const editusername = async () => {
    try {
      if (!firstName?.trim() && !lastName?.trim()) {
        return Promise.resolve(false);
      }

      LoaderHelper.loaderStatus(true);
      const result = await AuthService.editusername(firstName, lastName);
      LoaderHelper.loaderStatus(false);

      if (result?.success) {
        alertSuccessMessage(result?.message || "Name updated successfully");
        // Update local state immediately if API returns updated data
        if (result?.data) {
          if (result.data.firstName) setFirstName(result.data.firstName);
          if (result.data.lastName) setLastName(result.data.lastName);
        }
        // Refresh user details from API
        await handleUserDetails();
        return true;
      } else {
        alertErrorMessage(result?.message || "Failed to update name. Please try again.");
        return false;
      }
    } catch (error) {
      LoaderHelper.loaderStatus(false);
      if (process.env.NODE_ENV === 'development') {
        console.error("Error in editusername:", error);
      }
      alertErrorMessage(error?.response?.data?.message || error?.message || "An error occurred while updating name. Please try again.");
      return false;
    }
  };

  const editEmail = async () => {
    try {
      if (validateEmail(newEmail) !== undefined) {
        alertErrorMessage("Please enter valid email address");
        return;
      }
      if (!emailOtp || emailOtp?.length < 5) {
        alertErrorMessage("Invalid OTP");
        return;
      }

      LoaderHelper.loaderStatus(true);
      const result = await AuthService.editemail(newEmail, emailOtp);
      LoaderHelper.loaderStatus(false);

      if (result?.success) {
        setEmailOtp("");
        setNewEmail("");
        setTimer(0);
        setDisbaleBtn(false);
        modalBackdropRemove();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        alertSuccessMessage(result?.message || "Email updated successfully");
        handleUserDetails();
      } else {
        $("#email_light").modal('show');
        alertErrorMessage(result?.message || "Failed to update email. Please try again.");
      }
    } catch (error) {
      LoaderHelper.loaderStatus(false);
      if (process.env.NODE_ENV === 'development') {
        console.error("Error in editEmail:", error);
      }
      $("#email_light").modal('show');
      alertErrorMessage(error?.response?.data?.message || error?.message || "An error occurred while updating email. Please try again.");
    }
  };

  const handleGetPasswordOtp = async () => {
    try {
      if (!registeredSignId) {
        alertErrorMessage("Please update your email or phone number first");
        return;
      }

      LoaderHelper.loaderStatus(true);
      const result = await AuthService.getOtp(registeredSignId, "forgot_password");
      LoaderHelper.loaderStatus(false);

      if (result?.success) {
        alertSuccessMessage(result?.message || "OTP sent successfully");
        setPasswordDisableBtn(true);
        setPasswordTimer(30);
      } else {
        alertErrorMessage(result?.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      LoaderHelper.loaderStatus(false);
      if (process.env.NODE_ENV === 'development') {
        console.error("Error in handleGetPasswordOtp:", error);
      }
      alertErrorMessage(error?.response?.data?.message || error?.message || "An error occurred while sending OTP. Please try again.");
    }
  };

  // Custom password validation function for SettingsPage
  const validatePasswordSettings = (value) => {
    if (!value) return { isValid: false, errors: [] };

    const errors = [];

    // Check length (8-30 characters)
    if (value.length < 8 || value.length > 30) {
      errors.push('8-30 characters');
    }

    // Check for uppercase
    if (!/[A-Z]/.test(value)) {
      errors.push('At least one uppercase');
    }

    // Check for lowercase
    if (!/[a-z]/.test(value)) {
      errors.push('At least one lowercase');
    }

    // Check for number
    if (!/[0-9]/.test(value)) {
      errors.push('At least one number');
    }

    // Check for spaces
    if (/\s/.test(value)) {
      errors.push('Does not contain any spaces');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };

  const handleChangePassword = async () => {
    try {
      const passwordValidation = validatePasswordSettings(password);
      if (!passwordValidation.isValid || !password) {
        alertErrorMessage("Please ensure your password meets all requirements");
        return;
      }

      if (matchPassword(password, conPassword) !== undefined) {
        alertErrorMessage("New password and confirm password must match");
        return;
      }

      if (!passwordOtp || passwordOtp?.length < 5) {
        alertErrorMessage("Invalid verification code");
        return;
      }

      if (!registeredSignId) {
        alertErrorMessage("Please update your email or phone number first");
        return;
      }

      LoaderHelper.loaderStatus(true);
      const result = await AuthService.setSecurity(password, conPassword, passwordOtp, registeredSignId);
      LoaderHelper.loaderStatus(false);

      if (result?.success) {
        setPassword("");
        setConPassword("");
        setPasswordOtp("");
        setPasswordTimer(0);
        setPasswordDisableBtn(false);
        const modalElement = document.getElementById('security_verification');
        if (modalElement) {
          const modal = window.bootstrap?.Modal?.getInstance(modalElement);
          if (modal) modal.hide();
        }
        modalBackdropRemove();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        alertSuccessMessage(result?.message || "Password changed successfully");
      } else {
        $("#security_verification").modal('show');
        alertErrorMessage(result?.message || "Failed to change password. Please try again.");
      }
    } catch (error) {
      LoaderHelper.loaderStatus(false);
      if (process.env.NODE_ENV === 'development') {
        console.error("Error in handleChangePassword:", error);
      }
      $("#security_verification").modal('show');
      alertErrorMessage(error?.response?.data?.message || error?.message || "An error occurred while changing password. Please try again.");
    }
  };

  const handleCurrency = async (currencyType) => {
    try {
      if (!currencyType) {
        alertErrorMessage("Please select a currency");
        return;
      }

      LoaderHelper.loaderStatus(true);
      const result = await AuthService.setCurrency(currencyType);
      LoaderHelper.loaderStatus(false);

      if (result?.success) {
        alertSuccessMessage(result?.message || "Currency preference updated successfully");
        await handleUserDetails();
      } else {
        alertErrorMessage(result?.message || "Failed to update currency preference. Please try again.");
      }
    } catch (error) {
      LoaderHelper.loaderStatus(false);
      if (process.env.NODE_ENV === 'development') {
        console.error("Error in handleCurrency:", error);
      }
      alertErrorMessage(error?.response?.data?.message || error?.message || "An error occurred while updating currency preference. Please try again.");
    }
  };

  const editPhone = async () => {
    try {
      const fullPhone = `${newCountryCode}${newPhone}`;
      if (!isValidPhoneNumber(fullPhone)) {
        alertErrorMessage("Please enter a valid phone number for the selected country");
        return;
      }
      if (!newPhone || mobileOtp?.length < 5) {
        alertErrorMessage("Invalid OTP");
        $("#mobilepop").modal('show');
        return;
      }

      LoaderHelper.loaderStatus(true);
      const result = await AuthService.editPhone(`${newCountryCode} ${newPhone}`, mobileOtp);
      LoaderHelper.loaderStatus(false);

      if (result?.success) {
        setCountryCode("+91");
        setMobileOtp("");
        setNewPhone("");
        setTimer2(0);
        setDisbaleBtn2(false);
        // Close modal
        const modalElement = document.getElementById('mobilepop');
        if (modalElement) {
          const modal = window.bootstrap?.Modal?.getInstance(modalElement);
          if (modal) modal.hide();
        }
        modalBackdropRemove();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        alertSuccessMessage(result?.message || "Phone number updated successfully");
        handleUserDetails();
      } else {
        $("#mobilepop").modal('show');
        alertErrorMessage(result?.message || "Failed to update phone number. Please try again.");
      }
    } catch (error) {
      LoaderHelper.loaderStatus(false);
      if (process.env.NODE_ENV === 'development') {
        console.error("Error in editPhone:", error);
      }
      $("#mobilepop").modal('show');
      alertErrorMessage(error?.response?.data?.message || error?.message || "An error occurred while updating phone number. Please try again.");
    }
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
  useEffect(() => {
    let interval;
    if (timer2 > 0) {
      interval = setInterval(() => {
        setTimer2((prev) => prev - 1);
      }, 1000);
    } else if (timer2 === 0) {
      setDisbaleBtn2(false);
    }
    return () => clearInterval(interval);
  }, [timer2]);

  useEffect(() => {
    let interval;
    if (passwordTimer > 0) {
      interval = setInterval(() => {
        setPasswordTimer((prev) => prev - 1);
      }, 1000);
    } else if (passwordTimer === 0) {
      setPasswordDisableBtn(false);
    }
    return () => clearInterval(interval);
  }, [passwordTimer]);


  return (
    <>
      <div className="dashboard_right">
        <DashboardHeader props={props} />


        <div className="twofactor_outer_s">
          <h5>Profile</h5>
          <p>To protect your account, we recommend that you enable at least one 2FA</p>
          <div className="two_factor_list">
            <div className="factor_bl active">
              <div className="lftcnt">
                <h6><img src="/images/lock_icon.svg" alt="Authenticator App" /> Name & Avatar</h6>
                <p>Update your name and avatar to personalize your profile. Save changes to keep your account up to date.</p>
                <input
                  type="file"
                  id="avatarFileInput"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleChangeSelfie}
                  style={{ display: 'none' }}
                />
                {/* <button 
                  className="btn" 
                  onClick={() => document.getElementById('avatarFileInput').click()}
                >
                  Edit Avatar
                </button> */}
              </div>

              <div className="enable">
                <img
                  src={
                    userDetails?.profilepicture
                      ? `${ApiConfig.baseImage}${userDetails.profilepicture}`
                      : props?.userDetails?.profilepicture
                        ? `${ApiConfig.baseImage}${props.userDetails.profilepicture}`
                        : myfile && typeof myfile === 'string'
                          ? `${ApiConfig.baseImage}${myfile}`
                          : "/images/user.png"
                  }
                  alt="user"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/user.png";
                  }}
                />
                {userDetails?.firstName || userDetails?.lastName
                  ? `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim()
                  : props?.userDetails?.firstName || props?.userDetails?.lastName
                    ? `${props.userDetails.firstName || ''} ${props.userDetails.lastName || ''}`.trim()
                    : firstName || lastName
                      ? `${firstName || ''} ${lastName || ''}`.trim()
                      : 'User Name'
                }
              </div>
              <button className="btn" data-bs-toggle="modal" data-bs-target="#profilepop">Change</button>

            </div>

            <div className="factor_bl">
              <div className="lftcnt">
                <h6><img src="/images/email_icon2.svg" alt="Email Verification" /> Email Verification</h6>
                <p>SeLink your email address to your account for login, password recovery and withdrawal confirmation.cure your account and withdrawals with a passkey</p>
              </div>

              <div className="enable">
                <img src="/images/verified_icon.svg" alt="Email Verification" />
                {userDetails?.emailId || props?.userDetails?.emailId || emailId
                  ? (() => {
                    const email = userDetails?.emailId || props?.userDetails?.emailId || emailId;
                    if (email && email.length > 7) {
                      return `${email.substring(0, 3)}***${email.substring(email.length - 4)}`;
                    }
                    return email || 'Not set';
                  })()
                  : 'Not set'
                }
              </div>
              <button className="btn" data-bs-toggle="modal" data-bs-target="#emailpop">Change</button>

            </div>

            <div className="factor_bl">
              <div className="lftcnt">
                <h6><img src="/images/mobile_icon.svg" alt="Mobile Verification" /> Mobile Verification</h6>
                <p>Link your mobile number to your account to receive verification codes via SMS for confirmations on withdrawal, password change, and security settings.</p>
              </div>

              <div className="enable">
                <img src="/images/verified_icon.svg" alt="mobile" />
                {userDetails?.mobileNumber || props?.userDetails?.mobileNumber || mobile
                  ? `${userDetails?.country_code || props?.userDetails?.country_code || countryCode || '+91'}-${userDetails?.mobileNumber || props?.userDetails?.mobileNumber || mobile}`
                  : 'Not set'
                }
              </div>
              <button className="btn" data-bs-toggle="modal" data-bs-target="#mobilepop">Change</button>

            </div>

          </div>

        </div>

        <div className="twofactor_outer_s">
          <h5>Currency Preference</h5>
          <p>Select your preferred display currency for all markets</p>

          <div className="two_factor_list">

            <div className="currency_list_b">
              <ul>
                <li className={currencyType === "USDT" ? "active" : ""} onClick={() => setCurrencyType("USDT")}>
                  <div className="currency_bit"><img src="/images/icon/tether.png" className="img-fluid" alt="Tether" /></div>
                  <h6>Tether USD (USDT)</h6>
                  <div className="vector_bottom">
                    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="52" viewBox="0 0 60 52" fill="none">
                      <path d="M59.6296 0L60 52H0L59.6296 0Z" fill="#3B3B3B"></path>
                    </svg>
                  </div>
                </li>
                <li className={currencyType === "BTC" ? "active" : ""} onClick={() => setCurrencyType("BTC")}>
                  <div className="currency_bit"><img src="/images/icon/btc copy.png" className="img-fluid" alt="BTC" width="50px" /></div>
                  <h6>BTC</h6>
                  <div className="vector_bottom">
                    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="52" viewBox="0 0 60 52" fill="none">
                      <path d="M59.6296 0L60 52H0L59.6296 0Z" fill="#3B3B3B"></path>
                    </svg>
                  </div>
                </li>
                <li className={currencyType === "BNB" ? "active" : ""} onClick={() => setCurrencyType("BNB")}>
                  <div className="currency_bit"><img src="/images/icon/bnb copy.png" className="img-fluid" alt="BNB" /></div>
                  <h6>BNB</h6>
                  <div className="vector_bottom">
                    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="52" viewBox="0 0 60 52" fill="none">
                      <path d="M59.6296 0L60 52H0L59.6296 0Z" fill="#3B3B3B"></path>
                    </svg>
                  </div>
                </li>
              </ul>
              <div className="savebtn">
                <button onClick={() => handleCurrency(currencyType)}>Save Currency Preference</button>
              </div>

            </div>

          </div>

        </div>


        <div className="twofactor_outer_s">
          <h5>Security Settings</h5>
          <p>Manage your account security and password settings</p>

          <div className="two_factor_list">

            <div className="factor_bl active">
              <div className="lftcnt">
                <h6><img src="/images/lock_icon.svg" alt="Login Password" /> Login Password</h6>
                <p>Change your account password. You will need to verify with OTP sent to your registered {(userDetails?.registeredBy || props?.userDetails?.registeredBy) === "phone" ? "mobile number" : "email"}.</p>
              </div>

              <button
                className="btn"
                onClick={async () => {
                  // Reset form fields
                  setPassword("");
                  setConPassword("");
                  setPasswordOtp("");
                  // Send OTP
                  await handleGetPasswordOtp();
                  // Open modal
                  const modalElement = document.getElementById('security_verification');
                  if (modalElement) {
                    const modal = new window.bootstrap.Modal(modalElement);
                    modal.show();
                  }
                }}
              >
                Change Password
              </button>

            </div>

          </div>

        </div>



        <div className="modal fade search_form" id="editAvatarModal" tabIndex="-1" aria-labelledby="editAvatarModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="editAvatarModalLabel">Preview Avatar</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => {
                    // Reset preview when modal is closed
                    setLocalSelfy("");
                    setMyfile(props?.userDetails?.profilepicture || userDetails?.profilepicture || "");
                    const fileInput = document.getElementById('avatarFileInput');
                    if (fileInput) fileInput.value = "";
                  }}
                ></button>
              </div>
              <div className="modal-body avatar-modal-body">
                <p className="text-center mb-3">Review your new avatar before applying</p>
                <div className="avatar-preview-wrapper">
                  <div className="avatar-preview-container">
                    <img
                      className="profileimg avatar-preview-img"
                      src={localSelfy || "/images/user.png"}
                      alt="Avatar Preview"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/user.png";
                      }}
                    />
                  </div>
                </div>

                <div className="avatar-modal-actions" style={{ marginTop: '20px' }}>
                  <button
                    type="button"
                    className="btn-cancel-avatar"
                    data-bs-dismiss="modal"
                    onClick={() => {
                      // Reset preview when cancelled
                      setLocalSelfy("");
                      setMyfile(props?.userDetails?.profilepicture || userDetails?.profilepicture || "");
                      const fileInput = document.getElementById('avatarFileInput');
                      if (fileInput) fileInput.value = "";
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-apply-avatar"
                    onClick={async () => {
                      if (myfile && typeof myfile !== 'string') {
                        const result = await editavatar();
                        if (result) {
                          const modalElement = document.getElementById('editAvatarModal');
                          if (modalElement) {
                            const modal = window.bootstrap?.Modal?.getInstance(modalElement);
                            if (modal) modal.hide();
                          }
                          modalBackdropRemove();
                          setLocalSelfy("");
                          const fileInput = document.getElementById('avatarFileInput');
                          if (fileInput) fileInput.value = "";
                        }
                      } else {
                        alertErrorMessage("Please select an image first");
                      }
                    }}
                  >
                    Apply Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="modal fade search_form" id="mobilepop" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered ">
            <div className="modal-content">
              <div className="modal-header">

                <h5 className="modal-title" id="exampleModalLabel">Edit Phone</h5>
                <p>Update your phone number. You will receive an OTP for verification.</p>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">

                {(userDetails?.registeredBy === "phone" || props?.userDetails?.registeredBy === "phone") && (
                  <div className="alert alert-warning mb-3" role="alert">
                    <strong>Note:</strong> Signup method cannot be changed. Contact support for any modification in phone number.
                  </div>
                )}

                <form className="profile_form">

                  <div className="emailinput">
                    <label>Registered Phone</label>
                    <div className="d-flex">
                      <input type="text" value={mobile ? `${countryCode} ${mobile}` : "Not set"} disabled />
                    </div>
                  </div>

                  {!(userDetails?.registeredBy === "phone" || props?.userDetails?.registeredBy === "phone") && (
                    <>
                      <div className="emailinput">
                        <label>New Phone</label>
                        <div className="d-flex">
                          <div className="d-flex mobilenumber">
                            <div className="phonecode">
                              <select
                                className="country_code"
                                value={newCountryCode}
                                onChange={(e) => setNewCountryCode(e.target.value)}
                              >
                                <option value="+91">+91</option>
                                <option value="+1">+1</option>
                                <option value="+44">+44</option>
                              </select>
                            </div>
                            <input
                              type="text"
                              placeholder="New Phone"
                              value={newPhone || ""}
                              onChange={(e) => setNewPhone(e.target.value)}
                            />
                          </div>
                          <div
                            className={`getotp ${disableBtn2 ? 'otp-button-disabled' : 'otp-button-enabled'}`}
                            onClick={() => handleGetOtp(`${newCountryCode} ${newPhone}`, "registration", "phone")}
                          >
                            {disableBtn2 ? `Resend OTP (${timer2}s)` : "GET OTP"}
                          </div>
                        </div>
                      </div>

                      <div className="emailinput">
                        <label>OTP</label>
                        <div className="d-flex">
                          <input
                            type="text"
                            placeholder="Enter OTP here..."
                            value={mobileOtp}
                            onChange={(e) => setMobileOtp(e.target.value)}
                            maxLength={6}
                          />
                        </div>
                      </div>

                      <button
                        className="submit"
                        type="button"
                        onClick={editPhone}
                        disabled={!newPhone || !mobileOtp || mobileOtp?.length < 5}
                      >
                        Submit
                      </button>
                    </>
                  )}

                </form>


              </div>

            </div>
          </div>
        </div>


        <div className="modal fade search_form" id="emailpop" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered ">
            <div className="modal-content">
              <div className="modal-header">

                <h5 className="modal-title" id="exampleModalLabel">Edit Email</h5>
                <p>Update your email address. You will receive an OTP for verification.</p>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">

                {(userDetails?.registeredBy === "email" || userDetails?.registeredBy === "google" || props?.userDetails?.registeredBy === "email" || props?.userDetails?.registeredBy === "google") && (
                  <div className="alert alert-warning mb-3" role="alert">
                    <strong>Note:</strong> Signup method cannot be changed. Contact support for any modification in email.
                  </div>
                )}

                <form className="profile_form">

                  <div className="emailinput">
                    <label>Registered Email</label>
                    <div className="d-flex">
                      <input type="email" value={emailId || ""} disabled />
                    </div>
                  </div>

                  {!(userDetails?.registeredBy === "email" || userDetails?.registeredBy === "google" || props?.userDetails?.registeredBy === "email" || props?.userDetails?.registeredBy === "google") && (
                    <>
                      <div className="emailinput">
                        <label>New Email</label>
                        <div className="d-flex">
                          <input
                            type="email"
                            placeholder="Enter email here..."
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                          />
                          <div
                            className={`getotp ${disableBtn ? 'otp-button-disabled' : 'otp-button-enabled'}`}
                            onClick={() => handleGetOtp(newEmail, "registration", "email")}
                          >
                            {disableBtn ? `Resend OTP (${timer}s)` : "GET OTP"}
                          </div>
                        </div>
                      </div>

                      <div className="emailinput">
                        <label>OTP</label>
                        <div className="d-flex">
                          <input
                            type="text"
                            placeholder="Enter OTP here..."
                            value={emailOtp}
                            onChange={(e) => setEmailOtp(e.target.value)}
                            maxLength={6}
                          />
                        </div>
                      </div>

                      <button
                        className="submit"
                        type="button"
                        onClick={editEmail}
                        disabled={validateEmail(newEmail) !== undefined || !newEmail || !emailOtp || emailOtp?.length < 5}
                      >
                        Submit
                      </button>
                    </>
                  )}

                </form>


              </div>

            </div>
          </div>
        </div>


        <div className="modal fade search_form" id="security_verification" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered ">
            <div className="modal-content">
              <div className="modal-header">

                <h5 className="modal-title" id="exampleModalLabel">Security Verification</h5>
                <p>Enter the code sent to <span>
                  {registeredSignId && registeredSignId.length > 7
                    ? (registeredSignId.includes('@')
                      ? `${registeredSignId.substring(0, 3)}***${registeredSignId.substring(registeredSignId.length - 4)}`
                      : `${registeredSignId.substring(0, 3)}***${registeredSignId.substring(registeredSignId.length - 4)}`)
                    : registeredSignId || 'your registered email/phone'}
                </span></p>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">

                <form className="profile_form">

                  <div className="emailinput">
                    <label>Verification Code</label>
                    <div className="d-flex">
                      <input
                        type="text"
                        placeholder="Enter OTP here..."
                        value={passwordOtp}
                        onChange={(e) => setPasswordOtp(e.target.value)}
                        maxLength={6}
                      />
                      <div
                        className={`resend ${passwordDisableBtn ? 'otp-button-disabled' : 'otp-button-enabled'}`}
                        onClick={handleGetPasswordOtp}
                      >
                        {passwordDisableBtn ? `Resend (${passwordTimer}s)` : "Resend"}
                      </div>
                    </div>
                  </div>

                  <div className="emailinput">
                    <label>New Password</label>
                    <div className="d-flex">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <div
                        className="password-eye-btn"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <i className="ri-eye-line"></i>
                        ) : (
                          <i className="ri-eye-close-line"></i>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="error">
                    {password ? (
                      <>
                        <span className={password.length >= 8 && password.length <= 30 ? 'text-success' : 'text-danger'}>
                          {password.length >= 8 && password.length <= 30 ? '✓' : '✗'} 8-30 characters
                        </span>
                        <span className={/[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) ? 'text-success' : 'text-danger'}>
                          {/[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) ? '✓' : '✗'} At least one uppercase, lowercase, and number.
                        </span>
                        <span className={!/\s/.test(password) ? 'text-success' : 'text-danger'}>
                          {!/\s/.test(password) ? '✓' : '✗'} Does not contain any spaces.
                        </span>
                      </>
                    ) : (
                      <>
                        <span>8-30 characters</span>
                        <span>At least one uppercase, lowercase, and number.</span>
                        <span>Does not contain any spaces.</span>
                      </>
                    )}
                  </div>
                  <div className="emailinput">
                    <label>Confirm Password</label>
                    <div className="d-flex">
                      <input
                        type={showConPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={conPassword}
                        onChange={(e) => setConPassword(e.target.value)}
                      />
                      <div
                        className="password-eye-btn"
                        onClick={() => setShowConPassword(!showConPassword)}
                      >
                        {showConPassword ? (
                          <i className="ri-eye-line"></i>
                        ) : (
                          <i className="ri-eye-close-line"></i>
                        )}
                      </div>
                    </div>
                    {conPassword && (
                      <div className="error" style={{ marginTop: '5px' }}>
                        {password === conPassword ? (
                          <span className="text-success">✓ Passwords match</span>
                        ) : (
                          <span className="text-danger">✗ Passwords do not match</span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    className="submit"
                    type="button"
                    onClick={handleChangePassword}
                    disabled={
                      !validatePasswordSettings(password).isValid ||
                      !password ||
                      matchPassword(password, conPassword) !== undefined ||
                      !passwordOtp ||
                      passwordOtp?.length < 5
                    }
                  >
                    Submit
                  </button>

                </form>
              </div>

            </div>
          </div>
        </div>



        <div className="modal fade search_form" id="profilepop" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered ">
            <div className="modal-content">
              <div className="modal-header">

                <h5 className="modal-title" id="exampleModalLabel">Edit Profile</h5>
                <p>Avatar and nickname will also be applied to dummy text.Abusing them might lead to community penalties.</p>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">

                <form className="profile_form">

                  <div className="user_img">
                    <img
                      src={localSelfy || (myfile ? (typeof myfile === 'string' ? `${ApiConfig.baseImage}${myfile}` : URL.createObjectURL(myfile)) : (userDetails?.profilepicture ? `${ApiConfig.baseImage}${userDetails.profilepicture}` : props?.userDetails?.profilepicture ? `${ApiConfig.baseImage}${props?.userDetails?.profilepicture}` : "/images/user.png"))}
                      alt="user"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/user.png";
                      }}
                    />
                    <label
                      htmlFor="profileImageUpload"
                      className="edit_user"
                    >
                      <img src="/images/edit_icon.svg" alt="edit" />
                    </label>
                    <input
                      type="file"
                      id="profileImageUpload"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleChangeSelfie}
                      className="hidden-file-input"
                    />
                  </div>


                  <div className="emailinput">
                    <label>First Name</label>
                    <div className="d-flex">
                      <input
                        type="text"
                        placeholder="Enter first name"
                        value={firstName === "undefined" || !firstName ? "" : firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="emailinput">
                    <label>Last Name</label>
                    <div className="d-flex">
                      <input
                        type="text"
                        placeholder="Enter last name"
                        value={lastName === "undefined" || !lastName ? "" : lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    className="submit"
                    type="button"
                    onClick={async () => {
                      let avatarUpdated = false;
                      let nameUpdated = false;

                      // First upload profile picture if changed
                      if (myfile && typeof myfile !== 'string') {
                        avatarUpdated = await editavatar();
                      }

                      // Then update name
                      if (firstName?.trim() || lastName?.trim()) {
                        nameUpdated = await editusername();
                      }

                      // Close modal if at least one update was attempted
                      if (avatarUpdated !== undefined || nameUpdated !== undefined) {
                        const modalElement = document.getElementById('profilepop');
                        if (modalElement) {
                          const modal = window.bootstrap?.Modal?.getInstance(modalElement);
                          if (modal) modal.hide();
                        }
                        modalBackdropRemove();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        // Reset local preview after successful upload
                        if (avatarUpdated) {
                          setLocalSelfy("");
                        }
                        // Force re-render by updating state
                        if (avatarUpdated || nameUpdated) {
                          // State will be updated via handleUserDetails which is called in editavatar and editusername
                        }
                      }
                    }}
                    disabled={(!firstName?.trim() && !lastName?.trim() && (!myfile || typeof myfile === 'string'))}
                  >
                    Submit
                  </button>

                </form>


              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
