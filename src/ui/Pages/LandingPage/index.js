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
  const [coinData, setCoinData] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);


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
    // { id: "gainers", label: "Gainers" },
    // { id: "newest", label: "Newest" },
    // { id: "meme", label: "Meme" },
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
  const gainerElementRef = useRef(null);
  const handleTabClick = (itemName) => {
    setActiveTab(itemName);
    if (gainerElementRef.current) {
      gainerElementRef.current.scrollIntoView({ behavior: 'smooth' });
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




      {/* <div
        class="modal fade homebonuspop"
        id="bonusPopup"
        tabindex="-1"
        aria-labelledby="bonusPopupLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content popup-box homepop_box">
            <div class="modal-body text-center position-relative">

            
              <button
                type="button"
                class="btn-close position-absolute top-0 end-0 m-2"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={handleApkDonwload}
              ></button>

          
              <div id="bonusSlider" class="carousel slide" data-bs-ride="carousel" data-bs-interval="2000">
                <div class="carousel-inner">

               
                  <div class="carousel-item active">
                    <a href={authToken ? "/user_profile/giveaway" : "/login"}>
                      <img
                        src="/images/bonus_banner/giveaway_banner.png"
                        alt="giveaway"
                        class="img-fluid"
                      />
                    </a>
                  </div>

                
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
           

            </div>
          </div>
        </div>
      </div> */}



      <div class="hero_section_main">
        <video
          className="bg-video"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source
            src="https://img.bgstatic.com/video/msg/herobanner-1732092714.webm"
            type="video/webm"
          />
        </video>

        <div class="container">
          <div class="row">
            <div class="banner_content">
              <h1>The Smarter Way to Buy, <span className="sub_heading">Trade & Invest</span> in Crypto</h1>
              <p>A powerful crypto platform designed for speed, security, and smarter investing — all in one place.</p>

              <div className="d-flex download_button">
                <button className="btn">Download App</button>
                <button className="btn platform">Explore Platform</button>
              </div>

            </div>
            <div class="banner_img">
              <img className="bitcoin_right animation" src="images/new-images/banner_vectror_ani.svg" />
              <img className="crypto_cntr animation" src="images/new-images/banner_vectror_ani3.svg" />
              <div className="banner_img">
                <img src="images/new-images/banner_img.svg" alt="banner" />
              </div>
              <img className="bitcoin_left animation" src="images/new-images/banner_vectror_ani2.svg" />

            </div>
          </div>


        </div>
      </div>

      <div className="currency_logo">
        <ul>
          <li>
            <div className="cnt">
              <span>Instantly Convert</span>
              <h3>USDT to INR</h3>
            </div>
            <div className="icon_crypto">
              <img src="images/new-images/cryptoadd_vector.png" alt="crypto" />
            </div>
          </li>
          <li>
            <div className="cnt">
              <span>Spend and Earn upto 100%</span>
              <h3>Crypto Cashback</h3>
            </div>
            <div className="icon_crypto">
              <img src="images/new-images/cryptoadd_vector2.png" alt="crypto" />
            </div>
          </li>
          <li>
            <div className="cnt">
              <span>Experience Seamless</span>
              <h3>Crypto Withdrawals</h3>
            </div>
            <div className="icon_crypto">
              <img src="images/new-images/cryptoadd_vector3.png" alt="crypto" />
            </div>
          </li>
          <li>
            <div className="cnt">
              <h3>Buy USDT (Tether)</h3>
              <span>at Lowest Price</span>
            </div>
            <div className="icon_crypto">
              <img src="images/new-images/cryptoadd_vector4.png" alt="crypto" />
            </div>
          </li>
          <li>
            <div className="cnt">
              <span>Registered with</span>
              <h3>F.I.U. of India</h3>
            </div>
            <div className="icon_crypto">
              <img src="images/new-images/cryptoadd_vector5.png" alt="crypto" />
            </div>
          </li>
        </ul>
      </div>



      <div className="crypto_section trending_crypto" data-aos="fade-up" data-aos-duration="2000">
        <div className="container">
          <h2>Trending Cryptocurrencies</h2>
          <p>Real-time market movers powered by live data and smart analytics.</p>

          <div className="crypto_dashboard">
            {/* Trending */}
            <div className="hot_spot_outer">
              <div className="top_heading">
                <h4>Trending</h4>
              </div>
              <div className="hot_trading_s">

                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        {/* <th>#</th> */}
                        <th>Name</th>
                        <th className="text-end" >Price</th>
                        {/* <th className="text-end" >24h</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {coinData && coinData.length <= 0 ? (
                        <tr>
                          <td colSpan="3" className="p-0">
                            <div className="d-flex justify-content-center align-items-center">
                              <div className="spinner-border text-primary" role="status" />
                            </div>
                          </td>
                        </tr>
                      ) : coinData && coinData.length > 0 ? (
                        coinData.slice(0, 5).map((item, index) => (
                          <tr key={index} onClick={() => nextPage(item)}>
                            {/* NAME */}
                            <td className="first_coloum">
                              <div className="td_first">
                                <div className="icon">
                                  <img
                                    alt=""
                                    src={ApiConfig.baseImage + item?.icon_path}
                                    width="28"
                                    className="img-fluid icon_img coinimg me-2"
                                  />
                                </div>
                                <div className="price_heading">
                                  {item?.base_currency} / {item?.quote_currency}
                                </div>
                              </div>
                            </td>

                            {/* PRICE + % (Top Gainers Style) */}
                            <td className="price_right_top text-end">
                              {formatNumber(item?.buy_price, 5)}
                              <span
                                className={item?.change_percentage >= 0 ? "green" : "red"}
                              >
                                {" "}
                                {item?.change_percentage >= 0 ? "▲" : "▼"}{" "}
                                {formatNumber(item?.change_percentage, 3)}%
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="p-0">
                            <div className="favouriteData text-center">
                              <img
                                src="/images/no_data_vector.svg"
                                className="img-fluid"
                                width="96"
                                height="96"
                                alt=""
                              />
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
            {/* TOP GAINERS */}
            <div className="hot_spot_outer">
              <div className="top_heading">
                <h4>Top Gainers</h4>

              </div>

              <div className="hot_trading_s">
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        {/* <th>#</th> */}
                        <th>Name</th>
                        <th className="text-end" >Price</th>
                        {/* <th className="text-end" >24h</th> */}
                      </tr>
                    </thead>
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
            </div>
            {/* NEW LISTINGS */}
            <div className="hot_spot_outer">
              <div className="top_heading">
                <h4>New Listings</h4>

              </div>

              <div className="hot_trading_s">
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        {/* <th>#</th> */}
                        <th>Name</th>
                        <th className="text-end" >Price</th>
                        {/* <th className="text-end" >24h</th> */}
                      </tr>
                    </thead>
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

          <div className="viewmorebtn">
            <a href="/market">View More <i class="ri-arrow-right-line"></i></a>
          </div>

        </div>
      </div>



      <section className="crypto_exchange_section">
        <div className="container">
          <div className="cryptofuture_s">
            <div className="crypto_future_cnt">
              <h2>A Crypto Exchange Built for <span>the Future</span></h2>
              <p>Securely store, manage, and grow your digital assets with next-generation wallet technology
                designed for speed, privacy, and total control.</p>
              <ul className="listcrypto">
                <li><i class="ri-checkbox-circle-fill"></i> Lowest transaction fees in the market</li>
                <li><i class="ri-checkbox-circle-fill"></i> Instant deposits and withdrawals</li>
                <li><i class="ri-checkbox-circle-fill"></i> Advanced 256-bit encryption security</li>
                <li><i class="ri-checkbox-circle-fill"></i> Real-time portfolio tracking</li>
                <li><i class="ri-checkbox-circle-fill"></i> Multi-asset wallet support</li>
              </ul>
              <button className="downloadbtn">Download App</button>
            </div>

            <div className="exchange_future_s">
              <img className="animation_effect summary_data" src="images/new-images/crypto_summry.svg" />
              <img src="images/new-images/crypto_mobile.svg" alt="crypto exchange" />
              <img className="animation_effect bitcoin" src="images/new-images/crypto_bitcoin.svg" />
            </div>

          </div>

          <div className="cryptofuture_s reverse_security">

            <div className="exchange_future_s">
              <img src="images/new-images/verification_mobile.svg" alt="Bulletproof" />
              <img className="animation_effect bitcoin" src="images/new-images/lock_vector.svg" />
            </div>

            <div className="crypto_future_cnt">
              <h2><span>Bulletproof</span> Security, Built by Design</h2>
              <p>Your assets and data are protected by industry-leading security protocols, advanced encryption, and continuous monitoring — so you can trade with complete peace of mind.</p>

              <ul className="security_list">
                <li>
                  <h3>0.</h3>
                  <p>Security Incidents</p>
                </li>
                <li>
                  <h3>256<span>bits</span></h3>
                  <p>AES Encryption</p>
                </li>
                <li>
                  <h3>100<span>%</span></h3>
                  <p>Encrypted Data</p>
                </li>
                <li>
                  <h3>CISA<span>+</span></h3>
                  <p>Security Compliance</p>
                </li>
              </ul>

            </div>

          </div>


        </div>
      </section>


      <div className="profit_costs_cta_outer platform_trading_s">
        <div className="container">

          <div className="d-flex invest_tradetop">
            <h2>Fully Equipped to Buy, <span>Trade & Invest</span> in Crypto.</h2>
            <div class="d-flex download_button">
              <button class="btn">Download App</button>
              <button class="btn platform">Browse All Features</button>
            </div>
          </div>


<section class="features-grid">

  <div class="card large">
    <div class="content">
      <h3>Buy 100+ Crypto Assets</h3>
      <p>
        Trade top cryptocurrencies and emerging tokens with deep liquidity
        and real-time pricing across global markets.
      </p>
      <a href="#">Learn more →</a>
    </div>
    <img src="phone.png" alt="Crypto App" class="phone"/>
  </div>

  <div class="card wallet">
    <img src="wallet-icon.png" alt=""/>
    <h4>Secure & Encrypted Wallet</h4>
    <p>
      Protect your assets with enterprise-grade security, multi-layer encryption,
      and full ownership of your funds.
    </p>
  </div>

  <div class="card">
    <img src="send-icon.png" alt=""/>
    <h4>Send & Receive Instantly</h4>
    <p>
      Transfer crypto effortlessly with fast confirmations, low fees,
      and seamless wallet-to-wallet transactions.
    </p>
  </div>

  <div class="card">
    <img src="coin-icon.png" alt=""/>
    <h4>Invest in Real Time</h4>
    <p>
      Track market movements, execute trades instantly,
      and manage your investments as the market evolves.
    </p>
  </div>

  <div class="card">
    <img src="chart-icon.png" alt=""/>
    <h4>Watch & Analyze Charts</h4>
    <p>
      Make informed decisions using advanced charts,
      live indicators, and professional-grade analytics tools.
    </p>
  </div>

</section>





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
