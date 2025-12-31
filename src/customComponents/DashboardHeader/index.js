import React from 'react'
import { ApiConfig } from '../../api/apiConfig/apiConfig'
import { Link } from 'react-router-dom';
import { alertSuccessMessage } from '../CustomAlertMessage';

const DashboardHeader = ({ props }) => {

  function shortenAddress(address, length = 4) {
    if (!address || address.length < 10) return address; // Ensure it's a valid address
    return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
  }

  const copytext = (data) => {
    navigator.clipboard.writeText(data);
    alertSuccessMessage(" Copied!!");
  };

  return (
    <>

      <div className="top_header_dash">

        <div className="user_profile">
          <div className="user_img">
            <img src={props?.userDetails?.profilepicture ? ApiConfig?.baseImage + props?.userDetails?.profilepicture : "/images/profile_user.png"} alt="user" height="54px" width="54px" className='round_img' />
          </div>

          <div className="user_profile_cnt">
            <h3>{props?.userDetails?.emailId || "----"}</h3>


            <ul className="user_social">
              <li><a href="#" target='_blank'><img src="/images/user_social.svg" alt="social" /></a></li>
              <li><a href="https://x.com/WrathcodeExchange" target='_blank'><img src="/images/user_social2.svg" alt="social" /></a></li>
            </ul>

          </div>

        </div>





        <div className='profile_id_s'>



          <div className="profile_id">
            <span>UID :</span>
            {shortenAddress(props?.userDetails?.uuid) || "----"}
            <img src="/images/uid_icon.svg" className='m-1' alt="icon" onClick={() => copytext(props?.userDetails?.uuid)} />
          </div>

          <div className="profile_id">
            <span>Referral ID :</span>
            {props?.userDetails?.referral_code || "----"}
            <img src="/images/uid_icon.svg" className='m-1' alt="icon" onClick={() => copytext(props?.userDetails?.referral_code)} />
          </div>

          <div className="profile_id kycstatus">
            <span>KYC Status</span>
            {props?.userDetails?.kycVerified === 2 ? <Link to='#/' className='text-success'>KYC Verified</Link> : <Link to='/user_profile/kyc' className='text-warning'>KYC Pending
              <img src="/images/arrowdashboard.svg" className='m-1' alt="icon" />
            </Link>
            }

          </div>
          <div className="profile_id kycstatus giveway_bl">
            {/* <span>  Giveaway</span> */}
            <Link to='/user_profile/giveaway' className='text-warning'> 🎁 Giveaway
              <img src="/images/arrowdashboard.svg" className='m-1' alt="icon" />
            </Link>
          </div>


          {/* <div className="profile_id">
            <span>Last Login Time</span>
            <div className='time_pro'> <span>{moment(lastLogin).format("DD/MM/YYYY  ")}
              <small>{moment(lastLogin).format("hh:mm A")}</small>
            </span></div>
          </div> */}

        </div>

      </div>
    </>
  )
}

export default DashboardHeader
