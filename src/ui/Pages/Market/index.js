import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { alertErrorMessage } from "../../../customComponents/CustomAlertMessage";
import { ApiConfig } from "../../../api/apiConfig/apiConfig";
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper";
import AuthService from "../../../api/services/AuthService";
import { SocketContext } from "../../../customComponents/SocketContext";
import { Helmet } from "react-helmet-async";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";


const Market = () => {
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();
  const [search, setsearch] = useState("");
  const [favCoins, setfavCoins] = useState([]);
  const [coinData, setCoinData] = useState([]);
  const [fiterPairData, setFiterPairData] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const { socket } = useContext(SocketContext);
  const [activeTab, setActiveTab] = useState("Spot");



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
        const topGainers = [...data?.pairs || []]
          .sort((a, b) => b.change_percentage - a.change_percentage)
        const topLosers = [...data?.pairs || []]
          .sort((a, b) => a.change_percentage - b.change_percentage)
          .slice(0, 4); setTopGainers(topGainers);
        setTopLosers(topLosers);
      });
    }
    return (() => {
      clearInterval(interval)
    })
  }, [socket]);


  useEffect(() => {
    favoriteList();
  }, []);



  const nextPage = (data) => {
    sessionStorage.setItem('RecentPair', JSON.stringify(data))
    navigate(`/trade/${data?.base_currency}_${data?.quote_currency}`);
  };

  const handleAddFav = async (pairId) => {
    LoaderHelper.loaderStatus(true)
    await AuthService.favoriteCoin(pairId).then((result) => {
      if (result.success) {
        try {
          favoriteList();
        } catch (error) {
          alertErrorMessage(result?.message)
        }
      } else {
        alertErrorMessage(result.message);
      }
    });
    LoaderHelper.loaderStatus(false)
  };

  const favoriteList = async () => {
    await AuthService.favoriteList().then((result) => {
      if (result?.success) {
        try {
          setfavCoins(result?.data?.pairs ? result?.data?.pairs : []);
        } catch (error) {
          alertErrorMessage(result?.message)
        }
      }
    });
  };

  useEffect(() => {
    let filteredData = coinData?.filter((item) => {
      return (
        item?.base_currency?.toLowerCase().includes(search?.toLowerCase()) ||
        item?.quote_currency?.toLowerCase().includes(search?.toLowerCase())
      );
    });
    setFiterPairData(filteredData);
  }, [search, coinData]);

  const gainerElementRef = useRef(null);


  const handleTabClick = (itemName) => {
    setActiveTab(itemName);
    if (gainerElementRef.current) {
      gainerElementRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatNumber = (data, decimal = 5) => {
    // Try to convert strings like "22" or "22.567" into numbers
    const num = typeof data === "string" ? Number(data) : data;

    // Check if it's a valid number (not NaN, not undefined/null)
    if (typeof num === "number" && !isNaN(num)) {
      return (parseFloat(num.toFixed(decimal)));
    }

    return "0.00"; // "0.00"
  };


  return (
    <>
      <Helmet>
        <title>Wrathcode Market – Live Crypto Prices & Trading Pairs</title>

        <meta
          name="description"
          content="Explore live market data on Wrathcode. View real-time prices, volumes and trading pairs for Bitcoin, Ethereum and top altcoins. Start trading today."
        />

        <meta
          name="keywords"
          content="crypto market, live crypto prices, bitcoin ethereum trading pairs, Wrathcode market"
        />
      </Helmet>




      <section className="section-padding login_bg  login_sec  market_page">



        <div className="market_trade_crypto">
          <div className="container">
            {/* Desktop View - Row/Col Structure */}
            <div className="row d-none d-md-flex">
              <div className="col-sm-4">
                <div className="trade_marketvalue">
                  <div className="d-flex tophd">
                    <h5><img alt="" src="https://backend.gatbits.com/icons/coin-image-1751739632227-609587235.png" class="img-fluid icon_img coinimg me-2" />BTC</h5>
                    <div className="value text-green">+1.31%</div>
                  </div>
                  <div className="price">
                    $88,415
                  </div>
                  <div className="privevolume"><span>24H Volume：</span>4,015,454.86 (USD)</div>

                  <div className="tradevector_r">
                    <img src="/images/trade_vector.svg" className="img-fluid" alt="" />
                  </div>

                </div>
              </div>

              <div className="col-sm-4">
                <div className="trade_marketvalue">
                  <div className="d-flex tophd">
                    <h5><img alt="" src="https://backend.gatbits.com/icons/coin-image-1751739568603-337176937.png" class="img-fluid icon_img coinimg me-2" />ETH</h5>
                    <div className="value text-danger">-1.31%</div>
                  </div>
                  <div className="price">
                    $2,974.2
                  </div>
                  <div className="privevolume"><span>24H Volume：</span>4,015,454.86 (USD)</div>

                  <div className="tradevector_r">
                    <img src="/images/trade_vector.svg" className="img-fluid" alt="" />
                  </div>

                </div>
              </div>

              <div className="col-sm-4">
                <div className="trade_marketvalue">
                  <div className="d-flex tophd">
                    <h5><img alt="" src="https://backend.gatbits.com/icons/coin-image-1751739632227-609587235.png" class="img-fluid icon_img coinimg me-2" />BCH</h5>
                    <div className="value text-green">+1.31%</div>
                  </div>
                  <div className="price">
                    $597.3
                  </div>
                  <div className="privevolume"><span>24H Volume：</span>4,015,454.86 (USD)</div>

                  <div className="tradevector_r">
                    <img src="/images/trade_vector.svg" className="img-fluid" alt="" />
                  </div>

                </div>
              </div>
            </div>

            {/* Mobile View - Swiper Slider */}
            <div className="d-md-none market_trade_crypto_slider">
              <Swiper
                modules={[Pagination]}
                spaceBetween={15}
                slidesPerView={1}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                className="market-crypto-swiper"
              >
                <SwiperSlide>
                  <div className="trade_marketvalue">
                    <div className="d-flex tophd">
                      <h5><img alt="" src="https://backend.gatbits.com/icons/coin-image-1751739632227-609587235.png" class="img-fluid icon_img coinimg me-2" />BTC</h5>
                      <div className="value text-green">+1.31%</div>
                    </div>
                    <div className="price">
                      $88,415
                    </div>
                    <div className="privevolume"><span>24H Volume：</span>4,015,454.86 (USD)</div>

                    <div className="tradevector_r">
                      <img src="/images/trade_vector.svg" className="img-fluid" alt="" />
                    </div>

                  </div>
                </SwiperSlide>

                <SwiperSlide>
                  <div className="trade_marketvalue">
                    <div className="d-flex tophd">
                      <h5><img alt="" src="https://backend.gatbits.com/icons/coin-image-1751739568603-337176937.png" class="img-fluid icon_img coinimg me-2" />ETH</h5>
                      <div className="value text-danger">-1.31%</div>
                    </div>
                    <div className="price">
                      $2,974.2
                    </div>
                    <div className="privevolume"><span>24H Volume：</span>4,015,454.86 (USD)</div>

                    <div className="tradevector_r">
                      <img src="/images/trade_vector.svg" className="img-fluid" alt="" />
                    </div>

                  </div>
                </SwiperSlide>

                <SwiperSlide>
                  <div className="trade_marketvalue">
                    <div className="d-flex tophd">
                      <h5><img alt="" src="https://backend.gatbits.com/icons/coin-image-1751739632227-609587235.png" class="img-fluid icon_img coinimg me-2" />BCH</h5>
                      <div className="value text-green">+1.31%</div>
                    </div>
                    <div className="price">
                      $597.3
                    </div>
                    <div className="privevolume"><span>24H Volume：</span>4,015,454.86 (USD)</div>

                    <div className="tradevector_r">
                      <img src="/images/trade_vector.svg" className="img-fluid" alt="" />
                    </div>

                  </div>
                </SwiperSlide>
              </Swiper>
            </div>
          </div>
        </div>

        <section className="live_prices mt-0 market_prices market_update_sec market_update_table ">
          <div className="container">
            <div className="row mb-4 g-2">

              {/* Biggest Gainers */}

              {/* <div className="col-lg-3">
                <div className="ant-card ant-card-bordered ant-card-small marketRankList_rankItem__L1CvR">
                  <div className="ant-card-head-wrapper">
                    <div className="ant-card-head-title">
                      <h3>
                        <span className="bvtPSA me-2"  >
                          <img src="/images/topgainer_icon.svg" className="img-fluid" width="21" height="21" alt="top gainers" />
                        </span>
                        Top Gainers
                      </h3>
                    </div>
                    <button type="button" className="btn btn-link" onClick={() => handleTabClick('Gainers')}> See more <i className="ri-arrow-right-s-line"></i></button>
                  </div>

                  <div className="ant-card-body">
                    <div className="mt_table" >
                      <table className="table" >
                        <thead>
                          <tr>
                          
                            <th>Name</th>
                            <th className="text-end">Price</th>
                            <th className="text-end">24h</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topGainers.length <= 0 ?
                            <tr >
                              <td colSpan="4" className="p-0" >
                                <div className=" d-flex justify-content-center align-items-center"><div className="spinner-border text-primary" role="status" /></div>
                              </td>
                            </tr> :
                            topGainers
                              ? topGainers
                                .slice(0, 4).map((item, index) => {
                                  return <tr key={index} onClick={() => nextPage(item)} >
                                    <td>
                                      <div className="spotName">
                                        <div className="symblecurrency">
                                          <img alt="" src={ApiConfig.baseImage + item?.icon_path} className="img-fluid icon_img coinimg" />
                                          {item?.base_currency}/{item?.quote_currency} <span className="text-muted"></span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="text-end">{formatNumber(item?.buy_price, 5)}</td>
                                    <td className={item?.change_percentage >= 0 ? "text-success text-end" : "text-danger text-end"} ><b>
                                      <i className={item?.change_percentage >= 0 ? "ri-arrow-up-s-fill me-1" : "ri-arrow-down-s-fill me-1"}></i>
                                      {formatNumber(item?.change_percentage, 5)}%</b>
                                    </td>
                                  </tr>
                                })
                              : (
                                <tr >
                                  <td colSpan="4" className="p-0" >
                                    <div className="favouriteData">
                                      <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                                      <p>No Data Available</p>
                                    </div>
                                  </td>
                                </tr>
                              )
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div> */}
              {/* Biggest Losers */}
              {/* <div className="col-lg-3">
                <div className="ant-card ant-card-bordered ant-card-small marketRankList_rankItem__L1CvR">
                  <div className="ant-card-head-wrapper">
                    <div className="ant-card-head-title">
                      <h3>
                        <span className="bvtPSA bvtPSAL me-2"  >
                          <img src="/images/biggest_losser_icon.svg" className="img-fluid" width="21" height="21" alt="top losers" />
                        </span>
                        Top Losers
                      </h3>
                    </div>
                    <button type="button" className="btn btn-link" onClick={() => handleTabClick('Losers')}> See more <i className="ri-arrow-right-s-line"></i></button>
                  </div>
                  <div className="ant-card-body">
                    <div className="mt_table" >
                      <table className="table" >
                        <thead>
                          <tr>
                          
                            <th>Name</th>
                            <th className="text-end" >Price</th>
                            <th className="text-end" >24h</th>
                          </tr>
                        </thead>
                        <tbody>

                          {topLosers && topLosers.length <= 0 ?
                            <tr >
                              <td colSpan="4" className="p-0" >
                                <div className=" d-flex justify-content-center align-items-center"><div className="spinner-border text-primary" role="status" /></div>
                              </td>
                            </tr> :
                            topLosers
                              ? topLosers.slice(0, 4).map((item, index) => {
                                return (
                                  <tr key={index} onClick={() => nextPage(item)} >
                                    <td>
                                      <div className="spotName">
                                        <div className="symblecurrency">
                                          <img alt="" src={ApiConfig.baseImage + item?.icon_path} className="img-fluid icon_img coinimg" />
                                          {item?.base_currency}/{item?.quote_currency} <span className="text-muted"></span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="text-end">{formatNumber(item?.buy_price, 5)}</td>
                                    <td className={item?.change_percentage >= 0 ? "text-danger text-end" : "text-danger text-end"} ><b>
                                      <i className={item?.change_percentage >= 0 ? "ri-arrow-down-s-fill me-1" : "ri-arrow-down-s-fill me-1"}></i>
                                      {formatNumber(item?.change_percentage, 5)}%</b>
                                    </td>
                                  </tr>
                                );
                              })
                              : (
                                <tr >
                                  <td colSpan="4" className="p-0" >
                                    <div className="favouriteData">
                                      <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                                      <p>No Data Available</p>
                                    </div>
                                  </td>
                                </tr>
                              )
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div> */}
              {/* Trending */}
              {/* <div className="col-lg-3">
                <div className="ant-card ant-card-bordered ant-card-small marketRankList_rankItem__L1CvR">
                  <div className="ant-card-head-wrapper">
                    <div className="ant-card-head-title">
                      <h3>
                        <span className="bvtPSA bvtPSAL me-2"  >
                          <img src="/images/trending_icon.svg" className="img-fluid" width="21" height="21" alt="trending" />
                        </span> Trending</h3>
                    </div>
                    <button type="button" className="btn btn-link" onClick={() => handleTabClick('Trending')}> See more <i className="ri-arrow-right-s-line"></i></button>
                  </div>
                  <div className="ant-card-body">

                    <div className="mt_table" >
                      <table className="table" >
                        <thead>
                          <tr>
                           
                            <th>Name</th>
                            <th className="text-end" >Price</th>
                            <th className="text-end" >24h</th>
                          </tr>
                        </thead>
                        <tbody>
                          {coinData && coinData.length <= 0 ?
                            <tr >
                              <td colSpan="4" className="p-0" >
                                <div className=" d-flex justify-content-center align-items-center"><div className="spinner-border text-primary" role="status" /></div>
                              </td>
                            </tr> :
                            coinData && coinData?.length > 0 ? (
                              coinData?.slice(0, 4)?.map((item, index) => {
                                return (
                                  <tr key={index} onClick={() => nextPage(item)} >
                                    <td>
                                      <div className="spotName">
                                        <div className="symblecurrency">
                                          <img alt="" src={ApiConfig.baseImage + item?.icon_path} className="img-fluid icon_img coinimg" />
                                          {item?.base_currency}/{item?.quote_currency} <span className="text-muted"></span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="text-end">{formatNumber(item?.buy_price, 5)}</td>
                                    <td className={item?.change_percentage >= 0 ? "text-success text-end" : "text-danger text-end"} ><b>
                                      <i className={item?.change_percentage >= 0 ? "ri-arrow-up-s-fill me-1" : "ri-arrow-down-s-fill me-1"}></i>
                                      {formatNumber(item?.change_percentage, 5)}%</b>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan="4" className="p-0">
                                  <div className="favouriteData">
                                    <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                                    <p>No Data Available</p>
                                  </div>
                                </td>
                              </tr>
                            )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div> */}
              {/* <div className="col-lg-3">
                <div className="ant-card ant-card-bordered ant-card-small marketRankList_rankItem__L1CvR">
                  <div className="ant-card-head-wrapper">
                    <div className="ant-card-head-title">
                      <h3>
                        <span className="bvtPSA bvtPSAL me-2"  >
                          <img src="images/new_coin_icon.png" alt="new coin"></img></span> New Coins</h3>
                    </div>
                    <button type="button" className="btn btn-link" onClick={() => handleTabClick('Trending')}> See more <i className="ri-arrow-right-s-line"></i></button>
                  </div>
                  <div className="ant-card-body">
                    <div className="mt_table" >
                      <table className="table" >
                        <thead>
                          <tr>
                            
                            <th>Name</th>
                            <th className="text-end" >Price</th>
                            <th className="text-end" >24h</th>
                          </tr>
                        </thead>
                        <tbody>
                          {coinData && coinData.length <= 0 ?
                            <tr >
                              <td colSpan="4" className="p-0" >
                                <div className=" d-flex justify-content-center align-items-center"><div className="spinner-border text-primary" role="status" /></div>
                              </td>
                            </tr> :
                            coinData && coinData?.length > 0 ? (
                              coinData?.reverse()?.slice(0, 4)?.map((item, index) => {

                                // }
                                return (
                                  <tr key={index} onClick={() => nextPage(item)} >
                                    <td>
                                      <div className="spotName">
                                        <div className="symblecurrency">
                                          <img alt="" src={ApiConfig.baseImage + item?.icon_path} className="img-fluid icon_img coinimg" />
                                          {item?.base_currency}/{item?.quote_currency} <span className="text-muted"></span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="text-end">{formatNumber(item?.buy_price, 5)}</td>
                                    <td className={item?.change_percentage >= 0 ? "text-success text-end" : "text-danger text-end"} ><b>
                                      <i className={item?.change_percentage >= 0 ? "ri-arrow-up-s-fill me-1" : "ri-arrow-down-s-fill me-1"}></i>
                                      {formatNumber(item?.change_percentage, 5)}%</b>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan="4" className="p-0">
                                  <div className="favouriteData">
                                    <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                                    <p>No Data Available</p>
                                  </div>
                                </td>
                              </tr>
                            )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
          <div className="container" ref={gainerElementRef}>
            <div className="d-flex-between  mb-3  custom_dlflex">
              <ul className="nav nav-pills mb-2 overflowx_scroll funds_tab  market_tabs">
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === "Fav" ? 'active' : ""}`} onClick={() => setActiveTab('Fav')}>
                    <i className="ri-star-s-line me-2 ri-xl"></i> Favourite
                  </button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === "Spot" ? 'active' : ""}`} onClick={() => setActiveTab('Spot')}>
                    <i className="ri-list-unordered ri-xl me-2"></i> Spot
                  </button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === "Futures" ? 'active' : ""}`} onClick={() => setActiveTab('Futures')}>
                    <i className="ri-arrow-right-up-line me-2"></i>
                    Futures
                  </button>
                </li>
              </ul>
              {
                activeTab === "Fav" || activeTab === "Spot" || activeTab === "Futures" ?
                  <div className="searchBar custom-tabs">
                    <i className="ri-search-2-line"></i>
                    <input type="search" className="custom_search" placeholder="Search Crypto" value={search} onChange={(e) => { setsearch(e.target.value); }} />
                  </div>
                  :
                  ""
              }
            </div>
            <div className="tab-content custom-tab-content p-0">

              {/* Favourite */}
              <div className={`tab-pane ${activeTab === "Fav" ? 'active' : ""}`}>
                <div className="card py-2">
                  <div className="card-body p-0 desktoptable">
                    <div className="table-responsive">
                      {token ? (
                        (favCoins?.length > 0) ?
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Pair</th>
                                <th>Price</th>
                                <th>24H Change</th>
                                <th>24H High</th>
                                <th>24H Low</th>
                                <th>24H Vol</th>
                                <th>Chart</th>
                                <th>Operation</th>
                              </tr>
                            </thead>
                            <tbody>
                              {fiterPairData && fiterPairData.map((item, index) => {
                                // if (!favCoins.includes(item?._id)) return null;
                                return (
                                  favCoins.includes(item?._id) &&
                                  <tr key={index} onClick={() => nextPage(item)} >
                                    <td>
                                      <div className="td_div">
                                        <span className="star_btn btn_icon active">
                                          <i className="ri-star-fill text-warning me-2" onClick={() => { handleAddFav(item?._id); }}></i>
                                        </span>
                                        <img alt="" src={ApiConfig.baseImage + item?.icon_path} className="img-fluid icon_img coinimg me-2" />
                                        {item?.base_currency}/{item?.quote_currency}
                                      </div>
                                    </td>
                                    <td><b>{formatNumber(item?.buy_price, 5)}</b></td>
                                    <td className={item?.change >= 0 ? "color-green green" : "color-red text-danger"}><b>{formatNumber(item?.change, 5)}</b> </td>
                                    <td><b>{formatNumber(item?.high, 5)}</b></td>
                                    <td><b>{formatNumber(item?.low, 5)}</b></td>
                                    <td><b>{formatNumber(item?.volume, 5)}</b></td>
                                    <td><img src="/images/trade_count_range.svg" alt="svg" /></td>
                                    <td><a href="javascript:void(0)" onClick={() => nextPage(item)} className="btn custom-btn btn-sm" ><span>Trade</span></a></td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          :
                          <div className="favouriteData">
                            <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                            <p>No Data Available</p>
                          </div>
                      ) : (
                        <div className="py-5 favouriteData">
                          <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                          <p className="mt-2">No results.... Go to&nbsp;
                            <Link className="btn-link" to="/login"><b>&nbsp; Sign in &nbsp;</b></Link>&nbsp;and add your favorite coins from Spot.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

 
                  <div className="card-body p-0 mobiletable">
                    <div className="table-responsive">
                      {token ? (
                        (favCoins?.length > 0) ?
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Pair/24h Vol</th>
                                <th>Price</th>
                                <th>24H Change</th>
                              </tr>
                            </thead>
                            <tbody>
                              {fiterPairData && fiterPairData.map((item, index) => {
                                // if (!favCoins.includes(item?._id)) return null;
                                return (
                                  favCoins.includes(item?._id) &&
                                  <tr key={index} onClick={() => nextPage(item)} >
                                    <td>
                                      <div className="td_div">
                                        <span className="star_btn btn_icon active">
                                          <i className="ri-star-fill text-warning me-2" onClick={() => { handleAddFav(item?._id); }}></i>
                                        </span>
                                        <img alt="" src={ApiConfig.baseImage + item?.icon_path} className="img-fluid icon_img coinimg me-2" />
                                        {item?.base_currency}/{item?.quote_currency}
                                       
                                      </div>
                                      <b>Vol {formatNumber(item?.volume, 5)}</b>
                                    </td>
                                    <td><b>{formatNumber(item?.buy_price, 5)}</b>
                                    <div className={item?.change >= 0 ? "color-green green" : "color-red text-danger"}><b>{formatNumber(item?.change, 5)}</b> </div>
                                    </td>
                                   
                                    <td><b>{formatNumber(item?.high, 5)}</b>
                                    <br />
                                    <b>{formatNumber(item?.low, 5)}</b></td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          :
                          <div className="favouriteData">
                            <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                            <p>No Data Available</p>
                          </div>
                      ) : (
                        <div className="py-5 favouriteData">
                          <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                          <p className="mt-2">No results.... Go to&nbsp;
                            <Link className="btn-link" to="/login"><b>&nbsp; Sign in &nbsp;</b></Link>&nbsp;and add your favorite coins from Spot.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                 

                </div>
              </div>
              {/* Spot */}
              <div className={`tab-pane ${activeTab === "Spot" ? 'active' : ""}`}>

                <ul className="tbltabs">
                  <li>
                    <select>
                      <option>USDT</option>
                    </select>
                  </li>
                  <li className="active"><button>All</button></li>
                  <li><button>Gainners</button></li>
                  <li><button>Lossers</button></li>
                  <li><button>Trending</button></li>
                </ul>

                <div className="card  py-2 spot_table">
                  <div className="card-body p-0 desktoptable">
                    <div className="mrt_row">
                    </div>
                    <div className="table-responsive">
                      {fiterPairData?.length > 0 ? (
                        <table className="table ">
                          <thead>
                            <tr>
                              <th> Pair</th>
                              <th> Price</th>
                              <th> 24H Change</th>
                              <th> 24H High</th>
                              <th> 24H Low</th>
                              <th> 24H Vol</th>
                              {/* <th> Chart</th> */}
                              <th> Operation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fiterPairData ? fiterPairData.map((item, index) => (
                              <tr key={index} onClick={() => nextPage(item)} >
                                <td>
                                  <div className="td_div">
                                    {token && (
                                      <span className={"star_btn btn_icon active"}>
                                        <i className={favCoins.includes(item?._id) ? "ri ri-star-fill text-warning me-2 " : "ri ri-star-line me-2 "} onClick={() => { handleAddFav(item?._id); }} ></i>
                                      </span>
                                    )}
                                    <img alt="" src={ApiConfig.baseImage + item?.icon_path} className="img-fluid icon_img coinimg me-2 " />
                                    {item?.base_currency}/
                                    {item?.quote_currency}
                                  </div>
                                </td>
                                <td><b>{formatNumber(item?.buy_price, 5)}</b> </td>
                                <td className={item?.change >= 0 ? "color-green text-green" : "color-red text-danger"} ><b>{formatNumber(item?.change, 5)}</b></td>
                                <td className=" color-green"><b>{formatNumber(item?.high, 5)}</b></td>
                                <td className="text-danger"><b>{formatNumber(item?.low, 5)}</b></td>
                                <td><b>{formatNumber(item?.volume, 5)}</b></td>
                                {/* <td>
                                <img src={item?.change >= 0 ? "/images/trade_count_range.svg" : "/images/trade_count_red.svg"} alt="svg" /> 
        
                                  </td> */}
                                <td> <span onClick={() => nextPage(item)} className="btn custom-btn btn-sm cursor-pointer"><span>Trade</span></span></td>
                              </tr>
                            ))
                              : null
                            }
                          </tbody>
                        </table>
                      ) : (
                        <div className="favouriteData">
                          <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                          <p>No Data Available</p>
                        </div>
                      )}
                    </div>
                  </div>

                
                  <div className="card-body p-0 mobiletable">
                    <div className="table-responsive">
                      {token ? (
                        (favCoins?.length > 0) ?
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Pair/24h Vol</th>
                                <th>Price</th>
                                <th>24H Change</th>
                              </tr>
                            </thead>
                            <tbody>
                              {fiterPairData && fiterPairData.map((item, index) => {
                                // if (!favCoins.includes(item?._id)) return null;
                                return (
                                  favCoins.includes(item?._id) &&
                                  <tr key={index} onClick={() => nextPage(item)} >
                                    <td>
                                      <div className="td_div">
                                        <span className="star_btn btn_icon active">
                                          <i className="ri-star-fill text-warning me-2" onClick={() => { handleAddFav(item?._id); }}></i>
                                        </span>
                                        <img alt="" src={ApiConfig.baseImage + item?.icon_path} className="img-fluid icon_img coinimg me-2" />
                                        {item?.base_currency}/{item?.quote_currency}
                                       
                                      </div>
                                      <b>Vol {formatNumber(item?.volume, 5)}</b>
                                    </td>
                                    <td><b>{formatNumber(item?.buy_price, 5)}</b>
                                    <div className={item?.change >= 0 ? "color-green green" : "color-red text-danger"}><b>{formatNumber(item?.change, 5)}</b> </div>
                                    </td>
                                   
                                    <td><b>{formatNumber(item?.high, 5)}</b>
                                    <br />
                                    <b>{formatNumber(item?.low, 5)}</b></td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          :
                          <div className="favouriteData">
                            <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                            <p>No Data Available</p>
                          </div>
                      ) : (
                        <div className="py-5 favouriteData">
                          <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                          <p className="mt-2">No results.... Go to&nbsp;
                            <Link className="btn-link" to="/login"><b>&nbsp; Sign in &nbsp;</b></Link>&nbsp;and add your favorite coins from Spot.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
              {/* Biggest Gainers */}
              <div className={`tab-pane ${activeTab === "Futures" ? 'active' : ""}`}>
                <ul className="tbltabs">
                  <li>
                    <select>
                      <option>USDT</option>
                    </select>
                  </li>
                  <li className="active"><button>All</button></li>
                  <li><button>Gainners</button></li>
                  <li><button>Lossers</button></li>
                  <li><button>Trending</button></li>
                </ul>
                <div className="card  py-2">
                  <div className="card-body p-0 gainers_table desktoptable">
                    <div className="table-responsive">
                      {topGainers && topGainers?.length > 0 ? (
                        <>
                          {/* <h5 className="text-center">Biggest Gainers</h5> */}
                          <table className="table ">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th className="name"> Pair</th>
                                <th> Price</th>
                                <th> 24H </th>
                                <th> Volume(24H)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {topGainers
                                ? topGainers
                                  .map((item, index) => {
                                    return <tr key={index} onClick={() => nextPage(item)}  >
                                      <td className="">
                                        {index + 1}
                                      </td>
                                      <td>
                                        <div className="td_div">
                                          {item?.base_currency}
                                          <small>&nbsp; | {item?.symbol}</small>&nbsp;
                                          {item?.quote_currency}
                                        </div>
                                      </td>
                                      <td><b>{formatNumber(item?.buy_price, 5)}</b></td>
                                      <td className={item?.change_percentage >= 0 ? "color-green text-green" : "color-red text-danger"} ><b>
                                        <i className={item?.change_percentage >= 0 ? "ri-arrow-up-s-fill me-1" : "ri-arrow-down-s-fill me-1"}></i>
                                        {formatNumber(item?.change_percentage, 5)}%</b> </td>
                                      <td> <b> {formatNumber(item?.volume, 5)} </b> </td>
                                    </tr>
                                  })
                                : null
                              }
                            </tbody>
                          </table> </>
                      ) : (
                        <div className="favouriteData">
                          <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                          <p>No Data Available</p>
                        </div>
                      )
                      }
                    </div>
                  </div>
               
                </div>

                <div className="card-body p-0 mobiletable">
                    <div className="table-responsive">
                      {token ? (
                        (favCoins?.length > 0) ?
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Pair/24h Vol</th>
                                <th>Price</th>
                                <th>24H Change</th>
                              </tr>
                            </thead>


                            <tbody>
                              {topGainers
                                ? topGainers
                                  .map((item, index) => {
                                    return <tr key={index} onClick={() => nextPage(item)}  >
                                      <td className="">
                                        {index + 1}
                                      </td>
                                      <td>
                                        <div className="td_div">
                                          {item?.base_currency}
                                          <small>&nbsp; | {item?.symbol}</small>&nbsp;
                                          {item?.quote_currency}
                                        </div>
                                      </td>
                                      <td><b>{formatNumber(item?.buy_price, 5)}</b></td>
                                      <td className={item?.change_percentage >= 0 ? "color-green text-green" : "color-red text-danger"} ><b>
                                        <i className={item?.change_percentage >= 0 ? "ri-arrow-up-s-fill me-1" : "ri-arrow-down-s-fill me-1"}></i>
                                        {formatNumber(item?.change_percentage, 5)}%</b> </td>
                                      <td> <b> {formatNumber(item?.volume, 5)} </b> </td>
                                    </tr>
                                  })
                                : null
                              }
                            </tbody>





                            <tbody>
                              {fiterPairData && fiterPairData.map((item, index) => {
                                // if (!favCoins.includes(item?._id)) return null;
                                return (
                                  favCoins.includes(item?._id) &&
                            
                                );
                              })}
                            </tbody>
                          </table>
                          :
                          <div className="favouriteData">
                            <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                            <p>No Data Available</p>
                          </div>
                      ) : (
                        <div className="py-5 favouriteData">
                          <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" />
                          <p className="mt-2">No results.... Go to&nbsp;
                            <Link className="btn-link" to="/login"><b>&nbsp; Sign in &nbsp;</b></Link>&nbsp;and add your favorite coins from Spot.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

              </div>

            </div>
          </div>
        </section>
      </section >
    </>
  );
};

export default Market;
