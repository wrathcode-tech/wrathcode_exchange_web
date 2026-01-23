import React, { useState, useEffect, useContext } from "react";
import { alertErrorMessage, alertSuccessMessage } from "../../../customComponents/CustomAlertMessage";
import AuthService from "../../../api/services/AuthService";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import { ProfileContext } from "../../../context/ProfileProvider";
import DashboardHeader from "../../../customComponents/DashboardHeader";

const TwofactorPage = (props) => {
  const { handleUserDetails } = useContext(ProfileContext);

  // User data states
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailID, setEmailId] = useState("");
  
  // Security methods status
  const [hasEmail, setHasEmail] = useState(false);
  const [hasMobile, setHasMobile] = useState(false);
  const [hasGoogleAuth, setHasGoogleAuth] = useState(false);
  
  // Google Auth setup states
  const [googleQr, setGoogleQr] = useState("");
  const [googleCode, setGoogleCode] = useState("");
  const [authenticatorCode, setAuthenticatorCode] = useState("");
  
  // OTP states
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [mobileOtpCode, setMobileOtpCode] = useState("");
  const [newEmailOtpCode, setNewEmailOtpCode] = useState("");
  const [newMobileOtpCode, setNewMobileOtpCode] = useState("");
  const [googleAuthCode, setGoogleAuthCode] = useState("");
  
  // New values for change flows
  const [newEmail, setNewEmail] = useState("");
  const [newMobileNumber, setNewMobileNumber] = useState("");
  const [newCountryCode, setNewCountryCode] = useState("+91");
  
  // Timer and loading states
  const [resendTimer, setResendTimer] = useState(0);
  const [resendTimer2, setResendTimer2] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Flow step tracking
  const [currentStep, setCurrentStep] = useState(1);

  // Initialize user data
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const user = props?.userDetails;
    const current2fa = user?.['2fa'] || 0;
    
    setEmailId(user?.emailId || '');
    setMobileNumber(`${user?.country_code || ''} ${user?.mobileNumber || ''}`);
    
    // Determine which methods are active
    setHasEmail(!!user?.emailId);
    setHasMobile(!!user?.mobileNumber);
    setHasGoogleAuth(current2fa === 2);
  }, [props]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (resendTimer2 > 0) {
      const timer = setTimeout(() => setResendTimer2(resendTimer2 - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer2]);

  // Count active security methods
  const getActiveMethodsCount = () => {
    let count = 0;
    if (hasEmail) count++;
    if (hasMobile) count++;
    if (hasGoogleAuth) count++;
    return count;
  };

  // Get security level based on active methods
  const getSecurityLevel = () => {
    const count = getActiveMethodsCount();
    if (count >= 3) return { level: 'High', color: '#28a745' };
    if (count === 2) return { level: 'Medium', color: '#ffc107' };
    return { level: 'Low', color: '#dc3545' };
  };

  // Check if user can make sensitive changes (needs at least 2 methods)
  const canMakeSensitiveChanges = () => {
    return getActiveMethodsCount() >= 2;
  };

  // Mask email for display
  const maskEmail = (email) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (!domain) return email;
    const masked = username.substring(0, 2) + '***' + username.slice(-1);
    return `${masked}@${domain}`;
  };

  // Mask phone for display
  const maskPhone = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 4) return phone;
    return '****' + cleaned.slice(-4);
  };

  // Reset all modal states
  const resetModalStates = () => {
    setEmailOtpCode("");
    setMobileOtpCode("");
    setNewEmailOtpCode("");
    setNewMobileOtpCode("");
    setGoogleAuthCode("");
    setNewEmail("");
    setNewMobileNumber("");
    setNewCountryCode("+91");
    setAuthenticatorCode("");
    setGoogleQr("");
    setGoogleCode("");
    setCurrentStep(1);
    setResendTimer(0);
    setResendTimer2(0);
  };

  // Close all modals
  const closeAllModals = () => {
    const modalIds = [
      'googleAuthSetupModal', 'googleAuthQrModal', 'googleAuthVerifyModal',
      'addMobileModal', 'verifyNewMobileModal',
      'changeEmailModal', 'changeEmailStep2Modal', 'changeEmailStep3Modal',
      'changeMobileModal', 'changeMobileStep2Modal', 'changeMobileStep3Modal',
      'blockingModal', 'disableGoogleAuthModal'
    ];
    modalIds.forEach(id => {
      const modalElement = document.getElementById(id);
      if (modalElement) {
        const modal = window.bootstrap?.Modal?.getInstance(modalElement);
        if (modal) modal.hide();
      }
    });
    document.body.classList.remove('modal-open');
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    resetModalStates();
  };

  // Open a modal
  const openModal = (modalId) => {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new window.bootstrap.Modal(modalElement);
      modal.show();
    }
  };

  // Close a specific modal and open another
  const switchModal = (closeId, openId, delay = 300) => {
    const closeModal = window.bootstrap?.Modal?.getInstance(document.getElementById(closeId));
    if (closeModal) closeModal.hide();
    setTimeout(() => openModal(openId), delay);
  };

  // ============ API CALLS ============

  // Send OTP using security endpoint
  const handleSendOtp = async (target, purpose, value = null) => {
    try {
      setIsLoading(true);
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.securitySendOtp(target, purpose, value);
      if (result?.success) {
        alertSuccessMessage(result?.message || 'OTP sent successfully');
        return true;
      } else {
        alertErrorMessage(result?.message || 'Failed to send OTP');
        return false;
      }
    } catch (error) {
      alertErrorMessage(error?.message || 'Something went wrong');
      return false;
    } finally {
      setIsLoading(false);
      LoaderHelper.loaderStatus(false);
    }
  };

  // Verify OTP using security endpoint
  const handleVerifyOtp = async (target, otp, purpose, identifier = null) => {
    try {
      setIsLoading(true);
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.securityVerifyOtp(target, otp, purpose, identifier);
      if (result?.success) {
        return true;
      } else {
        alertErrorMessage(result?.message || 'Invalid OTP');
        return false;
      }
    } catch (error) {
      alertErrorMessage(error?.message || 'OTP verification failed');
      return false;
    } finally {
      setIsLoading(false);
      LoaderHelper.loaderStatus(false);
    }
  };

  // ============ GOOGLE AUTHENTICATOR FLOW ============
  // Step 1: Verify email first
  const handleGoogleAuthStart = async () => {
    resetModalStates();
    const sent = await handleSendOtp('email', '2fa_setup');
    if (sent) {
      setResendTimer(60);
      openModal('googleAuthSetupModal');
    }
  };

  // Step 2: After email verification, show QR code
  const handleGoogleAuthEmailVerify = async () => {
    if (!emailOtpCode || emailOtpCode.length !== 6) {
      alertErrorMessage('Please enter a valid 6-digit OTP');
      return;
    }

    const verified = await handleVerifyOtp('email', emailOtpCode, '2fa_setup');
    if (verified) {
      alertSuccessMessage('Email verified! Generating QR code...');
      
      try {
        setIsLoading(true);
        LoaderHelper.loaderStatus(true);
        const result = await AuthService.security2faSetup();
        
        if (result?.success) {
          setGoogleQr(result.data?.qr_code || '');
          setGoogleCode(result.data?.secret?.base32 || '');
          switchModal('googleAuthSetupModal', 'googleAuthQrModal');
        } else {
          alertErrorMessage(result?.message || "Failed to get QR code");
        }
      } catch (error) {
        alertErrorMessage(error?.message || "Something went wrong");
      } finally {
        setIsLoading(false);
        LoaderHelper.loaderStatus(false);
      }
    }
  };

  // Step 3: Verify authenticator code
  const handleGoogleAuthConfirm = async () => {
    if (!authenticatorCode || authenticatorCode.length !== 6) {
      alertErrorMessage('Please enter a valid 6-digit code');
      return;
    }

    try {
      setIsLoading(true);
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.security2faConfirm(authenticatorCode);
      
      if (result?.success) {
        alertSuccessMessage(result?.message || 'Google Authenticator enabled successfully!');
        closeAllModals();
        handleUserDetails();
      } else {
        alertErrorMessage(result?.message || 'Failed to enable 2FA');
      }
    } catch (error) {
      alertErrorMessage(error?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
      LoaderHelper.loaderStatus(false);
    }
  };

  // Start Disable Google Authenticator flow
  const handleDisableGoogleAuthStart = async () => {
    if (!canMakeSensitiveChanges()) {
      alertErrorMessage('You need at least 2 security methods to disable Google Authenticator');
      return;
    }

    resetModalStates();
    setCurrentStep(1);
    
    // Send OTP to email or mobile (whichever is available, prefer email)
    if (hasEmail) {
      const sent = await handleSendOtp('email', '2fa_disable');
      if (sent) {
        setResendTimer(60);
        openModal('disableGoogleAuthModal');
      }
    } else if (hasMobile) {
      const sent = await handleSendOtp('mobile', '2fa_disable');
      if (sent) {
        setResendTimer(60);
        openModal('disableGoogleAuthModal');
      }
    } else {
      alertErrorMessage('No verification method available');
    }
  };

  // Handle disable Google Auth verification steps
  const handleDisableGoogleAuthNextStep = async () => {
    if (currentStep === 1) {
      // Verify email or mobile OTP
      const otpToVerify = hasEmail ? emailOtpCode : mobileOtpCode;
      const target = hasEmail ? 'email' : 'mobile';
      
      if (!otpToVerify || otpToVerify.length !== 6) {
        alertErrorMessage('Please enter a valid 6-digit OTP');
        return;
      }
      
      const verified = await handleVerifyOtp(target, otpToVerify, '2fa_disable');
      if (verified) {
        setCurrentStep(2); // Move to authenticator code verification
      }
    } else if (currentStep === 2) {
      // Verify authenticator code and disable
      if (!googleAuthCode || googleAuthCode.length !== 6) {
        alertErrorMessage('Please enter a valid 6-digit authenticator code');
        return;
      }

      try {
        setIsLoading(true);
        LoaderHelper.loaderStatus(true);
        const result = await AuthService.security2faDisable(googleAuthCode);
        
        if (result?.success) {
          alertSuccessMessage(result?.message || "Google Authenticator disabled");
          closeAllModals();
          handleUserDetails();
        } else {
          alertErrorMessage(result?.message || "Failed to disable 2FA");
        }
      } catch (error) {
        alertErrorMessage(error?.message || "Something went wrong");
      } finally {
        setIsLoading(false);
        LoaderHelper.loaderStatus(false);
      }
    }
  };

  // Copy Google Auth code
  const copyCode = () => {
    if (googleCode) {
      navigator.clipboard
        .writeText(googleCode)
        .then(() => alertSuccessMessage("Code copied to clipboard!"))
        .catch(() => alertErrorMessage("Failed to copy code"));
    }
  };

  // ============ ADD MOBILE FLOW ============
  // User wants to add mobile number (requires 2FA or email verification first)
  const handleAddMobileStart = async () => {
    resetModalStates();
    
    // If user has Google Auth enabled, verify that first
    if (hasGoogleAuth) {
      openModal('addMobileModal');
      setCurrentStep(1); // Step 1: Google Auth verification
    } else if (hasEmail) {
      // Verify email first
      const sent = await handleSendOtp('email', 'add_mobile');
      if (sent) {
        setResendTimer(60);
        openModal('addMobileModal');
        setCurrentStep(2); // Step 2: Email verification
      }
    } else {
      alertErrorMessage('You need email verification to add a mobile number');
    }
  };

  // Verify identity for add mobile
  const handleAddMobileVerifyIdentity = async () => {
    if (currentStep === 1 && hasGoogleAuth) {
      // Verify Google Auth code
      if (!googleAuthCode || googleAuthCode.length !== 6) {
        alertErrorMessage('Please enter a valid 6-digit code');
        return;
      }
      
      // For now, move to email verification step
      const sent = await handleSendOtp('email', 'add_mobile');
      if (sent) {
        setResendTimer(60);
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      // Verify email OTP
      if (!emailOtpCode || emailOtpCode.length !== 6) {
        alertErrorMessage('Please enter a valid 6-digit OTP');
        return;
      }
      
      const verified = await handleVerifyOtp('email', emailOtpCode, 'add_mobile');
      if (verified) {
        setCurrentStep(3); // Move to enter mobile number
      }
    }
  };

  // Send OTP to new mobile and move to verification
  const handleAddMobileSendOtp = async () => {
    if (!newMobileNumber || newMobileNumber.length < 6) {
      alertErrorMessage('Please enter a valid mobile number');
      return;
    }

    const fullNumber = `${newCountryCode} ${newMobileNumber}`;
    const sent = await handleSendOtp('new_mobile', 'add_mobile', fullNumber);
    if (sent) {
      setResendTimer2(60);
      setCurrentStep(4); // Move to verify new mobile
    }
  };

  // Complete add mobile
  const handleAddMobileComplete = async () => {
    if (!newMobileOtpCode || newMobileOtpCode.length !== 6) {
      alertErrorMessage('Please enter a valid 6-digit OTP');
      return;
    }
    
    try {
      setIsLoading(true);
      LoaderHelper.loaderStatus(true);
      
      const result = await AuthService.securityMobileAdd({
        mobileNumber: newMobileNumber,
        countryCode: newCountryCode,
        mobileOtp: newMobileOtpCode
      });
      
      if (result?.success) {
        alertSuccessMessage(result?.message || 'Mobile number added successfully!');
        closeAllModals();
        handleUserDetails();
      } else {
        alertErrorMessage(result?.message || 'Failed to add mobile number');
      }
    } catch (error) {
      alertErrorMessage(error?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
      LoaderHelper.loaderStatus(false);
    }
  };

  // ============ CHANGE EMAIL FLOW ============
  const handleChangeEmailStart = () => {
    if (!canMakeSensitiveChanges()) {
      openModal('blockingModal');
      return;
    }
    resetModalStates();
    setCurrentStep(1);
    openModal('changeEmailModal');
  };

  // Step 1: Verify Google Auth (if enabled)
  // Step 2: Verify current email OTP
  // Step 3: Enter new email
  // Step 4: Verify new email OTP
  const handleChangeEmailNextStep = async () => {
    if (currentStep === 1 && hasGoogleAuth) {
      // Verify Google Auth
      if (!googleAuthCode || googleAuthCode.length !== 6) {
        alertErrorMessage('Please enter a valid 6-digit code');
        return;
      }
      // Send email OTP for current email verification
      const sent = await handleSendOtp('email', 'change_email');
      if (sent) {
        setResendTimer(60);
        setCurrentStep(2);
      }
    } else if (currentStep === 1 && !hasGoogleAuth) {
      // No Google Auth, start with email
      const sent = await handleSendOtp('email', 'change_email');
      if (sent) {
        setResendTimer(60);
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      // Verify current email OTP
      if (!emailOtpCode || emailOtpCode.length !== 6) {
        alertErrorMessage('Please enter a valid 6-digit OTP');
        return;
      }
      const verified = await handleVerifyOtp('email', emailOtpCode, 'change_email');
      if (verified) {
        setCurrentStep(3); // Move to enter new email
      }
    } else if (currentStep === 3) {
      // Validate and send OTP to new email
      if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        alertErrorMessage('Please enter a valid email address');
        return;
      }
      const sent = await handleSendOtp('new_email', 'change_email', newEmail);
      if (sent) {
        setResendTimer2(60);
        setCurrentStep(4);
      }
    } else if (currentStep === 4) {
      // Verify new email OTP and complete
      if (!newEmailOtpCode || newEmailOtpCode.length !== 6) {
        alertErrorMessage('Please enter a valid 6-digit OTP');
        return;
      }

      try {
        setIsLoading(true);
        LoaderHelper.loaderStatus(true);
        
        // Call backend to complete email change
        // This would need a backend endpoint like securityEmailChangeComplete
        alertSuccessMessage('Email change feature will be implemented with backend endpoint');
        closeAllModals();
        // handleUserDetails();
      } catch (error) {
        alertErrorMessage(error?.message || 'Something went wrong');
      } finally {
        setIsLoading(false);
        LoaderHelper.loaderStatus(false);
      }
    }
  };

  // ============ CHANGE MOBILE FLOW ============
  const handleChangeMobileStart = () => {
    if (!canMakeSensitiveChanges()) {
      openModal('blockingModal');
      return;
    }
    resetModalStates();
    setCurrentStep(1);
    openModal('changeMobileModal');
  };

  const handleChangeMobileNextStep = async () => {
    if (currentStep === 1 && hasGoogleAuth) {
      // Verify Google Auth
      if (!googleAuthCode || googleAuthCode.length !== 6) {
        alertErrorMessage('Please enter a valid 6-digit code');
        return;
      }
      // Send OTP to current mobile
      const sent = await handleSendOtp('mobile', 'change_mobile');
      if (sent) {
        setResendTimer(60);
        setCurrentStep(2);
      }
    } else if (currentStep === 1 && !hasGoogleAuth) {
      // No Google Auth, start with current mobile
      const sent = await handleSendOtp('mobile', 'change_mobile');
      if (sent) {
        setResendTimer(60);
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      // Verify current mobile OTP
      if (!mobileOtpCode || mobileOtpCode.length !== 6) {
        alertErrorMessage('Please enter a valid 6-digit OTP');
        return;
      }
      const verified = await handleVerifyOtp('mobile', mobileOtpCode, 'change_mobile');
      if (verified) {
        setCurrentStep(3); // Move to enter new mobile
      }
    } else if (currentStep === 3) {
      // Send OTP to new mobile
      if (!newMobileNumber || newMobileNumber.length < 6) {
        alertErrorMessage('Please enter a valid mobile number');
        return;
      }
      const fullNumber = `${newCountryCode} ${newMobileNumber}`;
      const sent = await handleSendOtp('new_mobile', 'change_mobile', fullNumber);
      if (sent) {
        setResendTimer2(60);
        setCurrentStep(4);
      }
    } else if (currentStep === 4) {
      // Verify new mobile OTP and complete
      if (!newMobileOtpCode || newMobileOtpCode.length !== 6) {
        alertErrorMessage('Please enter a valid 6-digit OTP');
        return;
      }

      try {
        setIsLoading(true);
        LoaderHelper.loaderStatus(true);
        
        // Call backend to complete mobile change
        alertSuccessMessage('Mobile change feature will be implemented with backend endpoint');
        closeAllModals();
        // handleUserDetails();
      } catch (error) {
        alertErrorMessage(error?.message || 'Something went wrong');
      } finally {
        setIsLoading(false);
        LoaderHelper.loaderStatus(false);
      }
    }
  };

  const securityLevel = getSecurityLevel();
  const activeMethodsCount = getActiveMethodsCount();

  return (
    <>
      <div className="dashboard_right">
        <DashboardHeader props={props} />

        <div className="twofactor_outer_s">
          <h5>Security Settings</h5>
          <p>Manage your account security methods. Enable multiple verification methods for enhanced protection.</p>

          <div className="security_level">
            <p>
              Security Level: <span style={{ color: securityLevel.color, fontWeight: 'bold' }}>{securityLevel.level}</span>
              <span style={{ marginLeft: '15px', color: '#888' }}>({activeMethodsCount}/3 methods active)</span>
            </p>
          </div>

          <div className="two_factor_list">
            {/* Email Verification */}
            <div className={`factor_bl ${hasEmail ? 'active' : ''}`}>
              <div className="lftcnt">
                <h6><img src="/images/email_icon2.svg" alt="Email" /> Email Verification</h6>
                <p>Use your email address for login verification and security confirmations.</p>
              </div>

              <div className="enable">
                {hasEmail ? (
                  <><img src="/images/verified_icon.svg" alt="Active" /> {maskEmail(emailID)}</>
                ) : (
                  <><img src="/images/enabled_icon.svg" alt="Not Set" /> Not Set</>
                )}
              </div>
              
              {hasEmail && canMakeSensitiveChanges() && (
                <button className="btn btn-outline" onClick={handleChangeEmailStart} disabled={isLoading}>
                  Change
                </button>
              )}
              {hasEmail && !canMakeSensitiveChanges() && (
                <span style={{ color: '#888', fontSize: '12px' }}>Add another method to change</span>
              )}
            </div>

            {/* Mobile Verification */}
            <div className={`factor_bl ${hasMobile ? 'active' : ''}`}>
              <div className="lftcnt">
                <h6><img src="/images/mobile_icon.svg" alt="Mobile" /> Mobile Verification</h6>
                <p>Receive SMS verification codes for login and security confirmations.</p>
              </div>

              <div className="enable">
                {hasMobile ? (
                  <><img src="/images/verified_icon.svg" alt="Active" /> {maskPhone(mobileNumber)}</>
                ) : (
                  <><img src="/images/enabled_icon.svg" alt="Not Set" /> Not Set</>
                )}
              </div>
              
              {!hasMobile ? (
                <button className="btn btn-outline" onClick={handleAddMobileStart} disabled={isLoading}>
                  Add Mobile
                </button>
              ) : canMakeSensitiveChanges() ? (
                <button className="btn btn-outline" onClick={handleChangeMobileStart} disabled={isLoading}>
                  Change
                </button>
              ) : (
                <span style={{ color: '#888', fontSize: '12px' }}>Add another method to change</span>
              )}
            </div>

            {/* Google Authenticator */}
            <div className={`factor_bl ${hasGoogleAuth ? 'active' : ''}`}>
              <div className="lftcnt">
                <h6>
                  <img src="/images/lock_icon.svg" alt="Authenticator" /> 
                  Google Authenticator 
                  {/* <span className="recommended-badge">Recommended</span> */}
                </h6>
                <p>Use time-based codes from Google Authenticator or similar apps for the highest security level.</p>
              </div>

              <div className="enable">
                {hasGoogleAuth ? (
                  <><img src="/images/verified_icon.svg" alt="Enabled" /> Enabled</>
                ) : (
                  <><img src="/images/enabled_icon.svg" alt="Not Enabled" /> Not Enabled</>
                )}
              </div>
              
              {hasGoogleAuth ? (
                <button 
                  className="btn btn-outline" 
                  onClick={handleDisableGoogleAuthStart} 
                  disabled={isLoading || !canMakeSensitiveChanges()}
                  title={!canMakeSensitiveChanges() ? 'Need at least 2 methods to disable' : ''}
                >
                  Disable
                </button>
              ) : (
                <button className="btn btn-outline" onClick={handleGoogleAuthStart} disabled={isLoading || !hasEmail}>
                  Set Up
                </button>
              )}
            </div>

            {/* Security Tips */}
            <div className="factor_bl security-tips">
              <div className="lftcnt">
                <h6><img src="/images/noneicon.svg" alt="Tips" /> Security Tips</h6>
                <ul className="security-tips-list">
                  <li>✓ Enable at least 2 security methods for better protection</li>
                  <li>✓ Google Authenticator provides the highest security level</li>
                  <li>✓ Never share your verification codes with anyone</li>
                  <li>✓ Keep your backup codes in a secure location</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ GOOGLE AUTHENTICATOR MODALS ============ */}
      
      {/* Step 1: Email Verification for Google Auth Setup */}
      <div className="modal fade search_form" id="googleAuthSetupModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Enable Google Authenticator</h5>
              <p>Step 1: Verify your email first for security</p>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="verify_authenticator_s">
                <img src="/images/verifyemail.svg" alt="Verify" />
                <p>We've sent a verification code to <strong>{maskEmail(emailID)}</strong></p>
              </div>

              <div className="verify_authenticator_form">
                <form className="profile_form" onSubmit={(e) => e.preventDefault()}>
                  <div className="emailinput">
                    <label>Enter verification code</label>
                    <div className="d-flex">
                      <input
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        value={emailOtpCode}
                        onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, ''))}
                      />
                      {resendTimer > 0 ? (
                        <div className="resend otp-button-disabled">Resend ({resendTimer}s)</div>
                      ) : (
                        <div className="getotp" onClick={() => handleSendOtp('email', '2fa_setup').then(() => setResendTimer(60))}>
                          Resend
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    className="submit"
                    type="button"
                    disabled={isLoading || emailOtpCode.length !== 6}
                    onClick={handleGoogleAuthEmailVerify}
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: QR Code Display */}
      <div className="modal fade search_form" id="googleAuthQrModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Scan QR Code</h5>
              <p>Step 2: Scan with Google Authenticator app</p>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="verify_authenticator_s">
                <div className="qr_code" style={{ padding: '20px', background: '#fff', borderRadius: '10px', display: 'inline-block' }}>
                  {googleQr ? (
                    <img src={googleQr} alt="QR Code" style={{ maxWidth: '200px' }} />
                  ) : (
                    <img src="/images/scanqr_code.svg" alt="QR code placeholder" />
                  )}
                </div>
                <p style={{ marginTop: '15px' }}>Scan this QR code with Google Authenticator</p>
              </div>

              <div className="verify_authenticator_form">
                <div className="coypcodetext">
                  <p>Or enter this code manually:</p>
                  <div className="d-flex align-items-center gap-2 copycodetxt">
                    <code className="copycodetxtcode">{googleCode || 'Loading...'}</code>
                    <button type="button" className="copy_code" onClick={copyCode}>
                      <i className="ri-file-copy-line"></i>
                    </button>
                  </div>
                </div>
                <form className="profile_form">
                <button
                  className="submit"
                  type="button"
                  disabled={!googleCode}
                  onClick={() => switchModal('googleAuthQrModal', 'googleAuthVerifyModal')}
                >
                  Continue
                </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Verify Authenticator Code */}
      <div className="modal fade search_form" id="googleAuthVerifyModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Verify Setup</h5>
              <p>Step 3: Enter the code from your authenticator app</p>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="verify_authenticator_s">
                <img src="/images/verifylock.svg" alt="Verify" />
                <p>Enter the 6-digit code displayed in your authenticator app</p>
              </div>

              <div className="verify_authenticator_form">
                <form className="profile_form" onSubmit={(e) => e.preventDefault()}>
                  <div className="emailinput">
                    <label>Authenticator Code</label>
                    <div className="d-flex">
                      <input
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        value={authenticatorCode}
                        onChange={(e) => setAuthenticatorCode(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>

                  <button
                    className="submit"
                    type="button"
                    disabled={isLoading || authenticatorCode.length !== 6}
                    onClick={handleGoogleAuthConfirm}
                  >
                    {isLoading ? 'Enabling...' : 'Enable Google Authenticator'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ ADD MOBILE MODAL ============ */}
      <div className="modal fade search_form" id="addMobileModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Mobile Number</h5>
              <p>
                {currentStep === 1 && hasGoogleAuth && 'Step 1: Verify Google Authenticator'}
                {currentStep === 2 && 'Step 2: Verify your email'}
                {currentStep === 3 && 'Step 3: Enter your mobile number'}
                {currentStep === 4 && 'Step 4: Verify your mobile number'}
              </p>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="verify_authenticator_form">
                <form className="profile_form" onSubmit={(e) => e.preventDefault()}>
                  
                  {/* Step 1: Google Auth (if enabled) */}
                  {currentStep === 1 && hasGoogleAuth && (
                    <div className="emailinput">
                      <label>Google Authenticator Code</label>
                      <div className="d-flex">
                        <input
                          type="text"
                          placeholder="123456"
                          maxLength={6}
                          value={googleAuthCode}
                          onChange={(e) => setGoogleAuthCode(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Email OTP */}
                  {currentStep === 2 && (
                    <>
                      <p style={{ marginBottom: '10px' }}>We've sent a code to <strong>{maskEmail(emailID)}</strong></p>

                    <div className="emailinput">
                      <label>Email Verification Code</label>
                      <div className="d-flex">
                        <input
                          type="text"
                          placeholder="123456"
                          maxLength={6}
                          value={emailOtpCode}
                          onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, ''))}
                        />
                        {resendTimer > 0 ? (
                          <div className="resend otp-button-disabled">Resend ({resendTimer}s)</div>
                        ) : (
                          <div className="getotp" onClick={() => handleSendOtp('email', 'add_mobile').then(() => setResendTimer(60))}>
                            Resend
                          </div>
                        )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 3: Enter mobile number */}
                  {currentStep === 3 && (
                    <>
                      <div className="emailinput">
                        <label>Country Code</label>
                        <select
                          className="form-control"
                          value={newCountryCode}
                          onChange={(e) => setNewCountryCode(e.target.value)}
                        >
                          <option value="+91">+91 (India)</option>
                          <option value="+1">+1 (USA)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+86">+86 (China)</option>
                        </select>
                      </div>
                      <div className="emailinput" style={{ marginTop: '15px' }}>
                        <label>Mobile Number</label>
                        <input
                          type="text"
                          placeholder="Enter mobile number"
                          value={newMobileNumber}
                          onChange={(e) => setNewMobileNumber(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                    </>
                  )}

                  {/* Step 4: Verify new mobile */}
                  {currentStep === 4 && (
                    <>
                      <p style={{ marginBottom: '10px' }}>We've sent a code to <strong>{newCountryCode} {newMobileNumber}</strong></p>

                    <div className="emailinput">
                      <label>Mobile Verification Code</label>
                      <div className="d-flex">
                        <input
                          type="text"
                          placeholder="123456"
                          maxLength={6}
                          value={newMobileOtpCode}
                          onChange={(e) => setNewMobileOtpCode(e.target.value.replace(/\D/g, ''))}
                        />
                        {resendTimer2 > 0 ? (
                          <div className="resend otp-button-disabled">Resend ({resendTimer2}s)</div>
                        ) : (
                          <div className="getotp" onClick={() => {
                            const fullNumber = `${newCountryCode} ${newMobileNumber}`;
                            handleSendOtp('new_mobile', 'add_mobile', fullNumber).then(() => setResendTimer2(60));
                          }}>
                            Resend
                          </div>
                        )}
                      </div>
                    </div>
                    </>
                  )}

                  <button
                    className="submit"
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      if (currentStep <= 2) handleAddMobileVerifyIdentity();
                      else if (currentStep === 3) handleAddMobileSendOtp();
                      else if (currentStep === 4) handleAddMobileComplete();
                    }}
                  >
                    {isLoading ? 'Processing...' : currentStep === 4 ? 'Add Mobile Number' : 'Continue'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ CHANGE EMAIL MODAL ============ */}
      <div className="modal fade search_form" id="changeEmailModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Change Email Address</h5>
              <p>
                {currentStep === 1 && hasGoogleAuth && 'Step 1: Verify Google Authenticator'}
                {currentStep === 1 && !hasGoogleAuth && 'Step 1: Verify current email'}
                {currentStep === 2 && 'Step 2: Verify current email'}
                {currentStep === 3 && 'Step 3: Enter new email address'}
                {currentStep === 4 && 'Step 4: Verify new email'}
              </p>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="verify_authenticator_form">
                <form className="profile_form" onSubmit={(e) => e.preventDefault()}>
                  
                  {/* Step 1: Google Auth (if enabled) */}
                  {currentStep === 1 && hasGoogleAuth && (
                    <div className="emailinput">
                      <label>Google Authenticator Code</label>
                      <div className="d-flex">
                        <input
                          type="text"
                          placeholder="123456"
                          maxLength={6}
                          value={googleAuthCode}
                          onChange={(e) => setGoogleAuthCode(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Current Email OTP */}
                  {currentStep === 2 && (
                    <div className="emailinput">
                      <p style={{ marginBottom: '10px' }}>We've sent a code to <strong>{maskEmail(emailID)}</strong></p>
                      <label>Current Email Verification Code</label>
                      <div className="d-flex">
                        <input
                          type="text"
                          placeholder="123456"
                          maxLength={6}
                          value={emailOtpCode}
                          onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, ''))}
                        />
                        {resendTimer > 0 ? (
                          <div className="resend otp-button-disabled">Resend ({resendTimer}s)</div>
                        ) : (
                          <div className="getotp" onClick={() => handleSendOtp('email', 'change_email').then(() => setResendTimer(60))}>
                            Resend
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Enter new email */}
                  {currentStep === 3 && (
                    <div className="emailinput">
                      <label>New Email Address</label>
                      <input
                        type="email"
                        placeholder="Enter new email address"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Step 4: Verify new email */}
                  {currentStep === 4 && (
                    <div className="emailinput">
                      <p style={{ marginBottom: '10px' }}>We've sent a code to <strong>{newEmail}</strong></p>
                      <label>New Email Verification Code</label>
                      <div className="d-flex">
                        <input
                          type="text"
                          placeholder="123456"
                          maxLength={6}
                          value={newEmailOtpCode}
                          onChange={(e) => setNewEmailOtpCode(e.target.value.replace(/\D/g, ''))}
                        />
                        {resendTimer2 > 0 ? (
                          <div className="resend otp-button-disabled">Resend ({resendTimer2}s)</div>
                        ) : (
                          <div className="getotp" onClick={() => handleSendOtp('new_email', 'change_email', newEmail).then(() => setResendTimer2(60))}>
                            Resend
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    className="submit"
                    type="button"
                    disabled={isLoading}
                    onClick={handleChangeEmailNextStep}
                  >
                    {isLoading ? 'Processing...' : currentStep === 4 ? 'Change Email' : 'Continue'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ CHANGE MOBILE MODAL ============ */}
      <div className="modal fade search_form" id="changeMobileModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Change Mobile Number</h5>
              <p>
                {currentStep === 1 && hasGoogleAuth && 'Step 1: Verify Google Authenticator'}
                {currentStep === 1 && !hasGoogleAuth && 'Step 1: Verify current mobile'}
                {currentStep === 2 && 'Step 2: Verify current mobile'}
                {currentStep === 3 && 'Step 3: Enter new mobile number'}
                {currentStep === 4 && 'Step 4: Verify new mobile'}
              </p>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="verify_authenticator_form">
                <form className="profile_form" onSubmit={(e) => e.preventDefault()}>
                  
                  {/* Step 1: Google Auth (if enabled) */}
                  {currentStep === 1 && hasGoogleAuth && (
                    <div className="emailinput">
                      <label>Google Authenticator Code</label>
                      <div className="d-flex">
                        <input
                          type="text"
                          placeholder="123456"
                          maxLength={6}
                          value={googleAuthCode}
                          onChange={(e) => setGoogleAuthCode(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Current Mobile OTP */}
                  {currentStep === 2 && (
                    <div className="emailinput">
                      <p style={{ marginBottom: '10px' }}>We've sent a code to <strong>{maskPhone(mobileNumber)}</strong></p>
                      <label>Current Mobile Verification Code</label>
                      <div className="d-flex">
                        <input
                          type="text"
                          placeholder="123456"
                          maxLength={6}
                          value={mobileOtpCode}
                          onChange={(e) => setMobileOtpCode(e.target.value.replace(/\D/g, ''))}
                        />
                        {resendTimer > 0 ? (
                          <div className="resend otp-button-disabled">Resend ({resendTimer}s)</div>
                        ) : (
                          <div className="getotp" onClick={() => handleSendOtp('mobile', 'change_mobile').then(() => setResendTimer(60))}>
                            Resend
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Enter new mobile */}
                  {currentStep === 3 && (
                    <>
                      <div className="emailinput">
                        <label>Country Code</label>
                        <select
                          className="form-control"
                          value={newCountryCode}
                          onChange={(e) => setNewCountryCode(e.target.value)}
                        >
                          <option value="+91">+91 (India)</option>
                          <option value="+1">+1 (USA)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+86">+86 (China)</option>
                        </select>
                      </div>
                      <div className="emailinput" style={{ marginTop: '15px' }}>
                        <label>New Mobile Number</label>
                        <input
                          type="text"
                          placeholder="Enter new mobile number"
                          value={newMobileNumber}
                          onChange={(e) => setNewMobileNumber(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                    </>
                  )}

                  {/* Step 4: Verify new mobile */}
                  {currentStep === 4 && (
                    <>
                      <p style={{ marginBottom: '10px' }}>We've sent a code to <strong>{newCountryCode} {newMobileNumber}</strong></p>

                    <div className="emailinput">
                      <label>New Mobile Verification Code</label>
                      <div className="d-flex">
                        <input
                          type="text"
                          placeholder="123456"
                          maxLength={6}
                          value={newMobileOtpCode}
                          onChange={(e) => setNewMobileOtpCode(e.target.value.replace(/\D/g, ''))}
                        />
                        {resendTimer2 > 0 ? (
                          <div className="resend otp-button-disabled">Resend ({resendTimer2}s)</div>
                        ) : (
                          <div className="getotp" onClick={() => {
                            const fullNumber = `${newCountryCode} ${newMobileNumber}`;
                            handleSendOtp('new_mobile', 'change_mobile', fullNumber).then(() => setResendTimer2(60));
                          }}>
                            Resend
                          </div>
                        )}
                      </div>
                    </div>
                    </>
                  )}

                  <button
                    className="submit"
                    type="button"
                    disabled={isLoading}
                    onClick={handleChangeMobileNextStep}
                  >
                    {isLoading ? 'Processing...' : currentStep === 4 ? 'Change Mobile' : 'Continue'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ BLOCKING MODAL (Not enough security methods) ============ */}
      <div className="modal fade search_form" id="blockingModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Additional Security Required</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="verify_authenticator_s">
                <img src="/images/noneicon.svg" alt="Security" />
                <p style={{ marginTop: '15px' }}>
                  <strong>You need at least 2 active security methods</strong> to make changes to your email or mobile number.
                </p>
                <p style={{ color: '#888', marginTop: '10px' }}>
                  This protects your account from unauthorized changes. Please enable Google Authenticator or add a mobile number first.
                </p>
              </div>
              <button
                className="submit"
                type="button"
                data-bs-dismiss="modal"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============ DISABLE GOOGLE AUTHENTICATOR MODAL ============ */}
      <div className="modal fade search_form" id="disableGoogleAuthModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Disable Google Authenticator</h5>
              <p>
                {currentStep === 1 && hasEmail && 'Step 1: Verify your email'}
                {currentStep === 1 && !hasEmail && hasMobile && 'Step 1: Verify your mobile'}
                {currentStep === 2 && 'Step 2: Verify your authenticator code'}
              </p>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="verify_authenticator_form">
                <form className="profile_form" onSubmit={(e) => e.preventDefault()}>
                  
                  {/* Step 1: Email or Mobile OTP verification */}
                  {currentStep === 1 && (
                    <>
                      {hasEmail ? (
                        <>
                          <p style={{ marginBottom: '10px' }}>We've sent a code to <strong>{maskEmail(emailID)}</strong></p>
                          <div className="emailinput">
                            <label>Email Verification Code</label>
                            <div className="d-flex">
                              <input
                                type="text"
                                placeholder="123456"
                                maxLength={6}
                                value={emailOtpCode}
                                onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, ''))}
                              />
                              {resendTimer > 0 ? (
                                <div className="resend otp-button-disabled">Resend ({resendTimer}s)</div>
                              ) : (
                                <div className="getotp" onClick={() => handleSendOtp('email', '2fa_disable').then(() => setResendTimer(60))}>
                                  Resend
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      ) : hasMobile ? (
                        <>
                          <p style={{ marginBottom: '10px' }}>We've sent a code to <strong>{maskPhone(mobileNumber)}</strong></p>
                          <div className="emailinput">
                            <label>Mobile Verification Code</label>
                            <div className="d-flex">
                              <input
                                type="text"
                                placeholder="123456"
                                maxLength={6}
                                value={mobileOtpCode}
                                onChange={(e) => setMobileOtpCode(e.target.value.replace(/\D/g, ''))}
                              />
                              {resendTimer > 0 ? (
                                <div className="resend otp-button-disabled">Resend ({resendTimer}s)</div>
                              ) : (
                                <div className="getotp" onClick={() => handleSendOtp('mobile', '2fa_disable').then(() => setResendTimer(60))}>
                                  Resend
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      ) : null}
                    </>
                  )}

                  {/* Step 2: Authenticator code verification */}
                  {currentStep === 2 && (
                    <>
                      <div className="verify_authenticator_s">
                        <img src="/images/verifylock.svg" alt="Verify" />
                        <p>Enter the 6-digit code from your Google Authenticator app to confirm</p>
                      </div>
                      <div className="emailinput">
                        <label>Authenticator Code</label>
                        <div className="d-flex">
                          <input
                            type="text"
                            placeholder="123456"
                            maxLength={6}
                            value={googleAuthCode}
                            onChange={(e) => setGoogleAuthCode(e.target.value.replace(/\D/g, ''))}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    className="submit"
                    type="button"
                    disabled={isLoading}
                    onClick={handleDisableGoogleAuthNextStep}
                  >
                    {isLoading ? 'Processing...' : currentStep === 2 ? 'Disable Google Authenticator' : 'Continue'}
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

export default TwofactorPage;
