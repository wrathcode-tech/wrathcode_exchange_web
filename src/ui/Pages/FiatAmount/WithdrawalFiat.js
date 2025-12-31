import React from 'react'
import { ApiConfig } from '../../../api/apiConfig/apiConfig';
import moment from 'moment';

function WithdrawalFiat() {
    return (
        <div className='dashboard_right'>

            <div className='withdrawal_rightside'>
                <button data-bs-toggle="modal" data-bs-target="#bankform_info_d">Add Bank</button>
            </div>
            {/* <!-- Modal Profile Email --> */}
            <div className="modal fade search_form bankpop_up_d" id="bankform_info_d" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered ">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            <ul className="nav nav-tabs" id="myTab" role="tablist">
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">Add Bank</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">Bank Details</button>
                                </li>
                            </ul>
                        </div>
                        <div className="modal-body px-8 py-4">
                            <div className="tab-content" id="myTabContent">
                                <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                                    <form>
                                        <div className="form-group mb-4 "><label for="bit"> Bank Name </label><input type="text" id="bit" name="bankName" value="" /></div>
                                        <div className="form-group mb-4"><label for="bit"> Account Holder Name </label><input type="text" name="holderName" value="" /></div>
                                        <div className="form-group mb-4"><label for="bit"> Account Number</label><input id="bit" name="accountNumber" type="number" value="" /></div>
                                        <div className="form-group mb-4"><label for="bit"> SWIFT Code/IFSC Code </label><input id="bit" name="ifscCode" type="text" value="" /></div>
                                        <div className="form-group mb-4"><label>Branch Address</label><input type="text" name="branchAddress" value="" /></div>
                                    </form>
                                    <button type="button" className="addbankbtn btn btn-gradient btn-small w-100 justify-content-center"><span>Add Bank</span></button>
                                </div>
                                <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                                    <form className='bankdetail_tabs'>
                                        <div className='row'>
                                            <div className='deletebtn'>
                                                <button>Delete</button>
                                            </div>

                                            <div className='col-sm-6'>
                                                <div className="form-group mb-4 "><label for="bit"> Bank Name </label><input type="text" id="bit" name="bankName" value="" /></div>
                                            </div>
                                            <div className='col-sm-6'>
                                                <div className="form-group mb-4"><label for="bit"> Account Holder Name </label><input type="text" name="holderName" value="" /></div>
                                            </div>
                                            <div className='col-sm-6'>
                                                <div className="form-group mb-4"><label for="bit"> Account Number</label><input id="bit" name="accountNumber" type="number" value="" /></div>
                                            </div>
                                            <div className='col-sm-6'>
                                                <div className="form-group mb-4"><label for="bit"> SWIFT Code/IFSC Code </label><input id="bit" name="ifscCode" type="text" value="" /></div>
                                            </div>
                                            <div className='col-sm-6'>
                                                <div className="form-group mb-4"><label for="bit"> Account Number</label><input id="bit" name="accountNumber" type="number" value="" /></div>
                                            </div>
                                            <div className='col-sm-6'>
                                                <div className="form-group mb-4"><label>Branch Address</label><input type="text" name="branchAddress" value="" /></div>
                                            </div>
                                        </div>
                                        <div className='row'>
                                            <div className='deletebtn'>
                                                <button>Delete</button>
                                            </div>
                                            <div className='col-sm-6'>
                                                <div className="form-group mb-4 "><label for="bit"> Bank Name </label><input type="text" id="bit" name="bankName" value="" /></div>
                                            </div>
                                            <div className='col-sm-6'>
                                                <div className="form-group mb-4"><label for="bit"> Account Holder Name </label><input type="text" name="holderName" value="" /></div>
                                            </div>
                                            <div className='col-sm-6'>
                                                <div className="form-group mb-4"><label for="bit"> Account Number</label><input id="bit" name="accountNumber" type="number" value="" /></div>
                                            </div>
                                            <div className='col-sm-6'>
                                                <div className="form-group mb-4"><label for="bit"> SWIFT Code/IFSC Code </label><input id="bit" name="ifscCode" type="text" value="" /></div>
                                            </div>
                                            <div className='col-sm-6'>
                                                <div className="form-group mb-4"><label for="bit"> Account Number</label><input id="bit" name="accountNumber" type="number" value="" /></div>
                                            </div>
                                            <div className='col-sm-6'>
                                                <div className="form-group mb-4"><label>Branch Address</label><input type="text" name="branchAddress" value="" /></div>
                                            </div>
                                        </div>
                                        <div className='row'>
                                            <div className='deletebtn'>
                                                <button>Delete</button>
                                            </div>
                                            <div className='col-sm-6'>
                                                <div className="form-group mb-4 "><label for="bit"> Bank Name </label><input type="text" id="bit" name="bankName" value="" /></div>
                                            </div>
                                            <div className='col-sm-6'>
                                                <div className="form-group mb-4"><label for="bit"> Account Holder Name </label><input type="text" name="holderName" value="" /></div>
                                            </div>
                                            <div className='col-sm-6'>
                                                <div className="form-group mb-4"><label for="bit"> Account Number</label><input id="bit" name="accountNumber" type="number" value="" /></div>
                                            </div>
                                            <div className='col-sm-6'>
                                                <div className="form-group mb-4"><label for="bit"> SWIFT Code/IFSC Code </label><input id="bit" name="ifscCode" type="text" value="" /></div>
                                            </div>
                                            <div className='col-sm-6'>
                                                <div className="form-group mb-4"><label for="bit"> Account Number</label><input id="bit" name="accountNumber" type="number" value="" /></div>
                                            </div>
                                            <div className='col-sm-6'>
                                                <div className="form-group mb-4"><label>Branch Address</label><input type="text" name="branchAddress" value="" /></div>
                                            </div>
                                        </div>
                                        <button type="button" className="addbankbtn btn btn-gradient btn-small w-100 justify-content-center"><span>Submit</span></button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='dashboard_deposit_s'>
                <h1>Withdraw Funds</h1>
                <form action="#">
                    <div className='select_option_bank'>
                        <h6 className="flex_amount"> Bank Account Details</h6>
                        <select className='select_option'>
                            <option>ICICI Bank</option>
                            <option>HDFC Bank</option>
                        </select>
                    </div>
                    <div className="flex_amount mb-3">
                        <div className="d-flex   tt_item"><strong>Bank Name :</strong> ICICI Bank Limited</div>
                        <div className="d-flex  tt_item"><strong>Account Holder Name :</strong> FIXED INCOME Platforms</div>
                        <div className=" d-flex  tt_item"><strong>Bank Account Number : </strong>  118505004367</div>
                        <div className=" d-flex  tt_item"><strong>Branch Name :</strong>  Rajahmundry Branch</div>
                        <div className=" d-flex  tt_item"><strong>SWIFT Code/IFSC Code :</strong>  ICIC0001185</div>
                    </div>
                    <div className="form-group mb-2"><input type="text" placeholder="Enter Amount" value="" /></div>
                    <label className='balance'>Balance: 12345</label>
                    <div className="field-box field-otp-box  mb-4">
                        <input type="number" name="wallet_Add" placeholder="Enter OTP" value="" />
                        <button type="button" className="btn btn-sm otpinput">
                            <span> Get OTP</span>
                        </button>
                    </div>
                    <small className="d-block text-center mt-2">OTP will sent to pallavsoni64@gmail.com</small>
                    <ul className="disclaimer mt-3">
                        <label>Disclaimer</label>
                        <li>• Minimum Withdrawal should be of 0.1</li>
                        <li>• Maximum Withdrawal should be of : 1000</li>
                        <li>• Withdrawal Fee will be: 0.1</li>
                    </ul>
                    <div className="form-group mb-1"><button type="button" className="btn btn-gradient btn-small w-100 justify-content-center mt-4"><span>Withdraw</span></button>
                    </div>
                </form>
            </div>






            <div className="recent_deposit_list">
                <div className="top_heading">
                    <h4>
                        Recent Withdrawal
                        <small className="ms-2 fetching_deposit_text">
                            Syncing Recent Withdrawal <div className="spinner-border spinner-border-sm text-primary ms-1" role="status" aria-hidden="true"></div>
                        </small>
                    </h4>
                    <a className="more_btn" href="/user_profile/transaction_history">More &gt;</a>
                </div>
                <div className="table_outer">
                    <table>
                        <tbody>


                            <tr >
                                <td>
                                    <div className="td_first">
                                        <div className="price_heading"><img width="30px" src="/images/no_data_vector.svg" alt="icon" /> <span>Completed</span></div>
                                        <div className="date_info"><span>Date</span></div>
                                    </div>
                                </td>
                                <td>Network <span>
                                    {/* {item?.chain || "Internal transfer"} */}
                                </span></td>
                                <td>Address <div className="address_icon"><span>
                                    {/* {shortAddress || "----"} */}
                                </span>

                                    <>
                                        {/* <svg className="bn-svg icon-small-pointer mobile:icon-normal-pointer mobile:text-IconNormal"
                          viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path
                            d="M6.379 8.5l-1.94 1.94a6.45 6.45 0 109.122 9.12l1.939-1.939-2.121-2.121-1.94 1.94a3.45 3.45 0 01-4.878-4.88L8.5 10.622 6.379 
              8.5zM12.56 6.56a3.45 3.45 0 014.88 4.88l-1.94 1.939 2.121 2.121 1.94-1.94a6.45 6.45 0 10-9.122-9.12L8.5 6.378 10.621 8.5l1.94-1.94z"
                            fill="currentColor"></path>
                          <path fillRule="evenodd" clip-rule="evenodd"
                            d="M9.81 16.31l-2.12-2.12 6.5-6.5 2.12 2.12-6.5 6.5z" fill="currentColor"></path></svg> */}

                                        <svg className="bn-svg icon-small-pointer mobile:icon-normal-pointer mobile:text-IconNormal"
                                            viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" clip-rule="evenodd" d="M9 3h11v13h-3V6H9V3zM4 8v13h11V8.02L4 8z"
                                                fill="currentColor"></path></svg>
                                    </>
                                </div>
                                </td>
                                <td >TxID <div className="address_icon"><span>
                                    {/* {shortTxHash || "----"} */}
                                </span>

                                    {/* <svg className="bn-svg icon-small-pointer mobile:icon-normal-pointer mobile:text-IconNormal"
                          viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path
                            d="M6.379 8.5l-1.94 1.94a6.45 6.45 0 109.122 9.12l1.939-1.939-2.121-2.121-1.94 1.94a3.45 3.45 0 01-4.878-4.88L8.5 10.622 6.379 
              8.5zM12.56 6.56a3.45 3.45 0 014.88 4.88l-1.94 1.939 2.121 2.121 1.94-1.94a6.45 6.45 0 10-9.122-9.12L8.5 6.378 10.621 8.5l1.94-1.94z"
                            fill="currentColor"></path>
                          <path fillRule="evenodd" clip-rule="evenodd"
                            d="M9.81 16.31l-2.12-2.12 6.5-6.5 2.12 2.12-6.5 6.5z" fill="currentColor"></path></svg> */}
                                    <svg className="bn-svg icon-small-pointer mobile:icon-normal-pointer mobile:text-IconNormal"
                                        viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clip-rule="evenodd" d="M9 3h11v13h-3V6H9V3zM4 8v13h11V8.02L4 8z"
                                            fill="currentColor"></path></svg>
                                </div>
                                </td>
                                <td className="right_t">Withdrawal Wallet<span></span></td>
                                <td >View</td>
                            </tr>


                        </tbody>
                    </table>
                </div>
                {/* <!-- Modal table recent Pop Up Start --> */}
                <div className="modal fade search_form table_pop_up" id="recent_table" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Deposit Details</h2>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="hot_trading_t">
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td>Status</td>
                                                <td className="right_t price_tb text-success">Completed</td>
                                            </tr>
                                            <tr>
                                                <td>Date</td>
                                                <td className="right_t price_tb"></td>
                                            </tr>
                                            <tr>
                                                <td>Coin</td>
                                                <td className="right_t price_tb"></td>
                                            </tr>
                                            <tr>
                                                <td>Deposit amount</td>
                                                <td className="right_t price_tb"></td>
                                            </tr>
                                            <tr>
                                                <td>Network</td>
                                                <td className="right_t price_tb"></td>
                                            </tr>
                                            <tr>
                                                <td>From Address</td>
                                                <td className="right_t price_tb"><div className="address_icon"><span></span>
                                                    <svg className="bn-svg icon-small-pointer mobile:icon-normal-pointer mobile:text-IconNormal" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" >
                                                        <path fillRule="evenodd" clip-rule="evenodd" d="M9 3h11v13h-3V6H9V3zM4 8v13h11V8.02L4 8z" fill="currentColor"></path></svg></div></td>
                                            </tr>
                                            <tr>
                                                <td>Deposit Address</td>
                                                <td className="right_t price_tb"><div className="address_icon"><span></span>
                                                    <svg className="bn-svg icon-small-pointer mobile:icon-normal-pointer mobile:text-IconNormal" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" >
                                                        <path fillRule="evenodd" clip-rule="evenodd" d="M9 3h11v13h-3V6H9V3zM4 8v13h11V8.02L4 8z" fill="currentColor"></path></svg>
                                                </div></td>
                                            </tr>
                                            <tr>
                                                <td>TxID</td>
                                                <td className="right_t price_tb"><div className="address_icon"><span></span>
                                                    <svg className="bn-svg icon-small-pointer mobile:icon-normal-pointer mobile:text-IconNormal" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" >
                                                        <path fillRule="evenodd" clip-rule="evenodd" d="M9 3h11v13h-3V6H9V3zM4 8v13h11V8.02L4 8z" fill="currentColor"></path></svg></div></td>
                                            </tr>
                                            <tr>
                                                <td>Deposit wallet</td>
                                                <td className="right_t price_tb"></td>
                                            </tr>
                                            <tr>
                                                <td>Description</td>
                                                <td className="right_t price_tb"></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    {/* <p className="help_chat"><a href="/user_profile/support">Help? Chat with us</a></p> */}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <!-- Modal  table recent Pop Up End --> */}

            </div>


        </div>
    )
}

export default WithdrawalFiat
