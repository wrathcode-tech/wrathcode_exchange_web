import React, { useState, useCallback } from 'react'
import { ApiConfig } from '../../api/apiConfig/apiConfig'
import { Link } from 'react-router-dom';
import { alertSuccessMessage } from '../CustomAlertMessage';
import moment from 'moment';

const DashboardHeader = ({ props }) => {
  const [isInfoHidden, setIsInfoHidden] = useState(true);

  const shortenAddress = useCallback((address, length = 4) => {
    if (!address || typeof address !== 'string' || address.length < 10) return address || "----";
    return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
  }, []);

  const maskEmail = useCallback((email) => {
    if (!email || typeof email !== 'string') return "----";
    const atIndex = email.indexOf('@');
    if (atIndex === -1) return email;
    const localPart = email.slice(0, atIndex);
    const domain = email.slice(atIndex + 1);
    const visibleChars = Math.min(3, localPart.length);
    return `${localPart.slice(0, visibleChars)}***@${domain}`;
  }, []);

  const maskUID = useCallback((uid) => {
    if (!uid || typeof uid !== 'string' || uid.length < 8) return uid || "----";
    return `${uid.slice(0, 2)}****${uid.slice(-2)}`;
  }, []);

  const maskIP = useCallback((ip) => {
    if (!ip || typeof ip !== 'string') return "----";
    const parts = ip.split('.');
    if (parts.length !== 4) return ip;
    const lastDigit = parts[3]?.slice(-1) || '';
    return `${parts[0]}.***.***.*${lastDigit}`;
  }, []);

  const copytext = useCallback((data) => {
    if (!data) return;
    navigator.clipboard.writeText(data).then(() => {
      alertSuccessMessage("Copied!");
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = data;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alertSuccessMessage("Copied!");
      } catch {
        // Silent fail
      }
      document.body.removeChild(textArea);
    });
  }, []);

  const toggleInfoVisibility = useCallback(() => {
    setIsInfoHidden(prev => !prev);
  }, []);

  const userDetails = props?.userDetails;
  const displayEmail = isInfoHidden ? maskEmail(userDetails?.emailId) : (userDetails?.emailId || "----");
  const displayUID = isInfoHidden ? maskUID(userDetails?.uuid) : shortenAddress(userDetails?.uuid);
  const displayIP = isInfoHidden ? maskIP(userDetails?.lastLoginIP) : (userDetails?.lastLoginIP || "----");

  const formatDate = useCallback((date) => {
    if (!date) return "----";
    return moment(date).format("DD/MM/YYYY");
  }, []);

  const formatTime = useCallback((date) => {
    if (!date) return "";
    return moment(date).format("hh:mm A");
  }, []);

  const profileImage = userDetails?.profilepicture 
    ? ApiConfig?.baseImage + userDetails.profilepicture 
    : "/images/user.png";

  return (
    <div className="top_header_dash">
      <div className="user_profile">
        <div className="user_img">
          <img 
            src={profileImage} 
            alt="User profile" 
            onError={(e) => { e.target.src = "/images/profile_user.png"; }}
          />
          <div className='edit_user'>
            <img src="/images/edit_icon.svg" alt="Edit profile" />
          </div>
        </div>

        <div className="user_profile_cnt">
          <h3>
            {displayEmail}
            <span className='hide'>
              <button type="button" onClick={toggleInfoVisibility}>
                <i className={isInfoHidden ? "ri-eye-off-line" : "ri-eye-line"} />
                {isInfoHidden ? " Show Info" : " Hide Info"}
              </button>
            </span>
          </h3>
          <span className='subdel'>
            Last Login: {formatDate(userDetails?.lastLoginTime)}, {formatTime(userDetails?.lastLoginTime)}
          </span>
        </div>
      </div>

      <div className='profile_id_s'>
        <div className="profile_id">
          <span>UID :</span>
          {displayUID}
          <img 
            src="/images/uid_icon.svg" 
            className='m-1' 
            alt="Copy UID" 
            onClick={() => copytext(userDetails?.uuid)}
            style={{ cursor: 'pointer' }}
          />
        </div>

        <div className="profile_id">
          <span>Referral Code :</span>
          {userDetails?.referral_code || "----"}
          <img 
            src="/images/uid_icon.svg" 
            className='m-1' 
            alt="Copy referral code" 
            onClick={() => copytext(userDetails?.referral_code)}
            style={{ cursor: 'pointer' }}
          />
        </div>

        <div className="profile_id kycstatus">
          <span>KYC Status</span>
          {userDetails?.kycVerified === 2 ? (
            <Link to='#/' className='text-success'>KYC Verified</Link>
          ) : (
            <Link className='text' to='/user_profile/kyc'>
              <img src="/images/check_icon.svg" alt="Verify KYC" />
              KYC Pending
            </Link>
          )}
        </div>

        <div className="profile_id">
          <span>Sign-up Time</span>
          <span className='textprofile'>
            {formatDate(userDetails?.createdAt)}{" "}
            <small>{formatTime(userDetails?.createdAt)}</small>
          </span>
        </div>

        <div className="profile_id">
          <span>Last Login IP</span>
          <span className='textprofile'>{displayIP}</span>
        </div>
      </div>
    </div>
  )
}

export default DashboardHeader
