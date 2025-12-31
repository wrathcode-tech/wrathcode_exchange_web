import React, { useState, useEffect, useContext } from "react";
import { alertSuccessMessage, alertErrorMessage } from "../../../customComponents/CustomAlertMessage";
import AuthService from "../../../api/services/AuthService";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import { ProfileContext } from "../../../context/ProfileProvider";
import Slider from "react-slick";
import { ApiConfig } from "../../../api/apiConfig/apiConfig";
import DashboardHeader from "../../../customComponents/DashboardHeader";
const CurrencyPrefrence = (props) => {

    const { handleUserDetails } = useContext(ProfileContext);
    const [currencyType, setCurrencyType] = useState();

    useEffect(() => {
        setCurrencyType(props?.userDetails?.currency_prefrence);
    }, [props]);

    const handleCurrency = async (currencyType) => {
        LoaderHelper.loaderStatus(true)
        await AuthService.setCurrency(currencyType).then(async result => {
            LoaderHelper.loaderStatus(false)
            if (result.success) {
                try {
                    alertSuccessMessage(result.message);
                    handleUserDetails();
                } catch (error) {
                    alertErrorMessage(error);
                }
            } else {
                alertErrorMessage(result.message);
            }
        });
    }


    const bannerSettings = {
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 2000
      };

    return (
        <> 
      

        <div className="dashboard_right">

          
                
       <DashboardHeader props={props}/>
      
  
  
        <div className="dashboard_listing_section Overview_mid">
  
  
          <div className="currency_preference_outer">
  
            <div className="kyc_approval_s">
  
              <div className="cnt">
                <h3>Currency Preference</h3>
                <p>Select your preferred display currency for all markets</p>
  
                <div className="dashboard_summary">
  
                  <div className="currency_outer_b">
  
                    <div className={`currency_preference_b ${currencyType == "USDT" ? "active" : ""}`} onClick={(e) => setCurrencyType("USDT")}>
                      <div className="icon"><img src="/images/icon/tether.png" alt="icon"/></div>
                      <div className="price_heading">Tether USD (USDT)</div>
                    </div>
  
                    <div className={`currency_preference_b ${currencyType == "BTC" ? "active" : ""}`}  onClick={(e) => setCurrencyType("BTC")}>
                      <div className="icon"><img src="/images/icon/btc copy.png" width="50px" alt="icon"/></div>
                      <div className="price_heading">BTC</div>
                    </div>
  
                    <div className={`currency_preference_b ${currencyType == "BNB" ? "active" : ""}`}  onClick={(e) => setCurrencyType("BNB")}>
                      <div className="icon"><img src="/images/icon/bnb copy.png" alt="icon"/></div>
                      <div className="price_heading">BNB</div>
                    </div>
  
                  </div>
  
  
                  <div className="currency_btn">
                    <a href="#/" onClick={() => handleCurrency(currencyType)}>Save Currency Preference</a>
                  </div>
  
  
  
                </div>
  
  
  
  
  
  
              </div>
  
  
            </div>
  
{/*   
            <div className="dashboard_right_side profileslider">
  
            <div className="slider dashboard_slider">
            <Slider {...bannerSettings}>
              <div className="banner_img_add">

                <div className="cnt_slider_f">
                  <h6>Wrathcode Landing Protocol</h6>
                  <p>Borrow Low, Earn High</p>
                </div>

                <div className="cv_trade_img">
                  <img src="/images/cvtrade_bitcoin.svg" alt="bitcoin" />
                </div>

              </div>
              <div className="banner_img_add">

                <div className="cnt_slider_f">
                  <h6>Wrathcode Landing Protocol</h6>
                  <p>Borrow Low, Earn High</p>
                </div>

                <div className="cv_trade_img">
                  <img src="/images/cvtrade_bitcoin.svg" alt="bitcoin" />
                </div>

              </div>

              <div className="banner_img_add">

                <div className="cnt_slider_f">
                  <h6>Wrathcode Landing Protocol</h6>
                  <p>Borrow Low, Earn High</p>
                </div>

                <div className="cv_trade_img">
                  <img src="/images/cvtrade_bitcoin.svg" alt="bitcoin" />
                </div>

              </div>

              <div className="banner_img_add">

                <div className="cnt_slider_f">
                  <h6>Wrathcode Landing Protocol</h6>
                  <p>Borrow Low, Earn High</p>
                </div>

                <div className="cv_trade_img">
                  <img src="/images/cvtrade_bitcoin.svg" alt="bitcoin" />
                </div>

              </div>

              <div className="banner_img_add">

                <div className="cnt_slider_f">
                  <h6>Wrathcode Landing Protocol</h6>
                  <p>Borrow Low, Earn High</p>
                </div>

                <div className="cv_trade_img">
                  <img src="/images/cvtrade_bitcoin.svg" alt="bitcoin" />
                </div>

              </div>
            </Slider>
          </div>

  
            </div> */}
  
          </div>
  
        </div>
  
      </div>


      </>
    );
}

export default CurrencyPrefrence;