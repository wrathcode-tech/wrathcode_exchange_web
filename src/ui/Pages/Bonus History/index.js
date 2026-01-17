import React, { useEffect, useState } from 'react'
import LoaderHelper from '../../../customComponents/Loading/LoaderHelper';
import AuthService from '../../../api/services/AuthService';
import { alertWarningMessage } from '../../../customComponents/CustomAlertMessage';
import moment from 'moment';
import DashboardHeader from '../../../customComponents/DashboardHeader';

const BonusHistory = (props) => {
  const [skipQbsHistory, setSkipQbsHistory] = useState(0);
  const [buySellHist, setBuySellHist] = useState([]);
  const [totalDataLength, setTotalDataLength] = useState();
  const [showAllListItems, setShowAllListItems] = useState({ 0: false, 1: false, 2: false });
  const [showExecutedTrades, setShowExecutedTrades] = useState({ 0: false, 1: false, 2: false });

  const limit = 10;

  const getTransferHistory = async (skip) => {
    LoaderHelper.loaderStatus(true);
    try {
      const result = await AuthService.bonusHistory(skip, limit)
      if (result?.success) {
        if (result?.data?.length > 0) {
          setSkipQbsHistory(skip);
          setBuySellHist(result?.data);
          setTotalDataLength(result.totalCount)
          return;
        } else if (skip !== 0) {
          alertWarningMessage('No more data found')
          return;
        }
      }
    } finally { LoaderHelper.loaderStatus(false); }
  };

  const handlePaginationQbsHistory = (action) => {
    if (action === 'prev') {
      if (skipQbsHistory - limit >= 0) {
        getTransferHistory(skipQbsHistory - limit);
      }
    } else if (action === 'next') {
      if (skipQbsHistory + limit < totalDataLength) {
        getTransferHistory(skipQbsHistory + limit);
      }
    } else if (action === 'first') {
      getTransferHistory(0);
    } else if (action === 'last') {
      const lastPageSkip = Math.floor(totalDataLength);
      if (totalDataLength > 10) {
        const data = lastPageSkip - 10
        getTransferHistory(data);
      }
    }
  };


  const toFixed = (data) => {
    if (typeof (data) === 'number') {
      return parseFloat(data?.toFixed(9));
    } else {
      return 0;
    }
  }

  useEffect(() => {
    getTransferHistory(0, limit)

  }, []);


  return (
    <>


      <div className="dashboard_right">
        <DashboardHeader props={props} />

        <div className="dashboard_listing_section Overview_mid">

          <div className="listing_left_outer full_width transaction_history_t desktop_view2">

            <div className="market_section spotorderhist">

              <div className="top_heading">
                <h4>Bonus History</h4>
              </div>


              <div className="dashboard_summary">

                <table>
                  <thead>
                    <tr>
                      <th>Sr No.</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Description</th>
                      <th className="right_td">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buySellHist?.length > 0 ? (
                      buySellHist?.map((item, index) => (
                        <tr>
                          <td>{index + 1} </td>
                          <td>{moment(item.createdAt).format("YYYY-MM-DD hh:mm A")} </td>
                          <td>
                            <div className="td_first">


                              <div className="price_heading">{item?.amount} {item?.short_name} </div>
                            </div>
                          </td>
                          <td>{item?.description} </td>
                      
                          <td className={`right_td ${item?.status === "SUCCESS" || item?.status === "Completed" ? "green" : item?.status === "REJECTED" ? "red" : item?.status === "PENDING" ? "yellow" : item?.status === "CANCELLED" ? "yellow" : ""}`}>{item?.status}</td>
                        </tr>
                      ))
                    ) : (
                      <tr rowSpan="5" className="no-data-row">
                      <td colSpan="12">
                        <div className="no-data-wrapper">
                          <div className="no_data_vector">
                            <img src="/images/Group 1171275449 (1).svg" alt="no-data" />
                          </div>

                        </div>

                      </td>
                    </tr>
                    )}
                  </tbody>
                </table>

                {buySellHist?.length > 0 ?
                  < div className="hVPalX gap-2" >
                    <span className="" >{skipQbsHistory + 1}-{Math.min(skipQbsHistory + limit, totalDataLength)} of {totalDataLength}</span>
                    <div className="sc-eAKtBH gVtWSU">
                      <button type="button" aria-label="First Page" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationQbsHistory('first')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                          <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"></path>
                          <path fill="none" d="M24 24H0V0h24v24z"></path>
                        </svg>
                      </button>
                      <button type="button" aria-label="Next Page" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationQbsHistory('prev')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
                          <path d="M0 0h24v24H0z" fill="none"></path>
                        </svg>
                      </button>

                      <button type="button" aria-label="Next Page" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationQbsHistory('next')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
                          <path d="M0 0h24v24H0z" fill="none"></path>
                        </svg>
                      </button>
                      <button type="button" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationQbsHistory('last')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                          <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"></path>
                          <path fill="none" d="M0 0h24v24H0V0z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  :
                  ""
                }


              </div>


            </div>



          </div>

          <div className='order_history_mobile_view'>
          <h5>Bonus History</h5>
          <div className='d-flex'>
            <div className='order_datalist'>
              <ul className='listdata'>
                <li>
                  <span className='date'>USDT (TRC20)</span>
                  <span className='date_light'>2025-08-14</span>
                </li>
                <li>
                  <span>Time</span>
                  <span>12:00:00</span>
                </li>
                <li>
                  <span>Currency Pair</span>
                  <span>BTC/USD</span>
                </li>
                <li>
                  <span>Side</span>
                  <span>Buy</span>
                </li>
                <li>
                  <span>Price</span>
                  <span>10000</span>
                </li>
                {showAllListItems[0] && (
                  <>
                    <li>
                      <span>Average</span>
                      <span>10000</span>
                    </li>
                    <li>
                      <span>Quantity</span>
                      <span>10000</span>
                    </li>
                    <li>
                      <span>Remaining</span>
                      <span>10000</span>
                    </li>
                    <li>
                      <span>Total</span>
                      <span>10000</span>
                    </li>
                    <li>
                      <span>Fee</span>
                      <span>10000</span>
                    </li>
                    <li>
                      <span>Order Type</span>
                      <span>Market</span>
                    </li>
                    <li>
                      <span>Status</span>
                      <span className='text-success'>Executed</span>
                    </li>
                    <li>
                      <span>Status</span>
                      <span className='text-danger'>Executed</span>
                    </li>
                    <li>
                      <span>Status</span>
                      <span className='text-warning'>Executed</span>
                    </li>
                  </>
                )}
              </ul>
              <button
                type="button"
                className="view_more_btn"
                onClick={() => setShowAllListItems({ ...showAllListItems, 0: !showAllListItems[0] })}
              >
                {showAllListItems[0] ? <i class="ri-arrow-down-s-line"></i> : <i class="ri-arrow-up-s-line"></i>}
              </button>

              <div className={`executed_trades_list ${showExecutedTrades[0] ? 'active' : ''}`}>
                <button onClick={() => setShowExecutedTrades({ ...showExecutedTrades, 0: !showExecutedTrades[0] })}>
                  <i className={`ri-arrow-drop-down-line ${showExecutedTrades[0] ? 'rotated' : ''}`}></i>Executed Trades
                </button>
                {showExecutedTrades[0] && (
                  <div className='executed_trades_list_items'>
                    <ul>
                      <li>Trade #1:</li>
                      <li>Trading Price: <span>10000</span></li>
                      <li>Executed: <span>10000</span></li>
                      <li>Trading Fee: <span>10000</span></li>
                      <li>Total: <span>10000</span></li>
                    </ul>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>


        </div>

      </div>

    </>
  )
}

export default BonusHistory
