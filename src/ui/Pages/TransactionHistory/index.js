import React, { useEffect, useState } from 'react'
import LoaderHelper from '../../../customComponents/Loading/LoaderHelper';
import AuthService from '../../../api/services/AuthService';
import { alertErrorMessage } from '../../../customComponents/CustomAlertMessage';
import moment from 'moment';
import DashboardHeader from '../../../customComponents/DashboardHeader';

const TransactionHistory = (props) => {
  const [skipWalletHistory, setSkipWalletHistory] = useState(0);
  const [walletHistory, setWalletHistory] = useState([]);
  const [totalDataLength, setTotalDataLength] = useState();

  const limit = 10;

  const handleWalletHistory = async (skip) => {
    LoaderHelper.loaderStatus(true);
    await AuthService.walletHistory(skip, limit).then(async (result) => {
      if (result?.success) {
        setSkipWalletHistory(skip)
        LoaderHelper.loaderStatus(false);
        setWalletHistory(result?.data);
        setTotalDataLength(result.totalCount)
      } else {
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result?.message);
      }
    })
  };

  const handlePaginationWalletHistory = (action) => {
    if (action === 'prev') {
      if (skipWalletHistory - limit >= 0) {
        handleWalletHistory(skipWalletHistory - limit);
      }
    } else if (action === 'next') {
      if (skipWalletHistory + limit < totalDataLength) {
        handleWalletHistory(skipWalletHistory + limit);
      }
    } else if (action === 'first') {
      handleWalletHistory(0);
    } else if (action === 'last') {
      const lastPageSkip = Math.floor(totalDataLength);
      if (totalDataLength > 10) {
        const data = lastPageSkip - 10
        handleWalletHistory(data);
      }
    }
  };

  useEffect(() => {
    handleWalletHistory(0)


  }, []);


  return (
    <>

      <div className="dashboard_right">

        <DashboardHeader props={props} />
        <div className="dashboard_listing_section Overview_mid">

          {/* <div className="transaction_top_select">

            <div className="select_option">
              <span>Type</span>
              <select>
                <option>Deposit</option>
                <option>Deposit</option>
                <option>Deposit</option>
              </select>
            </div>

            <div className="select_option">
              <span>Time</span>
              <select>
                <option>Past 30...</option>
                <option>Past 30</option>
                <option>Past 10 mint</option>
              </select>
            </div>

            <div className="select_option">
              <span>Coin</span>
              <select>
                <option>All</option>
                <option>Deposit</option>
                <option>Deposit</option>
              </select>
            </div>

            <div className="select_option">
              <span>Status</span>
              <select>
                <option>All</option>
                <option>Deposit</option>
                <option>Deposit</option>
              </select>
            </div>

            <div className="select_option form_type">
              <form>
                <button><img src="/images/search_icon.svg" alt="icon" /></button>
                <input type="text" placeholder="Enter TxID" />
              </form>

            </div>

            <div className="reset">

              <h6>Reset</h6>

            </div>


          </div> */}

          <div className="listing_left_outer full_width transaction_history_t">

            <div className="market_section spotorderhist">

              <div className="top_heading">
                <h4>Deposit/Withdrawal history</h4>
              </div>


              <div className="dashboard_summary">
                <div className='table-responsive'>
                  <table>
                    <thead>
                      <tr>
                        <th>Sr No</th>
                        <th>Date & Time</th>
                        <th>Transaction Type</th>
                        <th>Currency </th>
                        <th>Chain</th>
                        <th>Amount</th>
                        <th>Tx Hash</th>
                        <th className="right_td">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {walletHistory?.length > 0 ? (
                        walletHistory?.map((item, index) => (
                          <tr key={index} className="cursor-pointer" >
                            <td className="color-grey" ><small>{skipWalletHistory + index + 1}</small></td>
                            <td>
                              <div className="c_view justify-content-start" >
                                <span>{moment(item.updatedAt).format("DD/MM/YYYY  ")}
                                  <small>{moment(item.updatedAt).format("hh:mm A")}</small>
                                </span>
                              </div>
                            </td>
                            <td >
                              {item?.transaction_type}
                            </td>
                            <td >
                              {item?.short_name}
                            </td>

                            <td >
                              {item?.chain || "------"}
                            </td>

                            <td >
                              {item?.amount}
                            </td>
                            <td >
                              {item?.transaction_hash || '---'}
                            </td>
                            <td className={`right_td ${item?.status === "COMPLETED" || item?.status === "SUCCESS" ? "green" : item?.status === "REJECTED" ? "red" : item?.status === "PENDING" ? "yellow" : item?.status === "CANCELLED" ? "yellow" : ""}`}>{item?.status}</td>
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
                </div>
                {walletHistory?.length > 0 ?
                  < div className="hVPalX gap-2" >
                    <span className="" >{skipWalletHistory + 1}-{Math.min(skipWalletHistory + limit, totalDataLength)} of {totalDataLength}</span>
                    <div className="sc-eAKtBH gVtWSU">
                      <button type="button" aria-label="First Page" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationWalletHistory('first')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                          <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"></path>
                          <path fill="none" d="M24 24H0V0h24v24z"></path>
                        </svg>
                      </button>
                      <button type="button" aria-label="Next Page" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationWalletHistory('prev')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
                          <path d="M0 0h24v24H0z" fill="none"></path>
                        </svg>
                      </button>

                      <button type="button" aria-label="Next Page" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationWalletHistory('next')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
                          <path d="M0 0h24v24H0z" fill="none"></path>
                        </svg>
                      </button>
                      <button type="button" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationWalletHistory('last')}>
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


        </div>

      </div>

    </>
  )
}

export default TransactionHistory
