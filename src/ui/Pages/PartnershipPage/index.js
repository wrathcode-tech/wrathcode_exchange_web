import React, { useEffect, useState } from "react";
import QRCode from 'qrcode.react';
import AuthService from "../../../api/services/AuthService";
import { alertErrorMessage, alertSuccessMessage } from "../../../customComponents/CustomAlertMessage";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import codes from 'country-calling-code';
import { Helmet } from "react-helmet-async";
const PartnershipPage = () => {

  const [step, setStep] = useState("1");
  const [transactionId, setTransactionId] = useState("");
  const [transtionImage, setTranstionImage] = useState("");
  const [transtionImagePath, setTranstionImagePath] = useState("");
  const [name, setName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [partnershipID, setPartnershipID] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("India (+91)");
  const [referredBy, setReferredBy] = useState("");
  const [referredUserName, setReferredUserName] = useState("");
  const [loader, setLoader] = useState(false);
  const [showPass, setshowPass] = useState(false);


  const changeTransactionImg = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (allowedTypes.includes(file.type) && file.size <= maxSize) {
        const imgData = URL.createObjectURL(file);
        setTranstionImage(imgData);
        setTranstionImagePath(file);
      } else {
        if (!allowedTypes.includes(file.type)) {
          alertErrorMessage("Only PNG, JPEG, and JPG file types are allowed.");
        } else {
          alertErrorMessage("Max image size is 5MB.");
        }
      }
    }
  };

  const handlePartnershipDetails = async (transactionId, transtionImagePath, name, emailAddress, contactNumber, countryCode, password, referredBy) => {
    if (referredBy && !referredUserName) {
      alertErrorMessage('Invalid Referred User ID');
      return;
    }
    if (!transactionId) {
      alertErrorMessage('Please Enter Transaction ID');
      return;
    } if (!transtionImagePath) {
      alertErrorMessage('Please Upload Transaction Image');
      return;
    } if (!name) {
      alertErrorMessage('Please Enter Full Name');
      return;
    } if (!countryCode) {
      alertErrorMessage('Please Enter Country Name');
      return;
    } if (!contactNumber) {
      alertErrorMessage('Please Enter Contact Number');
      return;
    } if (!emailAddress) {
      alertErrorMessage('Please Enter Email Address');
      return;
    } if (!password) {
      alertErrorMessage('Please Enter Telegram ID');
      return;
    }


    var formData = new FormData();
    formData.append("transactionId", transactionId);
    formData.append("transactionImage", transtionImagePath);
    formData.append("userName", name);
    formData.append("country_code", countryCode);
    formData.append("email", emailAddress);
    formData.append("phoneNumber", contactNumber)
    formData.append("password", password)
    formData.append("reffered_by", referredBy)
    LoaderHelper.loaderStatus(true);
    await AuthService.addPartnerShipDetails(formData).then(async (result) => {
      if (result?.success) {
        LoaderHelper.loaderStatus(false);
        try {
          alertSuccessMessage(result?.message);
          handleResetInput();
          setStep("3");
          setPartnershipID(result?.PartnershipID)
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
    setTransactionId("");
    setTranstionImage("");
    setName("");
    setCountryCode("");
    setEmailAddress("");
    setContactNumber("");
    setPassword("");
    setReferredBy("");
    setReferredUserName("");
  };

  const qrCodeStyle = {
    height: '250px',
    width: '250px'
  };
  const copyCode = () => {
    navigator.clipboard
      .writeText("0xB910Bad41142206bf699942057d7E9364CF6A80c")
      .then(() => {
        alertSuccessMessage("Copied!!");
      })
      .catch(() => {
        alertErrorMessage("Something went wrong");
      });
  };

  const getReferredUserData = async () => {
    try {
      setLoader(true)
      const result = await AuthService.getPartnerName(referredBy)
      if (result?.status) {
        setReferredUserName(result?.name)
      } else {
        setReferredUserName("")
      }
    } catch (error) {
      setReferredUserName("")
      alertErrorMessage(error?.message)
    }
    finally { setLoader(false) }
  }

  useEffect(() => {
    if (referredBy) {
      getReferredUserData()
    }

  }, [referredBy]);

  return (
    <>
      <Helmet>
        <title> Wrathcode | The world class new generation crypto asset exchange</title>
      </Helmet>      <div className="partner_page" >
        <section className="p_sec  " >
          <div className="community_sec">
            <div className="container">
              <div className="card">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-lg-6">
                      <div className="section-title mb-0 text-start pb-0 no-border">
                        <h1 className=""> Become our partner  </h1>
                        <p className="  ">
                          Welcome to Wrathcode, where we believe in sharing the wealth! Our Exchange Profit Share program
                          is designed to provide you with the opportunity to earn a share of the profits generated on our
                          platform. We value
                          your partnership and want to ensure that you benefit from the success you help us achieve.
                        </p>

                        {/* <a href="#" className="btn custom-btn px-md-5 mt-3" data-bs-toggle="modal" data-bs-target="#SellConfirm" > Become our partner </a> */}
                        <a href="https://partner.Wrathcode.com/" target="_blank" className="btn custom-btn custom-border-btn custom-border-btn-white px-md-5 mt-3 ms-3" > Login as Partner </a>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <img src="/images/parnter_img.svg" alt="" className=" mx-auto img-fluid joc_img" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="ep_sec section-padding" >
          <div className="container" >
            <div className="row align-items-center gx-md-5" >
              <div className="col-lg-6" >
                <img src="/images/profile_sharer.svg" alt="" className=" mx-auto img-fluid" />
              </div>
              <div className="col-lg-6" >
                <div className="section-title text-start mb-0" >
                  <h2 className="mb-3"> What is Exchange <br /> Profit Share? </h2>
                  <p >
                    Exchange Profit Share is a unique initiative that rewards our loyal users
                    and traders for their commitment to our platform. We believe that when we
                    succeed, our users should share in that success.
                    This program allows you to earn a percentage of the profits generated from trading activities on our exchange.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        <section className="os_sec " >
          <div className="container">
            <div className="section-title  text-center " >
              <h3 className="mb-3"> Revenue Model  </h3>
              <p >
                Wrathcode revenue will come from the following sources:
              </p>
            </div>
            <div className="row justify-content-center g-3 mobile_row_scroll ">
              <div className="col-xxl-8 col-xl-10 ">
                <div className="table-responsive" >
                  <table className="table table-bordered ">
                    <tbody>
                      <tr>
                        <td  >Exchange Fee</td>
                        <td>Wrathcode initially will charge a 0.1% fixed fee per trade. Other variations will be subsequently introduced, including maker-taker, volumed based tiering and 0 fee promotions. We have no plan to charge above 0.1%</td>
                      </tr>
                      <tr>
                        <td>  Withdrawal Fee </td>
                        <td> Wrathcode may charge a small fee for withdrawals.</td>
                      </tr>
                      <tr>
                        <td>  Listing Fee  </td>
                        <td> Wrathcode will select innovative coins and other assets to be listed on the exchange, there may be a fee associated with those listings.</td>
                      </tr>
                      <tr>
                        <td>  Margin Fee  </td>
                        <td>If you trade on margin, there may be a fee or interest on the borrowed amount. </td>
                      </tr>
                      <tr>
                        <td>  Other Fees </td>
                        <td>Other Fees </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>



        <section className="os_sec " >
          <div className="container">
            <div className="section-title  text-center " >
              <h2 className="mb-3"> Advantages of Exchange Profit Share  </h2>
            </div>
            <div className="row justify-content-center g-3 mobile_row_scroll ">
              <div className="col-xxl-4 col-xl-4 col-lg-4 ">
                <div className="card fe_body h-100">
                  <div className="card-body">
                    <img src="/images/passive_img.webp" width="100" className="img-fluid" />
                    <h5>	Passive Income  </h5>
                    <p className="mb-0">
                      Enjoy a source of passive income by participating in our program.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-xxl-4 col-xl-4 col-lg-4 ">
                <div className="card fe_body h-100">
                  <div className="card-body">
                    <img src="/images/risk-management.webp" width="100" className="img-fluid" />
                    <h5>	Risk Mitigation    </h5>
                    <p className="mb-0">
                      Offset your trading risks by sharing in the exchange's success
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-xxl-4 col-xl-4 col-lg-4 ">
                <div className="card fe_body h-100">
                  <div className="card-body">
                    <img src="/images/community.webp" width="100" className="img-fluid" />
                    <h5>		Community Building    </h5>
                    <p className="mb-0">
                      We value a strong community and consider our users as partners in our journey.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        <section className="os_sec " >
          <div className="container">
            <h3 className=" " >Payouts</h3>
            <div className="col-cards" >
              <div className="row g-md-5 ">
                <div className="col-6">
                  <div className="card" >
                    <div className="card-body" ><i className="ri-checkbox-multiple-line"></i>
                      <p>	Earnings are calculated periodically, and payouts are made directly to your account.</p>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card" >
                    <div className="card-body" ><i className="ri-checkbox-multiple-line"></i>
                      <p>	You can choose to reinvest your earnings or withdraw them as per your preference. </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="st_sec " >
          <div className="container">
            <div className="card" >
              <div className="card-body" >
                <div className="row  align-items-center">
                  <div className="col-md-6 col-lg-7">
                    <div className="st_card" >
                      <h2 className="" >
                        Join the Exchange Profit Share Program Today
                      </h2>
                      <h5 className="h6" >Ready to start earning a share of the profits? </h5>
                      <p>
                        Join our Exchange Profit Share program today
                        and become a part of our success story. Your success is our success!.
                        We will distribute the profit from  <b className="text-gradient " >49%</b> from the total profit to all the partners
                        and the rest <b className="text-gradient " >51%</b> will company profit.
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6  col-lg-5">
                    <img src="https://cdn3d.iconscout.com/3d/premium/thumb/stock-market-growth-8656380-6925697.png?f=webp" className="img-fluid" alt="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>



      {/* form modal  */}

      <div className="modal p_modal  fade" id="SellConfirm" tabIndex="-1" aria-labelledby="SellConfirmLabel" aria-hidden="true">
        <div className="modal-dialog modal-md">
          <div className="modal-content">
            <div className="modal-header">

              <h5 className="modal-title" id="SellConfirmLabel">


                {step === '2' ?
                  <button className="btn btn-link" onClick={() => setStep("1")}>  <i className="ri-arrow-left-line"></i> </button>
                  :
                  ""
                }







                Partner with us </h5>
              {step === '3' ? '' :
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" ></button>
              }
            </div>
            <div className="modal-body">

              {/* step 1 */}
              <div className={`step_1 text-center${step === '1' ? '' : ' d-none'}`}>
                <h4>
                  Deposit $1500  & Become a Partner.
                </h4>

                <div className="bg-white img-fluid qr_img qr_xl p-1  p-md-4  " >
                  <QRCode value="0xB910Bad41142206bf699942057d7E9364CF6A80c" className=" img-fluid Canvas" style={qrCodeStyle} />

                </div>
                <div className=" field-otp-box" >
                  <input readOnly name="text" className="form-control cursor-pointer" type="text" value="0xB910Bad41142206bf699942057d7E9364CF6A80c" style={{ fontSize: "0.9rem" }} onClick={() => copyCode()} />
                  <button type="button" className="btn btn-xs  custom-btn" onClick={() => copyCode()}>Copy</button>
                </div>
                <h5 className="mb-0" >BEP-20 USDT</h5>
                <p className="mb-0   badge-danger_light d-block " >  Send only (BEP-20 USDT) to this address. Sending any other coins may result in payment loss. </p>
                <br />
                <button type="button" className="btn custom-btn  px-5" onClick={() => setStep("2")}> Pay, & Next </button>
              </div>


              {/* step 2 */}
              <div className={`step_2 ${step === '2' ? '' : ' d-none'}`} >
                <form>

                  <div className="form-group  mb-3">
                    <label>Transaction Hash  </label>
                    <input type="text" className="form-control" placeholder="Enter your Transaction Hash " value={transactionId} onChange={(event) => setTransactionId(event.target.value)} />
                  </div>
                  <div className="form-group  mb-3">
                    <label>Upload Transaction Image  </label>
                    <div className="img-prev mb-0">
                      <div className="avatar-preview">
                        <img src={transtionImage || 'images/blank_img.png'} alt="" className="img-fluid" />
                      </div>
                      <div className="avatar-edit">
                        <input type="file" id="imageUpload" name="myfile" onChange={changeTransactionImg} />
                        <label for="imageUpload"><i className="ri-upload-cloud-2-line me-2"></i> Upload Photo</label>
                        <small> Click button to upload photo </small>
                      </div>
                    </div>
                  </div>
                  <div className="form-group  mb-3">
                    <label> Full Name  </label>
                    <input className="form-control" placeholder="Enter Name" value={name} onChange={(event) => setName(event.target.value)} />
                  </div>
                  <div className="row gx-1" >

                    <div className="col-12" >
                      <label> Phone Number  </label>
                    </div>
                    <div className="col-lg-5 col-md-12 col-12">
                      <select name="countryCode" className="form-control" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                        {codes.map((country, index) => (
                          <option key={index} value={`${country.country} (+${country.countryCodes[0]})`}>
                            {country.country} (+{country.countryCodes[0]})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-lg-7 col-md-12 col-12">
                      <div className="form-group  mb-3">

                        <input className="form-control" placeholder="Enter Number" value={contactNumber} onChange={(event) => setContactNumber(event.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="form-group  mb-3">
                    <label> Email  </label>
                    <input className="form-control" placeholder="Enter Email Address" value={emailAddress} onChange={(event) => setEmailAddress(event.target.value)} />
                  </div>

                  <div className="col-lg-12 col-md-12 col-12 mb-3">
                    <label> Password </label>
                    <div className=" field-otp-box">
                      <input type={showPass ? 'text' : "password"} name="password" id="password" className="form-control" placeholder="Enter New Password" value={password} onChange={(event) => setPassword(event.target.value)} />
                      <button type="button" className="btn btn-icon btn_view_pass btn-white" onClick={() => { setshowPass(!showPass) }}>
                        <i className={`ri-eye${showPass ? "-line" : "-off-line"}`} />
                      </button>
                    </div>
                  </div>

                  <div className="col-lg-12 col-md-12 col-12 mb-3">
                    <label> Referred By (Optional) </label>
                    <input type='text' name="reffered" id="password" className="form-control" placeholder="Enter Referral ID" value={referredBy} onChange={(event) => setReferredBy(event.target.value)} />
                  </div>
                  <div className="col-lg-12 col-md-12 col-12 mb-3">
                    <span>
                      {loader ? <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div> : referredUserName ? <input type='text' disabled className="form-control" value={referredUserName} /> : ""}</span>
                  </div>

                  <div className="form-group text-center">
                    <button type="button" className="btn custom-btn px-5" onClick={() => handlePartnershipDetails(transactionId, transtionImagePath, name, emailAddress, contactNumber, countryCode, password, referredBy)}> Submit </button>
                  </div>
                </form>
              </div>



              {/* step 3 */}
              <div className={`step_3 p-3 mb-4 ${step === '3' ? '' : ' d-none'}`}>
                <div className="s_data text-center" >
                  <img src="https://cdn3d.iconscout.com/3d/premium/thumb/success-9146253-7451277.png?f=webp" width="160" className="img-fluid mx-auto mb-3" alt="" />
                  <h4>
                    Congrats
                  </h4>
                  <p>Thrilled to welcome you as a partner! Let's combine strengths, unlock growth, and achieve more together.</p>
                  <span className="p_id" >
                    Partnership ID-{partnershipID}
                  </span>
                </div>
                <div className="form-group text-center">
                  <button type="button" className="btn custom-btn px-5 mt-4" onClick={() => setStep("1")}> OK </button>
                </div>
              </div>



            </div>
          </div>
        </div>
      </div>

    </>
  );
}

export default PartnershipPage;
