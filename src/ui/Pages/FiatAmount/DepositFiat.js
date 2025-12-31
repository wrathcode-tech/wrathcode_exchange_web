import React from 'react'

function DepositFiat() {
   return (
      <div className='dashboard_right'>

         <div className='dashboard_deposit_s'>

            <h1> Deposit Fiat</h1>

            <form action="#">
               <h6 className="flex_amount mb-3"> Bank Account Details</h6>
               <div className="flex_amount mb-3">
                  <div className="d-flex   tt_item"><strong>Bank Name :</strong> ICICI Bank Limited</div>
                  <div className="d-flex  tt_item"><strong>Account Holder Name :</strong> FIXED INCOME Platforms</div>
                  <div className=" d-flex  tt_item"><strong>Bank Account Number : </strong>  118505004367</div>
                  <div className=" d-flex  tt_item"><strong>Branch Name :</strong>  Rajahmundry Branch</div>
                  <div className=" d-flex  tt_item"><strong>SWIFT Code/IFSC Code :</strong>  ICIC0001185</div>
               </div>
               <div className="form-group mb-2"><input type="text" placeholder="Enter Amount" value="" /></div>
               <div className="form-group mb-2"><input type="text" placeholder="Enter Transaction Number" value="" /></div>
               <div className="row">
                  <div className="col-md-12 upload-area">
                     <div className="brows-file-wrapper">
                        <input name="file" className="inputfile" type="file" />
                        <label for="file" title="No File Chosen"><i className="ri-upload-cloud-line"></i>
                           <span className="text-center mb-2">Choose a File</span>
                           <span className="file-type text-center mt--10">Drag or choose your file to upload</span>
                        </label>
                     </div>
                  </div>
               </div>
               <div className="form-group mb-4"><button type="button" className="btn btn-gradient btn-small w-100 justify-content-center mt-4"><span>Deposit</span></button><small className="mt-1 d-block text-center fw-small  mt-3 text-center "><span className="onceDeposit "> Deposit Confirmation will take minimum 2 hours after you submit the data </span></small></div>
            </form>

         </div>
   
   <div className="recent_deposit_list">
                <div className="top_heading">
                    <h4>
                        Recent Deposits
                        <small className="ms-2 fetching_deposit_text">
                            Syncing Recent Deposits   <div className="spinner-border spinner-border-sm text-primary ms-1" role="status" aria-hidden="true"></div>
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
                                <td className="right_t">Deposit Wallet<span></span></td>
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
                                                <td>Deposit Wallet</td>
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

export default DepositFiat
