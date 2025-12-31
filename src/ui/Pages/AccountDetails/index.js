import React, { useState, useEffect } from "react";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import { alertErrorMessage, alertSuccessMessage } from "../../../customComponents/CustomAlertMessage";
import AuthService from "../../../api/services/AuthService";
import { $ } from "react-jquery-plugin";
import DefaultInput from "../../../customComponents/DefaultInput";
import { validAccountno, validIfscCode } from "../../../utils/Validation";

const AccountDetails = (props) => {

  const [bankDetails, setBankDetails] = useState([])
  const [bankName, setBankName] = useState('')
  const [holderName, setHolderName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ifsCode, setIfscCode] = useState('')
  const [branchAddress, setBranchAddress] = useState('')
  const [accountType, setAccountType] = useState('')
  const [passbookImage, setPassbookImage] = useState('')

  const handleChangePassbookImage = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      const maxSize = 2 * 1024 * 1024; // 5MB
      if (allowedTypes.includes(file.type) && file.size <= maxSize) {
        setPassbookImage(file);
        alertSuccessMessage(file?.name)
      } else {
        if (!allowedTypes.includes(file.type)) {
          alertErrorMessage("Only PNG, JPEG, and JPG file types are allowed.");
        } else {
          alertErrorMessage("Max image size is 2MB.");
        }
      }
    }
  };



  useEffect(() => {
    handleBankDetails();
  }, []);

  const handleBankDetails = async () => {
    LoaderHelper.loaderStatus(true);
    await AuthService.getUserBankDetails().then(async result => {
      LoaderHelper.loaderStatus(false);
      if (result?.success) {
        try {
          setBankDetails(result?.data?.data.reverse());
          setBankName(result?.data?.data[0]?.bank_name)
          setHolderName(result?.data?.data[0]?.account_holder_name)
          setAccountNumber(result?.data?.data[0]?.account_number)
          setIfscCode(result?.data?.data[0]?.ifsc_code)
          setBranchAddress(result?.data?.data[0]?.branch_name)
          setAccountType(result?.data?.data[0]?.account_type)
          setPassbookImage(result?.data?.data[0]?.passbook_picture)
        } catch (error) {
          alertErrorMessage(error);
        }
      } else {
        alertErrorMessage(result?.message);
      }
    });
  };


  const handleUpdateBankDetails = async (accountType, bankName, holderName, accountNumber, ifsCode, branchAddress) => {
    var formData = new FormData();
    formData.append("account_type", accountType);
    formData.append("bank_name", bankName);
    formData.append("account_holder_name", holderName);
    formData.append("account_number", accountNumber);
    formData.append("ifsc_code", ifsCode);
    formData.append("branch_name", branchAddress);
    LoaderHelper.loaderStatus(true);
    await AuthService.editBankDetails(formData).then(async (result) => {
      if (result?.success) {
        LoaderHelper.loaderStatus(false);
        try {
          alertSuccessMessage(result?.message)
          $("#add_edit_bank").modal('hide');
          handleBankDetails();
        } catch (error) {
          alertErrorMessage(result?.message);
        }
      } else {
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result?.message);
      }
    });
  };


  return (
    <>
      <div className="tab-pane" id="AuthencationPill" role="tabpanel" aria-labelledby="Authencation-pill">
        <div className="upload-formate mb-6 d-flex justify-content-between align-items-center">
          <div className="">
            <h4 className="mb-2">Payment Options</h4>
            <p className="formate"> Select your payment options for all transactions. </p>
          </div>
          <button className="btn custom-btn" data-bs-toggle="modal" data-bs-target="#add_edit_bank" type="button">
            {bankDetails[0]?.verified == 0 ?
              <span>Edit Bank Account</span>
              :
              <span>Add Bank Account</span>
            }
          </button>
        </div>
      </div>
      <div className="form-field-wrapper bank-acc mb-3 ">
        <div className="acc_details">
          <div className="row justify-content-center">
            <div className="col-md-12">
              {bankDetails[0]?.verified == 2 ?
                <h6 className="ba_status badge-success badge mb-3 px-3 mb-md-5">Bank Details Verified</h6>
                :
                <h6 className="ba_status badge-danger badge mb-3 px-3 mb-md-5">Bank Details Not Verified</h6>
              }
            </div>
            <div className=" col-6">
              <h5 className="text-start">
                <small>Bank Name</small>
                <br />{bankDetails[0]?.bank_name}
              </h5>
            </div>
            <div className=" col-6">
              <h5 className="text-start">
                <small>Account Holder Name</small>
                <br />{bankDetails[0]?.account_holder_name}
              </h5>
            </div>
            <div className=" col-6">
              <h5 className="text-start">
                <small>Account Type</small>
                <br />{bankDetails[0]?.account_type}
              </h5>
            </div>
            <div className="col-6" >
              <h5 className="text-start">
                <small>Account Number</small>
                <br />{bankDetails[0]?.account_number}
              </h5>
            </div>
            <div className=" col-6">
              <h5 className="text-start">
                <small>IFSC Code</small>
                <br />{bankDetails[0]?.ifsc_code}
              </h5>
            </div>
            <div className=" col-6">
              <h5 className="text-start">
                <small>Branch Name</small>
                <br />{bankDetails[0]?.branch_name}
              </h5>
            </div>
            {/* <div className="col-md-6">
              <div className="image-container">
                <img src={!passbookImage ? "images/banbook.png" : `${ApiConfig.baseUrl}${passbookImage}`} className="img-fluid passbook_img" />
                {passbookImage ?
                  <a href={`${ApiConfig.baseUrl}${passbookImage}`} download="passbook.jpg" className="download-button" target="_blank">
                    Download
                  </a>
                  :
                  ''
                }
              </div>
            </div> */}
          </div>
        </div>
      </div>

      <div className="modal fade" id="add_edit_bank" tabIndex="-1" role="dialog" aria-labelledby="add_edit_bankLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <form className="modal-content">
            <div className="modal-header flex-column px-8">
              <h3 className="modal-title" id="add_edit_bankLaebl">
                {bankDetails?.verified == 0 ?
                  <span>Edit Bank Account</span>
                  :
                  <span>Add Bank Account</span>
                }
              </h3>
              <button type="button" className="btn-custom-closer" data-bs-dismiss="modal" aria-label="Close"><i
                className="ri-close-fill"></i></button>
            </div>
            <div className="modal-body conin_purchase">
              <div className="row" >
                <div className="form-group mb-4 col-lg-12">
                  {/* <label for="royality" className="form-label">Select Bank Type</label> */}
                  <select id="royality" name="accountType" className="form-select form-control" value={accountType} onChange={(e) => setAccountType(e.target.value)} defaultValue={accountType} style={{ color: "white", backgroundColor: "#0f051d" }} >
                    <option style={{ color: "white" }}>Select Account Type</option>
                    <option style={{ color: "white" }} value="SAVING">Saving Account</option>
                    <option style={{ color: "white" }} value="CURRENT">Current Account</option>
                    <option style={{ color: "white" }} value="FIXED DEPOSIT">Fixed Deposit account</option>
                  </select>
                </div>
                <div className="form-group mb-4 col-lg-6 ">
                  <label for="bit"> Bank Name </label>
                  <input type="text" className="form-control" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                </div>
                <div className="form-group mb-4 col-lg-6">
                  <label for="bit"> Account Holder Name </label>
                  <input type="text" className="form-control" value={holderName} onChange={(e) => setHolderName(e.target.value)} />
                </div>
                <div className="form-group mb-4 col-lg-6">
                  <label for="bit"> Account Number</label>
                  <DefaultInput errorstatus={validAccountno(accountNumber)} errormessage={validAccountno(accountNumber)} type="tel" className="form-control noSpin" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                </div>
                <div className="form-group mb-4 col-lg-6">
                  <label for="bit"> IFSC Code </label>
                  <DefaultInput errorstatus={validIfscCode(ifsCode)} errormessage={validIfscCode(ifsCode)}
                    className="form-control" type="text" value={ifsCode} onChange={(e) => setIfscCode(e.target.value)} />
                </div>
                <div className="form-group mb-4 col-lg-12">
                  <label>Branch Address</label>
                  <input type="text" className="form-control" value={branchAddress} onChange={(e) => setBranchAddress(e.target.value)} />
                </div>
                {/* <div className="form-group mb-4 col-lg-6">
                  <label>Passbook Image</label>
                  <input type="file" className="form-control" onChange={handleChangePassbookImage} />
                </div> */}
              </div>
            </div>
            <div className="modal-footer px-8">
              <button type="button" className="btn custom-btn btn-block btn-xl w-100" disabled={accountType == "undefined" || !bankName || !holderName || !accountNumber || !ifsCode || !branchAddress} onClick={() => handleUpdateBankDetails(accountType, bankName, holderName, accountNumber, ifsCode, branchAddress)}><span>Submit</span></button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AccountDetails;
