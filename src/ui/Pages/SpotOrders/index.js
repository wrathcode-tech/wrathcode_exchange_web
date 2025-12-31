import React, { useEffect, useState } from 'react'
import LoaderHelper from '../../../customComponents/Loading/LoaderHelper';
import AuthService from '../../../api/services/AuthService';
import { alertErrorMessage } from '../../../customComponents/CustomAlertMessage';
import moment from 'moment';
import DashboardHeader from '../../../customComponents/DashboardHeader';

const SpotOrders = (props) => {
  const [tradeHistoryData, setTradeHistoryData] = useState([]);
  console.log("🚀 ~ SpotOrders ~ tradeHistoryData:", tradeHistoryData)
  const [totalDataLength, setTotalDataLength] = useState(0);
  const [skip, setSkip] = useState(0);
  const limit = 10;
  const [expandedRow, setExpandedRow] = useState(null);
      const [expandedRowIndex, setExpandedRowIndex] = useState(null);
  

  const handleTradeHistory = async (skip, limit) => {
    try {
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.tradeHistory(skip, limit);
      if (result?.success) {
        setTradeHistoryData(result.data);
        setTotalDataLength(result.totalCount);
      } else {
        alertErrorMessage(result.message);
      }
    } catch (e) {
      alertErrorMessage('Failed to fetch trade history');
    } finally {
      LoaderHelper.loaderStatus(false);
    }
  };

  const handlePagination = (action) => {
    if (action === 'prev' && skip - limit >= 0) setSkip(skip - limit);
    if (action === 'next' && skip + limit < totalDataLength) setSkip(skip + limit);
    if (action === 'first') setSkip(0);
    if (action === 'last') setSkip(Math.max(0, totalDataLength - limit));
  };

  const nineDecimalFormat = (data) => {
    if (typeof (data) === "number") {
        // return data
        return parseFloat(data?.toFixed(9))
    } else {
        return 0
    }
};

  useEffect(() => {
    handleTradeHistory(skip, limit);
  }, [skip]);

  

  return (
    <div className="dashboard_right">
      <DashboardHeader props={props} />
      <div className="dashboard_listing_section Overview_mid">
        <div className="listing_left_outer full_width transaction_history_t">
          <div className="market_section spotorderhist">
            <div className="top_heading">
              <h4>Spot order history</h4>
            </div>
            <div className="dashboard_summary">
              <div className='table-responsive'>
                <table className=" ">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Trading Pair</th>
                      <th>Side</th>
                    
                      <th>Price</th>
                      <th>Average</th>
                      <th>Quantity</th>
                      <th>Remaining</th>
                      <th>Total</th>
                      <th>Fee</th>
                      <th>Order Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tradeHistoryData?.length > 0 ? tradeHistoryData.map((item, index) =>
                      <>
                        <tr key={index} onClick={() => setExpandedRowIndex(expandedRowIndex === index ? null : index)} className="cursor-pointer">
                          <td>

                            <div className="c_view justify-content-start">
                              {item?.executed_prices?.length > 0 && (
                                <p className="ms-2 mx-2 text-xl d-inline text-success">{expandedRowIndex === index ? '▾' : '▸'}</p>
                              )}
                              <span>{moment(item?.updatedAt).format("DD/MM/YYYY")}
                                <small>{moment(item?.updatedAt).format("hh:mm")}</small>
                              </span>
                            </div>
                          </td>
                          <td>{item?.side === "BUY" ? `${item?.ask_currency}/${item?.pay_currency}` : `${item?.pay_currency}/${item?.ask_currency}`}</td>
                          <td>{item?.side}</td>
                          <td>{nineDecimalFormat(item?.price)}</td>
                          <td>{nineDecimalFormat(item?.avg_execution_price)}</td>
                          <td>{nineDecimalFormat(item?.quantity)}</td>
                          <td>{nineDecimalFormat(item?.remaining)}</td>
                          <td>{nineDecimalFormat(item?.quantity * item?.avg_execution_price)}</td>
                          <td>{nineDecimalFormat(item?.total_fee)} {item?.ask_currency}</td>
                          <td>{item?.order_type}</td>
                          <td className={`text-${item?.status === "FILLED" ? "success" : item?.status === "CANCELLED" ? "danger" : "warning"}`}>
                            {item?.status === 'FILLED' ? 'EXECUTED' : item?.status}

                          </td>
                        </tr>

                        {/* Sub-row for executed trades */}
                        {expandedRowIndex === index && item?.executed_prices?.length > 0 && (
                          <tr>
                            <td colSpan="12">
                              <div className='table-responsive bg-dark'>
                                <table className="table table_home   ">
                                  <thead>
                                    <tr>
                                      <th>#</th>
                                      <th>Trading price	</th>
                                      <th>Executed</th>
                                      <th>Trading Fee</th>
                                      <th>Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {item.executed_prices.map((trade, i) => (
                                      <tr key={i}>
                                        <td>{i+1}</td>
                                        <td >{nineDecimalFormat(trade.price)} {item?.side === "BUY" ? `${item?.pay_currency}` : `${item?.ask_currency}`}</td>
                                        <td>{nineDecimalFormat(trade.quantity)} {item?.side === "BUY" ? `${item?.ask_currency}` : `${item?.pay_currency}`}</td>
                                        <td>{nineDecimalFormat(+trade.fee)} {item?.ask_currency}</td>
                                        <td>{nineDecimalFormat(+trade.price * trade.quantity)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>

                    ) : <tr rowSpan="5">
                      <td colSpan="12">
                        <div className="favouriteData">
                          <div className="no_data_s">
                            <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                            <p>No Data Available</p>
                          </div>
                        </div>
                      </td>
                    </tr>}
                  </tbody>
                </table>
              </div>
              {tradeHistoryData?.length > 0 ?
                < div className="hVPalX gap-2" >
                  <span className="" >{skip + 1}-{Math.min(skip + limit, totalDataLength)} of {totalDataLength}</span>
                  <div className="sc-eAKtBH gVtWSU">
                    <button type="button" aria-label="First Page" className="sc-gjLLEI kuPCgf" onClick={() => handlePagination('first')}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                        <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"></path>
                        <path fill="none" d="M24 24H0V0h24v24z"></path>
                      </svg>
                    </button>
                    <button type="button" aria-label="Next Page" className="sc-gjLLEI kuPCgf" onClick={() => handlePagination('prev')}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
                        <path d="M0 0h24v24H0z" fill="none"></path>
                      </svg>
                    </button>

                    <button type="button" aria-label="Next Page" className="sc-gjLLEI kuPCgf" onClick={() => handlePagination('next')}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
                        <path d="M0 0h24v24H0z" fill="none"></path>
                      </svg>
                    </button>
                    <button type="button" className="sc-gjLLEI kuPCgf" onClick={() => handlePagination('last')}>
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
  );
};

export default SpotOrders;
