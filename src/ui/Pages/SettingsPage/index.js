import React, { useState, useEffect, useContext } from "react";
import { validateEmail } from "../../../utils/Validation";
import { alertErrorMessage, alertSuccessMessage } from "../../../customComponents/CustomAlertMessage";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import AuthService from "../../../api/services/AuthService";
import { ApiConfig } from "../../../api/apiConfig/apiConfig";
import { ProfileContext } from "../../../context/ProfileProvider";
import Slider from "react-slick";
import { $ } from "react-jquery-plugin";
import DashboardHeader from "../../../customComponents/DashboardHeader";
import { isValidPhoneNumber } from "libphonenumber-js";

const SettingsPage = (props) => {

  const { userDetails, handleUserDetails } = useContext(ProfileContext);

  const bannerSettings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 2000
  };

  const [emailId, setEmailId] = useState('');
  const [signupBy, setSignupBy] = useState("");
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


  useEffect(() => {
    setEmailId(props?.userDetails?.emailId);
    setMobile(props?.userDetails?.mobileNumber);
    setFirstName(props?.userDetails?.firstName);
    setLastName(props?.userDetails?.lastName);
    setMyfile(props?.userDetails?.profilepicture);
    setCountryCode(props?.userDetails?.country_code);
    setSignupBy(props?.userDetails?.registeredBy);
  }, [props, userDetails]);

  const modalBackdropRemove = () => {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
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
        alertSuccessMessage(file?.name)
        $("#exampleModal_2").modal('hide');
        modalBackdropRemove()
        $("#exampleModal_3").modal('show');
      } else {
        if (!allowedTypes.includes(file.type)) {
          alertErrorMessage("Only PNG, JPEG, and JPG file types are allowed.");
        } else {
          alertErrorMessage("Max image size is 2MB.");
        }
      }
    }
  };


  const handleGetOtp = async (emailorMobile, type, inputType) => {
    let signId;
    if (inputType === "email") {
      if (validateEmail(newEmail) !== undefined) {
        alertErrorMessage("Please enter valid email address")
        return
      }
      signId = newEmail
    } else {
      const fullPhone = `${newCountryCode}${newPhone}`;

      if (!isValidPhoneNumber(fullPhone)) {
        alertErrorMessage("Please enter a valid phone number for the selected country");
        return;
      }
      const fullPhonePayload = `${newCountryCode} ${newPhone}`;

      signId = fullPhonePayload

    }

    LoaderHelper.loaderStatus(true);
    await AuthService.getOtp(signId, type).then(async (result) => {
      LoaderHelper.loaderStatus(false);
      if (result?.success) {
        try {
          alertSuccessMessage(result?.message);
          if (inputType === "email") {
            setDisbaleBtn(true);
            setTimer(30);
          }
          else {
            setDisbaleBtn2(true);
            setTimer2(30);
          }

        } catch (error) {
          alertErrorMessage(error);
        }
      } else {
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result?.message);
      }
    });
  };


  const editavatar = async () => {
    var formData = new FormData();
    formData.append("profilepicture", myfile);
    LoaderHelper.loaderStatus(true);
    await AuthService.editavatar(formData).then(async (result) => {
      if (result?.success) {
        LoaderHelper.loaderStatus(false);
        try {
          $("#exampleModal_3").modal('hide');
          modalBackdropRemove()
          window.scrollTo({ top: 0, behavior: 'smooth' });
          alertSuccessMessage(result?.message);
          handleUserDetails();
        } catch {
          alertErrorMessage(result?.message);
        }
      } else {
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result?.message);
      }
    });
  };

  const editusername = async () => {
    if (!firstName?.trim() && !lastName?.trim()) {
      return
    }
    LoaderHelper.loaderStatus(true);
    await AuthService.editusername(firstName, lastName).then(async (result) => {
      if (result?.success) {
        LoaderHelper.loaderStatus(false);
        try {
          $("#exampleModal_2").modal('hide');
          modalBackdropRemove()
          window.scrollTo({ top: 0, behavior: 'smooth' });
          alertSuccessMessage(result?.message);
          handleUserDetails();
        } catch {
          alertErrorMessage(result?.message);
        }
      } else {
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result?.message);
      }
    });
  };

  const editEmail = async () => {
    if (validateEmail(newEmail) !== undefined) {
      alertErrorMessage("Please enter valid email address")
      return
    } if (!emailOtp || emailOtp?.length < 5) {
      alertErrorMessage("Invalid OTP")
      return
    }
    LoaderHelper.loaderStatus(true);
    await AuthService.editemail(newEmail, emailOtp).then(async (result) => {
      if (result?.success) {
        LoaderHelper.loaderStatus(false);
        try {
          setEmailOtp("");
          setNewEmail("");
          setTimer(0);
          setDisbaleBtn(false)
          modalBackdropRemove()
          window.scrollTo({ top: 0, behavior: 'smooth' });
          alertSuccessMessage(result?.message);
          handleUserDetails();
        } catch {
          $("#email_light").modal('show');
          alertErrorMessage(result?.message);
        }
      } else {
        $("#email_light").modal('show');
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result?.message);
      }
    });
  };

  const editPhone = async () => {
    const fullPhone = `${newCountryCode}${newPhone}`;
    if (!isValidPhoneNumber(fullPhone)) {
      alertErrorMessage("Please enter a valid phone number for the selected country");
      return;
    } if (!newPhone || mobileOtp?.length < 5) {
      alertErrorMessage("Invalid OTP");
      $("#phone_light").modal('show');
      return
    }
    LoaderHelper.loaderStatus(true);
    await AuthService.editPhone(`${newCountryCode} ${newPhone}`, mobileOtp).then(async (result) => {
      if (result?.success) {
        LoaderHelper.loaderStatus(false);
        try {
          setCountryCode("+91");
          setMobileOtp("");
          setNewPhone("");
          setTimer2(0);
          setDisbaleBtn2(false)
          modalBackdropRemove()
          window.scrollTo({ top: 0, behavior: 'smooth' });
          alertSuccessMessage(result?.message);
          handleUserDetails();
        } catch {
          $("#phone_light").modal('show');
          alertErrorMessage(result?.message);
        }
      } else {
        $("#phone_light").modal('show');
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result?.message);
      }
    });
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


  return (
    <>

      {/* // <div className="tab-pane" id="SecurityPill" role="tabpanel" aria-labelledby="Security-pill">
    //   <div className="row">
    //     <div className="col-md-12 col-lg-8 m-auto">
    //       <div className="form-field-wrapper switch_btn  border-dashed border-gray-300 bg-lighten card-rounded p-md-4 p-3">
    //         <form>
    //           <div className="row">
    //             <div className="col-md-12">
    //               <div className="img-prev" >
    //                 <div className="avatar-preview">
    //                   {!myfile && !localSelfy ? (<img src="/images/user.png" className="img-fluid" />) : (
    //                     <img src={!localSelfy ? `${ApiConfig.baseUrl}${myfile}` : localSelfy} alt="User Avatar" className="img-fluid"
    //                       onError={(e) => {
    //                         e.target.onerror = null;
    //                         e.target.src = "/images/user.png";
    //                       }} />
    //                   )}
    //                 </div>
    //                 <div className="avatar-edit">
    //                   <input type="file" id="imageUpload" name="myfile" onChange={handleChangeSelfie} />
    //                   <label htmlFor="imageUpload">
    //                     <i className="ri-upload-cloud-2-line me-2"></i> Upload Photo
    //                   </label>
    //                   <small> Click button to upload photo </small>
    //                 </div>
    //               </div>

    //             </div>
    //             <div className="col-md-12 mb-3 mb-md-4">
    //               <div className="field-box">
    //                 <label htmlFor="text" className="form-label"> First Name </label>
    //                 <DefaultInput type="text" name="firstName" className="form-control" aria-describedby="First Name" placeholder="Enter Your First Name" value={firstName === "undefined" ? "" : firstName} onChange={(e) => setFirstName(e.target.value)} />
    //               </div>
    //             </div>
    //             <div className="col-md-12  mb-3 mb-md-4">
    //               <div className="field-box">
    //                 <label htmlFor="text" className="form-label"> Last Name </label>
    //                 <DefaultInput className="form-control" type="text" name="lastName" placeholder="Enter Last Name" value={lastName === "undefined" ? "" : lastName} onChange={(e) => setLastName(e.target.value)} />
    //               </div>
    //             </div>
    //             <div className="col-md-12  mb-3 mb-md-4">
    //               <div className="field-box">
    //                 <label htmlFor="text" className="form-label"> Email </label>
    //                 <DefaultInput className="form-control" type="email" name="Email" placeholder="Enter Email" value={emailId === "undefined" ? "" : emailId?.trim()} errorstatus={validateEmail(emailId) !== undefined && notEqualsZero(emailId)} errormessage={emailId === "undefined" ? "" : validateEmail(emailId)} onChange={(e) => setEmailId(e.target.value)} disabled={props?.userDetails?.emailId ? 'disabled' : undefined} />
    //               </div>
    //             </div>

    //             {props?.userDetails?.emailId ? '' :
    //               <div className="col-lg-12 col-md-12 col-12 mb-3 mb-md-4">
    //                 <label className="form-label" >Email Verification Code</label>
    //                 <div className=" field-otp-box" >
    //                   <input type="text" name="form-otp" id="form-otp" className="form-control" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} />
    //                   <button type="button" className="btn btn-xs  custom-btn" onClick={() => { handleGetOtp(emailId, "registration"); setDisbaleBtn(true) }}>
    //                     <span> {disableBtn ? 'Resend OTP' : 'GET OTP '}  </span>
    //                   </button>
    //                 </div>
    //               </div>
    //             }

    //             <div className="col-md-12  mb-3 mb-md-4 mt-md-4 mt-3">
    //               <div className="field-box">
    //                 <button className="btn custom-btn btn-block w-100 btn-xl" type="button" onClick={() => handleSettings(firstName, lastName, emailId, mobile, emailOtp, mobileOtp)}>
    //                   <span>Submit</span>
    //                 </button>
    //               </div>
    //             </div>
    //           </div>
    //         </form>
    //       </div>
    //     </div>
    //   </div>
    // </div> */}




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
              </div>

              <div className="enable"><img src="/images/user.png" alt="user" />Pallav-Soni</div>
              <button className="btn" data-bs-toggle="modal" data-bs-target="#profilepop">Change</button>

            </div>

            <div className="factor_bl">
              <div className="lftcnt">
                <h6><img src="/images/email_icon2.svg" alt="Email Verification" /> Email Verification</h6>
                <p>SeLink your email address to your account for login, password recovery and withdrawal confirmation.cure your account and withdrawals with a passkey</p>
              </div>

              <div className="enable"><img src="/images/verified_icon.svg" alt="Email Verification" /> pl***9@gmail.com</div>
              <button className="btn" data-bs-toggle="modal" data-bs-target="#emailpop">Change</button>

            </div>

            <div className="factor_bl">
              <div className="lftcnt">
                <h6><img src="/images/mobile_icon.svg" alt="Mobile Verification" /> Mobile Verification</h6>
                <p>Link your mobile number to your account to receive verification codes via SMS for confirmations on withdrawal, password change, and security settings.</p>
              </div>

              <div className="enable"><img src="/images/verified_icon.svg" alt="mobile" />+91-9982141988</div>
              <button className="btn" data-bs-toggle="modal" data-bs-target="#mobilepop">Change</button>

            </div>

          </div>

        </div>

        <div className="twofactor_outer_s">
          <h5>Currency Preference</h5>
          <p>Select your preferred display currency for all markets</p>

          <div className="two_factor_list">

            <div class="currency_list_b">
              <ul>
                <li className="active">
                  <div class="currency_bit"><img src="https://backend.gatbits.com/icons/coin-image-1751739665132-148359796.png" class="img-fluid" alt="Tether" /></div>
                  <h6>Tether USD (USDT)</h6>
                  <div class="vector_bottom">
                    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="52" viewBox="0 0 60 52" fill="none">
                      <path d="M59.6296 0L60 52H0L59.6296 0Z" fill="#3B3B3B"></path>
                    </svg>
                  </div>
                </li>
                <li>
                  <div class="currency_bit"><img src="https://backend.gatbits.com/icons/coin-image-1751739665132-148359796.png" class="img-fluid" alt="Tether" /></div>
                  <h6>BTC</h6>
                  <div class="vector_bottom">
                    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="52" viewBox="0 0 60 52" fill="none">
                      <path d="M59.6296 0L60 52H0L59.6296 0Z" fill="#3B3B3B"></path>
                    </svg>
                  </div>
                </li>
                <li>
                  <div class="currency_bit"><img src="https://backend.gatbits.com/icons/coin-image-1751739665132-148359796.png" class="img-fluid" alt="Tether" /></div>
                  <h6>BNB</h6>
                  <div class="vector_bottom">
                    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="52" viewBox="0 0 60 52" fill="none">
                      <path d="M59.6296 0L60 52H0L59.6296 0Z" fill="#3B3B3B"></path>
                    </svg>
                  </div>
                </li>
              </ul>
              <div className="savebtn">
                <button>Save Currency Preference</button>
              </div>

            </div>

          </div>

        </div>


        <div className="twofactor_outer_s">
          <h5>Change Password</h5>
          <p>To protect your account, we recommend that you enable at least one 2FA</p>

          <div className="two_factor_list">

            <div className="factor_bl active">
              <div className="lftcnt">
                <h6><img src="/images/lock_icon.svg" alt="Login Password" /> Login Password</h6>
                <p>Update your name and avatar to personalize your profile. Save changes to keep your account up to date.</p>
              </div>

              <button className="btn" data-bs-toggle="modal" data-bs-target="#security_verification">Change</button>

            </div>

          </div>

        </div>



        <div className="modal fade search_form" id="mobilepop" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered ">
            <div className="modal-content">
              <div className="modal-header">

                <h5 className="modal-title" id="exampleModalLabel">Edit Phone</h5>
                <p>Avatar and nickname will also be applied to dummy text.Abusing them might lead to community penalties.</p>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">

                <form className="profile_form">

                  <div className="emailinput">
                    <label>Registered Phone</label>
                    <div className="d-flex">
                      <input type="email" placeholder="pallavsoni64@gmail.com" />
                    </div>
                  </div>

                  <div className="emailinput">
                    <label>New Phone</label>
                    <div className="d-flex">
                      <div className="d-flex mobilenumber">
                        <div className="phonecode">
                          <select className="country_code">
                            <option value="+91">+91</option>
                            <option value="+1">+1</option>
                            <option value="+44">+44</option>
                          </select>
                        </div>
                        <input type="text" placeholder="New Phone" />
                        </div> 
                      <div className="getotp">GET OTP</div>
                      </div>
                    </div>

                  <div className="emailinput">
                    <label>OTP</label>
                    <div className="d-flex">
                      <input type="text" placeholder="Enter OTP here..." />
                    </div>
                  </div>

                  <button className="submit">Submit</button>

                </form>


              </div>

            </div>
          </div>
        </div>


        <div className="modal fade search_form" id="emailpop" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered ">
            <div className="modal-content">
              <div className="modal-header">

                <h5 className="modal-title" id="exampleModalLabel">Edit Profile</h5>
                <p>Avatar and nickname will also be applied to dummy text.Abusing them might lead to community penalties.</p>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">

                <form className="profile_form">

                  <div className="emailinput">
                    <label>Registered Email</label>
                    <div className="d-flex">
                      <input type="email" placeholder="pallavsoni64@gmail.com" />
                    </div>
                  </div>

                  <div className="emailinput">
                    <label>New Email</label>
                    <div className="d-flex">
                      <input type="email" placeholder="Enter email here..." />
                      <div className="getotp">GET OTP</div>
                    </div>
                  </div>

                  <div className="emailinput">
                    <label>OTP</label>
                    <div className="d-flex">
                      <input type="text" placeholder="Enter OTP here..." />
                    </div>
                  </div>

                  <button className="submit">Submit</button>

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
                <p>Enter the code sent to <span>ple***@gmail.com.</span></p>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">

                <form className="profile_form">

                  <div className="emailinput">
                    <label>Email Verification</label>
                    <div className="d-flex">
                      <input type="email" placeholder="" />
                      <div className="resend">Resend</div>
                    </div>
                  </div>

                  <div className="emailinput">
                    <label>New Password</label>
                    <div className="d-flex">
                      <input type="password" placeholder="" />
                    </div>
                  </div>
                  <div className="error">
                    <span>10-32 characters</span>
                    <span>At least one uppercase, lowercase, and number.</span>
                    <span>Does not contain any spaces.</span>
                  </div>
                  <div className="emailinput">
                    <label>Confirm Password</label>
                    <div className="d-flex">
                      <input type="password" placeholder="" />
                    </div>
                  </div>

                  <button className="submit">Submit</button>

                </form>

                {/* <div className="profile_cnt_lightb">

                      <div className="profile_bl">

                        <h5>Avatar</h5>

                        <div className="user_profile_pick">

                          <div className="editor_img_b">

                            <input type="file" accept="image/*" className="user-profile-editor_panel-form-field_object_avatar-uploader" onChange={handleChangeSelfie} />

                            <div className="user_profile_editor">
                              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="bn-svg"><path fillRule="evenodd" clip-rule="evenodd"
                                d="M15.314 4.781l3.889 3.89-1.768 1.767-3.889-3.889 1.768-1.768zm-3.182 3.182l3.89 3.89-5.129 
    5.127H15v3H7.893l-.004.004H4v-3.889l8.132-8.132zM17 16.98h3v3h-3v-3z" fill="currentColor"></path></svg>
                            </div>

                            <img src={props?.userDetails?.profilepicture ? ApiConfig?.baseImage + props?.userDetails?.profilepicture : "/images/user.png"} height="54px" width="54px" />

                          </div>

                      
                        </div>

                      </div>



                      <div className="profile_bl">

                        <h5>First name</h5>

                        <div className="user_profile_pick">

                          <input type="text" placeholder="" value={firstName === "undefined" ? "" : firstName} onChange={(e) => setFirstName(e.target.value)} />

                       
                        </div>

                      </div>
                      <div className="profile_bl">

                        <h5>Last name</h5>

                        <div className="user_profile_pick">

                          <input type="text" placeholder="" value={lastName === "undefined" ? "" : lastName} onChange={(e) => setLastName(e.target.value)} />

                      
                        </div>

                      </div>

                    </div> */}


                {/* <div className="btn_profile_list">
                      <button data-bs-dismiss="modal" >Cancel</button>
                      <button className="savebtn" onClick={editusername} disabled={!firstName?.trim() || !lastName?.trim()}  >Save</button>
                    </div> */}




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

                  <div class="user_img">
                    <img src="/images/user.png" alt="user" />
                    <div class="edit_user"> <img src="/images/edit_icon.svg" alt="edit" /></div>
                  </div>


                  <div className="emailinput">
                    <label>First Name</label>
                    <div className="d-flex">
                      <input type="text" placeholder="Pallav" />
                    </div>
                  </div>

                  <div className="emailinput">
                    <label>Last Name</label>
                    <div className="d-flex">
                      <input type="text" placeholder="Soni" />
                    </div>
                  </div>

                  <button className="submit">Submit</button>

                </form>


              </div>

            </div>
          </div>
        </div>






        {/* <div className="profile_outer_block mt-4">

          <div className="profile_cvtrade">

            <h2>Profile</h2>

            <div className="profie_block">

              <div className="profile_cnt">
                <span>Name & Avatar</span>
                <p>Update your name and avatar to personalize your profile. Save changes to keep your account up to date.</p>
                <div className="user_img">
                  <img src={props?.userDetails?.profilepicture ? ApiConfig?.baseImage + props?.userDetails?.profilepicture : "/images/user.png"} height="54px" width="54px" alt="user" /><span>{firstName || "Wrathcode"}-{lastName || "USER"}</span>
                </div>
              </div>

              <div className="profile_right">



                <a className="profile_btn" href="#" data-bs-toggle="modal" data-bs-target="#exampleModal_2">Edit</a>


              </div>

            </div>


          
            <div className="modal fade search_form" id="exampleModal_2" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div className="modal-dialog modal-dialog-centered ">
                <div className="modal-content">
                  <div className="modal-header">

                    <h5 className="modal-title" id="exampleModalLabel">Edit Profile</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body">

                    <p>*Avatar and nickname will also be applied to dummy text.</p>
                    <p>Abusing them might lead to community penalties.</p>


                    <div className="profile_cnt_lightb">

                      <div className="profile_bl">

                        <h5>Avatar</h5>

                        <div className="user_profile_pick">

                          <div className="editor_img_b">

                            <input type="file" accept="image/*" className="user-profile-editor_panel-form-field_object_avatar-uploader" onChange={handleChangeSelfie} />

                            <div className="user_profile_editor">
                              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="bn-svg"><path fillRule="evenodd" clip-rule="evenodd"
                                d="M15.314 4.781l3.889 3.89-1.768 1.767-3.889-3.889 1.768-1.768zm-3.182 3.182l3.89 3.89-5.129 
    5.127H15v3H7.893l-.004.004H4v-3.889l8.132-8.132zM17 16.98h3v3h-3v-3z" fill="currentColor"></path></svg>
                            </div>

                            <img src={props?.userDetails?.profilepicture ? ApiConfig?.baseImage + props?.userDetails?.profilepicture : "/images/user.png"} height="54px" width="54px" />

                          </div>

                      
                        </div>

                      </div>



                      <div className="profile_bl">

                        <h5>First name</h5>

                        <div className="user_profile_pick">

                          <input type="text" placeholder="" value={firstName === "undefined" ? "" : firstName} onChange={(e) => setFirstName(e.target.value)} />

                       
                        </div>

                      </div>
                      <div className="profile_bl">

                        <h5>Last name</h5>

                        <div className="user_profile_pick">

                          <input type="text" placeholder="" value={lastName === "undefined" ? "" : lastName} onChange={(e) => setLastName(e.target.value)} />

                      
                        </div>

                      </div>

                    </div>


                    <div className="btn_profile_list">
                      <button data-bs-dismiss="modal" >Cancel</button>
                      <button className="savebtn" onClick={editusername} disabled={!firstName?.trim() || !lastName?.trim()}  >Save</button>
                    </div>




                  </div>

                </div>
              </div>
            </div>





        
            <div className="modal fade search_form" id="exampleModal_3" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div className="modal-dialog modal-dialog-centered ">
                <div className="modal-content">
                  <div className="modal-header">

                    <h5 className="modal-title" id="exampleModalLabel">Edit Avatar</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body">




                    <div className="profile_cnt_lightb">

                      <div className="updated_profile_img"><img src={localSelfy} /></div>



                    </div>


                    <div className="btn_profile_list">
                      <button data-bs-dismiss="modal" >Cancel</button>
                      <button className="savebtn" onClick={editavatar} >Apply</button>
                    </div>

                  </div>

                </div>
              </div>
            </div>



          </div>


          <div className="profile_cvtrade">

            <div className="profie_block">

              <div className="profile_cnt">
                <h2>Email</h2>
                <div className="user_img email_ot">
                  <i className="ri-mail-line"></i><span>{emailId || "------"}</span>
                </div>
              </div>

              <div className="profile_right">



                <a className="profile_btn" href="#" data-bs-toggle="modal" data-bs-target="#email_light">Edit</a>

              </div>

            </div>


         
            <div className="modal fade search_form" id="email_light" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div className="modal-dialog modal-dialog-centered ">
                <div className="modal-content">
                  <div className="modal-header">

                    <h5 className="modal-title" id="exampleModalLabel">Edit Email</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body">

                    {(signupBy === "email" || signupBy === "google") && <p>Signup method cannot be changed. Contact support for any modification in email.</p>}


                    <div className="profile_cnt_lightb">

                      <div className="user_profile_pick">
                        {(signupBy === "email" || signupBy === "google") ?
                          <form className="profile_form">
                            <div className="input_filed">
                              <label>Registered Email</label><input type="text" placeholder="Name" defaultValue={emailId} disabled />
                            </div>

                          </form>
                          : <form className="profile_form">
                            {emailId &&
                              <div className="input_filed">
                                <label>Registered Email</label>  <input type="text" value={emailId || "---"} disabled />
                              </div>}

                            <div className="input_filed">
                              <label>New Email</label>

                              <div className="otp_s_in">
                                <input type="email" placeholder="Enter email here..." onChange={(e) => setNewEmail(e.target.value)} value={newEmail} />
                                <button type="button" onClick={() => handleGetOtp(newEmail, "registration", "email")} disabled={disableBtn} >{disableBtn ? `Resend OTP (${timer}s)` : "GET OTP"}</button>
                              </div>
                            </div>
                            <div className="input_filed">

                              <label>OTP</label><input type="number" onWheel={(e) => e.target.blur()} onChange={(e) => setEmailOtp(e.target.value)} value={emailOtp} placeholder="Enter OTP here..." />

                            </div>

                            <input type="button" value="Submit" data-bs-dismiss="modal" onClick={editEmail} disabled={validateEmail(newEmail) !== undefined || !newEmail || !emailOtp} />


                          </form>}

                      </div>

                    </div>

                  </div>

                </div>


              </div>
            </div>


          </div>


          <div className="profile_cvtrade">


            <div className="profie_block">

              <div className="profile_cnt">
                <h2>Phone</h2>
              </div>

              <div className="profile_right">

                <div className="user_img">
                  <img src="/images/phone_icon.png" alt="user" /><span>{mobile ? `${countryCode}-${mobile}` : "-----"}</span>
                </div>

                <a className="profile_btn" href="#" data-bs-toggle="modal" data-bs-target="#phone_light">Edit</a>

              </div>

            </div>





          </div>

        </div> */}

        {/* <div className="dashboard_right_side profileslider">

          <div className="slider dashboard_slider">
            <Slider {...bannerSettings}>
              <div className="banner_img_add">

                <div className="cnt_slider_f">
                  <h6>Wrathcode Landing Protocol</h6>
                  <p>Borrow Low, Earn High</p>
                </div>

                <div className="cv_trade_img">
                  <img src="/images/logo_light.svg" alt="bitcoin" />
                </div>

              </div>
              <div className="banner_img_add">

                <div className="cnt_slider_f">
                  <h6>Wrathcode Landing Protocol</h6>
                  <p>Borrow Low, Earn High</p>
                </div>

                <div className="cv_trade_img">
                  <img src="/images/logo_light.svg" alt="bitcoin" />

                </div>

              </div>

              <div className="banner_img_add">

                <div className="cnt_slider_f">
                  <h6>Wrathcode Landing Protocol</h6>
                  <p>Borrow Low, Earn High</p>
                </div>

                <div className="cv_trade_img">
                  <img src="/images/logo_light.svg" alt="bitcoin" />

                </div>

              </div>

              <div className="banner_img_add">

                <div className="cnt_slider_f">
                  <h6>Wrathcode Landing Protocol</h6>
                  <p>Borrow Low, Earn High</p>
                </div>

                <div className="cv_trade_img">
                  <img src="/images/logo_light.svg" alt="bitcoin" />

                </div>

              </div>

              <div className="banner_img_add">

                <div className="cnt_slider_f">
                  <h6>Wrathcode Landing Protocol</h6>
                  <p>Borrow Low, Earn High</p>
                </div>
                <div className="cv_trade_img">
                  <img src="/images/logo_light.svg" alt="bitcoin" />

                </div>
              </div>
            </Slider>
          </div>
        </div> */}


      </div >

      <div className="modal fade search_form" id="phone_light" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered ">
          <div className="modal-content">
            <div className="modal-header">

              <h5 className="modal-title" id="exampleModalLabel">Edit Phone</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {signupBy === "phone" && <p>Signup method cannot be changed. Contact support for any modification in mobile number.</p>}

              <div className="profile_cnt_lightb">



                <div className="user_profile_pick">
                  {signupBy === "phone" ?
                    <form className="profile_form">

                      <div className="input_filed">
                        <label>Registered Phone</label><input type="text" value={`${countryCode} ${mobile}`} disabled />
                      </div>



                    </form>
                    :


                    <form className="profile_form">
                      {mobile &&
                        <div className="input_filed">
                          <label>Registered Phone</label>  <input type="text" value={`${countryCode} ${mobile}`} disabled />
                        </div>
                      }
                      <div className="input_filed">
                        <label>Country Code</label>
                        <div className="otp_s_in">
                          <select class="country-select" value={newCountryCode} onChange={(e) => setNewCountryCode(e.target.value)}>
                            <option value="+93">🇦🇫 Afghanistan (+93)</option>
                            <option value="+355">🇦🇱 Albania (+355)</option>
                            <option value="+213">🇩🇿 Algeria (+213)</option>
                            <option value="+1-684">🇦🇸 American Samoa (+1-684)</option>
                            <option value="+376">🇦🇩 Andorra (+376)</option>
                            <option value="+244">🇦🇴 Angola (+244)</option>
                            <option value="+1-264">🇦🇮 Anguilla (+1-264)</option>
                            <option value="+672">🇦🇶 Antarctica (+672)</option>
                            <option value="+1-268">🇦🇬 Antigua and Barbuda (+1-268)</option>
                            <option value="+54">🇦🇷 Argentina (+54)</option>
                            <option value="+374">🇦🇲 Armenia (+374)</option>
                            <option value="+297">🇦🇼 Aruba (+297)</option>
                            <option value="+61">🇦🇺 Australia (+61)</option>
                            <option value="+43">🇦🇹 Austria (+43)</option>
                            <option value="+994">🇦🇿 Azerbaijan (+994)</option>
                            <option value="+1-242">🇧🇸 Bahamas (+1-242)</option>
                            <option value="+973">🇧🇭 Bahrain (+973)</option>
                            <option value="+880">🇧🇩 Bangladesh (+880)</option>
                            <option value="+1-246">🇧🇧 Barbados (+1-246)</option>
                            <option value="+375">🇧🇾 Belarus (+375)</option>
                            <option value="+32">🇧🇪 Belgium (+32)</option>
                            <option value="+501">🇧🇿 Belize (+501)</option>
                            <option value="+229">🇧🇯 Benin (+229)</option>
                            <option value="+1-441">🇧🇲 Bermuda (+1-441)</option>
                            <option value="+975">🇧🇹 Bhutan (+975)</option>
                            <option value="+591">🇧🇴 Bolivia, Plurinational State of (+591)</option>
                            <option value="+387">🇧🇦 Bosnia and Herzegovina (+387)</option>
                            <option value="+267">🇧🇼 Botswana (+267)</option>
                            <option value="+55">🇧🇷 Brazil (+55)</option>
                            <option value="+673">🇧🇳 Brunei Darussalam (+673)</option>
                            <option value="+359">🇧🇬 Bulgaria (+359)</option>
                            <option value="+226">🇧🇫 Burkina Faso (+226)</option>
                            <option value="+257">🇧🇮 Burundi (+257)</option>
                            <option value="+238">🇨🇻 Cabo Verde (+238)</option>
                            <option value="+855">🇰🇭 Cambodia (+855)</option>
                            <option value="+237">🇨🇲 Cameroon (+237)</option>
                            <option value="+1">🇨🇦 Canada (+1)</option>
                            <option value="+236">🇨🇫 Central African Republic (+236)</option>
                            <option value="+235">🇹🇩 Chad (+235)</option>
                            <option value="+56">🇨🇱 Chile (+56)</option>
                            <option value="+86">🇨🇳 China (+86)</option>
                            <option value="+57">🇨🇴 Colombia (+57)</option>
                            <option value="+269">🇰🇲 Comoros (+269)</option>
                            <option value="+242">🇨🇬 Congo (+242)</option>
                            <option value="+243">🇨🇩 Congo, The Democratic Republic of the (+243)</option>
                            <option value="+506">🇨🇷 Costa Rica (+506)</option>
                            <option value="+385">🇭🇷 Croatia (+385)</option>
                            <option value="+53">🇨🇺 Cuba (+53)</option>
                            <option value="+357">🇨🇾 Cyprus (+357)</option>
                            <option value="+420">🇨🇿 Czechia (+420)</option>
                            <option value="+225">🇨🇮 Côte d'Ivoire (+225)</option>
                            <option value="+45">🇩🇰 Denmark (+45)</option>
                            <option value="+253">🇩🇯 Djibouti (+253)</option>
                            <option value="+1-767">🇩🇲 Dominica (+1-767)</option>
                            <option value="+1-809">🇩🇴 Dominican Republic (+1-809)</option>
                            <option value="+593">🇪🇨 Ecuador (+593)</option>
                            <option value="+20">🇪🇬 Egypt (+20)</option>
                            <option value="+503">🇸🇻 El Salvador (+503)</option>
                            <option value="+240">🇬🇶 Equatorial Guinea (+240)</option>
                            <option value="+291">🇪🇷 Eritrea (+291)</option>
                            <option value="+372">🇪🇪 Estonia (+372)</option>
                            <option value="+251">🇪🇹 Ethiopia (+251)</option>
                            <option value="+679">🇫🇯 Fiji (+679)</option>
                            <option value="+358">🇫🇮 Finland (+358)</option>
                            <option value="+33">🇫🇷 France (+33)</option>
                            <option value="+241">🇬🇦 Gabon (+241)</option>
                            <option value="+220">🇬🇲 Gambia (+220)</option>
                            <option value="+995">🇬🇪 Georgia (+995)</option>
                            <option value="+49">🇩🇪 Germany (+49)</option>
                            <option value="+233">🇬🇭 Ghana (+233)</option>
                            <option value="+30">🇬🇷 Greece (+30)</option>
                            <option value="+1-473">🇬🇩 Grenada (+1-473)</option>
                            <option value="+502">🇬🇹 Guatemala (+502)</option>
                            <option value="+224">🇬🇳 Guinea (+224)</option>
                            <option value="+245">🇬🇼 Guinea-Bissau (+245)</option>
                            <option value="+592">🇬🇾 Guyana (+592)</option>
                            <option value="+509">🇭🇹 Haiti (+509)</option>
                            <option value="+379">🇻🇦 Holy See (Vatican City State) (+379)</option>
                            <option value="+504">🇭🇳 Honduras (+504)</option>
                            <option value="+36">🇭🇺 Hungary (+36)</option>
                            <option value="+354">🇮🇸 Iceland (+354)</option>
                            <option value="+91" >🇮🇳 India (+91)</option>
                            <option value="+62">🇮🇩 Indonesia (+62)</option>
                            <option value="+98">🇮🇷 Iran, Islamic Republic of (+98)</option>
                            <option value="+964">🇮🇶 Iraq (+964)</option>
                            <option value="+353">🇮🇪 Ireland (+353)</option>
                            <option value="+972">🇮🇱 Israel (+972)</option>
                            <option value="+39">🇮🇹 Italy (+39)</option>
                            <option value="+1-876">🇯🇲 Jamaica (+1-876)</option>
                            <option value="+81">🇯🇵 Japan (+81)</option>
                            <option value="+962">🇯🇴 Jordan (+962)</option>
                            <option value="+7">🇰🇿 Kazakhstan (+7)</option>
                            <option value="+254">🇰🇪 Kenya (+254)</option>
                            <option value="+686">🇰🇮 Kiribati (+686)</option>
                            <option value="+850">🇰🇵 Korea, Democratic People's Republic of (+850)</option>
                            <option value="+82">🇰🇷 Korea, Republic of (+82)</option>
                            <option value="+965">🇰🇼 Kuwait (+965)</option>
                            <option value="+996">🇰🇬 Kyrgyzstan (+996)</option>
                            <option value="+856">🇱🇦 Lao People's Democratic Republic (+856)</option>
                            <option value="+371">🇱🇻 Latvia (+371)</option>
                            <option value="+961">🇱🇧 Lebanon (+961)</option>
                            <option value="+266">🇱🇸 Lesotho (+266)</option>
                            <option value="+231">🇱🇷 Liberia (+231)</option>
                            <option value="+218">🇱🇾 Libya (+218)</option>
                            <option value="+423">🇱🇮 Liechtenstein (+423)</option>
                            <option value="+370">🇱🇹 Lithuania (+370)</option>
                            <option value="+352">🇱🇺 Luxembourg (+352)</option>
                            <option value="+261">🇲🇬 Madagascar (+261)</option>
                            <option value="+265">🇲🇼 Malawi (+265)</option>
                            <option value="+60">🇲🇾 Malaysia (+60)</option>
                            <option value="+960">🇲🇻 Maldives (+960)</option>
                            <option value="+223">🇲🇱 Mali (+223)</option>
                            <option value="+356">🇲🇹 Malta (+356)</option>
                            <option value="+692">🇲🇭 Marshall Islands (+692)</option>
                            <option value="+222">🇲🇷 Mauritania (+222)</option>
                            <option value="+230">🇲🇺 Mauritius (+230)</option>
                            <option value="+52">🇲🇽 Mexico (+52)</option>
                            <option value="+691">🇫🇲 Micronesia, Federated States of (+691)</option>
                            <option value="+373">🇲🇩 Moldova, Republic of (+373)</option>
                            <option value="+377">🇲🇨 Monaco (+377)</option>
                            <option value="+976">🇲🇳 Mongolia (+976)</option>
                            <option value="+382">🇲🇪 Montenegro (+382)</option>
                            <option value="+212">🇲🇦 Morocco (+212)</option>
                            <option value="+258">🇲🇿 Mozambique (+258)</option>
                            <option value="+95">🇲🇲 Myanmar (+95)</option>
                            <option value="+264">🇳🇦 Namibia (+264)</option>
                            <option value="+674">🇳🇷 Nauru (+674)</option>
                            <option value="+977">🇳🇵 Nepal (+977)</option>
                            <option value="+31">🇳🇱 Netherlands (+31)</option>
                            <option value="+64">🇳🇿 New Zealand (+64)</option>
                            <option value="+505">🇳🇮 Nicaragua (+505)</option>
                            <option value="+227">🇳🇪 Niger (+227)</option>
                            <option value="+234">🇳🇬 Nigeria (+234)</option>
                            <option value="+47">🇳🇴 Norway (+47)</option>
                            <option value="+968">🇴🇲 Oman (+968)</option>
                            <option value="+92">🇵🇰 Pakistan (+92)</option>
                            <option value="+680">🇵🇼 Palau (+680)</option>
                            <option value="+507">🇵🇦 Panama (+507)</option>
                            <option value="+675">🇵🇬 Papua New Guinea (+675)</option>
                            <option value="+595">🇵🇾 Paraguay (+595)</option>
                            <option value="+51">🇵🇪 Peru (+51)</option>
                            <option value="+63">🇵🇭 Philippines (+63)</option>
                            <option value="+48">🇵🇱 Poland (+48)</option>
                            <option value="+351">🇵🇹 Portugal (+351)</option>
                            <option value="+974">🇶🇦 Qatar (+974)</option>
                            <option value="+40">🇷🇴 Romania (+40)</option>
                            <option value="+7">🇷🇺 Russian Federation (+7)</option>
                            <option value="+250">🇷🇼 Rwanda (+250)</option>
                            <option value="+1-869">🇰🇳 Saint Kitts and Nevis (+1-869)</option>
                            <option value="+1-758">🇱🇨 Saint Lucia (+1-758)</option>
                            <option value="+1-784">🇻🇨 Saint Vincent and the Grenadines (+1-784)</option>
                            <option value="+685">🇼🇸 Samoa (+685)</option>
                            <option value="+378">🇸🇲 San Marino (+378)</option>
                            <option value="+239">🇸🇹 Sao Tome and Principe (+239)</option>
                            <option value="+966">🇸🇦 Saudi Arabia (+966)</option>
                            <option value="+221">🇸🇳 Senegal (+221)</option>
                            <option value="+381">🇷🇸 Serbia (+381)</option>
                            <option value="+248">🇸🇨 Seychelles (+248)</option>
                            <option value="+232">🇸🇱 Sierra Leone (+232)</option>
                            <option value="+65">🇸🇬 Singapore (+65)</option>
                            <option value="+421">🇸🇰 Slovakia (+421)</option>
                            <option value="+386">🇸🇮 Slovenia (+386)</option>
                            <option value="+677">🇸🇧 Solomon Islands (+677)</option>
                            <option value="+252">🇸🇴 Somalia (+252)</option>
                            <option value="+27">🇿🇦 South Africa (+27)</option>
                            <option value="+211">🇸🇸 South Sudan (+211)</option>
                            <option value="+34">🇪🇸 Spain (+34)</option>
                            <option value="+94">🇱🇰 Sri Lanka (+94)</option>
                            <option value="+249">🇸🇩 Sudan (+249)</option>
                            <option value="+597">🇸🇷 Suriname (+597)</option>
                            <option value="+46">🇸🇪 Sweden (+46)</option>
                            <option value="+41">🇨🇭 Switzerland (+41)</option>
                            <option value="+963">🇸🇾 Syrian Arab Republic (+963)</option>
                            <option value="+886">🇹🇼 Taiwan, Province of China (+886)</option>
                            <option value="+992">🇹🇯 Tajikistan (+992)</option>
                            <option value="+255">🇹🇿 Tanzania, United Republic of (+255)</option>
                            <option value="+66">🇹🇭 Thailand (+66)</option>
                            <option value="+670">🇹🇱 Timor-Leste (+670)</option>
                            <option value="+228">🇹🇬 Togo (+228)</option>
                            <option value="+676">🇹🇴 Tonga (+676)</option>
                            <option value="+1-868">🇹🇹 Trinidad and Tobago (+1-868)</option>
                            <option value="+216">🇹🇳 Tunisia (+216)</option>
                            <option value="+90">🇹🇷 Turkey (+90)</option>
                            <option value="+993">🇹🇲 Turkmenistan (+993)</option>
                            <option value="+256">🇺🇬 Uganda (+256)</option>
                            <option value="+380">🇺🇦 Ukraine (+380)</option>
                            <option value="+971">🇦🇪 United Arab Emirates (+971)</option>
                            <option value="+44">🇬🇧 United Kingdom (+44)</option>
                            <option value="+1">🇺🇸 United States (+1)</option>
                            <option value="+598">🇺🇾 Uruguay (+598)</option>
                            <option value="+998">🇺🇿 Uzbekistan (+998)</option>
                            <option value="+678">🇻🇺 Vanuatu (+678)</option>
                            <option value="+58">🇻🇪 Venezuela, Bolivarian Republic of (+58)</option>
                            <option value="+84">🇻🇳 Viet Nam (+84)</option>
                            <option value="+967">🇾🇪 Yemen (+967)</option>
                            <option value="+260">🇿🇲 Zambia (+260)</option>
                            <option value="+263">🇿🇼 Zimbabwe (+263)</option>
                          </select>


                        </div>
                      </div>
                      <div className="input_filed">
                        <label>New Phone</label>


                        <div className="otp_s_in">

                          <input type="email" placeholder="Enter phone number here..." onChange={(e) => setNewPhone(e.target.value)} value={newPhone} />
                          <button type="button" onClick={() => handleGetOtp(`${countryCode} ${newPhone}`, "registration", "phone")} disabled={disableBtn2}>{disableBtn2 ? `Resend OTP (${timer2}s)` : "GET OTP"}</button>

                        </div>
                      </div>
                      <div className="input_filed">

                        <label>OTP</label><input type="number" onWheel={(e) => e.target.blur()} onChange={(e) => setMobileOtp(e.target.value)} value={mobileOtp} placeholder="Enter OTP here..." />

                      </div>


                      <input type="button" value="Submit" data-bs-dismiss="modal" onClick={editPhone} disabled={!newPhone || !mobileOtp} />



                    </form>


                  }
                </div>

              </div>

            </div>

          </div>


        </div>
      </div>


    </>
  );
};

export default SettingsPage;
