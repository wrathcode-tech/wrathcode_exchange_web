import React, { useState, useContext, useEffect, useRef } from "react";
import { ApiConfig } from "../../../api/apiConfig/apiConfig";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../LandingPage/home.css";
import "swiper/css";
import "swiper/css/pagination";
import Slider from "react-slick";
import { SocketContext } from "../../../customComponents/SocketContext";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import AuthService from "../../../api/services/AuthService";
import "./home.css";
import TVChartContainer from "../../../customComponents/Libraries/TVChartContainer";
import { alertErrorMessage, alertSuccessMessage } from "../../../customComponents/CustomAlertMessage";
import { useGoogleLogin } from "@react-oauth/google";
import { ProfileContext } from "../../../context/ProfileProvider";
import { $ } from "react-jquery-plugin";
import QRCode from "qrcode.react";
import { Helmet } from "react-helmet-async";


const LandingPage = () => {
  const location = useLocation();

  const socketId = sessionStorage.getItem('socketId');
  const userId = sessionStorage.getItem('userId');
  const [coinsPair, setCoinsPair] = useState([]);
  const [AllData, setAllData] = useState([]);
  const [socketData, setSocketData] = useState([]);
  const [bannerList, setBannerList] = useState([]);
  const [hoveredItem, setHoveredItem] = useState({});
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const [SelectedCoin, setSelectedCoin] = useState();
  const [googleToken, setGoogleToken] = useState();
  const { setLoginDetails } = useContext(ProfileContext);
  const googlecaptchaRef = useRef(null);

  const [email, setEmail] = useState("");


  const nextPage = (data) => {
    sessionStorage.setItem('RecentPair', JSON.stringify(data))
    navigate(`/trade/${data?.base_currency}_${data?.quote_currency}`);
  };

  const signupPage = () => {
    navigate(`/signup?emailId=${email}`);
  };

  useEffect(() => {
    if (socketData?.length > 0 && Object.keys(hoveredItem)?.length === 0) {
      setHoveredItem(socketData[0])
    }
  }, [socketData])





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
        setSocketData(data?.pairs);
        // let filteredData = data?.pairs
        //   ?.filter((item) => item?.change_percentage > 0)
        //   ?.sort((a, b) => b.change_percentage - a.change_percentage);

      });
    }
    return (() => {
      clearInterval(interval)
    })
  }, [socket]);

  const [announcments, setAnnouncments] = useState([]);
  const handleNotifications = async () => {
    LoaderHelper.loaderStatus(true);
    await AuthService.notifications().then(async (result) => {
      if (result?.data?.length > 0) {
        try {
          let announcement = result?.data?.map((item) => item?.title)
          setAnnouncments(announcement);
        } catch (error) {

        }
      }
    });
    LoaderHelper.loaderStatus(false);
  };

  const handleBannerList = async () => {
    await AuthService.getbannerdata().then(async (result) => {
      if (result?.success) {
        setBannerList(result?.data);
      } else {
        LoaderHelper.loaderStatus(false);
      }
    })
  };

  const [apkLink, setApkLink] = useState("")

  const getApkLink = async () => {
    const result = await AuthService.getApk()
    if (result?.success) {
      setApkLink(result?.data?.apk || "");
      const apkDownloaded = localStorage.getItem("appDownloaded")
      if (apkDownloaded !== "true") {
        $("#bonusPopup").modal('show');
      }


    } else {
      LoaderHelper.loaderStatus(false);
    }
  };


  useEffect(() => {
    handleBannerList();
    handleNotifications();
    getApkLink();
  }, [])



  useEffect(() => {
    if (socket) {
      let payload = {
        message: 'exchange',
        userId: userId,
        socketId: socketId,
      };
      socket.emit('message', payload);
      socket.on('message', (data) => {
        setCoinsPair(data?.pairs || []);
        setAllData(data);

      });
    }
  }, [socket]);

  // ********* Auto Select Coin Pair after Socket Connection ********** //
  useEffect(() => {
    if (!SelectedCoin && coinsPair) {
      var Pair;
      Pair = coinsPair[0]
      navigate(`/`);
      setSelectedCoin(Pair);
    }
  }, [coinsPair]);


  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.6; // 0.5x = half speed
    }
  }, []);


  const [activeTab, setActiveTab] = useState("hotspot");

  const tabOptions = [
    { id: "hotspot", label: "Hot Spot" },
    { id: "gainers", label: "Gainers" },
    { id: "newest", label: "Newest" },
    { id: "meme", label: "Meme" },
  ];

  // Dummy filters (replace with real logic)
  const getFilteredData = () => {
    if (activeTab === "gainers") {
      return socketData?.filter(item => item.change_percentage > 0);
    } else if (activeTab === "meme") {
      return socketData?.filter(item => item.pairType === "meme");
    } else if (activeTab === "newest") {
      return socketData?.reverse();
    }
    return socketData;
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

  const authToken = sessionStorage.getItem("token")



  const loginWithGoogle = useGoogleLogin({
    onSuccess: tokenResponse => {
      if (tokenResponse.access_token) {
        setGoogleToken(tokenResponse)
        if (googlecaptchaRef.current) {
          googlecaptchaRef.current.showCaptcha();
        }
        handleLoginGoogle(tokenResponse)
      }
    }
  });

  const handleLoginGoogle = async (tokenResponse, captchaData) => {
    LoaderHelper.loaderStatus(true);
    try {
      const result = await AuthService.googleLogin(tokenResponse, captchaData);
      if (result?.success) {
        alertSuccessMessage(result?.message);
        sessionStorage.setItem("token", result.data.token);
        sessionStorage.setItem("userId", result.data.userId);
        setLoginDetails(result?.data);
        const redirectPath = location?.state?.redirectTo || "/user_profile/dashboard";
        navigate(redirectPath, { replace: true });
        window.location.reload()

        LoaderHelper.loaderStatus(false);
      } else {
        alertErrorMessage(result?.message);
        LoaderHelper.loaderStatus(false);
      }
    } catch (error) {
      alertErrorMessage(error?.message);
      LoaderHelper.loaderStatus(false);
    }
  };

  const handleApkDonwload = () => {
    $("#bonusPopup").modal('hide');
    sessionStorage.setItem("appDownloaded", true)
  };

  const DownloadApkButton = () => {
    if (apkLink) {
      window.location.href = `${ApiConfig?.baseUrl}${apkLink}`;
    }

  }


  return (

    <>

      <Helmet>
        <title>Join Wrathcode Today – Trade Crypto + Get Exclusive Rewards</title>

        <meta
          name="description"
          content="Sign up with Wrathcode, complete verification and deposit to unlock exclusive rewards. Trade top cryptocurrencies like Bitcoin, Ethereum & more in a trusted environment. Limited time offer."
        />

        <meta
          name="keywords"
          content="crypto rewards platform, Bitcoin Ethereum trading rewards, verified crypto exchange Wrathcode, crypto offer trade reward"
        />
      </Helmet>




      <div
        class="modal fade homebonuspop"
        id="bonusPopup"
        tabindex="-1"
        aria-labelledby="bonusPopupLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content popup-box homepop_box">
            <div class="modal-body text-center position-relative">

              {/* <!-- Close button --> */}
              <button
                type="button"
                class="btn-close position-absolute top-0 end-0 m-2"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={handleApkDonwload}
              ></button>

              {/* <!-- SLIDER START (NO ARROWS) --> */}
              <div id="bonusSlider" class="carousel slide" data-bs-ride="carousel" data-bs-interval="2000">
                <div class="carousel-inner">

                  {/* <!-- Slide 1 --> */}
                  <div class="carousel-item active">
                    <a href={authToken ? "/user_profile/giveaway" : "/login"}>
                      <img
                        src="/images/bonus_banner/giveaway_banner.png"
                        alt="giveaway"
                        class="img-fluid"
                      />
                    </a>
                  </div>

                  {/* <!-- Slide 2 --> */}
                  <div class="carousel-item ">
                    <a onClick={handleApkDonwload} href={ApiConfig?.baseUrl + apkLink}>
                      <img
                        src="/images/bonus_banner/Wrathcode_popup_img.png"
                        alt="gift"
                        class="img-fluid"
                      />
                    </a>
                  </div>

                </div>
              </div>
              {/* <!-- SLIDER END --> */}

            </div>
          </div>
        </div>
      </div>



      <div class="hero_section_main">
        <video
          ref={videoRef}
          className="video-bg"
          src="/images/hero_bg.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div class="container">
          <div class="row">
            <div class="col-sm-12 col-md-12 col-lg-7">
              <div class="banner_content">
                <span class="sub_heading">Welcome to Wrathcode</span>
                <h1>The Most Efficient<br />
                  <span>Crypto</span> Trading and<br />
                  {" "}  Investment Platform</h1>
                {/* <p><img src="images/user_gift_vector.svg" alt="gift" /> New User Exclusive Event! Get 100USDT!</p> */}

                <div className="t_shirts_add_s">
                  <div className="tshirts_vector">
                    <img src="images/t-shirts_bnr.svg" alt="tshirts" />
                  </div>
                  <div className="cnt_tshirts">
                    <span>IT'S TIME FOR</span>
                    <h3>Giveaway</h3>
                    <p>Join & Win a Premium Wrathcode T-shirts</p>
                    <ul>
                      <li>Register</li>
                      <li>Complete KYC</li>
                      <li>Deposit $10</li>
                    </ul>
                  </div>
                </div>

                {/* <button type="button" class="btn btn-primary homelightbox2" data-bs-toggle="modal" data-bs-target="#bonusPopup">
  Open Popup
</button> */}
                {!authToken &&
                  <div class="sign_form_btn">
                    <div class="sign_form">
                      <input type="text" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} value={email} />
                      <input type="button" value="Sign Up" onClick={signupPage} />
                    </div>
                    <ul>
                      <li><a class="icon_google" href="#/" type="button" onClick={() => loginWithGoogle()}><img src="images/google_icon2.svg" alt="google" /></a></li>
                      <li><a class="icon_google" href="https://t.me/Wrathcode" target="_blank" rel="noreferrer" ><img src="images/telegram_icon.svg" alt="telegram" /></a></li>
                      <li><a class="icon_google" href="#/" onClick={signupPage}><img src="images/apple_icon2.svg" alt="apple" /></a></li>
                    </ul>
                  </div>
                }
                <div className="d-flex scan_button">


                </div>

              </div>
            </div>
            <div class="col-sm-12 col-md-12 col-lg-5">
              <div class="banner_img">
                {/* <div className="dashbaordchart_mid">
                <TVChartContainer symbol={`${SelectedCoin?.base_currency}/${SelectedCoin?.quote_currency}`} />
</div> */}
                <img src="images/hero_img.svg" alt="banner" />
                <div className="dashboard_summary">

                </div>
                <Link className="more_btn" to="/market">{""}</Link>
              </div>
            </div>
          </div>


          <div className="banner_effect_bottom">
            <img src="images/herobanner_after.svg" alt="banner" />

          </div>
          <div class="annousment_s">

            <div class="annousment_left">
              <img src="images/notification_icon.png" />
              {authToken ? <marquee> Deposit any amount for the first time and enjoy an instant $0.50 reward.</marquee>
                : <marquee>Wrathcode Giveaway is LIVE! Complete Registration, KYC & Deposit $10 to grab your Premium T-Shirt!</marquee>
              }

            </div>

            {/* <div class="more_btn"><a href="#">More<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
            </svg></a></div> */}

          </div>


        </div>
      </div>

      {/* <div className="hero_section herobanner2">

        <div className="banner_animation_vector">

          <div className="vector_currency one">
            <img src="images/bitcon_icon.png" alt="bitcon" />
          </div>

          <div className="vector_currency two">
            <img src="images/tether_icon.png" alt="tether" />
          </div>


          <div className="vector_currency three">
            <img src="images/solana_icon.png" alt="solana" />
          </div>


          <div className="vector_currency four">
            <img src="images/xrp_icon.png" alt="xrp" />
          </div>

        </div>




        <div className="banner_animation_vector rightside">

          <div className="vector_currency one">
            <img src="images/bitcon_icon.png" alt="bitcon" />
          </div>

          <div className="vector_currency two">
            <img src="images/tether_icon.png" alt="tether" />
          </div>


          <div className="vector_currency three">
            <img src="images/solana_icon.png" alt="solana" />
          </div>


          <div className="vector_currency four">
            <img src="images/xrp_icon.png" alt="xrp" />
          </div>

        </div>


        <div className="container">
          <div className="banner_cnt">
            <h1>The Most Efficient <span>Crypto Exchange</span></h1>
            <h3>start today and build your crypto portfolio</h3>
            <div className="banner_img">
              <img className="drak_d" src="images/new_img/banner_mobile_vector.svg" alt="banner images" />
              <img className="light_m" src="images/new_img/banner_mobile_light_vector.svg" alt="banner images" />
            </div>
            <div className="scan_block">

              <ul>
                <li>
                  <div className="user_icon">
                    <img src="images/referral_commission.svg" alt="referral" />
                  </div>
                  <h6>500%</h6>
                  <span>Referral Commission</span>
                </li>
                <li>
                  <div className="user_icon">
                    <img src="images/register_user_icon.svg" alt="referral" />
                  </div>
                  <h6>1Million +</h6>
                  <span>Registered Users</span>
                </li>
                <li>
                  <div className="user_icon">
                    <img src="images/lowest_fees_icon.svg" alt="referral" />
                  </div>
                  <h6>0.50%</h6>
                  <span>Lowest Transaction Fees</span>
                </li>
              </ul>

             
            </div>

          </div>

          <div className="banner_add_slide">
            <Slider {...addbannerslider}>
              {slides.map((slide, index) => (
                <div className="currency_list_b" key={index}>
                  <div className="heighlightcnt">
                    <img src={slide.img} alt={`banner ${index}`} />
                    <h2>{slide.title}</h2>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
          <div className="rounded_effect_bottom">
            <img src="images/benner_afterbg.png" alt="rounded img" />
          </div>
        </div>
      </div> */}
      {/* <div className="market_update_outer" data-aos="fade-up" data-aos-duration="2000">
        <div className="container">
          <h2>Market <span>Update</span></h2>
          <div className="main_marker_summary">
            <div className="row align-items-center">
              <div className="col-md-3 col-sm-12">
                <div className="currency_left_dtl">
                  <div className="mobileview">
                    <div className="currency_tp_s">
                      <img src={ApiConfig?.baseImage + hoveredItem?.icon_path} alt="eth currency" width="50px" />
                      <h4>{hoveredItem?.base_currency_fullname}<sup>#{(hoveredItem?.index + 1) || 1}</sup></h4>
                    </div>
                    <div className="mu_pr_mark">
                      <h3>{hoveredItem?.buy_price}</h3>
                      {hoveredItem?.change_percentage > 0 ? <div className="pr_data text-success">
                        <i className="ri-arrow-up-s-fill me-1"></i>{hoveredItem?.change_percentage}%
                      </div> : <div className="pr_data text-danger">
                        <i className="ri-arrow-down-s-fill me-1"></i>{hoveredItem?.change_percentage}%
                      </div>}

                    </div>

                    <div className="trade_btn">
                      <button><Link to={`/trade/${hoveredItem?.base_currency}_${hoveredItem?.quote_currency}`}>trade now <span> <img src="images/trade_arrow.svg" alt="trade arrow" /></span></Link></button></div>
                  </div>
                </div>
              </div>
              <div className="col-md-9 col-sm-12">
                <div className="market_summary_right_tp">
                  <div className="summary_cnt_markert_r">
                    <div className="mr_data text-success">
                      <span>24 High <img src="images/info_icon.svg" alt="info" /></span>
                      <h5>{hoveredItem?.high}</h5>

                    </div>
                    <div className="mr_data">
                      <span>Volume Base<img src="images/info_icon.svg" alt="info" /></span>
                      <h5>{hoveredItem?.volume}  {hoveredItem?.base_currency}</h5>

                    </div>
                  </div>
                  <div className="summary_cnt_markert_r">
                    <div className="mr_data text-danger">
                      <span>24 Low <img src="images/info_icon.svg" alt="info" /></span>
                      <h5>{hoveredItem?.low}</h5>

                    </div>
                    <div className="mr_data">
                      <span>Volume Quote  <img src="images/info_icon.svg" alt="info" /></span>
                      <h5>{hoveredItem?.volumeQuote} {hoveredItem?.quote_currency}</h5>

                    </div>
                  </div>
                  <div className="summary_cnt_markert_r lastchild">
                    <div className="currency_img_mr">
                      <img src={ApiConfig?.baseImage + hoveredItem?.icon_path} alt="eth currency" width="80px" />
                    </div>
                  </div>
                  <div className="rectangle_bottom_eft">
                    <img src="images/rectangle_ri_bottom.png" alt="rectangle" />
                  </div>
                </div>
              </div>
            </div>
            <div className="row align-items-center">
              <div className="market_tab_scroll_ot">
                <ul>
                  {socketData?.map((item, index) => {
                    return (
                      <li key={item?.id || index}
                        onMouseEnter={() => setHoveredItem({ ...item, index })}>
                        <div className="currency_icon">
                          <img src={ApiConfig?.baseImage + item?.icon_path} alt={item?.base_currency} width="40px" />
                        </div>
                        <div className="currency_tag_cnt">
                          {item?.base_currency} <span>   /{item?.quote_currency}</span>
                        </div>
                        <div className="price_tag">{item?.buy_price}</div>
                      </li>
                    )
                  })}

                </ul>
              </div>
            </div>
          </div>
        </div>
      </div> */}



      <div className="currency_logo">
        <div className="container">
          <ul>
            <li><img src="images/currency_icon.png" alt="currency logo" /></li>
            <li><img src="images/currency_icon2.png" alt="currency logo" /></li>
            <li><img src="images/currency_icon3.png" alt="currency logo" /></li>
            <li><img src="images/currency_icon4.png" alt="currency logo" /></li>
            <li><img src="images/currency_icon5.png" alt="currency logo" /></li>
            <li><img src="images/currency_icon6.png" alt="currency logo" /></li>
            <li><img src="images/currency_icon7.png" alt="currency logo" /></li>
          </ul>
        </div>
      </div>



      <div className="crypto_section market_update_outer" data-aos="fade-up" data-aos-duration="2000">
        <div className="container">
          <h2>
            Market <span>Update</span>
          </h2>

          <div className="crypto_dashboard">
            <div className="hot_spot_outer">
              <div className="top_heading">
                <div className="d-flex gap-4 overflowx_scroll">
                  {tabOptions.map((tab) => (
                    <h4
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={activeTab === tab.id ? "active" : ""}
                    >
                      {tab.label}{" "}
                      {tab.label === "Meme" && (
                        <i className="ri-gemini-line yellow_font"></i>
                      )}
                    </h4>
                  ))}
                </div>
                <Link className="more_btn" to="/market">
                  View More{">"}
                </Link>
              </div>

              <div className="hot_trading_s">
                <table>
                  <thead>
                    <tr className="top_tradeing_t">
                      <th>Trading Pairs</th>
                      <th>Last Price</th>
                      <th className="desktop_view">24h Changes(%)</th>
                      <th className="mobile_view">24h(%)</th>
                      <th className="m_none">24H Change</th>
                      <th className="right_t right_0 m_none">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {getFilteredData()?.length > 0 ? (
                      getFilteredData()
                        .slice(0, 9)
                        .map((item, index) => (
                          <tr key={item?._id || index} onClick={() => nextPage(item)}>
                            <td className="first_coloum">
                              <div className="td_first">
                                <div className="icon">
                                  <img
                                    alt=""
                                    src={ApiConfig.baseImage + item?.icon_path}
                                    width="30"
                                    className="img-fluid icon_img coinimg me-2"
                                  />
                                </div>
                                <div className="price_heading">
                                  {item?.base_currency} / {item?.quote_currency}
                                </div>
                              </div>
                            </td>

                            <td>
                              {item?.buy_price} {item?.quote_currency}
                            </td>

                            <td
                              className={
                                item?.change_percentage > 0 ? "green" : "red"
                              }
                            >
                              {item?.change_percentage?.toFixed(2)}%
                            </td>

                            <td
                              className={
                                item?.change > 0
                                  ? "green m_none"
                                  : "red m_none"
                              }
                            >
                              {item?.change?.toFixed(2)}
                            </td>

                            <td className="right_t right_0 m_none">
                              <a href="#/">Trade</a>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="6">
                          <div className="no_data_s text-center">
                            <img
                              src="/images/no_data_vector.svg"
                              className="img-fluid"
                              alt="no data"
                              width="52"
                            />
                            <small>No data</small>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT DASHBOARD */}
            <div className="right_dashboard">
              {/* TOP GAINERS */}
              <div className="top_gainers">
                <div className="top_heading">
                  <h4>Top Gainers</h4>
                  <Link className="more_btn" to="/market">
                    View More{">"}
                  </Link>
                </div>

                <div className="hot_trading_s top_gainers">
                  <table>
                    <tbody>
                      {socketData?.length > 0 ? (
                        [...socketData].reverse().map((item, index) => (
                          <tr key={item?._id || index} onClick={() => nextPage(item)}>
                            <td className="first_coloum">
                              <div className="td_first">
                                <div className="icon">
                                  <img
                                    alt=""
                                    src={ApiConfig.baseImage + item?.icon_path}
                                    width="30"
                                    className="img-fluid icon_img coinimg me-2"
                                  />
                                </div>
                                <div className="price_heading">
                                  {item?.base_currency} / {item?.quote_currency}
                                </div>
                              </div>
                            </td>

                            <td className="price_right_top">
                              {item?.buy_price?.toFixed(4)}
                              <span
                                className={
                                  item?.change_percentage > 0 ? "green" : "red"
                                }
                              >
                                {" "}
                                {item?.change_percentage?.toFixed(3)}%
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3">
                            <div className="no_data_s text-center">
                              <img
                                src="/images/no_data_vector.svg"
                                width="52"
                                alt="no data"
                              />
                              <small>No data</small>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* NEW LISTINGS */}
              <div className="top_gainers losser_stock">
                <div className="top_heading">
                  <h4>New Listings</h4>
                  <Link className="more_btn" to="/market">
                    View More{">"}
                  </Link>
                </div>

                <div className="hot_trading_s top_gainers">
                  <table>
                    <tbody>
                      {socketData?.length > 0 ? (
                        [...socketData]
                          .reverse()
                          .slice(0, 5)
                          .map((item, index) => (
                            <tr
                              key={item?._id || index}
                              onClick={() => nextPage(item)}
                            >
                              <td className="first_coloum">
                                <div className="td_first">
                                  <div className="icon">
                                    <img
                                      alt=""
                                      src={ApiConfig.baseImage + item?.icon_path}
                                      width="30"
                                      className="img-fluid icon_img coinimg me-2"
                                    />
                                  </div>
                                  <div className="price_heading">
                                    {item?.base_currency} / {item?.quote_currency}
                                  </div>
                                </div>
                              </td>

                              <td className="price_right_top">
                                {item?.buy_price?.toFixed(4)}
                                <span
                                  className={
                                    item?.change_percentage > 0 ? "green" : "red"
                                  }
                                >
                                  {" "}
                                  {item?.change_percentage?.toFixed(3)}%
                                </span>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan="3">
                            <div className="no_data_s text-center">
                              <img
                                src="/images/no_data_vector.svg"
                                width="52"
                                alt="no data"
                              />
                              <small>No data</small>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="">
        <div className="how_get_account_ot bgtransparrent_s">
          <div className="container">
            <h2>How to Get <span>Started</span></h2>
            {/* <p className="sub_text">Our comprehensive range of services is designed to help businesses thrive
              in today’s fast-paced digital world.</p> */}


            <div class="row">
              <div class="col-sm-4">
                <div class="services_block_infor">
                  <div class="services_info_icon">
                    <img src="images/creat_account_icon.svg" alt="Software Development" />
                  </div>
                  <div class="cnt_block">
                    <h4>Create an Account</h4>
                    <p>Register and claim exclusive newcomer rewards.</p>
                    <div class="readbtn">
                      <Link to="/signup">Sign Up Now <svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none">
                        <path d="M8.72903 2.56148C8.57686 2.40931 8.50077 2.23539 8.50077 2.03974C8.50077 1.82235 8.57686 1.6267 8.72903 1.45279L9.28338 0.931046C9.43555 0.757133 9.60946 0.670177 9.80512 0.670177C10.0225 0.670177 10.2073 0.757133 10.3595 0.931046L14.7942 5.33322C14.9464 5.48539 15.0225 5.67018 15.0225 5.88757C15.0225 6.10496 14.9464 6.28974 14.7942 6.44192L10.3595 10.8441C10.2073 11.018 10.0225 11.105 9.80512 11.105C9.60946 11.105 9.43555 11.018 9.28338 10.8441L8.72903 10.3224C8.57686 10.1484 8.50077 9.96365 8.50077 9.768C8.50077 9.55061 8.57686 9.36583 8.72903 9.21365L10.8486 7.06148H1.19642C0.97903 7.06148 0.794247 6.98539 0.642073 6.83322C0.489899 6.68105 0.413812 6.49626 0.413812 6.27887V5.49626C0.413812 5.27887 0.489899 5.09409 0.642073 4.94192C0.794247 4.78974 0.97903 4.71365 1.19642 4.71365H10.8486L8.72903 2.56148Z" fill="white"></path>
                      </svg></Link>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-sm-4">
                <div class="services_block_infor">
                  <div class="services_info_icon">
                    <img src="images/deposit_account.svg" alt="Software Development" />
                  </div>
                  <div class="cnt_block">
                    <h4>Deposit to Account</h4>
                    <p>Quick top-up in a few easy steps.</p>
                    <div class="readbtn">
                      <Link to="/asset_managemnet/deposit">Deposit Now <svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none">
                        <path d="M8.72903 2.56148C8.57686 2.40931 8.50077 2.23539 8.50077 2.03974C8.50077 1.82235 8.57686 1.6267 8.72903 1.45279L9.28338 0.931046C9.43555 0.757133 9.60946 0.670177 9.80512 0.670177C10.0225 0.670177 10.2073 0.757133 10.3595 0.931046L14.7942 5.33322C14.9464 5.48539 15.0225 5.67018 15.0225 5.88757C15.0225 6.10496 14.9464 6.28974 14.7942 6.44192L10.3595 10.8441C10.2073 11.018 10.0225 11.105 9.80512 11.105C9.60946 11.105 9.43555 11.018 9.28338 10.8441L8.72903 10.3224C8.57686 10.1484 8.50077 9.96365 8.50077 9.768C8.50077 9.55061 8.57686 9.36583 8.72903 9.21365L10.8486 7.06148H1.19642C0.97903 7.06148 0.794247 6.98539 0.642073 6.83322C0.489899 6.68105 0.413812 6.49626 0.413812 6.27887V5.49626C0.413812 5.27887 0.489899 5.09409 0.642073 4.94192C0.794247 4.78974 0.97903 4.71365 1.19642 4.71365H10.8486L8.72903 2.56148Z" fill="white"></path>
                      </svg></Link>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-sm-4">
                <div class="services_block_infor">
                  <div class="services_info_icon">
                    <img src="images/trading_account.svg" alt="Software Development" />
                  </div>
                  <div class="cnt_block">
                    <h4>Start Trading</h4>
                    <p>Sell and buy crypto, copy trade, and more.</p>
                    <div class="readbtn">
                      <Link to="trade/landing">Trade Now <svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none">
                        <path d="M8.72903 2.56148C8.57686 2.40931 8.50077 2.23539 8.50077 2.03974C8.50077 1.82235 8.57686 1.6267 8.72903 1.45279L9.28338 0.931046C9.43555 0.757133 9.60946 0.670177 9.80512 0.670177C10.0225 0.670177 10.2073 0.757133 10.3595 0.931046L14.7942 5.33322C14.9464 5.48539 15.0225 5.67018 15.0225 5.88757C15.0225 6.10496 14.9464 6.28974 14.7942 6.44192L10.3595 10.8441C10.2073 11.018 10.0225 11.105 9.80512 11.105C9.60946 11.105 9.43555 11.018 9.28338 10.8441L8.72903 10.3224C8.57686 10.1484 8.50077 9.96365 8.50077 9.768C8.50077 9.55061 8.57686 9.36583 8.72903 9.21365L10.8486 7.06148H1.19642C0.97903 7.06148 0.794247 6.98539 0.642073 6.83322C0.489899 6.68105 0.413812 6.49626 0.413812 6.27887V5.49626C0.413812 5.27887 0.489899 5.09409 0.642073 4.94192C0.794247 4.78974 0.97903 4.71365 1.19642 4.71365H10.8486L8.72903 2.56148Z" fill="white"></path>
                      </svg></Link>
                    </div>
                  </div>
                </div>
              </div>

            </div>


            {/* <ul>
                  <li>
                    <span>1.</span>
                    <div className="get_started_cnt">
                      <h3>Create an Account</h3>
                      <p>Register and claim exclusive newcomer rewards.</p>

                      <div className="trade_btn">

                        <Link to="/signup">     <button class="register-btn">

                          Register Now <span><img src="images/trade_arrow.svg" alt="Arrow" /></span>

                        </button></Link>
                      </div>

                    </div>
                  </li>
                  <li>
                    <span>2.</span>
                    <div className="get_started_cnt">
                      <h3>Deposit to Account</h3>
                      <p>Quick top-up in a few easy steps.</p>
                      <div className="trade_btn">
                        <Link to="/asset_managemnet/deposit">
                          <button>
                            Deposit Now <span> <img src="images/trade_arrow.svg" alt="trade arrow" /></span>
                          </button>
                        </Link>
                      </div>
                    </div>
                  </li>
                  <li>
                    <span>3.</span>
                    <div className="get_started_cnt">
                      <h3>Start Trading</h3>
                      <p>Sell and buy crypto, copy trade, and more.</p>

                      <div className="trade_btn">
                        <a href="/trade/landing">
                          <button>
                            Trade Now <span> <img src="images/trade_arrow.svg" alt="trade arrow" /></span>
                          </button>
                        </a>

                      </div>

                    </div>
                  </li>
                </ul> */}
          </div>


          {/* <div className="col-sm-6">
                <div className="crypto_bitcoin_vector">
                  <img src="images/balance_ac_vector.png" alt="balance" />
                </div>
              </div> */}

        </div>



        {/* <div className="trading_platform_section">
          <div className="container">

            <h2><span>World</span>
              Class Trading Platform</h2>

            <div className="trading_services">

              <div className="services_block">
                <div className="trading_img">
                  <img src="images/new_img/exchange_icon.svg" alt="Exchange" />
                </div>
                <h4>Crypto Exchange</h4>
                <p>Experience lightning-fast crypto trading with Wrathcode. Buy, sell, and swap your favorite digital assets seamlessly on a secure and intuitive platform.</p>
              </div>

              <div className="services_block">
                <div className="trading_img">
                  <img src="images/new_img/high_performance_icon.svg" alt="High Performance" />
                </div>
                <h4>High Performance</h4>
                <p>Trade with zero delays. Our high-performance engine ensures fast order execution and real-time updates to keep you ahead of the market.</p>
              </div>

              <div className="services_block">
                <div className="trading_img">
                  <img src="images/new_img/fast_kyc_vector.svg" alt="Super Fast KYC" />
                </div>
                <h4>Instant KYC</h4>
                <p>Get verified in minutes with our lightning-fast KYC process. Start trading without the wait and access the full power of Wrathcode immediately.</p>
              </div>

              <div className="services_block">
                <div className="trading_img">
                  <img src="images/new_img/order_type_icon.svg" alt="Order Types" />
                </div>
                <h4>Advanced Order Types</h4>
                <p>From market to stop-limit orders, Wrathcode supports multiple order types to give you full control over your trading strategy.</p>
              </div>

              <div className="services_block">
                <div className="trading_img">
                  <img src="images/new_img/interface_icon.svg" alt="Interface" />
                </div>
                <h4>User-Friendly Interface</h4>
                <p>Enjoy a clean, minimal, and responsive design built for both beginners and pro traders. Navigate your dashboard effortlessly on any device.</p>
              </div>

              <div className="services_block">
                <div className="trading_img">
                  <img src="images/new_img/secure_icon.svg" alt="Safe and Secure" />
                </div>
                <h4>Secure Trading</h4>
                <p>Your security is our top priority. With advanced encryption, cold storage, and multi-layer protection, your assets stay safe at all times.</p>
              </div>
            </div>
          </div>
        </div> */}

        <div className="how_get_account_ot trade_app__app">

          <div className="effect_left_circle">
            <img src="images/trade_app_left_after.png" alt="circle" />
          </div>
          <div className="container">

            <div className="row">
              <div className="col-sm-6">
                <div className="crypto_bitcoin_vector">
                  <img src="images/crypto_app_mobile.svg" alt="app mobile" />
                </div>
              </div>

              <div className="col-sm-6">
                <div className="anytime_anywhere">

                  <h2><span>Trade Crypto</span> Anytime,Anywhere</h2>
                  <h5>Welcome to the future of crypto - trade Instantly and effortlessly with  Wrathcode</h5>
                  {/* <p>Welcome to the future of crypto - trade Instantly and effortlessly with  Wrathcode
                  </p>
                  <p><strong> Fast. Secure. Limitless.</strong></p> */}
                  <div className="d-flex scan_button">

                    <div className="scan_code_bl">
                      <div className="code_scan">
                        <QRCode
                          value={apkLink ? `${ApiConfig?.baseUrl}${apkLink}` : "APK will available soon to download"} // ✅ dynamic link
                          size={80} // QR size in px
                          bgColor="#ffffff"
                          fgColor="#000000"
                          includeMargin={false}
                        />
                      </div>
                      <div className="scan_cnt">
                        <h6>Android</h6>
                        <p>Scan to Download</p>
                      </div>
                    </div>

                    <div className="app_btn">
                      <button className="desktop">
                        <svg xmlns="http://www.w3.org/2000/svg" width="37" height="37" viewBox="0 0 37 37" fill="none">
                          <g clip-path="url(#clip0_300_4137)">
                            <g clip-path="url(#clip1_300_4137)">
                              <g clip-path="url(#clip2_300_4137)">
                                <path d="M27.4868 19.0368C27.5204 16.3496 28.9154 13.807 31.1286 12.3995C29.7324 10.3368 27.3938 9.02898 24.9608 8.95024C22.3657 8.66847 19.85 10.5565 18.5276 10.5565C17.1797 10.5565 15.1436 8.97821 12.9512 9.02488C10.0934 9.12038 7.42924 10.8011 6.03888 13.3856C3.05015 18.7383 5.27947 26.605 8.14243 30.9317C9.57482 33.0504 11.2489 35.4169 13.4394 35.3331C15.5829 35.2411 16.3835 33.9192 18.9709 33.9192C21.5343 33.9192 22.2853 35.3331 24.5202 35.2797C26.8203 35.2411 28.2695 33.1516 29.6516 31.0129C30.6808 29.5032 31.4727 27.8348 31.9981 26.0693C29.2952 24.8866 27.49 22.0727 27.4868 19.0368Z" fill="black" />
                                <path d="M23.2655 6.1048C24.5196 4.54745 25.1374 2.54575 24.9878 0.52478C23.0718 0.732948 21.302 1.6802 20.031 3.17779C18.7881 4.64101 18.1412 6.6075 18.2634 8.55123C20.1802 8.57164 22.0645 7.65007 23.2655 6.1048Z" fill="black" />
                              </g>
                            </g>
                          </g>
                          <defs>
                            <clipPath id="clip0_300_4137">
                              <rect width="35.8064" height="35.8064" fill="white" transform="translate(0.822021 0.52478)" />
                            </clipPath>
                            <clipPath id="clip1_300_4137">
                              <rect width="35.8064" height="35.8064" fill="white" transform="translate(0.822021 0.52478)" />
                            </clipPath>
                            <clipPath id="clip2_300_4137">
                              <rect width="28.2111" height="35.8064" fill="white" transform="translate(4.61963 0.52478)" />
                            </clipPath>
                          </defs>
                        </svg>App Store</button>
                      {/* Download from<br />  */}
                      <button className="mobile">
                        <svg xmlns="http://www.w3.org/2000/svg" width="37" height="37" viewBox="0 0 37 37" fill="none">
                          <g clip-path="url(#clip0_300_4137)">
                            <g clip-path="url(#clip1_300_4137)">
                              <g clip-path="url(#clip2_300_4137)">
                                <path d="M27.4868 19.0368C27.5204 16.3496 28.9154 13.807 31.1286 12.3995C29.7324 10.3368 27.3938 9.02898 24.9608 8.95024C22.3657 8.66847 19.85 10.5565 18.5276 10.5565C17.1797 10.5565 15.1436 8.97821 12.9512 9.02488C10.0934 9.12038 7.42924 10.8011 6.03888 13.3856C3.05015 18.7383 5.27947 26.605 8.14243 30.9317C9.57482 33.0504 11.2489 35.4169 13.4394 35.3331C15.5829 35.2411 16.3835 33.9192 18.9709 33.9192C21.5343 33.9192 22.2853 35.3331 24.5202 35.2797C26.8203 35.2411 28.2695 33.1516 29.6516 31.0129C30.6808 29.5032 31.4727 27.8348 31.9981 26.0693C29.2952 24.8866 27.49 22.0727 27.4868 19.0368Z" fill="black" />
                                <path d="M23.2655 6.1048C24.5196 4.54745 25.1374 2.54575 24.9878 0.52478C23.0718 0.732948 21.302 1.6802 20.031 3.17779C18.7881 4.64101 18.1412 6.6075 18.2634 8.55123C20.1802 8.57164 22.0645 7.65007 23.2655 6.1048Z" fill="black" />
                              </g>
                            </g>
                          </g>
                          <defs>
                            <clipPath id="clip0_300_4137">
                              <rect width="35.8064" height="35.8064" fill="white" transform="translate(0.822021 0.52478)" />
                            </clipPath>
                            <clipPath id="clip1_300_4137">
                              <rect width="35.8064" height="35.8064" fill="white" transform="translate(0.822021 0.52478)" />
                            </clipPath>
                            <clipPath id="clip2_300_4137">
                              <rect width="28.2111" height="35.8064" fill="white" transform="translate(4.61963 0.52478)" />
                            </clipPath>
                          </defs>
                        </svg> App Store</button>
                      {/* Get On <br /> */}

                      <button className="desktop" onClick={DownloadApkButton}><img src="images/playstore_icon.png" alt="google icon" />Google Play</button>
                      {/* Download from <br /> */}
                      <button className="mobile" onClick={DownloadApkButton}><img src="images/playstore_icon.png" alt="google icon" />Google Play</button>
                      {/* Get On <br /> */}

                      <button className="desktop" onClick={DownloadApkButton}><img src="images/apk_icon.svg" alt="APK" />APK</button>
                      {/* Download from <br /> */}
                      <button className="mobile" onClick={DownloadApkButton}><img src="images/apk_icon.svg" alt="APK" />APK</button>

                      <button className="desktop"><img src="images/api_icon.svg" alt="API" />API</button>
                      {/* Download from <br /> */}
                      <button className="mobile"><img src="images/api_icon.svg" alt="API" />API</button>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >


      <div className="profit_costs_cta_outer platform_trading_s">
        <div className="container">
          <h2><span>World</span> Class Trading Platform</h2>
          <div class="row">
            <div class="col-sm-4">
              <div class="software_trading_bl">
                <div className="after_top_vector">
                  <img src="images/platform_after_top.svg" alt="after" />
                </div>
                <img src="images/trading_platfarm_img.svg" alt="Exchange" />
                <div class="software_trading_cnt">
                  <h6>Exchange</h6>
                  <p>Empower your business to thrive with our tailored web design solutions.</p>
                </div>
              </div>
            </div>
            <div class="col-sm-4">
              <div class="software_trading_bl">
                <div className="after_top_vector">
                  <img src="images/platform_after_top.svg" alt="after" />
                </div>
                <img src="images/trading_platfarm_img2.svg" alt="Super Fast KYC" />
                <div class="software_trading_cnt">
                  <h6>Super Fast KYC</h6>
                  <p>Join a community of satisfied clients benefiting from our proven excellence.</p>
                </div>
              </div>
            </div>

            <div class="col-sm-4">
              <div class="software_trading_bl">
                <div className="after_top_vector">
                  <img src="images/platform_after_top.svg" alt="after" />
                </div>
                <img src="images/trading_platfarm_img3.svg" alt="High Performance" />
                <div class="software_trading_cnt">
                  <h6>High Performance</h6>
                  <p>Stay ahead with innovative web designs crafted by Arise.</p>
                </div>
              </div>
            </div>

            <div class="col-sm-4">
              <div class="software_trading_bl">
                <div className="after_top_vector">
                  <img src="images/platform_after_top.svg" alt="after" />
                </div>
                <img src="images/trading_platfarm_img4.svg" alt="Order Types" />
                <div class="software_trading_cnt">
                  <h6>Order Types</h6>
                  <p>Empower your business to thrive with our tailored web design solutions.</p>
                </div>
              </div>
            </div>

            <div class="col-sm-4">
              <div class="software_trading_bl">
                <div className="after_top_vector">
                  <img src="images/platform_after_top.svg" alt="after" />
                </div>
                <img src="images/trading_platfarm_img5.svg" alt="Minimal Interface" />
                <div class="software_trading_cnt">
                  <h6>Minimal Interface</h6>
                  <p>Join a community of satisfied clients benefiting from our proven excellence.</p>
                </div>
              </div>
            </div>

            <div class="col-sm-4">
              <div class="software_trading_bl">
                <div className="after_top_vector">
                  <img src="images/platform_after_top.svg" alt="after" />
                </div>
                <img src="images/trading_platfarm_img6.svg" alt="Multi-Access Role" />
                <div class="software_trading_cnt">
                  <h6>Multi-Access Role</h6>
                  <p>Stay ahead with innovative web designs crafted by Arise.</p>
                </div>
              </div>
            </div>

          </div>

          <div className="row cta_register_s">
            <div className="col-sm-8">
              <div className="profit_cost_cnt">
                <h2>Start your journey now and win</h2>
                <h5>Explore our products, gain real-time insights, and unlock your potential!</h5>
                <div className="trade_btn">
                  <button><Link to="/signup">Register Now <span><img src="images/trade_arrow.svg" alt="trade arrow" /></span></Link></button>
                </div>

                <ul className="social_media">
                  <li><a href="https://www.linkedin.com/company/Wrathcode/" target="_blank" rel="noreferrer"><i class="ri-linkedin-fill"></i></a></li>
                  <li><a href="https://x.com/Wrathcode" target="_blank" rel="noreferrer"><i class="ri-twitter-x-line"></i></a></li>
                  {/* <li><a href="#"><i class="ri-instagram-line"></i></a></li> */}
                  <li><a href="https://t.me/Wrathcode" target="_blank" rel="noreferrer"><i class="ri-telegram-2-fill"></i></a></li>
                  {/* <li><a href="#"><i class="ri-youtube-line"></i></a></li> */}
                </ul>

              </div>
            </div>
            <div className="col-sm-4">
              <div className="cta_vector">
                <img className="drak_d" src="images/new_img/cta_img2.svg" alt="cta img" />
                <img className="light_m" src="images/new_img/light_cta_img2.svg" alt="cta img" />
              </div>
            </div>

          </div>
        </div>


        {/* <div className="trusted_partner">
          <div className="container">
            <h2>Trusted by Partner</h2>
            <div className="partner_logos">
              <div className="logos_slide">
                <img src="images/partner_logo.png" alt="Logo 1" />
                <img src="images/partner_logo2.png" alt="Logo 2" />
                <img src="images/partner_logo3.png" alt="Logo 3" />
                <img src="images/partner_logo4.png" alt="Logo 4" />
                <img src="images/partner_logo5.png" alt="Logo 5" />
                <img src="images/partner_logo.png" alt="Logo 1" />
                <img src="images/partner_logo2.png" alt="Logo 2" />
                <img src="images/partner_logo3.png" alt="Logo 3" />
                <img src="images/partner_logo4.png" alt="Logo 4" />
                <img src="images/partner_logo5.png" alt="Logo 5" />
              </div>
            </div>

            <div className="partner_logos top_space">
              <div className="logos_slide_right">
                <img src="images/partner_logo.png" alt="Logo 1" />
                <img src="images/partner_logo2.png" alt="Logo 2" />
                <img src="images/partner_logo3.png" alt="Logo 3" />
                <img src="images/partner_logo4.png" alt="Logo 4" />
                <img src="images/partner_logo5.png" alt="Logo 5" />
                <img src="images/partner_logo.png" alt="Logo 1" />
                <img src="images/partner_logo2.png" alt="Logo 2" />
                <img src="images/partner_logo3.png" alt="Logo 3" />
                <img src="images/partner_logo4.png" alt="Logo 4" />
                <img src="images/partner_logo5.png" alt="Logo 5" />
              </div>


            </div>

          </div>
        </div> */}


        {/* <div className="faq_cta_outer mt-5">
          <div className="container">

            <div className="faq_section">

              <h2>FAQ'S</h2>


              <div className="accordion" id="accordionExample">
                <div className="accordion-item">
                  <h3 className="accordion-header" id="headingOne">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                      What is Wrathcode and how does it work?
                    </button>
                  </h3>
                  <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                    <div className="accordion-body">
                      Wrathcode is a secure cryptocurrency exchange platform that allows users to buy, sell, and trade digital assets like Bitcoin, Ethereum, and many trading pairs. We support spot trading — all with advanced charting tools and robust security infrastructure.
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h3 className="accordion-header" id="headingTwo">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                      How do I deposit or withdraw funds on Wrathcode?
                    </button>
                  </h3>
                  <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                    <div className="accordion-body">
                      Deposits and withdrawals can be made via crypto wallets. Simply navigate to the “Wallet” section, choose the asset you want to deposit or withdraw, and follow the on-screen instructions. Please make sure to double-check wallet addresses and network selection to avoid errors.
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h3 className="accordion-header" id="headingThree">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                      Is Wrathcode safe to use?
                    </button>
                  </h3>
                  <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                    <div className="accordion-body">
                      Yes, security is a top priority at Wrathcode. We use multi-layer security protocols including 2FA, cold wallet storage, encrypted user data, and real-time monitoring to keep your funds and data safe at all times.
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h3 className="accordion-header" id="headingFour">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                      What trading features does Wrathcode offer?
                    </button>
                  </h3>
                  <div id="collapseFour" className="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#accordionExample">
                    <div className="accordion-body">
                      Wrathcode offers a wide range of trading features including spot trading, limit & market orders, real-time price charts, and live order books — all designed for fast execution and optimized for both desktop and mobile users.
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h3 className="accordion-header" id="headingFive">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFive" aria-expanded="false" aria-controls="collapseFive">
                      How can I get help or support?
                    </button>
                  </h3>
                  <div id="collapseFive" className="accordion-collapse collapse" aria-labelledby="headingFive" data-bs-parent="#accordionExample">
                    <div className="accordion-body">
                      If you need assistance, our support team is available 24/7. You can submit a ticket through the Help Center, use live chat, or email us at support@wrathcode.com. We aim to resolve all queries as quickly as possible.
                    </div>
                  </div>
                </div>
              </div>


            </div>

          </div>
        </div> */}


      </div>



    </>
  );
};

export default LandingPage;
