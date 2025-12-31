import React from 'react'

function BankDetails() {
    return (
        <div className='dashboard_right'>

<div className='bank_detail_info'>

<div className='row'>
                  <div className='col-sm-8'>
                    <h1>Payment Options</h1>
                    <p>Select your payment options for all transactions.</p>
                  </div>

                  <div className='col-sm-4'>
                    <div className='d-flex justify-content-end align-item-center'>
                    <button data-bs-toggle="modal" data-bs-target="#bankform_info_d">Add New</button>
                    </div>
                  </div>
</div>


  {/* <!-- Modal Profile Email --> */}
            <div className="modal fade search_form bankpop_up_d" id="bankform_info_d" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div className="modal-dialog modal-dialog-centered ">
                <div className="modal-content">
                  <div className="modal-header">

                    <h5 className="modal-title" id="exampleModalLabel">Add Account details</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body px-8 py-5">
   <form>
      <div className="form-group mb-4 "><label for="bit"> Bank Name </label><input type="text" id="bit" name="bankName" value=""/></div>
      <div className="form-group mb-4"><label for="bit"> Account Holder Name </label><input type="text" name="holderName" value=""/></div>
      <div className="form-group mb-4"><label for="bit"> Account Number</label><input id="bit" name="accountNumber" type="number" value=""/></div>
      <div className="form-group mb-4"><label for="bit"> SWIFT Code/IFSC Code </label><input id="bit" name="ifscCode" type="text" value=""/></div>
      <div className="form-group mb-4"><label>Branch Address</label><input type="text" name="branchAddress" value=""/></div>
   </form>
</div>

<div className="modal-footer px-8">
    <button type="button" className="addbankbtn btn btn-gradient btn-small w-100 justify-content-center" data-bs-dismiss="modal" aria-label="Close" disabled=""><span>Add Bank</span></button>
    </div>

                </div>


              </div>
            </div>


</div>

        </div>
    )
}

export default BankDetails
