import React, { useEffect, useState } from 'react'
import LoaderHelper from '../../../customComponents/Loading/LoaderHelper';
import AuthService from '../../../api/services/AuthService';
import { alertWarningMessage } from '../../../customComponents/CustomAlertMessage';
import moment from 'moment';
import DashboardHeader from '../../../customComponents/DashboardHeader';

const QuickBuySellHistory = (props) => {
  const [skipQbsHistory, setSkipQbsHistory] = useState(0);
  const [buySellHist, setBuySellHist] = useState([]);
  const [totalDataLength, setTotalDataLength] = useState();

  const limit = 10;

  const getBuySellHistory = async (skip) => {
    LoaderHelper.loaderStatus(true);
    try {
      const result = await AuthService.quickBuySellHistory(skip, limit)
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
        getBuySellHistory(skipQbsHistory - limit);
      }
    } else if (action === 'next') {
      if (skipQbsHistory + limit < totalDataLength) {
        getBuySellHistory(skipQbsHistory + limit);
      }
    } else if (action === 'first') {
      getBuySellHistory(0);
    } else if (action === 'last') {
      const lastPageSkip = Math.floor(totalDataLength);
      if (totalDataLength > 10) {
        const data = lastPageSkip - 10
        getBuySellHistory(data);
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
    getBuySellHistory(0, limit)

  }, []);


  return (
    <>


      <div className="dashboard_right">
        <DashboardHeader props={props} />

        <div className="dashboard_listing_section Overview_mid">

     

          <div className="listing_left_outer full_width transaction_history_t">

            <div className="market_section spotorderhist">

              <div className="top_heading">
                <h4>Swap History</h4>
              </div>


              <div className="dashboard_summary">

                <table>
                  <thead>
                    <tr>
                      <th>Sr No.</th>
                      <th>Date/Time</th>
                      <th>Paid Amount</th>
                      <th>Received Amount</th>
                      <th>Conversion Rate</th>
                      <th>Fee</th>
                      <th className="right_td">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buySellHist?.length > 0 ? (
                      buySellHist?.map((item, index) => (
                        <tr key={index}>
                          <td >{index + skipQbsHistory + 1}</td>
                          <td >

                            <div className="c_view justify-content-start" >
                              <span>{moment(item.createdAt).format("DD/MM/YYYY  ")}
                                <small>{moment(item.createdAt).format("hh:mm A")}</small>
                              </span>
                            </div>
                          </td>
                          <td >{toFixed(item.pay_amount)} {item?.from}</td>
                          <td >{toFixed(item.get_amount)} {item?.to} </td>
                          <td >1 {item?.from} =  {toFixed(item.conversion_rate)} {item?.to}</td>
                          <td >{toFixed(item.fee)} {item?.from}</td>
                          <td className="right_td"><strong className={item.status === "Completed" ? "text-success" : "text-danger"}>{item.status}</strong></td>
                        </tr>
                      ))
                    ) : (
                      <tr rowSpan="5">
                        <td colSpan="12">
                          <div className="no_data_outer">
                            <div className="no_data_vector">
                              <img src="/images/Group 1171275449 (1).svg" alt="no-data" />

                            </div>

                            <p>No Data Available</p>

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


        </div>

      </div>

    </>
  )
}

export default QuickBuySellHistory
