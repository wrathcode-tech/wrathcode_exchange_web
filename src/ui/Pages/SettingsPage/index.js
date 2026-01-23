import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { validateEmail, matchPassword } from "../../../utils/Validation";
import { alertErrorMessage, alertSuccessMessage } from "../../../customComponents/CustomAlertMessage";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import AuthService from "../../../api/services/AuthService";
import { ApiConfig } from "../../../api/apiConfig/apiConfig";
import { ProfileContext } from "../../../context/ProfileProvider";
import DashboardHeader from "../../../customComponents/DashboardHeader";
import { isValidPhoneNumber } from "libphonenumber-js";
import Select from "react-select";
import { countriesList } from "../../../utils/CountriesList";
import "./SettingsPage.css";

// Custom styles for react-select in dark theme modal
const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#2d2d2d00',
    borderRadius: '8px',
    border: "none",
    boxShadow: 'none',
    minHeight: '48px',
    padding: '0 4px',
    fontSize: '14px',
    fontWeight: 500,
    '&:hover': {
      borderColor: '#f3bb2c',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 8px',
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    boxShadow: 'none !important',
    border: 'none !important',
    outline: 'none !important',
    color: '#fff !important',
  }),
  indicatorsContainer: (base) => ({
    ...base,
    paddingRight: '8px',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#999',
    '&:hover': {
      color: '#fff',
    },
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#999999',
    fontSize: '14px',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? '#636f83' : state.isSelected ? '#636f83' : '#373e4b',
    color: state.isSelected ? '#ffffff' : '#ffffff',
    cursor: 'pointer',
    padding: '10px 15px',
    fontSize: '13px',
    '&:active': {
      backgroundColor: '#f3bb2c',
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#373e4b',
    borderRadius: '8px',
    overflow: 'hidden',
    fontSize: '13px',
    zIndex: 9999,
    border: '1px solid #444',
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: '200px',
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#2d2d2d',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#555',
      borderRadius: '3px',
    },
  }),
};

