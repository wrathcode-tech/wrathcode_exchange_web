import React, { useState, useEffect, useContext } from "react";
import { alertErrorMessage, alertSuccessMessage } from "../../../customComponents/CustomAlertMessage";
import AuthService from "../../../api/services/AuthService";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import { ProfileContext } from "../../../context/ProfileProvider";
import DashboardHeader from "../../../customComponents/DashboardHeader";

const TwofactorPage = (props) => {
  const { handleUserDetails } = useContext(ProfileContext);

  const [current2fa, setCurrent2fa] = useState(0);
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailID, setEmailId] = useState("");
  const [googleQr, setGoogleQr] = useState("");
  const [googleCode, setGoogleCode] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [authenticatorCode, setAuthenticatorCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize user data
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrent2fa(props?.userDetails?.['2fa'] || 0);
    setMobileNumber(`${props?.userDetails?.country_code || ''} ${props?.userDetails?.mobileNumber || ''}`);
    setEmailId(props?.userDetails?.emailId || '');
  }, [props]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Get security level based on 2FA status
  const getSecurityLevel = () => {
    if (current2fa === 2) return { level: 'High', color: '#28a745' };
    if (current2fa === 1 || current2fa === 3) return { level: 'Medium', color: '#ffc107' };
    return { level: 'Low', color: '#dc3545' };
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

  // Get Google Authenticator QR Code
  const getGoogleQr = async () => {
    try {
      setIsLoading(true);
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.googleAuth();
      if (result?.success) {
        setGoogleQr(result.data?.qr_code || '');
        setGoogleCode(result.data?.secret?.base32 || '');
        // Open the modal
        const modalElement = document.getElementById('twofaInfoModal');
        if (modalElement) {
          const modal = new window.bootstrap.Modal(modalElement);
          modal.show();
        }
      } else {
        alertErrorMessage(result?.message || "Failed to get QR code");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error in getGoogleQr:", error);
      }
      alertErrorMessage(error?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
      LoaderHelper.loaderStatus(false);
    }
  };

  // Handle Get OTP for Email/Mobile verification
  const handleGetOtp = async (signId, type = 'send') => {
    if (!signId) {
      alertErrorMessage("Invalid email or phone number");
      return;
    }
    try {
      setIsLoading(true);
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.getOtp(signId, type);
      if (result?.success) {
        alertSuccessMessage(result?.message || `OTP sent to ${signId}`);
        setResendTimer(60);
      } else {
        alertErrorMessage(result?.message || "Failed to send OTP");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error in handleGetOtp:", error);
      }
      alertErrorMessage(error?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
      LoaderHelper.loaderStatus(false);
    }
  };

  // Update 2FA settings
  const handleUpdate2fa = async (authType, code, verifyType) => {
    if (!code || code.length !== 6) {
      alertErrorMessage("Please enter a valid 6-digit code");
      return;
    }
    try {
      setIsLoading(true);
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.update2fa(authType, code, verifyType);
      if (result?.success) {
        alertSuccessMessage(result?.message || "2FA updated successfully");
        // Close all modals
        closeAllModals();
        // Reset form
        setOtpCode("");
        setAuthenticatorCode("");
        // Refresh user data
        handleUserDetails();
      } else {
        alertErrorMessage(result?.message || "Failed to update 2FA");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error in handleUpdate2fa:", error);
      }
      alertErrorMessage(error?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
      LoaderHelper.loaderStatus(false);
    }
  };

  // Copy Google Auth code
  const copyCode = () => {
    if (googleCode) {
      navigator.clipboard
        .writeText(googleCode)
        .then(() => {
          alertSuccessMessage("Code copied to clipboard!");
        })
        .catch(() => {
          alertErrorMessage("Failed to copy code");
        });
    }
  };

  // Close all modals
  const closeAllModals = () => {
    const modalIds = ['twofaInfoModal', 'continueModal', 'emailverifyModal', 'verifymobileModal'];
    modalIds.forEach(id => {
      const modalElement = document.getElementById(id);
      if (modalElement) {
        const modal = window.bootstrap?.Modal?.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
      }
    });
    // Remove backdrops
    document.body.classList.remove('modal-open');
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  };

  // Handle Email 2FA Setup
  const handleEmailSetup = async () => {
    await handleGetOtp(emailID, 'send');
    const modalElement = document.getElementById('emailverifyModal');
    if (modalElement) {
      const modal = new window.bootstrap.Modal(modalElement);
      modal.show();
    }
  };

  // Handle Mobile 2FA Setup
  const handleMobileSetup = async () => {
    const phoneOnly = props?.userDetails?.mobileNumber;
    if (!phoneOnly) {
      alertErrorMessage("Mobile number not found. Please add mobile number first.");
      return;
    }
    await handleGetOtp(phoneOnly, 'send');
    const modalElement = document.getElementById('verifymobileModal');
    if (modalElement) {
      const modal = new window.bootstrap.Modal(modalElement);
      modal.show();
    }
  };

  // Disable 2FA
  const handleDisable2fa = async () => {
    try {
      setIsLoading(true);
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.update2fa(0, '', '');
      if (result?.success) {
        alertSuccessMessage(result?.message || "2FA disabled");
        handleUserDetails();
      } else {
        alertErrorMessage(result?.message || "Failed to disable 2FA");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error in handleDisable2fa:", error);
      }
      alertErrorMessage(error?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
      LoaderHelper.loaderStatus(false);
    }
  };

  const securityLevel = getSecurityLevel();

  return (
    <>
      <div className="dashboard_right">
        <DashboardHeader props={props} />

        <div className="twofactor_outer_s">
          <h5>Two-Factor Authentication (2FA)</h5>
          <p>To protect your account, we recommend that you enable at least one 2FA</p>

          <div className="security_level">
            <p>Security Level: <span style={{ color: securityLevel.color, fontWeight: 'bold' }}>{securityLevel.level}</span></p>
          </div>

          <div className="two_factor_list">
            {/* Google Authenticator */}
            <div className={`factor_bl ${current2fa === 2 ? 'active' : ''}`}>
              <div className="lftcnt">
                <h6><img src="/images/lock_icon.svg" alt="Authenticator App" /> Authenticator App</h6>
                <p>Secure your account and withdrawals with Google Authenticator for one-time codes.</p>
              </div>

              <div className="enable">
                {current2fa === 2 ? (
                  <><img src="/images/verified_icon.svg" alt="Enabled" /> Enabled</>
                ) : (
                  <><img src="/images/enabled_icon.svg" alt="Not Enabled" /> Not Enabled</>
                )}
              </div>
              {current2fa === 2 ? (
                <button className="btn" onClick={handleDisable2fa} disabled={isLoading}>Disable</button>
              ) : (
                <button className="btn" onClick={getGoogleQr} disabled={isLoading}>Set Up</button>
              )}
            </div>

            {/* Email Verification */}
            <div className={`factor_bl ${current2fa === 1 ? 'active' : ''}`}>
              <div className="lftcnt">
                <h6><img src="/images/email_icon2.svg" alt="Email Verification" /> Email Verification</h6>
                <p>Link your email address to your account for login, password recovery and withdrawal confirmation.</p>
              </div>

              <div className="enable">
                {emailID ? (
                  <><img src="/images/verified_icon.svg" alt="Verified" /> {maskEmail(emailID)}</>
                ) : (
                  <><img src="/images/enabled_icon.svg" alt="Not Set" /> Not Set</>
                )}
              </div>
              {current2fa === 1 ? (
                <button className="btn" onClick={handleDisable2fa} disabled={isLoading}>Disable</button>
              ) : (
                <button className="btn" onClick={handleEmailSetup} disabled={isLoading || !emailID}>
                  {emailID ? 'Enable' : 'Set Up'}
                </button>
              )}
            </div>

            {/* Mobile Verification */}
            <div className={`factor_bl ${current2fa === 3 ? 'active' : ''}`}>
              <div className="lftcnt">
                <h6><img src="/images/mobile_icon.svg" alt="Mobile Verification" /> Mobile Verification</h6>
                <p>Link your mobile number to your account to receive verification codes via SMS for confirmations on withdrawal, password change, and security settings.</p>
              </div>

              <div className="enable">
                {props?.userDetails?.mobileNumber ? (
                  <><img src="/images/verified_icon.svg" alt="Verified" /> {maskPhone(mobileNumber)}</>
                ) : (
                  <><img src="/images/enabled_icon.svg" alt="Not Set" /> Not Set</>
                )}
              </div>
              {current2fa === 3 ? (
                <button className="btn" onClick={handleDisable2fa} disabled={isLoading}>Disable</button>
              ) : (
                <button className="btn" onClick={handleMobileSetup} disabled={isLoading || !props?.userDetails?.mobileNumber}>
                  {props?.userDetails?.mobileNumber ? 'Enable' : 'Set Up'}
                </button>
              )}
            </div>

            {/* None (Disable 2FA) */}
            <div className={`factor_bl ${current2fa === 0 ? 'active' : ''}`}>
              <div className="lftcnt">
                <h6><img src="/images/noneicon.svg" alt="None" /> None</h6>
                <p>No two-factor authentication enabled. We strongly recommend enabling at least one 2FA method for security.</p>
              </div>

              <div className="enable">
                {current2fa === 0 ? (
                  <><img src="/images/verified_icon.svg" alt="Active" /> Active</>
                ) : (
                  <><img src="/images/enabled_icon.svg" alt="Not Active" /> Not Active</>
                )}
              </div>
              {current2fa !== 0 && (
                <button className="btn" onClick={handleDisable2fa} disabled={isLoading}>Disable All</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Google Authenticator Setup Modal */}
      <div className="modal fade search_form" id="twofaInfoModal" tabIndex="-1" aria-labelledby="twofaInfoModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Setup Authenticator</h5>
              <p>Secure your account by linking it with an authenticator app for one-time codes.</p>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="verify_authenticator_s">
                <img src="/images/authenticator_vector.svg" alt="authenticator" />
                <p>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>

                <div className="qr_code" style={{ padding: '20px', background: '#fff', borderRadius: '10px', display: 'inline-block' }}>
                  {googleQr ? (
                    <img src={googleQr} alt="QR Code" style={{ maxWidth: '200px' }} />
                  ) : (
                    <img src="/images/scanqr_code.svg" alt="QR code placeholder" />
                  )}
                </div>
              </div>

              <div className="verify_authenticator_form">
                <form className="profile_form" onSubmit={(e) => e.preventDefault()}>
                  <div className="coypcodetext">

                    <p>Copy this code and enter it in your authenticator app:</p>
                   
                    <div className="d-flex align-items-center gap-2 copycodetxt">
                      <code className="copycodetxtcode">
                        {googleCode || 'Loading...'}
                      </code>
                      <button type="button" className="copy_code" onClick={copyCode} style={{ padding: '5px 10px' }}>
                        <i className="ri-file-copy-line"></i>
                      </button>
                    
                    </div>
                  </div>

                  <button
                    className="submit"
                    type="button"
                    disabled={!googleCode}
                    onClick={(e) => {
                      e.preventDefault();
                      const twofaModal = window.bootstrap?.Modal?.getInstance(document.getElementById('twofaInfoModal'));
                      if (twofaModal) twofaModal.hide();
                      setTimeout(() => {
                        const continueModalElement = document.getElementById('continueModal');
                        if (continueModalElement) {
                          const continueModal = new window.bootstrap.Modal(continueModalElement);
                          continueModal.show();
                        }
                      }, 300);
                    }}
                  >
                    Continue
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Authenticator Verify Modal */}
      <div className="modal fade search_form" id="continueModal" tabIndex="-1" aria-labelledby="continueModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Verify Authenticator</h5>
              <p>Enter the 6-digit code from your authenticator app to complete verification.</p>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="verify_authenticator_s">
                <img src="/images/verifylock.svg" alt="Verify" />
                <p>Enter the 6-digit code from your authenticator app to complete verification.</p>
              </div>

              <div className="verify_authenticator_form">
                <form className="profile_form" onSubmit={(e) => e.preventDefault()}>
                  <div className="emailinput">
                    <label>Enter 6-digit code</label>
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
                    onClick={() => handleUpdate2fa(2, authenticatorCode, 'google')}
                  >
                    {isLoading ? 'Verifying...' : 'Submit'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Verify Modal */}
      <div className="modal fade search_form" id="emailverifyModal" tabIndex="-1" aria-labelledby="emailverifyModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Verify Email OTP</h5>
              <p>Check your inbox and type the OTP to confirm your email address securely.</p>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="verify_authenticator_s">
                <img src="/images/verifyemail.svg" alt="Verify" />
                <p>We've sent a verification code to your email <strong>{maskEmail(emailID)}</strong></p>
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
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      />
                      <div
                        className="getotp"
                        style={{ cursor: resendTimer > 0 ? 'not-allowed' : 'pointer', opacity: resendTimer > 0 ? 0.6 : 1 }}
                        onClick={() => resendTimer === 0 && handleGetOtp(emailID, 'resend')}
                      >
                        {resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend Code'}
                      </div>
                    </div>
                  </div>

                  <button
                    className="submit"
                    type="button"
                    disabled={isLoading || otpCode.length !== 6}
                    onClick={() => handleUpdate2fa(1, otpCode, 'email')}
                  >
                    {isLoading ? 'Verifying...' : 'Submit'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Verify Modal */}
      <div className="modal fade search_form" id="verifymobileModal" tabIndex="-1" aria-labelledby="verifymobileModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Verify Mobile OTP</h5>
              <p>Enter the OTP sent to your mobile number.</p>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="verify_authenticator_s">
                <img src="/images/verifymobile.svg" alt="Verify" />
                <p>We've sent a verification code to your mobile number ending in <strong>{maskPhone(mobileNumber)}</strong></p>
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
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      />
                      <div
                        className="getotp"
                        style={{ cursor: resendTimer > 0 ? 'not-allowed' : 'pointer', opacity: resendTimer > 0 ? 0.6 : 1 }}
                        onClick={() => resendTimer === 0 && handleGetOtp(props?.userDetails?.mobileNumber, 'resend')}
                      >
                        {resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend Code'}
                      </div>
                    </div>
                  </div>

                  <button
                    className="submit"
                    type="button"
                    disabled={isLoading || otpCode.length !== 6}
                    onClick={() => handleUpdate2fa(3, otpCode, 'mobile')}
                  >
                    {isLoading ? 'Verifying...' : 'Submit'}
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
