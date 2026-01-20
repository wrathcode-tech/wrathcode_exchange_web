import React, { useEffect, useState } from 'react'
import { ApiConfig } from '../../../api/apiConfig/apiConfig'
import AuthService from '../../../api/services/AuthService';
import LoaderHelper from '../../../customComponents/Loading/LoaderHelper';
import moment from 'moment';
import { Link } from 'react-router-dom';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from 'react-slick';
import { alertErrorMessage, alertSuccessMessage } from '../../../customComponents/CustomAlertMessage';


const AssetOverview = () => {
  const [estimatedportfolio, setEstimatedportfolio] = useState({});
  const [fundData, setfundData] = useState([]);
  const [walletHistory, setWalletHistory] = useState([]);
  const [topWallets, setTopWallets] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState({});
  const [currencyData, setCurrencyData] = useState([]);
  const [searchCoin, setSearchCoin] = useState("");
  const [searchPair, setSearchPair] = useState("");
  const [walletType, setWalletType] = useState([]);
  const [fromWalletType, setFromWalletType] = useState("");
  const [toWalletType, setToWalletType] = useState("");
  const [selectedCurrBalance, setSelectedCurrBalance] = useState({});
  const [transferAmount, setTransferAmount] = useState("");
  const [currenctTab, setCurrenctTab] = useState("");
  const [showBalance, setShowBalance] = useState("");
  const [activeTab, setActiveTab] = useState("assets");
  const [availableCurrency, setAvailableCurrency] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [depositAddress, setDepositAddress] = useState("");
  const [allData, setAllData] = useState([]);


  const [hideAssets, setHideAssets] = useState(true);
  const [search, setSearch] = useState("");

  const estimatedPortfolio = async (type) => {
    try {
      setCurrenctTab(type)
      LoaderHelper.loaderStatus(true);
      setEstimatedportfolio({});
      setTopWallets([]);
      const result = await AuthService.estimatedPortfolio(type);
      handleUserFunds(type)
      if (result?.success) {
        setEstimatedportfolio(result?.data);
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error fetching estimated portfolio:", result?.message);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error in estimatedPortfolio:", error);
      }
    } finally { LoaderHelper.loaderStatus(false); }
  };

  const handleSelectDepositCoin = (item) => {
    setSelectedCurrency(item);
    setSelectedNetwork("");
    setDepositAddress("");
    setSearchPair("");
    // Close only the assets_crypto_modal, keep kycModal open
    // Use manual DOM manipulation to avoid closing parent modal
    const modalElement = document.getElementById('assets_crypto_modal');
    if (modalElement) {
      // Remove show class and backdrop
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      modalElement.setAttribute('aria-hidden', 'true');
      modalElement.removeAttribute('aria-modal');

      // Remove backdrop for this specific modal only
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => {
        // Only remove if it's the last backdrop (child modal's backdrop)
        if (backdrop && backdrop.parentNode) {
          const backdropZIndex = window.getComputedStyle(backdrop).zIndex;
          // Remove only the topmost backdrop (child modal)
          if (parseInt(backdropZIndex) > 1040) {
            backdrop.remove();
          }
        }
      });

      // Ensure parent modal stays open
      const parentModal = document.getElementById('kycModal');
      if (parentModal) {
        parentModal.classList.add('show');
        parentModal.style.display = 'block';
        parentModal.setAttribute('aria-hidden', 'false');
        parentModal.setAttribute('aria-modal', 'true');
      }
    }
  };

  const getWalletType = async () => {
    try {
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.availableWalletTypes();
      if (result?.success) {
        setWalletType(result?.data);
        setFromWalletType(result?.data[0] || "")
        setToWalletType(result?.data[1] || "")
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error fetching wallet types:", result?.message);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error in getWalletType:", error);
      }
    } finally { LoaderHelper.loaderStatus(false); }
  };

  const handleUserFunds = async (type) => {
    try {
      const result = await AuthService.getUserfunds(type);
      if (result?.success) {
        const wallets = result?.data || [];

        // Parse balance to number and sort
        const walletsWithBalance = wallets
          .filter(wallet => parseFloat(wallet.balance) > 0)
          .sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));

        let topWalletsList = [];

        if (walletsWithBalance.length >= 2) {
          topWalletsList = walletsWithBalance;
        } else {
          // Add existing non-zero wallets
          topWalletsList = [...walletsWithBalance];

          // Fill remaining with top wallets regardless of balance
          const remaining = 2 - topWalletsList.length;
          const walletsSorted = wallets
            .sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance))
            .filter(w => !topWalletsList.find(tw => tw.currency_id === w.currency_id));

          topWalletsList = topWalletsList.concat(walletsSorted.slice(0, remaining));
        }

        setfundData(wallets);
        if (currencyData?.length === 0) {
          setCurrencyData(wallets);
          setSelectedCurrency(wallets[0] || {})
        }
        setTopWallets(topWalletsList);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching user funds:", error);
      }
    }
  };

  const handleCheckboxChange = (type) => {
    if (type === "balance") {
      setHideAssets(!hideAssets);
    } else {
      setHideAssets(false);
    }
  };

  const handleWalletHistory = async () => {
    try {
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.walletTransferHistory(0, 10);
      if (result?.success) {
        setWalletHistory(result?.data);
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error fetching wallet history:", result?.message);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error in handleWalletHistory:", error);
      }
    } finally {
      LoaderHelper.loaderStatus(false);
    }
  };

  const finalFundData = fundData?.filter((item) =>
    item?.short_name?.toLowerCase()?.includes(search?.toLowerCase()) || item?.currency?.toLowerCase()?.includes(search?.toLowerCase())
  );

  const filteredCoinList = hideAssets
    ? finalFundData.filter(item => (item.balance + item?.bonus + item.locked_balance || 0) > 0)
    : finalFundData;


  const fiveDecimal = (data) => {
    if (typeof (data) === "number") {
      return parseFloat(data?.toFixed(8))
    } else {
      return "N/A"
    }
  };

  const settings = {
    dots: true,              // 👈 Enable dots
    infinite: true,
    speed: 600,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,           // 👈 Hide arrows
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  const getWalletBalance = async () => {
    try {
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.getPerticularWalletBalance(selectedCurrency?.currency_id, fromWalletType, toWalletType);
      if (result?.success) {
        setSelectedCurrBalance(result?.data);
      } else {
        alertErrorMessage(result?.message)
      }

    } catch (error) {
      alertErrorMessage(error?.message)
    } finally {
      LoaderHelper.loaderStatus(false)
    }
  }

  const handleWalletTransfer = async () => {
    if (!fromWalletType || !toWalletType || !selectedCurrency?.currency_id || !+transferAmount) {
      return;
    }
    try {
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.walletTransfer(fromWalletType, toWalletType, selectedCurrency?.currency_id, +transferAmount);
      if (result?.success) {
        alertSuccessMessage(result?.message);
        getWalletBalance();
        estimatedPortfolio(currenctTab);
        setTransferAmount("");
        handleWalletHistory()
      } else {
        alertErrorMessage(result?.message)
      }

    } catch (error) {
      alertErrorMessage(error?.message)
    } finally {
      LoaderHelper.loaderStatus(false)
    }
  };

  const handleInterchangeWallet = () => {
    let fromWallet = fromWalletType;
    let toWallet = toWalletType;
    setFromWalletType(toWallet);
    setToWalletType(fromWallet);
  };


  const handleSelecteCurrency = (currency) => {
    setSelectedCurrency(currency);
    setTransferAmount("");
    setSearchCoin("");
  }

  useEffect(() => {
    estimatedPortfolio("");
    handleWalletHistory();
    getWalletType();
  }, []);

  useEffect(() => {
    if (Object.keys(selectedCurrency)?.length > 0 && fromWalletType && fromWalletType !== "" && toWalletType && toWalletType !== "") {
      getWalletBalance()
    }

  }, [selectedCurrency, fromWalletType, toWalletType]);


  const getDepositActiveCoins = async () => {
    try {
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.depositActiveCoins();
      if (result?.success) {
        setAvailableCurrency(result?.data);
        setAllData(result?.data);
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error fetching deposit active coins:", result?.message);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error in getDepositActiveCoins:", error);
      }
    } finally {
      LoaderHelper.loaderStatus(false);
    }
  };

  useEffect(() => {
    getDepositActiveCoins();
  }, []);
  useEffect(() => {
    if (searchPair) {
      const filteredPair = allData?.filter((item) => item?.short_name?.toLowerCase()?.includes(searchPair?.toLowerCase()));
      setAvailableCurrency(filteredPair)

    } else {
      setAvailableCurrency(allData)
    }
  }, [searchPair]);



  return (
    <>


      <div className="dashboard_right">
        <div className='row'>
          <div className="col-sm-10">
            <div className='overview_section'>
              <div className='estimated_balance'>
                <h6>Estimated Balance <button><i class="ri-eye-line"></i></button></h6>
                <div class="wallet-header d-flex flex-wrap align-items-center justify-content-between">
                  <div>
                    <div class="wallet-title">
                      0 USDT
                    </div>
                    <div class="wallet-sub mt-1">
                      ≈ 0.00 USD
                      <span>Today’s PNL 0.00 USD (0.00%) <i class="ri-arrow-right-s-line"></i></span>
                    </div>
                  </div>

                  <div class="d-flex gap-2 mt-3 mt-md-0">
                    <button class="btn btn-deposit px-4">Deposit</button>
                    <button class="btn btn-outline-custom px-4">Withdraw</button>
                    <button class="btn btn-outline-custom px-4" data-bs-toggle="modal" data-bs-target="#kycModal">Transfer</button>
                  </div>

                </div>

              </div>

            </div>
          </div>
        </div>


        {/* <DashboardHeader props={props} /> */}

        {/* <div className="overview_section">
          <div className="row top_heading_overview">
            <div className="col-sm-2">
              <h1><img src="/images/poket_overview.png" alt="poket" />Overview</h1>

            </div>

            <div className="col-sm-10">
              <div className="overview_cate_section asstes_listing_tb">

                <ul className="nav nav-tabs" id="myTab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home"
                      type="button" role="tab" aria-controls="home" aria-selected="true" onClick={() => estimatedPortfolio("")}>Overview</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile"
                      type="button" role="tab" aria-controls="profile" aria-selected="false" onClick={() => estimatedPortfolio("main")}>Main</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#contact"
                      type="button" role="tab" aria-controls="contact" aria-selected="false" onClick={() => estimatedPortfolio("spot")}>Spot</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="swap-tab" data-bs-toggle="tab" data-bs-target="#swap" type="button"
                      role="tab" aria-controls="swap" aria-selected="false" onClick={() => estimatedPortfolio("swap")}>Swap</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="earning-tab" data-bs-toggle="tab" data-bs-target="#earning"
                      type="button" role="tab" aria-controls="earning" aria-selected="false" onClick={() => estimatedPortfolio("earning")}>Earning</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="earning-tab" data-bs-toggle="tab" data-bs-target="#futures"
                      type="button" role="tab" aria-controls="earning" aria-selected="false" onClick={() => estimatedPortfolio("futures")}>Futures</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="earning-tab" data-bs-toggle="tab" data-bs-target="#futures"
                      type="button" role="tab" aria-controls="earning" aria-selected="false" onClick={() => estimatedPortfolio("options")}>Options</button>
                  </li>
                 
                </ul>


              </div>
            </div>


            <div className="col-sm-12">
              <div className="tab-content" id="myTabContent">
                <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">

                  <div className="overview_summary_currency">
                    <div className="row">
                      <div className="col-sm-12 col-md-12 col-lg-4 ">

                        {Object.keys(estimatedportfolio)?.length > 0 ?
                          <>
                            <div className="estimated_balance_bl">
                              <h2>Estimated Balance</h2>
                              <h4> {(estimatedportfolio?.dollarPrice?.toFixed(8)) || 0}<span>USDT</span></h4>
                              <div className="sub_price">{estimatedportfolio?.currencyPrice?.toFixed(8) || 0}{estimatedportfolio?.Currency || "---"}<Link to="/user_profile/currency_preference"><img src="/images/arrow_5.svg" alt="arrow" /></Link>
                              </div>
                              <div className="overview_btn ">
                                <button className="deposit"><Link to="/asset_managemnet/deposit">Deposit</Link></button>
                                <button className="withdrawbtn"><Link to="/asset_managemnet/withdraw">Withdraw</Link></button>
                              </div>
                            </div>

                          </>
                          :
                          <div className="estimated_balance_bl ">
                            <h2>Estimated Balance</h2>
                            <div className=' d-flex justify-content-center align-items-center estimate_loader'>
                              <div className="spinner-grow text-light" role="status">
                                <span className="sr-only"></span>
                              </div>
                            </div>
                          </div>
                        }
                      </div>

                      <div className="col-sm-12 col-md-12 col-lg-8">

                        {topWallets?.length > 0 ? <Slider {...settings}>
                          {topWallets?.map((wallet, index) => {
                            return (
                              <div key={index}>
                                <div className="client_outer">
                                  <div className="estimated_balance_bl currency_bit">
                                    <h2>
                                      <img src={ApiConfig?.baseImage + wallet?.icon_path} alt={wallet?.currency} width="30px" /> {wallet?.currency}
                                    </h2>
                                    <h4>
                                      {fiveDecimal(wallet?.balance)} {wallet?.short_name} <span>1 {wallet?.short_name} = ${wallet?.short_name === "USDT" ? "1" : fiveDecimal(wallet?.price) || "N/A"}</span>
                                    </h4>
                                    <div className="sub_price">${wallet?.short_name === "USDT" ? wallet?.balance : fiveDecimal(wallet?.balance * wallet?.price)}</div>

                                    <div className="change_price_update">
                                      <p>24h Change</p>
                                      <div className="price_value">
                                        {wallet?.short_name === "USDT" ? "0" : fiveDecimal(wallet?.change)}%
                                      </div>
                                    </div>

                                    <div className="overview_btn">
                                      <button className="swapbtn"> <Link to="/user_profile/swap">Swap</Link></button>
                                      <button className="deposit"><Link to={wallet?.short_name === "INR" ? "/asset_managemnet/deposit_fiat" : "/asset_managemnet/deposit"}>Deposit</Link></button>
                                      <button className="withdrawbtn"> <Link to={`/trade/${wallet?.short_name}_USDT`}>Trade</Link></button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}

                        </Slider> :
                          <>
                            <Slider {...settings}>
                              <div >
                                <div className="client_outer">
                                  <div className="estimated_balance_bl currency_bit d-flex justify-content-center align-items-center">
                                    <div className="spinner-grow text-light" role="status">
                                      <span className="sr-only"></span>
                                    </div>
                                  </div>
                                </div>
                              </div><div >
                                <div className="client_outer">
                                  <div className="estimated_balance_bl currency_bit d-flex justify-content-center align-items-center">
                                    <div className="spinner-grow text-light" role="status">
                                      <span className="sr-only"></span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Slider>
                          </>
                        }



                      </div>

                    </div>
                  </div>
                </div>
                <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                  <div className="overview_summary_currency">
                    <div className="row">
                      <div className="col-sm-12 col-md-12 col-lg-4 ">

                        {Object.keys(estimatedportfolio)?.length > 0 ?
                          <>
                            <div className="estimated_balance_bl">
                              <h2>Estimated Balance</h2>
                              <h4> {(estimatedportfolio?.dollarPrice?.toFixed(8)) || 0}<span>USDT</span></h4>
                              <div className="sub_price">{estimatedportfolio?.currencyPrice?.toFixed(8) || 0}{estimatedportfolio?.Currency || "---"}<Link to="/user_profile/currency_preference"><img src="/images/arrow_5.svg" alt="arrow" /></Link>
                              </div>
                              <div className="overview_btn ">
                                <button className="deposit"><Link to="/asset_managemnet/deposit">Deposit</Link></button>
                                <button className="withdrawbtn"><Link to="/asset_managemnet/withdraw">Withdraw</Link></button>
                              </div>
                            </div>

                          </>
                          :
                          <div className="estimated_balance_bl ">
                            <h2>Estimated Balance</h2>
                            <div className=' d-flex justify-content-center align-items-center estimate_loader'>
                              <div className="spinner-grow text-light" role="status">
                                <span className="sr-only"></span>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-8">
                        {topWallets?.length > 0 ? <Slider {...settings}>
                          {topWallets?.map((wallet, index) => {
                            return (
                              <div key={index}>
                                <div className="client_outer">
                                  <div className="estimated_balance_bl currency_bit">
                                    <h2>
                                      <img src={ApiConfig?.baseImage + wallet?.icon_path} alt={wallet?.currency} width="30px" /> {wallet?.currency}
                                    </h2>
                                    <h4>
                                      {fiveDecimal(wallet?.balance)} {wallet?.short_name} <span>1 {wallet?.short_name} = ${wallet?.short_name === "USDT" ? "1" : fiveDecimal(wallet?.price) || "N/A"}</span>
                                    </h4>
                                    <div className="sub_price">${wallet?.short_name === "USDT" ? wallet?.balance : fiveDecimal(wallet?.balance * wallet?.price)}</div>

                                    <div className="change_price_update">
                                      <p>24h Change</p>
                                      <div className="price_value">
                                        {wallet?.short_name === "USDT" ? "0" : fiveDecimal(wallet?.change)}%
                                      </div>
                                    </div>

                                    <div className="overview_btn">
                                      <button className="swapbtn"> <Link to="/user_profile/swap">Swap</Link></button>
                                      <button className="deposit"><Link to={wallet?.short_name === "INR" ? "/asset_managemnet/deposit_fiat" : "/asset_managemnet/deposit"}>Deposit</Link></button>
                                      <button className="withdrawbtn"> <Link to={`/trade/${wallet?.short_name}_USDT`}>Trade</Link></button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}

                        </Slider> :
                          <>
                            <Slider {...settings}>
                              <div >
                                <div className="client_outer">
                                  <div className="estimated_balance_bl currency_bit d-flex justify-content-center align-items-center">
                                    <div className="spinner-grow text-light" role="status">
                                      <span className="sr-only"></span>
                                    </div>
                                  </div>
                                </div>
                              </div><div >
                                <div className="client_outer">
                                  <div className="estimated_balance_bl currency_bit d-flex justify-content-center align-items-center">
                                    <div className="spinner-grow text-light" role="status">
                                      <span className="sr-only"></span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Slider>
                          </>
                        }
                      </div>

                    </div>
                  </div>
                </div>
                <div className="tab-pane fade" id="contact" role="tabpanel" aria-labelledby="contact-tab">
                  <div className="overview_summary_currency">
                    <div className="row">
                      <div className="col-sm-12 col-md-12 col-lg-4 ">

                        {Object.keys(estimatedportfolio)?.length > 0 ?
                          <>
                            <div className="estimated_balance_bl">
                              <h2>Estimated Balance</h2>
                              <h4> {(estimatedportfolio?.dollarPrice?.toFixed(8)) || 0}<span>USDT</span></h4>
                              <div className="sub_price">{estimatedportfolio?.currencyPrice?.toFixed(8) || 0}{estimatedportfolio?.Currency || "---"}<Link to="/user_profile/currency_preference"><img src="/images/arrow_5.svg" alt="arrow" /></Link>
                              </div>
                              <div className="overview_btn ">
                                <button className="deposit"><Link to="/asset_managemnet/deposit">Deposit</Link></button>
                                <button className="withdrawbtn"><Link to="/asset_managemnet/withdraw">Withdraw</Link></button>
                              </div>
                            </div>

                          </>
                          :
                          <div className="estimated_balance_bl ">
                            <h2>Estimated Balance</h2>
                            <div className=' d-flex justify-content-center align-items-center estimate_loader'>
                              <div className="spinner-grow text-light" role="status">
                                <span className="sr-only"></span>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-8">
                        {topWallets?.length > 0 ? <Slider {...settings}>
                          {topWallets?.map((wallet, index) => {
                            return (
                              <div key={index}>
                                <div className="client_outer">
                                  <div className="estimated_balance_bl currency_bit">
                                    <h2 >
                                      <img src={ApiConfig?.baseImage + wallet?.icon_path} alt={wallet?.currency} width="30px" /> {wallet?.currency}
                                    </h2>
                                    <h4>
                                      {fiveDecimal(wallet?.balance)} {wallet?.short_name} <span>1 {wallet?.short_name} = ${wallet?.short_name === "USDT" ? "1" : fiveDecimal(wallet?.price) || "N/A"}</span>
                                    </h4>
                                    <div className="sub_price">${wallet?.short_name === "USDT" ? wallet?.balance : fiveDecimal(wallet?.balance * wallet?.price)}</div>

                                    <div className="change_price_update">
                                      <p>24h Change</p>
                                      <div className="price_value">
                                        {wallet?.short_name === "USDT" ? "0" : fiveDecimal(wallet?.change)}%
                                      </div>
                                    </div>

                                    <div className="overview_btn">
                                      <button className="swapbtn"> <Link to="/user_profile/swap">Swap</Link></button>
                                      <button className="deposit"><Link to={wallet?.short_name === "INR" ? "/asset_managemnet/deposit_fiat" : "/asset_managemnet/deposit"}>Deposit</Link></button>
                                      <button className="withdrawbtn"> <Link to={`/trade/${wallet?.short_name}_USDT`}>Trade</Link></button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}

                        </Slider> :
                          <>
                            <Slider {...settings}>
                              <div >
                                <div className="client_outer">
                                  <div className="estimated_balance_bl currency_bit d-flex justify-content-center align-items-center">
                                    <div className="spinner-grow text-light" role="status">
                                      <span className="sr-only"></span>
                                    </div>
                                  </div>
                                </div>
                              </div><div >
                                <div className="client_outer">
                                  <div className="estimated_balance_bl currency_bit d-flex justify-content-center align-items-center">
                                    <div className="spinner-grow text-light" role="status">
                                      <span className="sr-only"></span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Slider>
                          </>
                        }
                      </div>

                    </div>
                  </div>
                </div>
                <div className="tab-pane fade" id="swap" role="tabpanel" aria-labelledby="swap-tab">
                  <div className="overview_summary_currency">
                    <div className="row">
                      <div className="col-sm-12 col-md-12 col-lg-4 ">

                        {Object.keys(estimatedportfolio)?.length > 0 ?
                          <>
                            <div className="estimated_balance_bl">
                              <h2>Estimated Balance</h2>
                              <h4> {(estimatedportfolio?.dollarPrice?.toFixed(8)) || 0}<span>USDT</span></h4>
                              <div className="sub_price">{estimatedportfolio?.currencyPrice?.toFixed(8) || 0}{estimatedportfolio?.Currency || "---"}<Link to="/user_profile/currency_preference"><img src="/images/arrow_5.svg" alt="arrow" /></Link>
                              </div>
                              <div className="overview_btn ">
                                <button className="deposit"><Link to="/asset_managemnet/deposit">Deposit</Link></button>
                                <button className="withdrawbtn"><Link to="/asset_managemnet/withdraw">Withdraw</Link></button>
                              </div>
                            </div>

                          </>
                          :
                          <div className="estimated_balance_bl ">
                            <h2>Estimated Balance</h2>
                            <div className=' d-flex justify-content-center align-items-center estimate_loader'>
                              <div className="spinner-grow text-light" role="status">
                                <span className="sr-only"></span>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-8">
                        {topWallets?.length > 0 ? <Slider {...settings}>
                          {topWallets?.map((wallet, index) => {
                            return (
                              <div key={index}>
                                <div className="client_outer">
                                  <div className="estimated_balance_bl currency_bit">
                                    <h2>
                                      <img src={ApiConfig?.baseImage + wallet?.icon_path} alt={wallet?.currency} width="30px" /> {wallet?.currency}
                                    </h2>
                                    <h4>
                                      {fiveDecimal(wallet?.balance)} {wallet?.short_name} <span>1 {wallet?.short_name} = ${wallet?.short_name === "USDT" ? "1" : fiveDecimal(wallet?.price) || "N/A"}</span>
                                    </h4>
                                    <div className="sub_price">${wallet?.short_name === "USDT" ? wallet?.balance : fiveDecimal(wallet?.balance * wallet?.price)}</div>

                                    <div className="change_price_update">
                                      <p>24h Change</p>
                                      <div className="price_value">
                                        {wallet?.short_name === "USDT" ? "0" : fiveDecimal(wallet?.change)}%
                                      </div>
                                    </div>

                                    <div className="overview_btn">
                                      <button className="swapbtn"> <Link to="/user_profile/swap">Swap</Link></button>
                                      <button className="deposit"><Link to={wallet?.short_name === "INR" ? "/asset_managemnet/deposit_fiat" : "/asset_managemnet/deposit"}>Deposit</Link></button>
                                      <button className="withdrawbtn"> <Link to={`/trade/${wallet?.short_name}_USDT`}>Trade</Link></button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}

                        </Slider> :
                          <>
                            <Slider {...settings}>
                              <div >
                                <div className="client_outer">
                                  <div className="estimated_balance_bl currency_bit d-flex justify-content-center align-items-center">
                                    <div className="spinner-grow text-light" role="status">
                                      <span className="sr-only"></span>
                                    </div>
                                  </div>
                                </div>
                              </div><div >
                                <div className="client_outer">
                                  <div className="estimated_balance_bl currency_bit d-flex justify-content-center align-items-center">
                                    <div className="spinner-grow text-light" role="status">
                                      <span className="sr-only"></span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Slider>
                          </>
                        }
                      </div>

                    </div>
                  </div>
                </div>
                <div className="tab-pane fade" id="earning" role="tabpanel" aria-labelledby="earning-tab">
                  <div className="overview_summary_currency">
                    <div className="row">
                      <div className="col-sm-12 col-md-12 col-lg-4 ">

                        {Object.keys(estimatedportfolio)?.length > 0 ?
                          <>
                            <div className="estimated_balance_bl">
                              <h2>Estimated Balance</h2>
                              <h4> {(estimatedportfolio?.dollarPrice?.toFixed(8)) || 0}<span>USDT</span></h4>
                              <div className="sub_price">{estimatedportfolio?.currencyPrice?.toFixed(8) || 0}{estimatedportfolio?.Currency || "---"}<Link to="/user_profile/currency_preference"><img src="/images/arrow_5.svg" alt="arrow" /></Link>
                              </div>
                              <div className="overview_btn ">
                                <button className="deposit"><Link to="/asset_managemnet/deposit">Deposit</Link></button>
                                <button className="withdrawbtn"><Link to="/asset_managemnet/withdraw">Withdraw</Link></button>
                              </div>
                            </div>

                          </>
                          :
                          <div className="estimated_balance_bl ">
                            <h2>Estimated Balance</h2>
                            <div className=' d-flex justify-content-center align-items-center estimate_loader'>
                              <div className="spinner-grow text-light" role="status">
                                <span className="sr-only"></span>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-8">
                        {topWallets?.length > 0 ? <Slider {...settings}>
                          {topWallets?.map((wallet, index) => {
                            return (
                              <div key={index}>
                                <div className="client_outer">
                                  <div className="estimated_balance_bl currency_bit">
                                    <h2>
                                      <img src={ApiConfig?.baseImage + wallet?.icon_path} alt={wallet?.currency} width="30px" /> {wallet?.currency}
                                    </h2>
                                    <h4>
                                      {fiveDecimal(wallet?.balance)} {wallet?.short_name} <span>1 {wallet?.short_name} = ${wallet?.short_name === "USDT" ? "1" : fiveDecimal(wallet?.price) || "N/A"}</span>
                                    </h4>
                                    <div className="sub_price">${wallet?.short_name === "USDT" ? wallet?.balance : fiveDecimal(wallet?.balance * wallet?.price)}</div>

                                    <div className="change_price_update">
                                      <p>24h Change</p>
                                      <div className="price_value">
                                        {wallet?.short_name === "USDT" ? "0" : fiveDecimal(wallet?.change)}%
                                      </div>
                                    </div>

                                    <div className="overview_btn">
                                      <button className="swapbtn"> <Link to="/user_profile/swap">Swap</Link></button>
                                      <button className="deposit"><Link to={wallet?.short_name === "INR" ? "/asset_managemnet/deposit_fiat" : "/asset_managemnet/deposit"}>Deposit</Link></button>
                                      <button className="withdrawbtn"> <Link to={`/trade/${wallet?.short_name}_USDT`}>Trade</Link></button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}

                        </Slider> :
                          <>
                            <Slider {...settings}>
                              <div >
                                <div className="client_outer">
                                  <div className="estimated_balance_bl currency_bit d-flex justify-content-center align-items-center">
                                    <div className="spinner-grow text-light" role="status">
                                      <span className="sr-only"></span>
                                    </div>
                                  </div>
                                </div>
                              </div><div >
                                <div className="client_outer">
                                  <div className="estimated_balance_bl currency_bit d-flex justify-content-center align-items-center">
                                    <div className="spinner-grow text-light" role="status">
                                      <span className="sr-only"></span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Slider>
                          </>
                        }
                      </div>

                    </div>
                  </div>
                </div>
                <div className="tab-pane fade" id="futures" role="tabpanel" aria-labelledby="futures-tab">
                  <div className="overview_summary_currency">
                    <div className="row">
                      <div className="col-sm-12 col-md-12 col-lg-4 ">

                        {Object.keys(estimatedportfolio)?.length > 0 ?
                          <>
                            <div className="estimated_balance_bl">
                              <h2>Estimated Balance</h2>
                              <h4> {(estimatedportfolio?.dollarPrice?.toFixed(8)) || 0}<span>USDT</span></h4>
                              <div className="sub_price">{estimatedportfolio?.currencyPrice?.toFixed(8) || 0}{estimatedportfolio?.Currency || "---"}<Link to="/user_profile/currency_preference"><img src="/images/arrow_5.svg" alt="arrow" /></Link>
                              </div>
                              <div className="overview_btn ">
                                <button className="deposit"><Link to="/asset_managemnet/deposit">Deposit</Link></button>
                                <button className="withdrawbtn"><Link to="/asset_managemnet/withdraw">Withdraw</Link></button>
                              </div>
                            </div>

                          </>
                          :
                          <div className="estimated_balance_bl ">
                            <h2>Estimated Balance</h2>
                            <div className=' d-flex justify-content-center align-items-center estimate_loader'>
                              <div className="spinner-grow text-light" role="status">
                                <span className="sr-only"></span>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-8">
                        {topWallets?.length > 0 ? <Slider {...settings}>
                          {topWallets?.map((wallet, index) => {
                            return (
                              <div key={index}>
                                <div className="client_outer">
                                  <div className="estimated_balance_bl currency_bit">
                                    <h2>
                                      <img src={ApiConfig?.baseImage + wallet?.icon_path} alt={wallet?.currency} width="30px" /> {wallet?.currency}
                                    </h2>
                                    <h4>
                                      {fiveDecimal(wallet?.balance)} {wallet?.short_name} <span>1 {wallet?.short_name} = ${wallet?.short_name === "USDT" ? "1" : fiveDecimal(wallet?.price) || "N/A"}</span>
                                    </h4>
                                    <div className="sub_price">${wallet?.short_name === "USDT" ? wallet?.balance : fiveDecimal(wallet?.balance * wallet?.price)}</div>

                                    <div className="change_price_update">
                                      <p>24h Change</p>
                                      <div className="price_value">
                                        {wallet?.short_name === "USDT" ? "0" : fiveDecimal(wallet?.change)}%
                                      </div>
                                    </div>

                                    <div className="overview_btn">
                                      <button className="swapbtn"> <Link to="/user_profile/swap">Swap</Link></button>
                                      <button className="deposit"><Link to={wallet?.short_name === "INR" ? "/asset_managemnet/deposit_fiat" : "/asset_managemnet/deposit"}>Deposit</Link></button>
                                      <button className="withdrawbtn"> <Link to={`/trade/${wallet?.short_name}_USDT`}>Trade</Link></button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}

                        </Slider> :
                          <>
                            <Slider {...settings}>
                              <div >
                                <div className="client_outer">
                                  <div className="estimated_balance_bl currency_bit d-flex justify-content-center align-items-center">
                                    <div className="spinner-grow text-light" role="status">
                                      <span className="sr-only"></span>
                                    </div>
                                  </div>
                                </div>
                              </div><div >
                                <div className="client_outer">
                                  <div className="estimated_balance_bl currency_bit d-flex justify-content-center align-items-center">
                                    <div className="spinner-grow text-light" role="status">
                                      <span className="sr-only"></span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Slider>
                          </>
                        }
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div >


        <div className="estimated_balance">

       <div className='div_tag'>

            <div className="balance_chart_left">

              <h4>Estimated Portfolio     {
                showBalance ?
                  <i className="ri-eye-close-line mx-1" onClick={() => setShowBalance(false)}></i>
                  :
                  <i className="ri-eye-line mx-1" onClick={() => setShowBalance(true)}></i>
              }</h4>

              <div className="select_price">


                <ul className='wallet_price_list'>
                  <li>   <h3> {showBalance ? (estimatedportfolio?.dollarPrice?.toFixed(8)) || 0 : "*********"}  USD</h3></li>
                  <li> {showBalance ? estimatedportfolio?.currencyPrice?.toFixed(8) || 0 : "*********"}{" "}{estimatedportfolio?.Currency || "---"}</li>
                </ul>


              </div>

           


            </div> 


            <div className="balance_chart_right">

              <div className="deposit_btn">
                <Link className="btn btn-green" to="/asset_managemnet/deposit">Deposit</Link>
                <Link className="btn btn-red" to="/asset_managemnet/withdraw">Withdraw</Link>
              </div>


              <div className="chart_img"><img src="/images/graph_map.svg" alt="graph" /></div>


            </div>

          </div>

          <div className="chart_img mobile_view"><img src="/images/graph_map.svg" alt="graph" /></div>
        </div> */}

        <div div className="dashboard_listing_section Overview_mid" >
          <div className="assets_wallets_section">
            <div className='row'>
              <div className="col-sm-10">
                <div className="market_section">

                  {/* Tabs Header */}

                  <div className="coin_view_top">
                    <div className="wallet_tabs">
                      <button
                        className={activeTab === "assets" ? "tab_btn active" : "tab_btn"}
                        onClick={() => setActiveTab("assets")}
                      >
                        Crypto
                      </button>

                      <button
                        className={activeTab === "dummy" ? "tab_btn active" : "tab_btn"}
                        onClick={() => setActiveTab("dummy")}
                      >
                        Account
                      </button>
                    </div>

                    <div className="coin_right">
                      <div class="searchBar custom-tabs"><i class="ri-search-2-line"></i>
                        <input type="search" class="custom_search" placeholder="Search Crypto" />
                      </div>

                      <div className="checkbox">
                        <input
                          type="checkbox"
                          checked={hideAssets}
                          onChange={() => handleCheckboxChange("balance")}
                        />
                        Hide 0 Balance
                      </div>
                    </div>

                  </div>

                  {/* TAB 1 : YOUR ORIGINAL CONTENT */}
                  {activeTab === "assets" && (
                    <div className="dashboard_summary">
                      <div className='desktop_view'>
                        <div className="table-responsive">
                          <table>
                            <thead>
                              <tr>
                                <th>Coin</th>
                                <th>Available Balance</th>
                                <th>In-Order Balance</th>
                                <th>Bonus</th>
                                <th className="right_td">Action</th>
                              </tr>
                            </thead>

                            <tbody>
                              {filteredCoinList?.length > 0 ? (
                                filteredCoinList.map((item, index) => (
                                  <tr key={index}>
                                    <td>
                                      <div className="td_first">
                                        <div className="icon">
                                          <img
                                            src={ApiConfig?.baseImage + item?.icon_path}
                                            height="30"
                                            alt="icon"
                                          />
                                        </div>
                                        <div className="price_heading">
                                          {item?.short_name}
                                          <br />
                                          <span>{item?.currency}</span>
                                        </div>
                                      </div>
                                    </td>

                                    <td>{item?.balance}</td>
                                    <td>{item?.locked_balance}</td>
                                    <td>{item?.bonus}</td>
                                    <td className="right_td">
                                      <div className='d-flex gap-3 justify-content-end'>
                                        <a className="text-white" href="#">
                                          Convert
                                        </a>
                                        <a className="text-white" href="/asset_managemnet/deposit">
                                          Trade
                                        </a>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr rowSpan="5" className="no-data-row2">
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
                      </div>
                      <div className='mobile_view'>
                        <div className="table-responsive">
                          <table>
                            <thead>
                              <tr>
                                <th>Coin</th>
                                <th>Available/Order Balance</th>
                                <th>Bonus</th>
                              </tr>
                            </thead>

                            <tbody>
                              {filteredCoinList?.length > 0 ? (
                                filteredCoinList.map((item, index) => (
                                  <tr key={index}>
                                    <td>
                                      <div className="td_first">
                                        <div className="icon">
                                          <img
                                            src={ApiConfig?.baseImage + item?.icon_path}
                                            height="30"
                                            alt="icon"
                                          />
                                        </div>
                                        <div className="price_heading">
                                          {item?.short_name}
                                          <br />
                                          <span>{item?.currency}</span>
                                        </div>
                                      </div>
                                    </td>

                                    <td>{item?.balance}<br></br>{item?.locked_balance}</td>
                                    <td>{item?.bonus}</td>

                                  </tr>
                                ))
                              ) : (
                                <tr rowSpan="5" className="no-data-row2">
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
                      </div>

                    </div>
                  )}

                  {/* TAB 2 : DUMMY CONTENT */}
                  {activeTab === "dummy" && (
                    <div className="dashboard_summary dummy_tab account_table">
                      <div className='d-flex gap-3 justify-content-between account_tabcnt'>

                        <div className="table-responsive">
                          <table>
                            <thead>
                              <tr>
                                <th>Account</th>
                                <th>Amount</th>
                                <th>Ratio</th>
                                <th className="right_td">Action</th>
                              </tr>
                            </thead>

                            <tbody>
                              <tr>
                                <td>
                                  <div className="td_first">
                                    Main
                                  </div>
                                </td>

                                <td className="amount_td">0.00<span>$00.00</span></td>
                                <td>0.00</td>
                                <td className="right_td">
                                  <div className='d-flex gap-3 justify-content-end'>
                                    <a className="text-white" href="#">
                                      Convert
                                    </a>
                                    <a className="text-white" href="/asset_managemnet/deposit">
                                      Trade
                                    </a>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <div className="td_first spot">
                                    Spot
                                  </div>
                                </td>

                                <td className="amount_td">0.00<span>$00.00</span></td>
                                <td>0.00</td>
                                <td className="right_td">
                                  <div className='d-flex gap-3 justify-content-end'>
                                    <a className="text-white" href="#">
                                      Convert
                                    </a>
                                    <a className="text-white" href="/asset_managemnet/deposit">
                                      Trade
                                    </a>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <div className="td_first swap">
                                    Swap
                                  </div>
                                </td>

                                <td className="amount_td">0.00<span>$00.00</span></td>
                                <td>0.00</td>
                                <td className="right_td">
                                  <div className='d-flex gap-3 justify-content-end'>
                                    <a className="text-white" href="#">
                                      Convert
                                    </a>
                                    <a className="text-white" href="/asset_managemnet/deposit">
                                      Trade
                                    </a>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <div className="td_first staking">
                                    Staking
                                  </div>
                                </td>

                                <td className="amount_td">0.00<span>$00.00</span></td>
                                <td>0.00</td>
                                <td className="right_td">
                                  <div className='d-flex gap-3 justify-content-end'>
                                    <a className="text-white" href="#">
                                      Convert
                                    </a>
                                    <a className="text-white" href="/asset_managemnet/deposit">
                                      Trade
                                    </a>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <div className="td_first futures">
                                    Futures
                                  </div>
                                </td>

                                <td className="amount_td">0.00<span>$00.00</span></td>
                                <td>0.00</td>
                                <td className="right_td">
                                  <div className='d-flex gap-3 justify-content-end'>
                                    <a className="text-white" href="#">
                                      Convert
                                    </a>
                                    <a className="text-white" href="/asset_managemnet/deposit">
                                      Trade
                                    </a>
                                  </div>
                                </td>
                              </tr>

                            </tbody>
                          </table>
                        </div>

                      </div>
                    </div>
                  )}
                </div>

              </div>
              {/* <div className="col-sm-6">
                <div className="my_assets_summary_t wallet_transfer">
                  <h2>Wallet Transfer</h2>
                  <h4>Select Coin</h4>
                  <div className="select_currency_s" data-bs-toggle="modal" data-bs-target="#search_coin">
                    <div className="currency_option">
                      <div className="custom-select">
                        <span className="arrow">▼</span>
                        <div className="selected-option">
                          {Object.keys(selectedCurrency)?.length > 0 ?
                            <>       <div className="icon"> <img src={ApiConfig?.baseImage + selectedCurrency?.icon_path} alt="bitcoin" height="35px" /></div>{selectedCurrency?.currency}<small >({selectedCurrency?.short_name})</small></> : <>  Click here to select coin</>}

                        </div>

                      </div>
                    </div>
                  </div>
                </div>



              

                <div className="modal fade search_form search_coin bordernone" id="search_coin" tabIndex="-1" aria-labelledby="exampleModalLabel" >
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header pt-0">
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div className="modal-body">
                        <form>
                          <input type="text" placeholder="Search coin name" value={searchCoin} onChange={(e) => setSearchCoin(e.target.value)} />
                        </form>

                        <div className="hot_trading_t">
                          <div className='table-responsive'>
                            <table>
                              <tbody>


                                {currencyData?.length > 0 ? currencyData?.map((currency, index) => {
                                  let searchableCurrencyName = currency?.currency?.toLowerCase();
                                  let searchableCurrencyShortName = currency?.short_name?.toLowerCase();
                                  let searchedurrency = searchCoin?.toLowerCase();

                                  return (
                                    (!searchCoin || searchableCurrencyName?.includes(searchedurrency) || searchableCurrencyShortName?.includes(searchedurrency)) &&
                                    <>
                                      <tr tr data-bs-dismiss="modal" key={index} onClick={() => handleSelecteCurrency(currency)}>
                                        <td>
                                          <div className="td_first">
                                            <div className="icon"> <img src={ApiConfig?.baseImage + currency?.icon_path} alt="bitcoin" /></div>
                                            <div className="price_heading">{currency?.currency} <small> ({currency?.short_name})</small> <br /> </div>
                                          </div>
                                        </td>
                                      </tr>
                                    </>

                                  )
                                }) : <tr rowSpan="5">
                                  <td colSpan="12">
                                    <div className="no_data_outer">
                                      <div className="no_data_vector">
                                        <img src="/images/Group 1171275449 (1).svg" alt="no-data" />

                                      </div>

                                      <p>No Data Available</p>

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

               

                <div className="form_select_to_s">

                  <div className="form_select">
                    <span>From Wallet</span>
                    <select value={fromWalletType} onChange={(e) => setFromWalletType(e.target.value)}>
                      <option hidden selected>Select Wallet</option>
                      {walletType?.length > 0 ? walletType?.map((wallet) => {
                        return (
                          wallet !== toWalletType &&
                          <option value={wallet}>  {typeof wallet === 'string' && wallet.length > 0
                            ? wallet.charAt(0).toUpperCase() + wallet.slice(1)
                            : 'N/A'} Wallet</option>
                        )
                      }) : <option>Wallet Not Available</option>}



                    </select>

                  </div>

                  <div className="wallet_icon">
                    <img src="/images/wallet_icon.png" alt="wallet" onClick={handleInterchangeWallet} />
                  </div>

                  <div className="form_select">
                    <span>To Wallet</span>
                    <select value={toWalletType} onChange={(e) => setToWalletType(e.target.value)}>
                      <option hidden selected>Select Wallet</option>
                      {walletType?.length > 0 ? walletType?.map((wallet) => {
                        return (
                          wallet !== fromWalletType &&
                          <option value={wallet}>  {typeof wallet === 'string' && wallet.length > 0
                            ? wallet.charAt(0).toUpperCase() + wallet.slice(1)
                            : 'N/A'} Wallet</option>
                        )
                      }) : <option>Wallet Not Available</option>}



                    </select>


                  </div>

                </div>



                <div className="price_max_total">
                  <input type="number" placeholder="Amount" onWheel={(e) => e.target.blur()} value={transferAmount} onChange={(e) => { setTransferAmount(e.target.value) }} />
                  <button onClick={() => setTransferAmount(selectedCurrBalance?.fromWallet?.balance || 0)}>Max</button>

                </div>
                {transferAmount > (selectedCurrBalance?.fromWallet?.balance || 0) &&
                  <div className="main_spot_balance">
                    <p className='text-danger'>Insufficient Balance</p>
                  </div>}

                <div className="main_spot_balance">

                  <p> {fromWalletType.charAt(0).toUpperCase() + fromWalletType.slice(1)} Balance:<span> {fiveDecimal(selectedCurrBalance?.fromWallet?.balance || 0)} {selectedCurrBalance?.currency}</span></p>



                  <p>{toWalletType.charAt(0).toUpperCase() + toWalletType.slice(1)}  Balance:<span> {fiveDecimal(selectedCurrBalance?.toWallet?.balance || 0)} {selectedCurrBalance?.currency} </span></p>

                </div>
                {(transferAmount > selectedCurrBalance?.fromWallet?.balance || transferAmount <= 0 || !transferAmount) ?
                  <button className="transfer_btn" disabled>Transfer Amount</button> : <button className="transfer_btn" onClick={handleWalletTransfer}>Transfer Amount</button>}


              </div> */}
            </div>
          </div>
        </div >
        {/* <div className="trade_add_view">
          <div className="banner_img_add">
            <div className="cnt_slider_f">
              <h6>Wrathcode Landing Protocol</h6>
              <p>Borrow Low, Earn High</p>
            </div>
            <div className="cv_trade_img">
              <img src="/images/crypto_trade_icon.png" alt="bitcoin" />
            </div>
          </div>
          <div className="banner_img_add graybg">
            <div className="cnt_slider_f">
              <h6>Trade Crypto with advanced tools</h6>
              <p>BTC/USDT <span>$90,546.540 +1.54%</span></p>
            </div>
            <div className="cv_trade_img">
              <img src="/images/crypto_trade_icon2.png" alt="bitcoin" />
            </div>
          </div>
        </div>
        <div className="listing_left_outer full_width">
          <div className="market_section">
            <div className="top_heading mb-0">
              <h4>Recent Transactions</h4>
              <Link className="more_btn" to="/user_profile/transaction_history">More {">"}</Link>
            </div>
            <div className="dashboard_summary">
              <div className='table-responsive'>
                <table>
                  <thead>
                    <tr>
                      <th>Sr No.</th>
                      <th>Date</th>
                      <th>Currency</th>
                      <th>Wallet</th>
                      <th >Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {walletHistory?.length > 0 ? walletHistory?.map((item, index) => {
                      return (
                        <tr>
                          <td>{index + 1} </td>
                          <td>{moment(item.createdAt).format("YYYY-MM-DD hh:mm A")} </td>
                          <td>
                            <div className="td_first">


                              <div className="price_heading">{item?.amount} {item?.short_name} </div>
                            </div>
                          </td>
                          <td> {item?.from_wallet.charAt(0).toUpperCase() + item?.from_wallet.slice(1)} Wallet <i className="ri-arrow-right-double-line"></i>  {item?.to_wallet.charAt(0).toUpperCase() + item?.to_wallet.slice(1)} Wallet</td>

                          <td className={` ${item?.status === "COMPLETE" || item?.status === "Completed" ? "green" : item?.status === "REJECTED" ? "red" : item?.status === "PENDING" ? "yellow" : item?.status === "CANCELLED" ? "yellow" : ""}`}>{item?.status}</td>
                        </tr>
                      )
                    }) : <tr rowSpan="5">
                      <td colSpan="12">
                        <div className="no_data_outer">
                          <div className="no_data_vector">
                            <img src="/images/Group 1171275449 (1).svg" alt="no-data" />

                          </div>

                          <p>No Data Available</p>

                        </div>

                      </td>
                    </tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div> */}
      </div >
      {/* <div className="modal fade search_form" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form>
                <input type="text" placeholder="search" />
              </form>
            </div>

          </div>
        </div>
      </div> */}

      {/* <!-- Modal kyc Start --> */}

      <div className="modal fade kyc_modal" id="kycModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">


            <div className="modal-header">
              <h5 className="modal-title" id="kycTitle">Face Verification </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>


            <div className="modal-body">

              <div className='wallet_transfer'>

                <div className='wallet_form'>
                  <div className='form_select'>
                    <div className='currencyicon'>
                      <img src="/images/dollaricon.svg" alt="dollaricon" />
                    </div>
                    <div className='formfiled'>
                      <label>Form</label>
                      <div className='select_spot'>
                        <select>
                          <option>Spot</option>
                          <option>Spot</option>
                          <option>Spot</option>
                        </select>
                      </div>
                    </div>

                  </div>

                  <div className='form_select refreshcntr'>
                    <div className='currencyicon'>
                      <img src="/images/arrowbottom.svg" alt="arrowbottom" />
                    </div>
                    <div className='formfiled'>
                    </div>

                    <div className='currencyicon'>
                      <img src="/images/refreshicon.svg" alt="refreshicon" />
                    </div>

                  </div>

                  <div className='form_select'>
                    <div className='currencyicon'>
                      <img src="/images/dollaricon.svg" alt="dollaricon" />
                    </div>
                    <div className='formfiled'>
                      <label>To</label>
                      <div className='select_spot'>
                        <select>
                          <option>Futures</option>
                          <option>Futures</option>
                          <option>Spot</option>
                        </select>
                      </div>
                    </div>

                  </div>


                </div>


                <div className='crypto_selectcoin'>
                  <h6>Crypto</h6>

                  <div className='coin_cryptofiled'>
                    <button
                      type="button"
                      data-bs-toggle="modal"
                      data-bs-target="#assets_crypto_modal"
                    >
                      {Object.keys(selectedCurrency)?.length > 0 ? (
                        <span>
                          <img src={ApiConfig?.baseImage + selectedCurrency?.icon_path} alt={selectedCurrency?.short_name} width="20px" />
                          {selectedCurrency?.short_name || selectedCurrency?.currency || 'Crypto'}
                        </span>
                      ) : (
                        <span><img src="/images/tether_icon.png" alt="Crypto" />Crypto</span>
                      )}
                      <i class="ri-arrow-down-s-fill"></i>
                    </button>
                  </div>
                </div>
                <div className='crypto_selectcoin'>
                  <h6>Quantity</h6>
                  <div class="price_max_total">
                    <input type="number" placeholder="Amount" />
                    <div className='d-flex gap-0'>
                      USDT
                      <button>All</button>
                    </div>
                  </div>

                </div>

                <legend>Balance：<span>0 USDT</span></legend>

                <button className='btn'>Explore</button>

              </div>

            </div>
          </div>
        </div>
      </div>


      {/* <!-- Modal kyc End --> */}





      {/* <!-- Modal Search Coin Start --> */}

      <div className="modal fade search_form search_coin search_form_modal_2" id="assets_crypto_modal" tabIndex="-1" aria-labelledby="assetsCryptoModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title" id="assetsCryptoModalLabel">Select Crypto</h4>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => {
                  const modalElement = document.getElementById('assets_crypto_modal');
                  if (modalElement) {
                    modalElement.classList.remove('show');
                    modalElement.style.display = 'none';
                    modalElement.setAttribute('aria-hidden', 'true');
                    modalElement.removeAttribute('aria-modal');

                    // Remove only the topmost backdrop
                    const backdrops = document.querySelectorAll('.modal-backdrop');
                    backdrops.forEach(backdrop => {
                      const backdropZIndex = window.getComputedStyle(backdrop).zIndex;
                      if (parseInt(backdropZIndex) > 1040) {
                        backdrop.remove();
                      }
                    });

                    // Ensure parent modal stays open
                    const parentModal = document.getElementById('kycModal');
                    if (parentModal) {
                      parentModal.classList.add('show');
                      parentModal.style.display = 'block';
                      parentModal.setAttribute('aria-hidden', 'false');
                      parentModal.setAttribute('aria-modal', 'true');
                    }
                  }
                }}
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <input type="text" placeholder="Search coin name " value={searchPair} onChange={(e) => setSearchPair(e.target.value)} />
              </form>

              <div className="hot_trading_t">
                <div className='table-responsive'>
                  <table>
                    <tbody>
                      {availableCurrency?.length > 0 ? availableCurrency?.filter((item) => {
                        if (!searchPair) return true;
                        const searchTerm = searchPair.toLowerCase();
                        const currencyName = item?.name?.toLowerCase() || '';
                        const shortName = item?.short_name?.toLowerCase() || '';
                        return currencyName.includes(searchTerm) || shortName.includes(searchTerm);
                      }).map((item) => {
                        return (
                          <tr
                            key={item?.currency_id || item?.id || Math.random()}
                            onClick={() => handleSelectDepositCoin(item)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td>
                              <div className="td_first">
                                <div className="icon"><img src={ApiConfig?.baseImage + item?.icon_path} alt="icon" width="30px" /></div>
                                <div className="price_heading"> {item?.short_name} <br /> </div>
                              </div>
                            </td>
                            <td className="right_t price_tb">{item?.name}</td>
                          </tr>
                        )
                      }) : ""}

                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Modal Search Coin Start End --> */}



    </>
  )
}

export default AssetOverview