const SettingsPage = (props) => {

  const { userDetails, handleUserDetails } = useContext(ProfileContext);

  const [emailId, setEmailId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
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
  const [newPhone, setNewPhone] = useState('');
  const [newCountryCode, setNewCountryCode] = useState("+91");
  const [currencyType, setCurrencyType] = useState('USDT');
  const [password, setPassword] = useState('');
  const [conPassword, setConPassword] = useState('');
  const [passwordOtp, setPasswordOtp] = useState('');
  const [passwordTimer, setPasswordTimer] = useState(0);
  const [passwordDisableBtn, setPasswordDisableBtn] = useState(false);
  const [registeredSignId, setRegisteredSignId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConPassword, setShowConPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref to track object URLs for cleanup
  const objectUrlRef = useRef(null);

  // Initialize state from props/context
  useEffect(() => {
    const details = userDetails || props?.userDetails;
    if (details) {
      setEmailId(details.emailId || '');
      setMobile(details.mobileNumber || '');
      setFirstName(details.firstName || '');
      setLastName(details.lastName || '');
      setMyfile(details.profilepicture || '');
      setCountryCode(details.country_code || '+91');
      setCurrencyType(details.currency_prefrence || 'USDT');
    }
  }, [props?.userDetails, userDetails]);

  // Set registered sign ID for password change
  useEffect(() => {
    const currentUserDetails = userDetails || props?.userDetails;
    if (currentUserDetails?.registeredBy === "phone") {
      const code = currentUserDetails?.country_code || "+91";
      const mobileNumber = currentUserDetails?.mobileNumber || mobile;
      setRegisteredSignId(mobileNumber ? `${code} ${mobileNumber}` : "");
    } else {
      const email = currentUserDetails?.emailId || emailId;
      setRegisteredSignId(email || "");
    }
  }, [userDetails, props?.userDetails, mobile, emailId]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const modalBackdropRemove = useCallback(() => {
    try {
      document.body.classList.remove('modal-open');
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    } catch (error) {
      // Silently handle error
    }
  }, []);

  const closeModal = useCallback((modalId) => {
    try {
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        const modal = window.bootstrap?.Modal?.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
      }
      modalBackdropRemove();
    } catch (error) {
      // Silently handle error
    }
  }, [modalBackdropRemove]);

  const openModal = useCallback((modalId) => {
    try {
      const modalElement = document.getElementById(modalId);
      if (modalElement && window.bootstrap) {
        const modal = new window.bootstrap.Modal(modalElement);
        modal.show();
      }
    } catch (error) {
      // Silently handle error
    }
  }, []);

  const handleChangeSelfie = useCallback((event) => {
    event.preventDefault();
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      alertErrorMessage("Only PNG, JPEG, and JPG file types are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > maxSize) {
      alertErrorMessage("Max image size is 5MB.");
      event.target.value = "";
      return;
    }

    // Cleanup previous object URL
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const imgData = URL.createObjectURL(file);
    objectUrlRef.current = imgData;
    setLocalSelfy(imgData);
    setMyfile(file);

    // Close profile modal and open preview modal
    closeModal('profilepop');

    setTimeout(() => {
      openModal('editAvatarModal');
    }, 300);
  }, [closeModal, openModal]);

  const handleGetOtp = useCallback(async (type, inputType) => {
    if (isSubmitting) return;

    try {
      let signId;
      if (inputType === "email") {
        if (!newEmail || validateEmail(newEmail) !== undefined) {
          alertErrorMessage("Please enter valid email address");
          return;
        }
        signId = newEmail;
      } else {
        if (!newPhone) {
          alertErrorMessage("Please enter a phone number");
          return;
        }
        const fullPhone = `${newCountryCode}${newPhone}`;
        if (!isValidPhoneNumber(fullPhone)) {
          alertErrorMessage("Please enter a valid phone number for the selected country");
          return;
        }
        signId = `${newCountryCode} ${newPhone}`;
      }

      setIsSubmitting(true);
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.getOtp(signId, type);
      LoaderHelper.loaderStatus(false);
      setIsSubmitting(false);

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
      setIsSubmitting(false);
      alertErrorMessage(error?.response?.data?.message || error?.message || "An error occurred while sending OTP.");
    }
  }, [isSubmitting, newEmail, newPhone, newCountryCode]);

  const editavatar = useCallback(async () => {
    if (!myfile || typeof myfile === 'string') {
      return false;
    }

    try {
      const formData = new FormData();
      formData.append("profilepicture", myfile);

      LoaderHelper.loaderStatus(true);
      const result = await AuthService.editavatar(formData);
      LoaderHelper.loaderStatus(false);

      if (result?.success) {
        alertSuccessMessage(result?.message || "Profile picture updated successfully");
        if (result?.data?.profilepicture) {
          setMyfile(result.data.profilepicture);
        }
        await handleUserDetails();
        return true;
      } else {
        alertErrorMessage(result?.message || "Failed to update profile picture.");
        return false;
      }
    } catch (error) {
      LoaderHelper.loaderStatus(false);
      alertErrorMessage(error?.response?.data?.message || error?.message || "An error occurred while updating profile picture.");
      return false;
    }
  }, [myfile, handleUserDetails]);

  const editusername = useCallback(async () => {
    const trimmedFirst = firstName?.trim() || '';
    const trimmedLast = lastName?.trim() || '';

    if (!trimmedFirst && !trimmedLast) {
      return false;
    }

    // Basic validation for names
    const nameRegex = /^[a-zA-Z\s'-]*$/;
    if (trimmedFirst && !nameRegex.test(trimmedFirst)) {
      alertErrorMessage("First name contains invalid characters");
      return false;
    }
    if (trimmedLast && !nameRegex.test(trimmedLast)) {
      alertErrorMessage("Last name contains invalid characters");
      return false;
    }

    try {
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.editusername(trimmedFirst, trimmedLast);
      LoaderHelper.loaderStatus(false);

      if (result?.success) {
        alertSuccessMessage(result?.message || "Name updated successfully");
        if (result?.data) {
          if (result.data.firstName) setFirstName(result.data.firstName);
          if (result.data.lastName) setLastName(result.data.lastName);
        }
        await handleUserDetails();
        return true;
      } else {
        alertErrorMessage(result?.message || "Failed to update name.");
        return false;
      }
    } catch (error) {
      LoaderHelper.loaderStatus(false);
      alertErrorMessage(error?.response?.data?.message || error?.message || "An error occurred while updating name.");
      return false;
    }
  }, [firstName, lastName, handleUserDetails]);

  const editEmail = useCallback(async () => {
    if (isSubmitting) return;

    if (!newEmail || validateEmail(newEmail) !== undefined) {
      alertErrorMessage("Please enter valid email address");
      return;
    }
    if (!emailOtp || emailOtp.length < 5) {
      alertErrorMessage("Invalid OTP");
      return;
    }

    try {
      setIsSubmitting(true);
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.editemail(newEmail, emailOtp);
      LoaderHelper.loaderStatus(false);
      setIsSubmitting(false);

      if (result?.success) {
        setEmailOtp("");
        setNewEmail("");
        setTimer(0);
        setDisbaleBtn(false);
        closeModal('emailpop');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        alertSuccessMessage(result?.message || "Email updated successfully");
        handleUserDetails();
      } else {
        alertErrorMessage(result?.message || "Failed to update email.");
      }
    } catch (error) {
      LoaderHelper.loaderStatus(false);
      setIsSubmitting(false);
      alertErrorMessage(error?.response?.data?.message || error?.message || "An error occurred while updating email.");
    }
  }, [isSubmitting, newEmail, emailOtp, closeModal, handleUserDetails]);

  const handleGetPasswordOtp = useCallback(async () => {
    if (isSubmitting) return;

    if (!registeredSignId) {
      alertErrorMessage("Please update your email or phone number first");
      return;
    }

    try {
      setIsSubmitting(true);
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.getOtp(registeredSignId, "forgot_password");
      LoaderHelper.loaderStatus(false);
      setIsSubmitting(false);

      if (result?.success) {
        alertSuccessMessage(result?.message || "OTP sent successfully");
        setPasswordDisableBtn(true);
        setPasswordTimer(30);
      } else {
        alertErrorMessage(result?.message || "Failed to send OTP.");
      }
    } catch (error) {
      LoaderHelper.loaderStatus(false);
      setIsSubmitting(false);
      alertErrorMessage(error?.response?.data?.message || error?.message || "An error occurred while sending OTP.");
    }
  }, [isSubmitting, registeredSignId]);

  // Custom password validation function
  const validatePasswordSettings = useCallback((value) => {
    if (!value) return { isValid: false, errors: [] };

    const errors = [];

    if (value.length < 8 || value.length > 30) {
      errors.push('8-30 characters');
    }
    if (!/[A-Z]/.test(value)) {
      errors.push('At least one uppercase');
    }
    if (!/[a-z]/.test(value)) {
      errors.push('At least one lowercase');
    }
    if (!/[0-9]/.test(value)) {
      errors.push('At least one number');
    }
    if (/\s/.test(value)) {
      errors.push('Does not contain any spaces');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }, []);

  const handleChangePassword = useCallback(async () => {
    if (isSubmitting) return;

    const passwordValidation = validatePasswordSettings(password);
    if (!passwordValidation.isValid || !password) {
      alertErrorMessage("Please ensure your password meets all requirements");
      return;
    }

    if (matchPassword(password, conPassword) !== undefined) {
      alertErrorMessage("New password and confirm password must match");
      return;
    }

    if (!passwordOtp || passwordOtp.length < 5) {
      alertErrorMessage("Invalid verification code");
      return;
    }

    if (!registeredSignId) {
      alertErrorMessage("Please update your email or phone number first");
      return;
    }

    try {
      setIsSubmitting(true);
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.setSecurity(password, conPassword, passwordOtp, registeredSignId);
      LoaderHelper.loaderStatus(false);
      setIsSubmitting(false);

      if (result?.success) {
        setPassword("");
        setConPassword("");
        setPasswordOtp("");
        setPasswordTimer(0);
        setPasswordDisableBtn(false);
        closeModal('security_verification');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        alertSuccessMessage(result?.message || "Password changed successfully");
      } else {
        alertErrorMessage(result?.message || "Failed to change password.");
      }
    } catch (error) {
      LoaderHelper.loaderStatus(false);
      setIsSubmitting(false);
      alertErrorMessage(error?.response?.data?.message || error?.message || "An error occurred while changing password.");
    }
  }, [isSubmitting, password, conPassword, passwordOtp, registeredSignId, validatePasswordSettings, closeModal]);

  const handleCurrency = useCallback(async (selectedCurrency) => {
    if (isSubmitting) return;

    if (!selectedCurrency) {
      alertErrorMessage("Please select a currency");
      return;
    }

    try {
      setIsSubmitting(true);
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.setCurrency(selectedCurrency);
      LoaderHelper.loaderStatus(false);
      setIsSubmitting(false);

      if (result?.success) {
        alertSuccessMessage(result?.message || "Currency preference updated successfully");
        await handleUserDetails();
      } else {
        alertErrorMessage(result?.message || "Failed to update currency preference.");
      }
    } catch (error) {
      LoaderHelper.loaderStatus(false);
      setIsSubmitting(false);
      alertErrorMessage(error?.response?.data?.message || error?.message || "An error occurred while updating currency preference.");
    }
  }, [isSubmitting, handleUserDetails]);

  const editPhone = useCallback(async () => {
    if (isSubmitting) return;

    if (!newPhone) {
      alertErrorMessage("Please enter a phone number");
      return;
    }

    const fullPhone = `${newCountryCode}${newPhone}`;
    if (!isValidPhoneNumber(fullPhone)) {
      alertErrorMessage("Please enter a valid phone number for the selected country");
      return;
    }

    if (!mobileOtp || mobileOtp.length < 5) {
      alertErrorMessage("Invalid OTP");
      return;
    }

    try {
      setIsSubmitting(true);
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.editPhone(`${newCountryCode} ${newPhone}`, mobileOtp);
      LoaderHelper.loaderStatus(false);
      setIsSubmitting(false);

      if (result?.success) {
        setNewCountryCode("+91");
        setMobileOtp("");
        setNewPhone("");
        setTimer2(0);
        setDisbaleBtn2(false);
        closeModal('mobilepop');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        alertSuccessMessage(result?.message || "Phone number updated successfully");
        handleUserDetails();
      } else {
        alertErrorMessage(result?.message || "Failed to update phone number.");
      }
    } catch (error) {
      LoaderHelper.loaderStatus(false);
      setIsSubmitting(false);
      alertErrorMessage(error?.response?.data?.message || error?.message || "An error occurred while updating phone number.");
    }
  }, [isSubmitting, newPhone, newCountryCode, mobileOtp, closeModal, handleUserDetails]);

  const handleProfileSubmit = useCallback(async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    let avatarUpdated = false;
    let nameUpdated = false;

    try {
      // Upload profile picture if changed
      if (myfile && typeof myfile !== 'string') {
        avatarUpdated = await editavatar();
      }

      // Update name if provided
      const trimmedFirst = firstName?.trim();
      const trimmedLast = lastName?.trim();
      if (trimmedFirst || trimmedLast) {
        nameUpdated = await editusername();
      }

      // Close modal if at least one update was successful
      if (avatarUpdated || nameUpdated) {
        closeModal('profilepop');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (avatarUpdated && objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
          setLocalSelfy("");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, myfile, firstName, lastName, editavatar, editusername, closeModal]);

  const resetAvatarPreview = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setLocalSelfy("");
    const details = userDetails || props?.userDetails;
    setMyfile(details?.profilepicture || "");
    const fileInput = document.getElementById('avatarFileInput');
    if (fileInput) fileInput.value = "";
    const fileInput2 = document.getElementById('profileImageUpload');
    if (fileInput2) fileInput2.value = "";
  }, [userDetails, props?.userDetails]);

  const handleAvatarApply = useCallback(async () => {
    if (isSubmitting) return;

    if (!myfile || typeof myfile === 'string') {
      alertErrorMessage("Please select an image first");
      return;
    }

    setIsSubmitting(true);
    const result = await editavatar();
    setIsSubmitting(false);

    if (result) {
      closeModal('editAvatarModal');
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setLocalSelfy("");
      const fileInput = document.getElementById('avatarFileInput');
      if (fileInput) fileInput.value = "";
      const fileInput2 = document.getElementById('profileImageUpload');
      if (fileInput2) fileInput2.value = "";
    }
  }, [isSubmitting, myfile, editavatar, closeModal]);

  // Timer effects
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

  // Helper functions for display
  const hasEmail = () => {
    const email = userDetails?.emailId || props?.userDetails?.emailId || emailId;
    return !!email;
  };

  const hasPhone = () => {
    const phone = userDetails?.mobileNumber || props?.userDetails?.mobileNumber || mobile;
    return !!phone;
  };

  const getDisplayEmail = () => {
    const email = userDetails?.emailId || props?.userDetails?.emailId || emailId;
    if (email && email.length > 7) {
      return `${email.substring(0, 3)}***${email.substring(email.length - 4)}`;
    }
    return email || 'Not set';
  };

  const getDisplayPhone = () => {
    const phone = userDetails?.mobileNumber || props?.userDetails?.mobileNumber || mobile;
    const code = userDetails?.country_code || props?.userDetails?.country_code || countryCode || '+91';
    return phone ? `${code}-${phone}` : 'Not set';
  };

  const getDisplayName = () => {
    const first = userDetails?.firstName || props?.userDetails?.firstName || firstName;
    const last = userDetails?.lastName || props?.userDetails?.lastName || lastName;
    const name = `${first || ''} ${last || ''}`.trim();
    return name || 'User Name';
  };

  const getProfileImage = () => {
    const pic = userDetails?.profilepicture || props?.userDetails?.profilepicture || (typeof myfile === 'string' ? myfile : '');
    return pic ? `${ApiConfig.baseImage}${pic}` : "/images/user.png";
  };

  const getProfileModalImage = () => {
    if (localSelfy) return localSelfy;
    if (myfile && typeof myfile !== 'string') return URL.createObjectURL(myfile);
    const pic = userDetails?.profilepicture || props?.userDetails?.profilepicture || (typeof myfile === 'string' ? myfile : '');
    return pic ? `${ApiConfig.baseImage}${pic}` : "/images/user.png";
  };

  const getMaskedSignId = () => {
    if (registeredSignId && registeredSignId.length > 7) {
      return `${registeredSignId.substring(0, 3)}***${registeredSignId.substring(registeredSignId.length - 4)}`;
    }
    return registeredSignId || 'your registered email/phone';
  };

  const isRegisteredByEmail = userDetails?.registeredBy === "email" || userDetails?.registeredBy === "google" || 
                              props?.userDetails?.registeredBy === "email" || props?.userDetails?.registeredBy === "google";
  
  const isRegisteredByPhone = userDetails?.registeredBy === "phone" || props?.userDetails?.registeredBy === "phone";

  const canSubmitProfile = (firstName?.trim() || lastName?.trim() || (myfile && typeof myfile !== 'string')) && !isSubmitting;
  const canSubmitEmail = !isSubmitting && newEmail && validateEmail(newEmail) === undefined && emailOtp && emailOtp.length >= 5;
  const canSubmitPhone = !isSubmitting && newPhone && mobileOtp && mobileOtp.length >= 5 && isValidPhoneNumber(`${newCountryCode}${newPhone}`);
  const canSubmitPassword = !isSubmitting && validatePasswordSettings(password).isValid && password && 
                           matchPassword(password, conPassword) === undefined && passwordOtp && passwordOtp.length >= 5;

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
              </div>

              <div className="enable">
                <img
                  src={getProfileImage()}
                  alt="user"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/user.png";
                  }}
                />
                {getDisplayName()}
              </div>
              <button className="btn" data-bs-toggle="modal" data-bs-target="#profilepop">Change</button>
            </div>

            {/* <div className="factor_bl">
              <div className="lftcnt">
                <h6><img src="/images/email_icon2.svg" alt="Email Verification" /> Email Verification</h6>
                <p>Link your email address to your account for login, password recovery, and withdrawal confirmation. Secure your account and withdrawals with a passkey.</p>
              </div>

              <div className="enable">
                <img src={hasEmail() ? "/images/verified_icon.svg" : "/images/closebtn2.svg"} alt="Email Verification" />
                {getDisplayEmail()}
              </div>
              <button className="btn" data-bs-toggle="modal" data-bs-target="#emailpop">{hasEmail() ? 'Change' : 'Add'}</button>
            </div>

            <div className="factor_bl">
              <div className="lftcnt">
                <h6><img src="/images/mobile_icon.svg" alt="Mobile Verification" /> Mobile Verification</h6>
                <p>Link your mobile number to your account to receive verification codes via SMS for confirmations on withdrawal, password change, and security settings.</p>
              </div>

              <div className="enable">
                <img src={hasPhone() ? "/images/verified_icon.svg" : "/images/closebtn2.svg"} alt="mobile" />
                {getDisplayPhone()}
              </div>
              <button className="btn" data-bs-toggle="modal" data-bs-target="#mobilepop">{hasPhone() ? 'Change' : 'Add'}</button>
            </div> */}
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
                <button onClick={() => handleCurrency(currencyType)} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Currency Preference'}
                </button>
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
                <p>Change your account password. You will need to verify with OTP sent to your registered {isRegisteredByPhone ? "mobile number" : "email"}.</p>
              </div>

              <button
                className="btn"
                disabled={isSubmitting}
                onClick={async () => {
                  setPassword("");
                  setConPassword("");
                  setPasswordOtp("");
                  openModal('security_verification');
                }}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Edit Avatar Modal */}
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
                  onClick={resetAvatarPreview}
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
                    onClick={resetAvatarPreview}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-apply-avatar"
                    onClick={handleAvatarApply}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Applying...' : 'Apply Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Phone Modal */}
        <div className="modal fade search_form" id="mobilepop" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered ">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Edit Phone</h5>
                <p>Update your phone number. You will receive an OTP for verification.</p>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form className="profile_form" onSubmit={(e) => e.preventDefault()}>
              

                  <div className="emailinput">
                    <label>Registered Phone</label>
                    <div className="d-flex">
                      <input type="text" value={mobile ? `${countryCode} ${mobile}` : "Not set"} disabled />
                    </div>
                  </div>

                  {isRegisteredByPhone && (
                    <div className="alert alert-warning mb-3" role="alert">
                      <strong>Note:</strong> Signup method cannot be changed. Contact support for any modification in phone number.
                    </div>
                  )}

                  {!isRegisteredByPhone && (
                    <>
                      <div className="emailinput">
                        <label>Country Code</label>
                        <div className="country-select-wrapper">
                          <Select
                            styles={selectStyles}
                            inputId="newCountryCode"
                            name="country_code_select"
                            options={countriesList}
                            onChange={(selected) => setNewCountryCode(selected?.value || '+91')}
                            value={countriesList.find(option => option.value === newCountryCode)}
                            placeholder="Select country code"
                            isSearchable={true}
                            menuPlacement="auto"
                          />
                        </div>
                      </div>

                      <div className="emailinput">
                        <label>New Phone Number</label>
                        <div className="d-flex">
                          <input
                            type="text"
                            placeholder="Enter phone number"
                            value={newPhone || ""}
                            onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                            maxLength={15}
                          />
                          {!disableBtn2 ?  <button
                            type="button"
                            className={`getotp ${disableBtn2 ? 'otp-button-disabled' : 'otp-button-enabled'} getotp_mobile`}
                            onClick={() => !disableBtn2 && !isSubmitting && handleGetOtp("registration", "phone")}
                            disabled={disableBtn2 || isSubmitting  }
                          >
                            {disableBtn2 ? `Resend OTP (${timer2}s)` : "GET OTP"}
                          </button>: <div className="resend otp-button-disabled">Resend ({timer2}s)</div>}
                         
                        </div>
                       
                      </div>
                    
                      <div className="emailinput">
                        <label>OTP</label>
                        <div className="d-flex">
                          <input
                            type="text"
                            placeholder="Enter OTP here..."
                            value={mobileOtp}
                            onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, ''))}
                            maxLength={6}
                          />
                        </div>
                      </div>

                      <button
                        className="submit"
                        type="button"
                        onClick={editPhone}
                        disabled={!canSubmitPhone}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                      </button>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Email Modal */}
        <div className="modal fade search_form" id="emailpop" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered ">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Edit Email</h5>
                <p>Update your email address. You will receive an OTP for verification.</p>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
              

                <form className="profile_form" onSubmit={(e) => e.preventDefault()}>
                  <div className="emailinput">
                    <label>Registered Email</label>
                    <div className="d-flex">
                      <input type="email" value={emailId || ""} disabled />
                    </div>
                  </div>
                  {isRegisteredByEmail && (
                  <div className="alert alert-warning mb-3" role="alert">
                    <strong>Note:</strong> Signup method cannot be changed. Contact support for any modification in email.
                  </div>
                )}

                  {!isRegisteredByEmail && (
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
                           {!disableBtn ?  <button
                            type="button"
                            className={`getotp ${disableBtn ? 'otp-button-disabled' : 'otp-button-enabled'} getotp_mobile`}
                            onClick={() => !disableBtn && !isSubmitting && handleGetOtp("registration", "email")}
                            disabled={disableBtn || isSubmitting  }
                          >
                            {disableBtn ? `Resend OTP (${timer}s)` : "GET OTP"}
                          </button>: <div className="resend otp-button-disabled">Resend ({timer}s)</div>}

                   
                        </div>
                      </div>

                      <div className="emailinput">
                        <label>OTP</label>
                        <div className="d-flex">
                          <input
                            type="text"
                            placeholder="Enter OTP here..."
                            value={emailOtp}
                            onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                            maxLength={6}
                          />
                        </div>
                      </div>

                      <button
                        className="submit"
                        type="button"
                        onClick={editEmail}
                        disabled={!canSubmitEmail}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                      </button>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Security Verification Modal */}
        <div className="modal fade search_form" id="security_verification" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered ">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Security Verification</h5>
                <p>Enter the code sent to <span>{getMaskedSignId()}</span></p>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form className="profile_form" onSubmit={(e) => e.preventDefault()}>
                  <div className="emailinput">
                    <label>Verification Code</label>
                    

                    <div className="d-flex">
                      <input
                        type="text"
                        placeholder="Enter OTP here..."
                        value={passwordOtp}
                        onChange={(e) => setPasswordOtp(e.target.value.replace(/\D/g, ''))}
                        maxLength={6}
                      />
                     {!passwordDisableBtn ?   <button
                        type="button"
                        className={`getotp ${passwordDisableBtn ? 'otp-button-disabled' : 'otp-button-enabled'} getotp_mobile`}
                        onClick={() => !passwordDisableBtn && !isSubmitting && handleGetPasswordOtp()}
                        disabled={passwordDisableBtn || isSubmitting}
                      >
                        {passwordDisableBtn ? `Resend (${passwordTimer}s)` : "Send OTP"}
                      </button>: <div className="resend otp-button-disabled">Resend ({passwordTimer}s)</div>}

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
                        autoComplete="new-password"
                      />
                      <div className="password-eye-btn" onClick={() => setShowPassword(!showPassword)}>{showPassword ? (
                          <i className="ri-eye-line"></i>
                        ) : (
                          <i className="ri-eye-close-line"></i>
                        )}</div>
                     
                    </div>
                  </div>
                  <div className="error_text">
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
                        autoComplete="new-password"
                      />
                        <div className="password-eye-btn" onClick={() => setShowConPassword(!showConPassword)}>{showConPassword ? (
                          <i className="ri-eye-line"></i>
                        ) : (
                          <i className="ri-eye-close-line"></i>
                        )}</div>
                     
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
                    disabled={!canSubmitPassword}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <div className="modal fade search_form" id="profilepop" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered ">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Edit Profile</h5>
                <p>Avatar and nickname will also be applied to your profile. Abusing them might lead to community penalties.</p>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form className="profile_form" onSubmit={(e) => e.preventDefault()}>
                  <div className="user_img">
                    <img
                      src={getProfileModalImage()}
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
                        maxLength={50}
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
                        maxLength={50}
                      />
                    </div>
                  </div>

                  <button
                    className="submit"
                    type="button"
                    onClick={handleProfileSubmit}
                    disabled={!canSubmitProfile}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
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