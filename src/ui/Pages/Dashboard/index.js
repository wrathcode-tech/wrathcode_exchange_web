import React, { useContext, useEffect, useState } from 'react'
import "swiper/css";
import "swiper/css/pagination";
import { ApiConfig } from '../../../api/apiConfig/apiConfig';
import AuthService from '../../../api/services/AuthService';
import { SocketContext } from "../../../customComponents/SocketContext";
import { Link } from 'react-router-dom';
import DashboardHeader from '../../../customComponents/DashboardHeader';
import { ProfileContext } from '../../../context/ProfileProvider';
import LoaderHelper from '../../../customComponents/Loading/LoaderHelper';
import { alertErrorMessage } from '../../../customComponents/CustomAlertMessage';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper";


const Dashboard = (props) => {
  const { socket } = useContext(SocketContext);
  const { modalStatus, updateModelHideStatus } = useContext(ProfileContext);
  const [coinData, setCoinData] = useState([]);
  const [favCoins, setfavCoins] = useState([]);
  const [estimatedportfolio, setEstimatedportfolio] = useState();
  const [showBalance, setShowBalance] = useState(false);
  const [highlightCoins, setHighlightCoins] = useState({ new: {}, topGainer: {}, topLoser: {}, topVolumne: {} });

  const formatNumber = (data, decimal = 5) => {
    // Try to convert strings like "22" or "22.567" into numbers
    const num = typeof data === "string" ? Number(data) : data;

    // Check if it's a valid number (not NaN, not undefined/null)
    if (typeof num === "number" && !isNaN(num)) {
      return (parseFloat(num.toFixed(decimal)));
    }

    return "0.00"; // "0.00"
  };
  const favoriteList = async () => {
    try {
      const result = await AuthService.favoriteList()
      if (result?.success) {
        setfavCoins(result?.data?.pairs ? result?.data?.pairs : []);

      }
    } catch (error) {
    }
  };

  const estimatedPortfolio = async (type) => {
    try {
      const result = await AuthService.estimatedPortfolio(type)
      if (result?.success) {
        setEstimatedportfolio(result?.data);
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    let interval;
    if (socket) {
      let payload = {
        'message': 'market',
      }
      socket.emit('message', payload);
      interval = setInterval(() => {
        let payload = {
          'message': 'market',
        }
        socket.emit('message', payload);
      }, 2000)

      socket.on('message', (data) => {
        setCoinData(data?.pairs);

        let topGainer = data?.pairs?.reduce((max, item) => {
          return parseFloat(item.change) > parseFloat(max.change) ? item : max;
        }, data.pairs[0]);

        let topLoser = data?.pairs?.reduce((min, item) => {
          return parseFloat(item.change) < parseFloat(min.change) ? item : min;
        }, data.pairs[0]);

        let newest = data?.pairs?.reverse()[0];

        const validVolumePairs = data?.pairs?.filter(item => item?.volume !== undefined && item?.volume !== null);

        const highestVolumePair = validVolumePairs?.reduce((max, item) => {
          return parseFloat(item.volume) > parseFloat(max.volume) ? item : max;
        }, validVolumePairs[0]);


        setHighlightCoins({ new: newest || {}, topGainer: topGainer || {}, topLoser: topLoser || {}, topVolumne: highestVolumePair || {} });

      });
    }
    return (() => {
      clearInterval(interval)
    })
  }, [socket]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    estimatedPortfolio("")
    favoriteList()
  }, []);

  const handleCheckGiveaway = async () => {
    LoaderHelper.loaderStatus(true);

    const res = await AuthService.checkGiveawayStatus();

    LoaderHelper.loaderStatus(false);

    if (res.success) {
      // setAllData(res.data);
    }
    // ❌ else me koi error message nahi
  };


  useEffect(() => {
    handleCheckGiveaway();
  }, []);



  return (
    <>


      <div className="dashboard_right">

        <DashboardHeader props={props} />
        <div className="estimated_balance dash_balance desktop_view">
          <div className='div_tag'>
            <div className="balance_chart_left">
              <div className="d-flex justify-content-between">
                <h4>Newest (Pair)</h4> <Link to="/market">  <i className="ri-arrow-right-s-line"></i></Link>
              </div>
              <div className="select_price">
                <ul className='wallet_price_list'>
                  <li><h3 className={`${highlightCoins?.new?.change > 0 ? "text-success" : "text-danger"}`}>{highlightCoins?.new?.buy_price || 0.00} {highlightCoins?.new?.quote_currency || "---"} | {highlightCoins?.new?.change || 0.00}%</h3></li>
                  <li><span>≈ {highlightCoins?.new?.base_currency_fullname || "---"}</span></li>
                </ul>
                <div className="dashboardsummary_bottom">
                  <h4>{highlightCoins?.new?.base_currency || "---"}/{highlightCoins?.new?.quote_currency || "---"}</h4>
                  <Link className="btn" to={`/trade/${highlightCoins?.new?.base_currency || "base"}_${highlightCoins?.new?.quote_currency || "quote"}`}>Make Trade</Link>
                </div>

              </div>
            </div>
          </div>

          <div className='div_tag'>
            <div className="balance_chart_left">
              <div className="d-flex justify-content-between">
                <h4>Top gainer (24h)</h4> <Link to="/market">  <i className="ri-arrow-right-s-line"></i></Link>
              </div>
              <div className="select_price">

                <ul className='wallet_price_list'>
                  <li><h3 className={`${highlightCoins?.topGainer?.change > 0 ? "text-success" : "text-danger"}`}>{highlightCoins?.topGainer?.buy_price || 0.00} {highlightCoins?.topGainer?.quote_currency || "---"} | {highlightCoins?.topGainer?.change || 0.00}%</h3></li>
                  <li><span>≈ {highlightCoins?.topGainer?.base_currency_fullname || "---"}</span></li>
                </ul>

                <div className="dashboardsummary_bottom">
                  <h4>{highlightCoins?.topGainer?.base_currency || "---"}/{highlightCoins?.topGainer?.quote_currency || "---"}</h4>
                  <Link className="btn" to={`/trade/${highlightCoins?.topGainer?.base_currency || "base"}_${highlightCoins?.topGainer?.quote_currency || "quote"}`}>Make Trade</Link>
                </div>
              </div>
            </div>
          </div>

          <div className='div_tag'>
            <div className="balance_chart_left">
              <div className="d-flex justify-content-between">
                <h4>Top Loser (24h)</h4><Link to="/market">  <i className="ri-arrow-right-s-line"></i></Link>
              </div>
              <div className="select_price">

                <ul className='wallet_price_list'>
                  <li><h3 className={`${highlightCoins?.topLoser?.change > 0 ? "text-success" : "text-danger"}`}>{highlightCoins?.topLoser?.buy_price || 0.00} {highlightCoins?.topLoser?.quote_currency || "---"} | {highlightCoins?.topLoser?.change || 0.00}%</h3></li>
                  <li><span>≈ {highlightCoins?.topLoser?.base_currency_fullname || "---"}</span></li>
                </ul>

                <div className="dashboardsummary_bottom">
                  <h4>{highlightCoins?.topLoser?.base_currency || "---"}/{highlightCoins?.topLoser?.quote_currency || "---"}</h4>
                  <Link className="btn" to={`/trade/${highlightCoins?.topLoser?.base_currency || "base"}_${highlightCoins?.topLoser?.quote_currency || "quote"}`}>Make Trade</Link>
                </div>
              </div>
            </div>
          </div>

          <div className='div_tag'>
            <div className="balance_chart_left">
              <div className="d-flex justify-content-between">
                <h4>High Volume (24H)</h4> <Link to="/market">  <i className="ri-arrow-right-s-line"></i></Link>
              </div>
              <div className="select_price">

                <ul className='wallet_price_list'>
                  <li><h3 className={`${highlightCoins?.topVolumne?.change > 0 ? "text-success" : "text-danger"}`}>{highlightCoins?.topVolumne?.buy_price || 0.00} {highlightCoins?.topVolumne?.quote_currency || "---"} | {highlightCoins?.topVolumne?.change || 0.00}%</h3></li>
                  <li><span>≈ {highlightCoins?.topVolumne?.base_currency_fullname || "---"}</span></li>
                </ul>

                <div className="dashboardsummary_bottom">
                  <h4>{highlightCoins?.topVolumne?.base_currency || "---"}/{highlightCoins?.topVolumne?.quote_currency || "---"}</h4>
                  <Link className="btn" to={`/trade/${highlightCoins?.topVolumne?.base_currency || "base"}_${highlightCoins?.topVolumne?.quote_currency || "quote"}`}>Make Trade</Link>
                </div>
              </div>
            </div>
          </div>

        </div>




        <div className="estimated_balance dash_balance mobile_view">

          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            spaceBetween={20}
            slidesPerView={1}
          >

            {/* Newest Pair */}
            <SwiperSlide>
              <div className='div_tag'>
                <div className="balance_chart_left">
                  <div className="d-flex justify-content-between">
                    <h4>Newest (Pair)</h4>
                    <Link to="/market"><i className="ri-arrow-right-s-line"></i></Link>
                  </div>

                  <div className="select_price">
                    <ul className='wallet_price_list'>
                      <li>
                        <h3 className={`${highlightCoins?.new?.change > 0 ? "text-success" : "text-danger"}`}>
                          {highlightCoins?.new?.buy_price || 0.00} {highlightCoins?.new?.quote_currency || "---"} |
                          {highlightCoins?.new?.change || 0.00}%
                        </h3>
                      </li>
                      <li><span>≈ {highlightCoins?.new?.base_currency_fullname || "---"}</span></li>
                    </ul>

                    <div className="dashboardsummary_bottom">
                      <h4>{highlightCoins?.new?.base_currency || "---"}/{highlightCoins?.new?.quote_currency || "---"}</h4>
                      <Link className="btn" to={`/trade/${highlightCoins?.new?.base_currency || "base"}_${highlightCoins?.new?.quote_currency || "quote"}`}>
                        Make Trade
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            {/* Top Gainer */}
            <SwiperSlide>
              <div className='div_tag'>
                <div className="balance_chart_left">
                  <div className="d-flex justify-content-between">
                    <h4>Top gainer (24h)</h4>
                    <Link to="/market"><i className="ri-arrow-right-s-line"></i></Link>
                  </div>

                  <div className="select_price">
                    <ul className='wallet_price_list'>
                      <li>
                        <h3 className={`${highlightCoins?.topGainer?.change > 0 ? "text-success" : "text-danger"}`}>
                          {highlightCoins?.topGainer?.buy_price || 0.00} {highlightCoins?.topGainer?.quote_currency || "---"} |
                          {highlightCoins?.topGainer?.change || 0.00}%
                        </h3>
                      </li>
                      <li><span>≈ {highlightCoins?.topGainer?.base_currency_fullname || "---"}</span></li>
                    </ul>

                    <div className="dashboardsummary_bottom">
                      <h4>{highlightCoins?.topGainer?.base_currency || "---"}/{highlightCoins?.topGainer?.quote_currency || "---"}</h4>
                      <Link className="btn" to={`/trade/${highlightCoins?.topGainer?.base_currency || "base"}_${highlightCoins?.topGainer?.quote_currency || "quote"}`}>
                        Make Trade
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            {/* Top Loser */}
            <SwiperSlide>
              <div className='div_tag'>
                <div className="balance_chart_left">
                  <div className="d-flex justify-content-between">
                    <h4>Top Loser (24h)</h4>
                    <Link to="/market"><i className="ri-arrow-right-s-line"></i></Link>
                  </div>

                  <div className="select_price">
                    <ul className='wallet_price_list'>
                      <li>
                        <h3 className={`${highlightCoins?.topLoser?.change > 0 ? "text-success" : "text-danger"}`}>
                          {highlightCoins?.topLoser?.buy_price || 0.00} {highlightCoins?.topLoser?.quote_currency || "---"} |
                          {highlightCoins?.topLoser?.change || 0.00}%
                        </h3>
                      </li>
                      <li><span>≈ {highlightCoins?.topLoser?.base_currency_fullname || "---"}</span></li>
                    </ul>

                    <div className="dashboardsummary_bottom">
                      <h4>{highlightCoins?.topLoser?.base_currency || "---"}/{highlightCoins?.topLoser?.quote_currency || "---"}</h4>
                      <Link className="btn" to={`/trade/${highlightCoins?.topLoser?.base_currency || "base"}_${highlightCoins?.topLoser?.quote_currency || "quote"}`}>
                        Make Trade
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            {/* High Volume */}
            <SwiperSlide>
              <div className='div_tag'>
                <div className="balance_chart_left">
                  <div className="d-flex justify-content-between">
                    <h4>High Volume (24H)</h4>
                    <Link to="/market"><i className="ri-arrow-right-s-line"></i></Link>
                  </div>

                  <div className="select_price">
                    <ul className='wallet_price_list'>
                      <li>
                        <h3 className={`${highlightCoins?.topVolumne?.change > 0 ? "text-success" : "text-danger"}`}>
                          {highlightCoins?.topVolumne?.buy_price || 0.00} {highlightCoins?.topVolumne?.quote_currency || "---"} |
                          {highlightCoins?.topVolumne?.change || 0.00}%
                        </h3>
                      </li>
                      <li><span>≈ {highlightCoins?.topVolumne?.base_currency_fullname || "---"}</span></li>
                    </ul>

                    <div className="dashboardsummary_bottom">
                      <h4>{highlightCoins?.topVolumne?.base_currency || "---"}/{highlightCoins?.topVolumne?.quote_currency || "---"}</h4>
                      <Link className="btn" to={`/trade/${highlightCoins?.topVolumne?.base_currency || "base"}_${highlightCoins?.topVolumne?.quote_currency || "quote"}`}>
                        Make Trade
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>

          </Swiper>

        </div>




        <div className="dashboard_listing_section">
          <div className="listing_left_outer">
            <div className="crypto_deposit">
              <h4>Stat by depositing some crypto</h4>
              <ul>
                <li>

                  <div className="estimate_cnt">
                    <h5> Estimated Portfolio</h5>
                    <h4>{showBalance ? formatNumber(estimatedportfolio?.dollarPrice, 8) || 0 : "*********"}  USD <span>{showBalance ? formatNumber(estimatedportfolio?.currencyPrice, 8) || 0 : "*********"}{" "}{estimatedportfolio?.Currency || "---"}</span>  {showBalance ?
                      <i className="ri-eye-close-line mx-1" onClick={() => setShowBalance(false)}></i>
                      :
                      <i className="ri-eye-line mx-1" onClick={() => setShowBalance(true)}></i>}</h4>
                  </div>
                  <div className="estimated_portfolio">
                    <Link className="deposit_btn" to="/asset_managemnet/deposit">Deposit</Link>
                    <Link className="deposit_btn withdraw" to="/asset_managemnet/withdraw">Withdraw</Link>
                  </div>
                </li>
              </ul>
            </div>

            <div className="market_section maindashboard">
              <div className="top_heading">
                <h4>Markets</h4>
                <a className="more_btn" href="/market">More {">"}</a>
              </div>
              <div className="dashboard_summary">
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home"
                      type="button" role="tab" aria-controls="home" aria-selected="true">Trending</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button"
                      role="tab" aria-controls="profile" aria-selected="false">Hot</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#contact" type="button"
                      role="tab" aria-controls="contact" aria-selected="false">New Listing</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#favorite"
                      type="button" role="tab" aria-controls="favorite" aria-selected="false">Favorite</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#gainers" type="button"
                      role="tab" aria-controls="gainers" aria-selected="false">Top Gainers</button>
                  </li>
                </ul>
                <div className="tab-content" id="myTabContent">
                  <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                    <div className='desktop_view'>
                      <div className='table-responsive'>
                        <table>
                          <thead>
                            <tr>
                              <th>Coin</th>
                              <th>Price</th>
                              <th>24H High</th>
                              <th>24H Change</th>
                              <th className="right_t">Trade</th>
                            </tr>
                          </thead>
                          <tbody>
                            {coinData?.length > 0 ? coinData?.map((item) => {
                              return (
                                <>
                                  <tr>
                                    <td>
                                      <div className="td_first">
                                        <div className="icon"><img src={ApiConfig?.baseImage + item?.icon_path} height="30px" alt="icon" /></div>
                                        <div className="price_heading"> {item?.base_currency} <br /> <span>{item?.base_currency_fullname}</span></div>
                                      </div>
                                    </td>
                                    <td>{formatNumber(item?.buy_price, 5)} <br /> <span className='fontWeight'>{item?.quote_currency}</span></td>
                                    <td>{formatNumber(item?.high, 5)}</td>
                                    {item?.change_percentage > 0 ? <td className="green">+{formatNumber(item?.change_percentage, 5)}%</td> : <td className="red">-{formatNumber(item?.change_percentage, 5)}%</td>}
                                    <td className="right_t"><a href={`/trade/${item?.base_currency}_${item?.quote_currency}`}>Trade</a></td>
                                  </tr>
                                </>
                              )
                            }) : <tr rowSpan="5" className="no-data-row">
                              <td colSpan="12">
                                <div className="no-data-wrapper">
                                  <div className="no_data_s">
                                    <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                                  </div>
                                </div>
                              </td>
                            </tr>}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className='mobile_view'>
                      <div className='table-responsive'>
                        <table>
                          <thead>
                            <tr>
                              <th>Coin</th>
                              <th>Price</th>
                              <th className="right_t">24 High/Change</th>
                            </tr>
                          </thead>
                          <tbody>
                            {coinData?.length > 0 ? coinData?.map((item) => {
                              return (
                                <>
                                  <tr>
                                    <td>
                                      <div className="td_first">
                                        <div className="icon"><img src={ApiConfig?.baseImage + item?.icon_path} height="30px" alt="icon" /></div>
                                        <div className="price_heading"> {item?.base_currency} <br /> <span>{item?.base_currency_fullname}</span></div>
                                      </div>
                                    </td>
                                    <td>{formatNumber(item?.buy_price, 5)} <br /> <span className='fontWeight'>{item?.quote_currency}</span></td>
                                    <td className="right_t">{formatNumber(item?.high, 5)}
                                      {item?.change_percentage > 0 ? <div className="green">+{formatNumber(item?.change_percentage, 5)}%</div> :
                                        <div className="red">-{formatNumber(item?.change_percentage, 5)}%</div>}</td>

                                  </tr>
                                </>
                              )
                            }) : <tr rowSpan="5" className="no-data-row">
                              <td colSpan="12">
                                <div className="no-data-wrapper">
                                  <div className="no_data_s">
                                    <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                                  </div>
                                </div>
                              </td>
                            </tr>}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                  <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                    <div className='desktop_view'>
                      <div className='table-responsive'>
                        <table>
                          <thead>
                            <tr>
                              <th>Coin</th>
                              <th>Price</th>
                              <th>24H High</th>
                              <th>24H Change</th>
                              <th className="right_t">Trade</th>
                            </tr>
                          </thead>
                          <tbody>
                            {coinData?.length > 0 ? coinData?.slice(0, 5)?.map((item) => {
                              return (
                                <>
                                  <tr>
                                    <td>
                                      <div className="td_first">
                                        <div className="icon"><img src={ApiConfig?.baseImage + item?.icon_path} height="30px" alt="icon" /></div>
                                        <div className="price_heading"> {item?.base_currency} <br /> <span>{item?.base_currency_fullname}</span></div>
                                      </div>
                                    </td>
                                    <td>{formatNumber(item?.buy_price, 5)} <br /> {item?.quote_currency}</td>
                                    <td>{formatNumber(item?.high, 5)}</td>
                                    {item?.change_percentage > 0 ? <td className="green">+{formatNumber(item?.change_percentage, 5)}%</td> : <td className="red">-{formatNumber(item?.change_percentage, 5)}%</td>}
                                    <td className="right_t"><a href={`/trade/${item?.base_currency}_${item?.quote_currency}`}>Trade</a></td>
                                  </tr>
                                </>
                              )
                            }) : <tr rowSpan="5" className="no-data-row">
                              <td colSpan="12">
                                <div className="no-data-wrapper">
                                  <div className="no_data_s">
                                    <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                                  </div>
                                </div>
                              </td>
                            </tr>}


                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className='mobile_view'>
                      <div className='table-responsive'>
                        <table>
                          <thead>
                            <tr>
                              <th>Coin</th>
                              <th>Price</th>
                              <th className="right_t">24H High/Change</th>
                            </tr>
                          </thead>
                          <tbody>
                            {coinData?.length > 0 ? coinData?.slice(0, 5)?.map((item) => {
                              return (
                                <>
                                  <tr>
                                    <td>
                                      <div className="td_first">
                                        <div className="icon"><img src={ApiConfig?.baseImage + item?.icon_path} height="30px" alt="icon" /></div>
                                        <div className="price_heading"> {item?.base_currency} <br /> <span>{item?.base_currency_fullname}</span></div>
                                      </div>
                                    </td>
                                    <td>{formatNumber(item?.buy_price, 5)} <br /> {item?.quote_currency}</td>
                                    <td className="right_t">{formatNumber(item?.high, 5)}
                                      {item?.change_percentage > 0 ?
                                        <div className="green">+{formatNumber(item?.change_percentage, 5)}%</div> :
                                        <div className="red">-{formatNumber(item?.change_percentage, 5)}%</div>}
                                    </td>
                                  </tr>
                                </>
                              )
                            }) : <tr rowSpan="5" className="no-data-row">
                              <td colSpan="12">
                                <div className="no-data-wrapper">
                                  <div className="no_data_s">
                                    <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                                  </div>
                                </div>
                              </td>
                            </tr>}


                          </tbody>
                        </table>
                      </div>
                    </div>


                  </div>
                  <div className="tab-pane fade" id="contact" role="tabpanel" aria-labelledby="contact-tab">
                    <div className='desktop_view'>
                      <div className='table-responsive'>
                        <table>
                          <thead>
                            <tr>
                              <th>Coin</th>
                              <th>Price</th>
                              <th>24H High</th>
                              <th>24H Change</th>
                              <th className="right_t">Trade</th>
                            </tr>
                          </thead>
                          <tbody>

                            {coinData?.length > 0 ? coinData?.reverse()?.slice(0, 7)?.map((item) => {

                              return (
                                <>
                                  <tr>
                                    <td>
                                      <div className="td_first">
                                        <div className="icon"><img src={ApiConfig?.baseImage + item?.icon_path} height="30px" alt="icon" /></div>
                                        <div className="price_heading"> {item?.base_currency} <br /> <span>{item?.base_currency_fullname}</span></div>
                                      </div>
                                    </td>
                                    <td>{formatNumber(item?.buy_price, 5)} <br /> {item?.quote_currency}</td>
                                    <td>{formatNumber(item?.high, 5)}</td>
                                    {item?.change_percentage > 0 ? <td className="green">+{formatNumber(item?.change_percentage, 5)}%</td> : <td className="red">-{formatNumber(item?.change_percentage, 5)}%</td>}
                                    <td className="right_t"><a href={`/trade/${item?.base_currency}_${item?.quote_currency}`}>Trade</a></td>
                                  </tr>
                                </>
                              )
                            }) : <tr rowSpan="5" className="no-data-row">
                              <td colSpan="12">
                                <div className="no-data-wrapper">
                                  <div className="no_data_s">
                                    <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                                  </div>
                                </div>
                              </td>
                            </tr>}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className='mobile_view'>
                      <div className='table-responsive'>
                        <table>
                          <thead>
                            <tr>
                              <th>Coin</th>
                              <th>Price</th>
                              <th className="right_t">24H High/Change</th>
                            </tr>
                          </thead>
                          <tbody>

                            {coinData?.length > 0 ? coinData?.reverse()?.slice(0, 7)?.map((item) => {

                              return (
                                <>
                                  <tr>
                                    <td>
                                      <div className="td_first">
                                        <div className="icon"><img src={ApiConfig?.baseImage + item?.icon_path} height="30px" alt="icon" /></div>
                                        <div className="price_heading"> {item?.base_currency} <br /> <span>{item?.base_currency_fullname}</span></div>
                                      </div>
                                    </td>
                                    <td>{formatNumber(item?.buy_price, 5)} <br /> {item?.quote_currency}</td>
                                    <td className="right_t">{formatNumber(item?.high, 5)}
                                      {item?.change_percentage > 0 ?
                                        <div className="green">+{formatNumber(item?.change_percentage, 5)}%</div> :
                                        <div className="red">-{formatNumber(item?.change_percentage, 5)}%</div>}
                                    </td>
                                  </tr>
                                </>
                              )
                            }) : <tr rowSpan="5" className="no-data-row">
                              <td colSpan="12">
                                <div className="no-data-wrapper">
                                  <div className="no_data_s">
                                    <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                                  </div>
                                </div>
                              </td>
                            </tr>}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                  <div className="tab-pane fade" id="favorite" role="tabpanel" aria-labelledby="favorite-tab">
                    <div className='desktop_view'>
                      <div className='table-responsive'>
                        <table>
                          <thead>
                            <tr>
                              <th>Coin</th>
                              <th>Price</th>
                              <th>24H High</th>
                              <th>24H Change</th>
                              <th className="right_t">Trade</th>
                            </tr>
                          </thead>
                          <tbody>

                            {(coinData?.length > 0 && favCoins?.length > 0) ? coinData?.map((item) => {
                              return (
                                favCoins.includes(item?._id) &&

                                <>
                                  <tr>
                                    <td>
                                      <div className="td_first">
                                        <div className="icon"><img src={ApiConfig?.baseImage + item?.icon_path} height="30px" alt="icon" /></div>
                                        <div className="price_heading"> {item?.base_currency} <br /> <span>{item?.base_currency_fullname}</span></div>
                                      </div>
                                    </td>
                                    <td>{formatNumber(item?.buy_price, 5)} <br /> {item?.quote_currency}</td>
                                    <td>{formatNumber(item?.high, 5)}</td>
                                    {item?.change_percentage > 0 ? <td className="green">+{formatNumber(item?.change_percentage, 5)}%</td> : <td className="red">-{formatNumber(item?.change_percentage, 5)}%</td>}
                                    <td className="right_t"><a href={`/trade/${item?.base_currency}_${item?.quote_currency}`}>Trade</a></td>
                                  </tr>
                                </>
                              )
                            }) : <tr rowSpan="5" className="no-data-row">
                              <td colSpan="12">
                                <div className="no-data-wrapper">
                                  <div className="no_data_s">
                                    <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                                  </div>
                                </div>
                              </td>
                            </tr>}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className='mobile_view'>
                      <div className='table-responsive'>
                        <table>
                          <thead>
                            <tr>
                              <th>Coin</th>
                              <th>Price</th>
                              <th className='right_t'>24H High/Change</th>
                            </tr>
                          </thead>
                          <tbody>

                            {(coinData?.length > 0 && favCoins?.length > 0) ? coinData?.map((item) => {
                              return (
                                favCoins.includes(item?._id) &&

                                <>
                                  <tr>
                                    <td>
                                      <div className="td_first">
                                        <div className="icon"><img src={ApiConfig?.baseImage + item?.icon_path} height="30px" alt="icon" /></div>
                                        <div className="price_heading"> {item?.base_currency} <br /> <span>{item?.base_currency_fullname}</span></div>
                                      </div>
                                    </td>
                                    <td>{formatNumber(item?.buy_price, 5)} <br /> {item?.quote_currency}</td>
                                    <td className='right_t'>{formatNumber(item?.high, 5)}
                                      {item?.change_percentage > 0 ?
                                        <div className="green">+{formatNumber(item?.change_percentage, 5)}%</div> :
                                        <div className="red">-{formatNumber(item?.change_percentage, 5)}%</div>}
                                    </td>
                                  </tr>
                                </>
                              )
                            }) : <tr rowSpan="5" className="no-data-row">
                              <td colSpan="12">
                                <div className="no-data-wrapper">
                                  <div className="no_data_s">
                                    <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                                  </div>
                                </div>
                              </td>
                            </tr>}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                  <div className="tab-pane fade" id="gainers" role="tabpanel" aria-labelledby="gainers-tab">
                    <div className='desktop_view'>
                      <div className='table-responsive'>
                        <table>
                          <thead>
                            <tr>
                              <th>Coin</th>
                              <th>Price</th>
                              <th>24H High</th>
                              <th>24H Change</th>
                              <th className="right_t">Trade</th>
                            </tr>
                          </thead>
                          <tbody>

                            {coinData?.length > 0 ? coinData?.slice(0, 10)?.map((item) => {
                              return (
                                item?.change_percentage > 0 &&

                                <>
                                  <tr>
                                    <td>
                                      <div className="td_first">
                                        <div className="icon"><img src={ApiConfig?.baseImage + item?.icon_path} height="30px" alt="icon" /></div>
                                        <div className="price_heading"> {item?.base_currency} <br /> <span>{item?.base_currency_fullname}</span></div>
                                      </div>
                                    </td>
                                    <td>{formatNumber(item?.buy_price, 5)} <br /> {item?.quote_currency}</td>
                                    <td>{formatNumber(item?.high, 5)}</td>
                                    {item?.change_percentage > 0 ? <td className="green">+{formatNumber(item?.change_percentage, 5)}%</td> : <td className="red">-{formatNumber(item?.change_percentage, 5)}%</td>}
                                    <td className="right_t"><a href={`/trade/${item?.base_currency}_${item?.quote_currency}`}>Trade</a></td>
                                  </tr>
                                </>
                              )
                            }) : <tr rowSpan="5" className="no-data-row">
                              <td colSpan="12">
                                <div className="no-data-wrapper">
                                  <div className="no_data_s">
                                    <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                                  </div>
                                </div>
                              </td>
                            </tr>}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className='mobile_view'>
                      <div className='table-responsive'>
                        <table>
                          <thead>
                            <tr>
                              <th>Coin</th>
                              <th>Price</th>
                              <th className="right_t">24H High/Change</th>
                            </tr>
                          </thead>
                          <tbody>

                            {coinData?.length > 0 ? coinData?.slice(0, 10)?.map((item) => {
                              return (
                                item?.change_percentage > 0 &&

                                <>
                                  <tr>
                                    <td>
                                      <div className="td_first">
                                        <div className="icon"><img src={ApiConfig?.baseImage + item?.icon_path} height="30px" alt="icon" /></div>
                                        <div className="price_heading"> {item?.base_currency} <br /> <span>{item?.base_currency_fullname}</span></div>
                                      </div>
                                    </td>
                                    <td>{formatNumber(item?.buy_price, 5)} <br /> {item?.quote_currency}</td>
                                    <td className='right_t'>{formatNumber(item?.high, 5)}
                                      {item?.change_percentage > 0 ?
                                        <div className="green">+{formatNumber(item?.change_percentage, 5)}%</div> :
                                        <div className="red">-{formatNumber(item?.change_percentage, 5)}%</div>}
                                    </td>
                                  </tr>
                                </>
                              )
                            }) : <tr rowSpan="5" className="no-data-row">
                              <td colSpan="12">
                                <div className="no-data-wrapper">
                                  <div className="no_data_s">
                                    <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                                  </div>
                                </div>
                              </td>
                            </tr>}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

          </div>


          <div className="dashboard_right_side">
            <div className="new_features_s">
              {/* <h4>Coming Soon</h4> */}
              <div className="features_block">
                <div className="block_features">
                  <img className='darkimg' src="/images/trading_bots.svg" alt="bots" />
                  <img className='lightimg' src="/images/trading_bots_light.svg" alt="bots" />
                  <div className="features_cnt">
                    <h5>Invite Friends for Rewards</h5>
                    <p>Invite your friends to join, expand your
                      community, and earn amazing rewards
                      for every successful referral.</p>
                  </div>
                </div>

                <div className="block_features">
                  <img className='darkimg' src="/images/crypto_card.svg" alt="bots" />
                  <img className='lightimg' src="/images/crypto_card_light.svg" alt="bots" />
                  <div className="features_cnt">
                    <h5>Complete IdentityVerification</h5>
                    <p>Verify your identity to secure your
                      account, protect your data, and
                      unlock full access to all features
                      and services without any limitations.</p>
                  </div>
                </div>

                <div className="block_features">
                  <img className='darkimg' src="/images/crypto_card.svg" alt="bots" />
                  <img className='lightimg' src="/images/crypto_card_light.svg" alt="bots" />
                  <div className="features_cnt">
                    <h5>2.factor authentication (2FA)</h5>
                    <p>Enable 2-Factor Authentication to
                      add an extra security layer and
                      prevent unauthorized access to
                      your account.</p>
                  </div>
                </div>

                <div className="block_features">
                  <img className='darkimg' src="/images/crypto_card.svg" alt="bots" />
                  <img className='lightimg' src="/images/crypto_card_light.svg" alt="bots" />
                  <div className="features_cnt">
                    <h5>Buy crypto with one-click</h5>
                    <p>Buy crypto instantly with one-click
                      and get fast access to digital assets
                      without complex steps or delays.</p>
                  </div>
                </div>



              </div>

              {/* <h4>Recommendations</h4>
              <div className="recommendations_block">
                <ul>
                  <li>
                    <div className="cv_trade_img">
                      <img src="/images/recommendations_vector.png" alt="recommendations" />
                    </div>
                    <div className="cnt_slider_f">
                      <h6>Complete Identity Verification</h6>
                      <p>Secure your account by completing identity verification.</p>
                      {props?.userDetails?.kycVerified === 0 ? (
                        <Link to="/user_profile/kyc">Verify</Link>
                      ) : props?.userDetails?.kycVerified === 1 ? (
                        <span className='kycpendingbtn'>KYC Pending</span>
                      ) : props?.userDetails?.kycVerified === 2 ? (
                        <span className='kycapprovedbtn'>KYC Approved</span>
                      ) : props?.userDetails?.kycVerified === 3 ? (
                        <span style={{ color: "red", fontWeight: "bold" }}>KYC Rejected</span>
                      ) : null}
                    </div>
                  </li>
                  <li>
                    <div className="cv_trade_img">
                      <img src="/images/recommendations_vector2.png" alt="recommendations" />
                    </div>
                    <div className="cnt_slider_f">
                      <h6>2-Factor Authentication (2FA)</h6>
                      <p>Enhance your security with 2FA — an extra layer of protection for your account.</p>
                      {props?.userDetails?.["2fa"] === 0 ? (
                        <Link to="/user_profile/two_factor_autentication">Bind</Link>
                      ) : (
                        <span style={{ color: "#fea903", fontWeight: "bold" }}>2FA Activated</span>
                      )}
                    </div>
                  </li>
                  <li>
                    <div className="cv_trade_img">
                      <img src="/images/recommendations_vector3.png" alt="recommendations" />
                    </div>
                    <div className="cnt_slider_f">
                      <h6>Buy crypto with one-click</h6>
                      <p>Easily purchase crypto in seconds with just a single click </p>
                      <Link to="/asset_managemnet/deposit">Buy Crypto</Link>
                    </div>
                  </li>
                </ul>
              </div> */}
            </div>

          </div>
        </div>
      </div>

    </>
  )
}

export default Dashboard
