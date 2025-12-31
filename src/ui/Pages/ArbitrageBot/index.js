import React, { useEffect, useState } from 'react'
import DashboardHeader from '../../../customComponents/DashboardHeader'
import AuthService from '../../../api/services/AuthService';
import LoaderHelper from '../../../customComponents/Loading/LoaderHelper';
import { alertErrorMessage, alertSuccessMessage } from '../../../customComponents/CustomAlertMessage';
import { $ } from 'react-jquery-plugin';
import { useNavigate } from 'react-router-dom';

function ArbitrageBot(props) {
  const navigate = useNavigate()
  const [packageList, setPackageList] = useState([]);
  const [walletType, setWalletType] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [packageDetails, setPackageDetails] = useState({});


  const handlePackageList = async () => {
    LoaderHelper.loaderStatus(true);
    try {
      const result = await AuthService.getPackageList();
      LoaderHelper.loaderStatus(false);
      if (result?.success) {
        setPackageList(result?.data);
      } else {
        alertErrorMessage(result?.message || "Failed to fetch package list.");
      }
    } catch (err) {
      LoaderHelper.loaderStatus(false);
      alertErrorMessage("Something went wrong.");
    }
  };


  const getWalletType = async () => {
    try {
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.availableWalletTypes();
      if (result?.success) {
        setWalletType(result?.data);
        setSelectedWallet(result?.data[0] || "")
      }
    } catch (error) {
    }
    finally { LoaderHelper.loaderStatus(false); }
  };

  const isPackageActive = async () => {
    LoaderHelper.loaderStatus(true);
    try {
      const result = await AuthService.getActivePackage();
      LoaderHelper.loaderStatus(false);
      if (result?.success) {
        if (result?.data?.length > 0) {
          navigate("/user_profile/arbitrage_dashboard")
        }
      } else {
        alertErrorMessage(result?.message || "Failed to fetch package list.");
      }
    } catch (err) {
      LoaderHelper.loaderStatus(false);
      alertErrorMessage("Something went wrong.");
    }
  };

  const subscribeBotPackage = async () => {
    if (!packageDetails?._id || !selectedWallet) {
      alertErrorMessage("Invalid subscription details, please reload the page and try again")
      return;
    }
    try {
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.buyArbitrageBot(packageDetails?._id, selectedWallet);
      if (result?.success) {
        $("#more_details").modal('hide');
        navigate("/user_profile/arbitrage_dashboard")
        window.location.reload()
        alertSuccessMessage(result?.message);
      } else {
        alertErrorMessage(result?.message)
      }
    } catch (error) {
      alertSuccessMessage(error?.message)
    }
    finally { LoaderHelper.loaderStatus(false); }
  };


  const getWalletBalance = async () => {
    try {
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.getWalletBalance(packageDetails?.currency_id, selectedWallet);
      if (result?.success) {
        setWalletBalance(formatToNineDecimals(result?.data?.balance || 0))
      }
    } catch (error) {
    }
    finally { LoaderHelper.loaderStatus(false); }
  };

  const showPackageDetails = (data) => {
    setPackageDetails(data)
    $("#package_details").modal('show');
    if (data?.currency_id !== packageDetails?.currency_id) {
      getWalletType()
    }
  };



  const formatToNineDecimals = (data) => {
    if (typeof (data) === "number") {
      // return data
      return parseFloat(data?.toFixed(9))
    } else {
      return 0
    }
  };

  useEffect(() => {
    if (selectedWallet && selectedWallet !== "") {
      getWalletBalance()

    }

  }, [selectedWallet]);


  useEffect(() => {
    handlePackageList()
    isPackageActive()
  }, []);



  return (
    <>
      <div className="dashboard_right">
        <DashboardHeader props={props} />
        <div className="arbitrage_subscriptions_block">
          <h1>Our Arbitrage BOT Subscriptions</h1>
          <ul>
            {packageList.length > 0 ? (
              packageList.map((currency, idx) => {
                return (
                  <li>
                    <div className="arbitbot_vector vector_bot">
                      {currency.price === 100 && (
                        <img src="/images/arbitragebot_img3.svg" alt="robotic" />
                      )}
                      {currency.price === 300 && (
                        <img src="/images/arbitragebot_img2.svg" alt="robotic" />
                      )}
                      {currency.price === 500 && (
                        <img src="/images/arbitragebot_img.svg" alt="robotic" />
                      )}
                    </div>
                    <h2>Wrathcode - {idx + 1}</h2>
                    <div className="arbitbot_cnt">
                      <p><strong>{currency.monthlyReturnMin} - {currency.monthlyReturnMax}%Return</strong></p>
                      <p>Monthly from your Investment</p>
                      <p><strong> ${currency.minTradeLimit} - ${currency.maxTradeLimit}</strong></p>
                      <p><span>Trade Capacity</span></p>
                      <div className="pricetag">{currency?.price} USDT / Year</div>
                      <button className="subscribe_btn" onClick={() => showPackageDetails(currency)}><a href="#/">Buy</a></button>
                    </div>
                  </li>

                );
              })
            ) : (
              <p className="text-muted">No active packages available.</p>
            )}
          </ul>
        </div >
        <div className="faq_cta_outer how_workblock">
          <div className="faq_section">
            <h2>How It Works</h2>
            <div className="faq" id="accordionExample">
              <div className="card p-0">
                <h2 className="card-header" id="headingcollapse_1">
                  <button className="accordion-button p-0 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_1" aria-expanded="false" aria-controls="collapse_1">
                    What is Wrathcode Arbitrage BOT?
                  </button>
                </h2>
                <div id="collapse_1" className="accordion-collapse collapse" aria-labelledby="headingcollapse_1" data-bs-parent="#accordionExample">
                  <div className="card-body card-body-padding-top border-bottom">
                    <div className="faq_text">
                      <p>
                        Wrathcode Arbitrage BOT is an automated trading tool that identifies price differences across exchanges and executes profitable trades in real time. Users can invest in bot packages, and our system does the rest—analyzing markets, executing trades, and distributing profits directly to users.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-0">
                <h2 className="card-header" id="headingcollapse_2">
                  <button className="accordion-button p-0 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_2" aria-expanded="false" aria-controls="collapse_2">
                    How do I start using the Arbitrage BOT?
                  </button>
                </h2>
                <div id="collapse_2" className="accordion-collapse collapse" aria-labelledby="headingcollapse_2" data-bs-parent="#accordionExample">
                  <div className="card-body card-body-padding-top border-bottom">
                    <div className="faq_text">
                      <p>
                        Simply log in to your Wrathcode account, go to the Arbitrage BOT section, select a package, and deposit the required amount. Once activated, the bot will start trading with your funds and generate returns automatically.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-0">
                <h2 className="card-header" id="headingcollapse_3">
                  <button className="accordion-button p-0 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_3" aria-expanded="false" aria-controls="collapse_3">
                    How are profits calculated and distributed?
                  </button>
                </h2>
                <div id="collapse_3" className="accordion-collapse collapse" aria-labelledby="headingcollapse_3" data-bs-parent="#accordionExample">
                  <div className="card-body card-body-padding-top border-bottom">
                    <div className="faq_text">
                      <p>
                        The bot performs trades across various platforms based on market volatility. Profits are calculated after each cycle and reflected in your dashboard. You can withdraw or reinvest them anytime, depending on your package terms.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-0">
                <h2 className="card-header" id="headingcollapse_4">
                  <button className="accordion-button p-0 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_4" aria-expanded="false" aria-controls="collapse_4">
                    Is there any risk involved in arbitrage trading?
                  </button>
                </h2>
                <div id="collapse_4" className="accordion-collapse collapse" aria-labelledby="headingcollapse_4" data-bs-parent="#accordionExample">
                  <div className="card-body card-body-padding-top border-bottom">
                    <div className="faq_text">
                      <p>
                        Arbitrage is generally low-risk compared to other trading strategies, but no trading is entirely risk-free. We mitigate risks through smart algorithms, liquidity filters, and risk-managed execution. However, we recommend users understand market conditions before investing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>


              <div className="card p-0">
                <h2 className="card-header no-border" id="headingcollapse_6">
                  <button className="accordion-button p-0 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_6" aria-expanded="false" aria-controls="collapse_6">
                    Is there any lock-in period for bot packages?
                  </button>
                </h2>
                <div id="collapse_6" className="accordion-collapse collapse" aria-labelledby="headingcollapse_6" data-bs-parent="#accordionExample">
                  <div className="card-body card-body-padding-top border-bottom border-top">
                    <div className="faq_text">
                      <p>
                        Some packages may come with a short lock-in period to allow the bot to optimize performance. This will be clearly mentioned before purchase. After the lock-in ends, you are free to withdraw funds or renew the package.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div >





      {/* <!-- Modal  more details Pop Up Start --> */}

      <div className="modal fade search_form order_detail_pop modelbg2 " id="package_details" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Buy Package  <i className="ri-arrow-right-double-line"></i> {packageDetails?.name}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body modal-swap ">

              <div className='row'>
                <div className='col-sm-6'>
                  <div className="hot_trading_t model_height">
                    <div className='table-responsive'>
                      <table>
                        <tbody>

                          <tr>
                            {/* <td className="right_t price_tb">  */}
                            <div className="form_select">
                              <span>Choose Wallet</span>

                              <select value={selectedWallet} onChange={(e) => setSelectedWallet(e.target.value)}>
                                <option hidden selected>Select Wallet</option>
                                {walletType?.length > 0 ? walletType?.map((wallet) => {
                                  return (
                                    <option value={wallet}>  {typeof wallet === 'string' && wallet.length > 0
                                      ? wallet.charAt(0).toUpperCase() + wallet.slice(1)
                                      : 'N/A'} Wallet</option>
                                  )
                                }) : <option>Wallet Not Available</option>}
                              </select>

                            </div>
                            {/* </td> */}
                          </tr>
                          <tr>
                            <td>{selectedWallet.charAt(0).toUpperCase() + selectedWallet.slice(1)} Balance: </td>
                            <td className="right_t price_tb">
                              {walletBalance} USDT </td>
                          </tr>
                          <tr>
                            <td> Subscription Amount: </td>
                            <td className="right_t price_tb">
                              {packageDetails?.price} USDT </td>
                          </tr>

                          {(packageDetails?.price > walletBalance) &&
                            <tr>
                              <td className='text-danger'>Insufficient Balance
                              </td>
                              <td className="right_t price_tb">
                              </td>
                            </tr>
                          }

                          <tr>
                            <td className="text-warning">
                              <i className="ri-information-2-line"></i> Don't have enough balance? <a href='/asset_managemnet/deposit' className="text-info">  <span>Deposit Now</span></a>
                            </td>
                          </tr>

                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className='col-sm-6'>
                  <div className="hot_trading_t model_height">
                    <div className='table-responsive'>
                      <table>
                        <tbody>
                          <tr>
                            <td></td>
                          </tr>
                          <tr>
                            <td>Bot Validity: </td>
                            <td className="right_t price_tb text-warning">
                              {packageDetails?.validityDays || 0} Days </td>
                          </tr>



                          <tr>
                            <td>ROI Rate
                            </td>

                          </tr>
                          <tr>
                            <td className='padding-0'><i className="ri-arrow-right-line"></i> Estimated ROI (%):
                            </td>
                            <td className="right_t price_tb padding-0">
                              {packageDetails?.monthlyReturnMin} - {packageDetails?.monthlyReturnMax}% USDT</td>

                          </tr>





                          <div className="mt-2">
                            {(packageDetails?.price > walletBalance) ?
                              <button className="orderbtn" disabled>Insufficient Balance</button> :

                              <button className="orderbtn" onClick={subscribeBotPackage}>Buy Package</button>
                            }
                          </div>

                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>


            </div>
          </div>
        </div>
      </div>


      {/* <!-- Modal   more details Pop Up End --> */}
    </>
  )
}

export default ArbitrageBot
