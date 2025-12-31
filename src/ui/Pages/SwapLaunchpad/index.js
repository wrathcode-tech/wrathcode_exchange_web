import React, {useState, useRef, useEffect, useContext} from "react"
import AuthService from "../../../api/services/AuthService";
import { alertErrorMessage, alertSuccessMessage } from "../../../customComponents/CustomAlertMessage";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import { ProfileContext } from "../../../context/ProfileProvider";

const SwapLaunchpad = () =>{

const [usdtCoin, setUsdtCoin] = useState()
const [nexbCoin, setNexbCoin] = useState()
const [pairs,setPairs] = useState([])
const [isDisable, setIsDisable] = useState(true)

const { userDetails } = useContext(ProfileContext);



const userId = userDetails._id


useEffect(()=>{
getPairs()
},[])


const getPairs = async() =>{
  const result = await AuthService.getPairs()
  if(result.success){
    setPairs(result.data)
  }
  else{
    alertErrorMessage(result.message)
  }
}


const timeoutRef = useRef(null);
const handleAmount = (e) =>{
  setUsdtCoin(e.target.value);
  clearTimeout(timeoutRef.current); 
  timeoutRef.current = setTimeout(() => {
  handleNexbAmount(baseCurrencyId, quoteCurrencyId, userId, e.target.value ? e.target.value : 0);
  }, 700);
}




const handleNexbAmount = async(baseCurrencyId, quoteCurrencyId, userId, usdtCoin) =>{
const result = await AuthService.nexbAmount(baseCurrencyId, quoteCurrencyId, userId, usdtCoin)
if(result.success) {
  setNexbCoin(result.data?.amountToBuy)
}else{
  alertErrorMessage(result.message)
}
}

const swapAmount = async(baseCurrencyId, quoteCurrencyId, userId, usdtCoin, nexbCoin) =>{
  LoaderHelper.loaderStatus(true);
  const result = await AuthService.swapAmount(baseCurrencyId, quoteCurrencyId, userId, usdtCoin, nexbCoin)
  LoaderHelper.loaderStatus(false);
  if(result.success) {
    alertSuccessMessage(result.message)
    usdtCoin('')
    nexbCoin('')
  }else{
    alertErrorMessage(result.message)
  }
  }

  const baseCurrency = pairs.filter(item => item.base_currency == "NEXB")
  const quoteCurrency = pairs.filter(item => item.quote_currency == "USDT")

  const baseCurrencyId = baseCurrency[0]?.base_currency_id 
  const quoteCurrencyId = quoteCurrency[0]?.quote_currency_id 



    return(
        <>

<section className=" swap_sec  section-padding feature_bg pc_bg login_sec ">  

        <div className="container">
          <div className="row">
            <div className="col-lg-5 col-md-7 col-12 mx-auto">
              <div className="page_title">
                <h3 className="d-block text-center mb-5"> Swap <strong className="text-gradient"> NEXB</strong> Coin </h3></div>

              <form className="custom-form ticket-form mb-5 mb-lg-0">
                  <div className="card-body ">
                    <div className="row">
                      <div className="col-md-12">
                      <label className=" mb-2">  USDT  </label>
                      </div>
                      <div className="col-lg-12 col-md-12 col-12">
                        <input type="number" name="form-USDT" id="form-USDT" className="form-control"  onWheel={(e) => e.target.blur()} placeholder="Enter USDT" value={usdtCoin} onChange={(e)=>handleAmount(e)} />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                      <label className=" mb-2">  NEXB  </label>
                      </div>
                      <div className="col-lg-12 col-md-12 col-12">
                        <input type="text" name="form-NEXB" id="form-NEXB" className="form-control" placeholder="Enter NEXB Coin" value={nexbCoin}  />
                      </div>
                        
                    </div>

                    <div className="balance-libra card-success mb-3 ">
                      <div className="token-img-bg_right" id="lc-data"> Min. - <b>100 USDT</b> </div>
                      <div className="token-img-bg_right" id="lc-data"> Max. - <b> 1,000 USDT</b> </div>
                      
                      </div>
                    <div className="row" > 
                      
                      <div className="col-lg-12 mt-3 text-center ">
                        <button type="button" className="btn btn-xl px-5 w-100"  onClick={()=>(usdtCoin < 100 || usdtCoin > 1000) ? alertErrorMessage("Please enter amount within the range of 100 USDT to 1000 USDT") :swapAmount(baseCurrencyId, quoteCurrencyId, userId, usdtCoin, nexbCoin)} disabled={isDisable}>Sold Out</button>
                      </div>
                    </div>
                  </div>
                </form>


            
            </div>
          </div>
        </div>



 










      
      </section>




      <div className="modal custom-modal fade" id="successmodal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              {/* <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Modal title</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div> */}
              <div className="modal-body text-center p-lg-4">
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                      <circle className="path circle" fill="none" stroke="#198754" stroke-width="6" stroke-miterlimit="10" cx="65.1" cy="65.1" r="62.1"></circle>
                      <polyline className="path check" fill="none" stroke="#198754" stroke-width="6" stroke-linecap="round" stroke-miterlimit="10" points="100.2,40.2 51.5,88.8 29.8,67.5 "></polyline>
                      </svg>

                      <h4 className=" mt-3">Success!</h4>
                      <p className="mt-3">You have successfully Swap NEXB Coin</p>
                      <button type="button" className="btn btn-sm mt-3 btn-success px-5 " data-bs-dismiss="modal">Ok</button>
                      </div>
              
            </div>
          </div>
        </div>


    
        
        </>
    )
}

export default SwapLaunchpad