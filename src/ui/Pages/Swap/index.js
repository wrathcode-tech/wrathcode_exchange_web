import React, { useState, useEffect } from "react"
import AuthService from "../../../api/services/AuthService";
import { alertErrorMessage, alertSuccessMessage } from "../../../customComponents/CustomAlertMessage";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import { ApiConfig } from "../../../api/apiConfig/apiConfig";
import { $ } from "react-jquery-plugin";
import BigNumber from "bignumber.js";
import moment from "moment";

const Swap = () => {

  const [currencyList, setCurrencyList] = useState([])
  const [conversionRate, setConversionRate] = useState(0);

  const [transactionHistory, setTransactionHistory] = useState([]);

  const [fromCurrency, setFromCurrency] = useState({});
  const [receiveCurrency, setReceiveCurrency] = useState({});

  const [fromSearch, setFromSearch] = useState("");
  const [receieveSearch, setReceieveSearch] = useState("");

  const [fromCurrencyAmount, setFromCurrencyAmount] = useState("");
  const [receiveCurrencyAmount, setReceiveCurrencyAmount] = useState("");




  const getAvailableCurrency = async (type) => {
    try {
      LoaderHelper.loaderStatus(true);

      const result = await AuthService.baseCurrencyList();
      if (!result?.success) {
        LoaderHelper.loaderStatus(false);
        return alertErrorMessage(result.message);
      }

      const currencies = result?.data;

      // Sort currencies: non-zero balances on top, then by balance descending
      currencies.sort((a, b) => {
        const balA = parseFloat(a.balance || 0);
        const balB = parseFloat(b.balance || 0);

        if (balA > 0 && balB === 0) return -1;
        if (balA === 0 && balB > 0) return 1;

        return balB - balA; // descending order
      });

      if (currencies?.length > 1 || type === "update") {
        setFromCurrency(currencies[0]);
        setReceiveCurrency(currencies[1]);
      }

      setCurrencyList(currencies);
    } catch (err) {
      console.error("Failed to fetch/sort currency list:", err);
    } finally {
      LoaderHelper.loaderStatus(false);
    }
  };

  const getConversionrate = async () => {
    try {
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.getConversionRate(fromCurrency?.short_name, receiveCurrency?.short_name);


      if (!result?.success) {
        LoaderHelper.loaderStatus(false);
        setConversionRate(0)
        return alertErrorMessage(result.message);
      }
      setConversionRate(result?.data?.rate || 0)

    } catch (err) {
      console.error("Failed to fetch/sort currency list:", err);
    } finally {
      LoaderHelper.loaderStatus(false);
    }
  };

  const nineDecimalFormat = (data) => {
    if (typeof (data) === "number") {
      // return data
      return parseFloat(data?.toFixed(9))
    } else {
      return 0
    }
  };

  const selectCurrency = (data, type) => {
    if (type === "from") {
      setFromCurrency(data);
    } else {
      setReceiveCurrency(data);
    }

  };

  const handleInterchangeWallet = () => {
    let fromWallet = fromCurrency;
    let toWallet = receiveCurrency;
    setFromCurrency(toWallet);
    setReceiveCurrency(fromWallet);
  };

  const handleMaxAmount = (type) => {
    if (!conversionRate) return;

    const rate = new BigNumber(conversionRate);

    if (type === "from") {
      const balance = new BigNumber(fromCurrency?.balance || 0);
      const fee = new BigNumber(fromCurrency?.swappingFee || 0);
      const remaining = BigNumber.maximum(balance.minus(fee), 0);

      const receiveAmount = remaining.multipliedBy(rate);

      setFromCurrencyAmount(parseFloat(remaining.toFixed())); // rounded to 8 decimal places
      setReceiveCurrencyAmount(parseFloat(receiveAmount.toFixed()));
    } else {
      const receiveBalance = new BigNumber(receiveCurrency?.balance || 0);
      const fromAmount = receiveBalance.dividedBy(rate);
      setReceiveCurrencyAmount(parseFloat(receiveBalance.toFixed()));
      setFromCurrencyAmount(parseFloat(fromAmount.toFixed()));
    }
  };

  const showMoreDetails = () => {
    $("#more_details").modal('show');
  }

  const handleCurrencySwaping = async () => {
    if (!fromCurrency?.currency_id || !receiveCurrency?.currency_id || !+fromCurrencyAmount || +fromCurrencyAmount <= 0) {
      return;
    }
    try {
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.swapToken(fromCurrency?.currency_id, receiveCurrency?.currency_id, +fromCurrencyAmount)
      if (result?.success) {
        alertSuccessMessage(result?.message)
        $("#more_details").modal('hide');
        getAvailableCurrency("update")
        setFromCurrencyAmount("");
        setReceiveCurrencyAmount("");
        getBuySellHistory()
      } else {
        alertErrorMessage(result?.message)
      }
    } finally {
      LoaderHelper.loaderStatus(false);
    }
  };

  const getBuySellHistory = async () => {
    LoaderHelper.loaderStatus(true);
    try {
      const result = await AuthService.quickBuySellHistory(0, 10)
      if (result?.success) {
        if (result?.data?.length > 0) {
          setTransactionHistory(result?.data);
          return;
        }
      }
    } finally { LoaderHelper.loaderStatus(false); }
  };

  const handleSwapInput = (e) => {
    let input = +e.target.value;
    let value = (nineDecimalFormat(input))
    switch (e.target.name) {
      case "fromSwap":
        setFromCurrencyAmount(value);
        setReceiveCurrencyAmount((value * conversionRate))
        break;
      case "toSwap":
        setReceiveCurrencyAmount(value);
        setFromCurrencyAmount((value / conversionRate));
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (fromCurrency?.short_name && receiveCurrency?.short_name) {
      setFromCurrencyAmount("");
      setReceiveCurrencyAmount("");
      // clearTimeout(timeoutRef.current);
      // timeoutRef.current = setTimeout(() => {
      //   getConversionrate();
      // }, 1000);
      getConversionrate();
    }

    return () => {
      // clearTimeout(timeoutRef.current);
    }
  }, [fromCurrency, receiveCurrency]);


  useEffect(() => {
    getAvailableCurrency("")
    getBuySellHistory("")
  }, [])

  return (
    <>

      <div className="dashboard_right">

        <div className="swap_outer_section">

          <h3>Quick Swap</h3>
          <div className="d-flex cnt_amountsl ">
            <ul className="swaplist">
              <li><span>Minimum Amount | Maximum Amount</span>1 | 500 USDT</li>
              <li><span>Swapping Fee</span>0.1 USDT</li>
            </ul>
            <div className="swap_bitcoin">
              <img src="/images/bitcoinswap.svg" className="img-fluid" alt="swapbitcoin" />
            </div>
          </div>


          <div className="swap_usdtdata">
            <div className="d-flex">
              <div className="swap_ustd_bl">
                <div className="from">
                  <p>From<i class="ri-information-line"></i></p>
                  <p>Available -- USDT <i class="ri-add-circle-fill"></i></p>
                </div>
                <div className="from">
                  <button data-bs-toggle="modal" data-bs-target="#search_coin"><img src="/images/tether_icon.png" className="img-fluid" alt="USDT" /> USDT <i class="ri-arrow-drop-down-fill"></i></button>
                  <h6>0</h6>
                </div>
              </div>

              <div className="swap_ustd_bl">
                <div className="from">
                  <p>From<i class="ri-information-line"></i></p>
                  <p>Available -- USDT <i class="ri-add-circle-fill"></i></p>
                </div>
                <div className="from">
                  <button data-bs-toggle="modal" data-bs-target="#search_coin"><img src="/images/tether_icon.png" className="img-fluid" alt="USDT" /> USDT <i class="ri-arrow-drop-down-fill"></i></button>
                  <h6>0</h6>
                </div>
              </div>

              <div class="vector_icon"><img src="/images/wallet_icon2.png" alt="wallet" /></div>

            </div>

            <p><span>Conversion Rate (Approx.)</span> 1 USDT  2.3674632571565426 BTC</p>

            <button className="btn">Sign Up/Log In</button>

          </div>


        </div>


        {/* <div className="swap_outer_section">

          <div className="give_currency_s">

            <div className="currency_block">
              <div className="top_heading_s">
                <h2>Pay</h2>

                <div className="searchBar custom-tabs">
                  <button><i className="ri-search-line"></i></button>
                  <input type="search" className="custom_search" placeholder="Search Crypto" value={fromSearch} onChange={(e) => setFromSearch(e.target.value)} />
                </div>

              </div>

              <div className="bitcoin_cate_list">
                <ul>
                  {currencyList?.length > 0 ? currencyList?.map((item, index) => {
                    return (
                      item?.short_name?.toLowerCase()?.includes(fromSearch?.toLowerCase()) &&
                      <li key={index} className={`icon ${fromCurrency?.currency_id === item?.currency_id && "active"} ${receiveCurrency?.currency_id === item?.currency_id && "disabled"}`} onClick={() => receiveCurrency?.currency_id !== item?.currency_id && selectCurrency(item, "from")}>
                        <img src={ApiConfig?.baseImage + item?.icon_path} alt="bitcoin" height="28px" />
                        <div className="bitcoin_cnt">
                          <h4>{item?.short_name}</h4>
                          <span className={`price ${item?.balance > 0 && "text-success"}`}>Bal: {nineDecimalFormat(item?.balance || 0)}</span>
                        </div>
                      </li>
                    )
                  }) :
                    <div className="no_data_outer">
                      <div className="no_data_vector">
                        <img src="/images/Group 1171275449 (1).svg" alt="no-data" />
                      </div>
                      <p>No Coin Available</p>
                    </div>
                  }
                </ul>
              </div>
            </div>
            <div className="currency_block">
              <div className="top_heading_s">
                <h2>Receive</h2>

                <div className="searchBar custom-tabs">
                  <button><i className="ri-search-line"></i></button>
                  <input type="search" className="custom_search" placeholder="Search Crypto" value={receieveSearch} onChange={(e) => setReceieveSearch(e.target.value)} />
                </div>

              </div>

              <div className="bitcoin_cate_list">
                <ul>
                  {currencyList?.length > 0 ? currencyList?.map((item, index) => {
                    return (
                      item?.short_name?.toLowerCase()?.includes(receieveSearch?.toLowerCase()) &&
                      <li key={index} className={`icon ${receiveCurrency?.currency_id === item?.currency_id && "active"} ${fromCurrency?.currency_id === item?.currency_id && "disabled"}`} onClick={() => fromCurrency?.currency_id !== item?.currency_id && selectCurrency(item, "receive")}>
                        <img src={ApiConfig?.baseImage + item?.icon_path} alt="bitcoin" height="28px" />
                        <div className="bitcoin_cnt">
                          <h4>{item?.short_name}</h4>
                          <span className={`price ${item?.balance > 0 && "text-success"}`}>Bal: {nineDecimalFormat(item?.balance || 0)}</span>
                        </div>
                      </li>
                    )
                  }) :
                    <div className="no_data_outer">
                      <div className="no_data_vector">
                        <img src="/images/Group 1171275449 (1).svg" alt="no-data" />
                      </div>
                      <p>No Coin Available</p>
                    </div>
                  }
                </ul>
              </div>


            </div>

          </div>

          <div className="swap_currency_total">

            <section className="block_currency">

              <div className="bitcoin_currency">
                <div className="bitcoin_top_currency icon">
                  <h3><img src={ApiConfig?.baseImage + fromCurrency?.icon_path} alt={fromCurrency?.currency} height="35px" />{fromCurrency?.currency || "---"}</h3>
                  <ul>
                    <li>Min Amount: {nineDecimalFormat(fromCurrency?.minSwapping)} {fromCurrency?.short_name}</li>
                    <li>Bal: {nineDecimalFormat(fromCurrency?.balance)} {fromCurrency?.short_name}</li>
                  </ul>
                </div>

                <div className="price_max_total">
                  <input type="number" placeholder={`Amount (${fromCurrency?.short_name || ""})`} onWheel={(e) => e.target.blur()} name="fromSwap" value={fromCurrencyAmount} onChange={handleSwapInput} />
                  <button onClick={() => handleMaxAmount("from")}>Max</button>

                </div>
                {fromCurrencyAmount && +fromCurrencyAmount > 0 ? (
                  (() => {
                    const amount = new BigNumber(+fromCurrencyAmount || 0);
                    const fee = new BigNumber(fromCurrency?.swappingFee || 0);
                    const balance = new BigNumber(fromCurrency?.balance || 0);
                    const minAmount = new BigNumber(fromCurrency?.minSwapping || 0);
                    const totalRequired = amount.plus(fee);

                    if (totalRequired.isGreaterThan(balance)) {
                      return <small className="text-danger">Insufficient funds. <a href="/asset_managemnet/deposit">Deposit now<i className="ri-arrow-right-up-line"></i></a></small>;
                    } else if (amount.isLessThan(minAmount)) {
                      return <small className="text-danger">Amount should be greater than {fromCurrency?.minSwapping} {fromCurrency?.short_name}</small>;
                    }
                    return "";
                  })()
                ) : ""}
              </div>

              <div className="vector_icon">
                <img src="/images/wallet_icon2.png" alt="wallet" onClick={handleInterchangeWallet} />
              </div>
              <div className="bitcoin_currency">
                <div className="bitcoin_top_currency icon">
                  <h3><img src={ApiConfig?.baseImage + receiveCurrency?.icon_path} alt={fromCurrency?.currency} height="35px" />{receiveCurrency?.currency}</h3>
                  <ul>
                    <li>Bal: {nineDecimalFormat(receiveCurrency?.balance)}  {receiveCurrency?.short_name}</li>
                  </ul>
                </div>

                <div className="price_max_total">
                  <input type="number" placeholder={`Amount (${receiveCurrency?.short_name || ""})`} value={nineDecimalFormat(receiveCurrencyAmount)} disabled />
                  <input type="number" placeholder={`Amount (${receiveCurrency?.short_name || ""})`} onWheel={(e) => e.target.blur()} name="toSwap" value={receiveCurrencyAmount} onChange={handleSwapInput} />
                  <button onClick={() => handleMaxAmount("to")}>Max</button>
                </div>
              </div>

            </section>

            <div className="amount_detail_bottom">
              <div className="amount_cnt">
                <p>Minimum Amount | Maximum Amount <span className=" text-success">{nineDecimalFormat(fromCurrency?.minSwapping)} | {nineDecimalFormat(fromCurrency?.maxSwapping)} {fromCurrency?.short_name}</span></p>
              </div>

              <div className="amount_cnt">
                <p>Swapping Fee <span className=" text-success">{fromCurrency?.swappingFee} {fromCurrency?.short_name}</span></p>
              </div>

              <div className="amount_cnt">
                <p>Conversion Rate (Approx.)<span className=" text-success">1 {fromCurrency?.short_name} <i className="ri-arrow-right-double-line"></i>  {(conversionRate)} {receiveCurrency?.short_name}</span></p>
              </div>

              {(() => {
                const amount = new BigNumber(+fromCurrencyAmount || 0);
                const fee = new BigNumber(fromCurrency?.swappingFee || 0);
                const balance = new BigNumber(fromCurrency?.balance || 0);
                const minAmount = new BigNumber(fromCurrency?.minSwapping || 0);
                const totalRequired = amount.plus(fee);

                const isValid = amount.isGreaterThan(0) &&
                  receiveCurrencyAmount > 0 &&
                  totalRequired.isLessThanOrEqualTo(balance) &&
                  amount.isGreaterThanOrEqualTo(minAmount);

                return isValid ? (
                  <button className="orderbtn" onClick={showMoreDetails}>Place Order</button>
                ) : (
                  <button className="orderbtn" disabled>Place Order</button>
                );
              })()}

            </div>

          </div>

        </div> */}

        <div className="dashboard_recent_s swap_tb_his">
          <div className="user_list_top">
            <div className="d-flex-between  mb-3  custom_dlflex">
              <h4>Recent Transactions </h4>
              <div class="searchBar custom-tabs"><i class="ri-search-2-line"></i><input type="search" class="custom_search" placeholder="Search Crypto" /></div>
            </div>
            {/* <div className="user_search">
              <form>
                <input className='search' type="text" placeholder="Currency" />
                <div className="currency_btn_2"> <button className='searchbtn'>Search</button>
                  <button className='restbtn'>Rest</button>
                </div>
              </form>
            </div> */}
          </div>
          <div className="desktop_view2">
            <div className='table-responsive'>
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Date</th>
                    <th>Swapping Currencies</th>
                    <th>Pay Amount</th>
                    <th>Get Amount</th>
                    <th>Swapping Fee</th>
                    <th>Conversion Rate</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionHistory?.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{moment(item.createdAt).format("YYYY-MM-DD hh:mm A")} </td>
                        <td> {item?.from} <i className="ri-arrow-right-double-line"></i> {item?.to}</td>
                        <td>{item?.pay_amount} {item?.from}</td>
                        <td>{item?.get_amount} {item?.to}</td>
                        <td>{item?.fee} {item?.from}</td>
                        <td>1 {item?.from} {"=>"} {item?.conversion_rate} {item?.to}</td>
                        <td className="text-success">Completed</td>
                      </tr>
                    )
                  })}

                </tbody>
              </table>

            </div>
          </div>

          <div className="mobile_view">
            <div className='table-responsive'>
              <table>
                <thead>
                  <tr>
                    <th>Swapping Currencies</th>
                    <th>Pay Amount</th>
                    <th>Get Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionHistory?.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td> {item?.from} <i className="ri-arrow-right-double-line"></i> {item?.to}</td>
                        <td>{item?.pay_amount} {item?.from}</td>
                        <td>{item?.get_amount} {item?.to}</td>
                      </tr>
                    )
                  })}

                </tbody>
              </table>

            </div>
          </div>


        </div>

      </div>

      {/* <!-- Modal  more details Pop Up Start --> */}


      <div className="modal fade search_form search_coin"
        id="search_coin" tabIndex="-1" aria-labelledby="exampleModalLabel">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4>Select Crypto</h4>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>

            <div className="modal-body">
              <form>
                <input type="text" placeholder="Search coin name " />
              </form>

              <div className="hot_trading_t">
                <div className="table-responsive">
                  <table>
                    <tbody>

                      <tr data-bs-dismiss="modal">
                        <td>
                          <div className="td_first">
                            <div className="icon">
                              <img
                                src="https://backend.gatbits.com/icons/coin-image-1751740975587-586000162.png"
                                alt="icon"
                                width="30"
                              />
                            </div>
                            <div className="price_heading">AVAX<span>/USDT</span></div>
                          </div>
                        </td>
                        <td className="right_t price_tb">0.00%</td>
                      </tr>

                      <tr data-bs-dismiss="modal">
                        <td>
                          <div className="td_first">
                            <div className="icon">
                              <img
                                src="https://backend.gatbits.com/icons/coin-image-1751739888899-576451443.png"
                                alt="icon"
                                width="30"
                              />
                            </div>
                            <div className="price_heading">DOGE<span>/USDT</span></div>
                          </div>
                        </td>
                        <td className="right_t price_tb">0.00%</td>
                      </tr>

                      <tr data-bs-dismiss="modal">
                        <td>
                          <div className="td_first">
                            <div className="icon">
                              <img
                                src="https://backend.gatbits.com/icons/coin-image-1751739854071-903335949.png"
                                alt="icon"
                                width="30"
                              />
                            </div>
                            <div className="price_heading">BNB<span>/USDT</span></div>
                          </div>
                        </td>
                        <td className="right_t price_tb">0.00%</td>
                      </tr>

                      <tr data-bs-dismiss="modal">
                        <td>
                          <div className="td_first">
                            <div className="icon">
                              <img
                                src="https://backend.gatbits.com/icons/coin-image-1751739632227-609587235.png"
                                alt="icon"
                                width="30"
                              />
                            </div>
                            <div className="price_heading">BTC<span>/USDT</span></div>
                          </div>
                        </td>
                        <td className="right_t price_tb">0.00%</td>
                      </tr>
                      <tr data-bs-dismiss="modal">
                        <td>
                          <div className="td_first">
                            <div className="icon">
                              <img
                                src="https://backend.gatbits.com/icons/coin-image-1751739632227-609587235.png"
                                alt="icon"
                                width="30"
                              />
                            </div>
                            <div className="price_heading">BTC<span>/USDT</span></div>
                          </div>
                        </td>
                        <td className="right_t price_tb">0.00%</td>
                      </tr>
                      <tr data-bs-dismiss="modal">
                        <td>
                          <div className="td_first">
                            <div className="icon">
                              <img
                                src="https://backend.gatbits.com/icons/coin-image-1751739632227-609587235.png"
                                alt="icon"
                                width="30"
                              />
                            </div>
                            <div className="price_heading">BTC<span>/USDT</span></div>
                          </div>
                        </td>
                        <td className="right_t price_tb">0.00%</td>
                      </tr>
                      <tr data-bs-dismiss="modal">
                        <td>
                          <div className="td_first">
                            <div className="icon">
                              <img
                                src="https://backend.gatbits.com/icons/coin-image-1751739632227-609587235.png"
                                alt="icon"
                                width="30"
                              />
                            </div>
                            <div className="price_heading">BTC<span>/USDT</span></div>
                          </div>
                        </td>
                        <td className="right_t price_tb">0.00%</td>
                      </tr>
                      <tr data-bs-dismiss="modal">
                        <td>
                          <div className="td_first">
                            <div className="icon">
                              <img
                                src="https://backend.gatbits.com/icons/coin-image-1751739632227-609587235.png"
                                alt="icon"
                                width="30"
                              />
                            </div>
                            <div className="price_heading">BTC<span>/USDT</span></div>
                          </div>
                        </td>
                        <td className="right_t price_tb">0.00%</td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* <div className="modal fade search_form search_coin" id="more_details" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Order details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body modal-swap ">
              <div className="hot_trading_t model_height">
                <table>
                  <tbody>

                    <tr>
                      <td>Swapping </td>
                      <td className="right_t price_tb">{fromCurrencyAmount} {fromCurrency?.short_name} <i className="ri-arrow-right-double-line"></i>
                        {nineDecimalFormat(receiveCurrencyAmount)} {receiveCurrency?.short_name}</td>
                    </tr>
                    <tr>
                      <td>Swapping Fee</td>
                      <td className="right_t price_tb">{fromCurrency?.swappingFee} {fromCurrency?.short_name}</td>
                    </tr>
                    <tr>
                      <td>Deductable Amount</td>
                      <td className="right_t price_tb">{nineDecimalFormat(fromCurrency?.swappingFee + +fromCurrencyAmount)} {fromCurrency?.short_name}</td>
                    </tr>
                    <tr>
                      <td>Receivable Amount(Approx.)</td>
                      <td className="right_t price_tb">{nineDecimalFormat(receiveCurrencyAmount) || 0} {receiveCurrency?.short_name}</td>
                    </tr>
                    <tr>
                      <td className="text-info">
                        <i className="ri-information-2-line"></i> This is an internal transfer. The final disbursed amount will be based on the current market rate at the time of execution. Minor fluctuations may occur between placing the order and its execution.
                      </td>
                    </tr>

                    <div className="mt-2">
                      <button className="orderbtn" onClick={handleCurrencySwaping}>Confirm Order</button>
                    </div>

                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div> */}


      {/* <!-- Modal   more details Pop Up End --> */}

    </>


  )
}

export default Swap