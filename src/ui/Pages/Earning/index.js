import React, { useEffect, useState } from 'react'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from 'react-slick';
import LoaderHelper from '../../../customComponents/Loading/LoaderHelper';
import AuthService from '../../../api/services/AuthService';
import { alertErrorMessage, alertSuccessMessage } from '../../../customComponents/CustomAlertMessage';
import { ApiConfig } from '../../../api/apiConfig/apiConfig';
import { Link } from 'react-router-dom';
import { $ } from 'react-jquery-plugin';
import moment from 'moment';
import { Helmet } from 'react-helmet-async';

function Earning() {
  const [packageList, setPackageList] = useState([]);
  const [fundData, setFundData] = useState([]);
  const [search, setSearch] = useState("");
  const [hideAssets, setHideAssets] = useState(true);
  const [packageDetails, setPackageDetails] = useState({});
  const [walletType, setWalletType] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [subscriptionAmount, setSubscriptionAmount] = useState("");
  const [searchPackage, setSearchPackage] = useState("");


  const [subscribedActivePackages, setSubscribedActivePackages] = useState([]);
  const [subscribedCompletedPackage, setSubscribedCompletedPackage] = useState([]);

  const [portfolio, setPortfoilio] = useState([]);
  const token = sessionStorage.getItem("token");



  const getPackageList = async (type) => {
    try {
      LoaderHelper.loaderStatus(true);

      const result = await AuthService.packageList(type);
      if (result?.success) {
        setPackageList(result?.data);
      } else {
        alertErrorMessage(result?.message)
      }
    } catch (error) {
    }
    finally { LoaderHelper.loaderStatus(false); }
  };

  const earningPortfolio = async (type) => {
    try {
      LoaderHelper.loaderStatus(true);

      const result = await AuthService.earningPortfolio(type);
      if (result?.success) {
        setPortfoilio(result?.data);
      } else {
        alertErrorMessage(result?.message)
      }
    } catch (error) {
    }
    finally { LoaderHelper.loaderStatus(false); }
  };

  const subscribedPackageList = async (type) => {
    try {
      LoaderHelper.loaderStatus(true);

      const result = await AuthService.subscribedPackageList(type);
      if (result?.success) {
        let completedPackage = result?.data?.filter((item) => item?.status === "COMPLETED")
        let activePackage = result?.data?.filter((item) => item?.status === "ACTIVE")
        setSubscribedActivePackages(activePackage);
        setSubscribedCompletedPackage(completedPackage);
      } else {
        alertErrorMessage(result?.message)
      }
    } catch (error) {
    }
    finally { LoaderHelper.loaderStatus(false); }
  };

  const handleUserFunds = async (type) => {
    try {
      const result = await AuthService.getUserfunds("earning");
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

        setFundData(wallets);

      }
    } catch (error) {
      console.error("Error fetching user funds:", error);
    }
  };

  // Filtered data
  const filteredPackageList = packageList.filter(group =>
    group.some(item =>
      item.currency.toLowerCase().includes(searchPackage.toLowerCase()) ||
      item.currency_fullname.toLowerCase().includes(searchPackage.toLowerCase())
    )
  );


  const finalFundData = fundData?.filter((item) =>
    item?.short_name?.toLowerCase()?.includes(search?.toLowerCase()) || item?.currency?.toLowerCase()?.includes(search?.toLowerCase())
  );

  const filteredCoinList = hideAssets
    ? finalFundData.filter(item => (item.balance + item?.bonus + item.locked_balance || 0) > 0.000001)
    : finalFundData;

  const handleCheckboxChange = (type) => {
    if (type === "balance") {
      setHideAssets(!hideAssets);
    } else {
      setHideAssets(false);
    }
  };

  useEffect(() => {
    getPackageList()
    token && handleUserFunds()
    token && earningPortfolio()
    token && subscribedPackageList()

  }, []);

  const getWalletType = async () => {
    try {
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.availableWalletTypes();
      if (result?.success) {
        setWalletType(result?.data);
        setSelectedWallet(result?.data[0] || "")
      }
    } catch (error) {
    }
    finally { LoaderHelper.loaderStatus(false); }
  };

  const resetInput = () => {
    setSubscriptionAmount("");
    setPackageDetails({});
  }

  const subscribeEarningPackage = async () => {
    if (!packageDetails?._id || !subscriptionAmount || !selectedWallet) {
      alertErrorMessage("Invalid subscription details, please reload the page and try again")
      return;
    }
    try {
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.subscribeEarningPackage(packageDetails?._id, subscriptionAmount, selectedWallet);
      if (result?.success) {
        resetInput();
        $("#more_details").modal('hide');
        alertSuccessMessage(result?.message);
        subscribedPackageList()
        earningPortfolio()
        handleUserFunds()
      } else {
        alertErrorMessage(result?.message)
      }
    } catch (error) {
      alertSuccessMessage(error?.message)
    }
    finally { LoaderHelper.loaderStatus(false); }
  };

  const getWalletBalance = async () => {
    try {
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.getWalletBalance(packageDetails?.currency_id, selectedWallet);
      if (result?.success) {
        setWalletBalance(formatToNineDecimals(result?.data?.balance || 0))
      }
    } catch (error) {
    }
    finally { LoaderHelper.loaderStatus(false); }
  };

  const showPackageDetails = (data) => {
    resetInput()
    setPackageDetails(data)
    $("#package_details").modal('show');
    if (data?.currency_id !== packageDetails?.currency_id) {
      getWalletType()
    }
  };

  // Format function (DD/MM/YYYY)
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };


  const showOrderDetail = () => {
    const today = new Date();
    const subscriptionDate = formatDate(today);
    const redemptionDate = formatDate(new Date(today.getTime() + packageDetails?.duration_days * 24 * 60 * 60 * 1000));
    setPackageDetails({ ...packageDetails, subscriptionDate, redemptionDate })
    $("#package_details").modal('hide');
    $("#more_details").modal('show');
  };

  const showBackModel = () => {
    $("#package_details").modal('show');
    $("#more_details").modal('hide');
  }
  const formatToNineDecimals = (data) => {
    if (typeof (data) === "number") {
      // return data
      return parseFloat(data?.toFixed(9))
    } else {
      return 0
    }
  };

  const settings = (packageNumber) => {
    return {
      dots: true,
      infinite: true,
      speed: 600,
      slidesToShow: packageNumber <= 6 ? 6 : 1,
      slidesToScroll: 1,
      autoplay: false,
      autoplaySpeed: 3000,
      arrows: false,
      responsive: [
        {
          breakpoint: 1024,
          settings: { slidesToShow: 2 },
        },
        {
          breakpoint: 600,
          settings: { slidesToShow: 2 },
        },
      ],
    };
  };

  useEffect(() => {
    if (selectedWallet && selectedWallet !== "") {
      getWalletBalance()
    }

  }, [selectedWallet]);

  return (
    <>
      <Helmet>
        <title>Rewards & Yield – Wrathcode Earning Platform</title>

        <meta
          name="description"
          content="Access Wrathcode earning programs: rewards, staking and yield-based crypto solutions on a trusted platform."
        />

        <meta
          name="keywords"
          content="crypto yield, earn with crypto, Wrathcode earning, crypto rewards platform"
        />
      </Helmet>

      <section className='earning_outer_s'>
        <div className='earning_section_cate'>

          {/* <div className='col-sm-2'>
                <div className='earning_tp_heading'>
                  <img src="/images/earning_vector.png" className="img-fluid" alt="earning" /><h4>Earning</h4>
                </div>
              </div> */}

          <div className='earning_right_tab'>
            <div className='toptabs_hd'>
              <div className='container'>
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">Earning</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">Earning Dashboard</button>
                  </li>
                  {/* <li className="nav-item" role="presentation" >
                        <button className="nav-link" id="earning-tab" data-bs-toggle="tab" data-bs-target="#earning" type="button" role="tab" aria-controls="earning" aria-selected="false">Earning Dashboard</button>
                      </li> */}
                </ul>
              </div>
            </div>

          </div>

          <div className='container'>

            <div className="tab-content" id="myTabContent">

              <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">

                <div className='exchange_earning_bnr'>
                  <div className='earningbnr_cnt'>
                    <h2>Wrathcode Exchange Earning</h2>
                    <p>New user exclusive: Up to <span>600% APR</span></p>
                    <button className='signbtn'>Sign Up Now</button>
                  </div>

                  <div className='earning_bnr'>
                    <img src="/images/earining_bnr_vector.png" alt="Exchange Earning" />
                  </div>
                </div>


                {/* <div className="user_search earningtop_search">
                  <form className='searchinput'>
                    <button><i className="ri-search-line"></i></button>
                    <input type="text" placeholder="Search" onChange={(e) => setSearchPackage(e.target.value)} value={searchPackage} />

                  </form>

                </div> */}

                <div className='earning_list_block'>
                  {filteredPackageList?.length > 0 ? filteredPackageList.slice(0, 1).map((packagees, groupIndex) => {
                    const groupSlidesCount = packagees.length;
                    const groupSettings = {
                      ...settings,
                      dots: true,
                      arrows: false,
                      slidesToShow: groupSlidesCount >= 3 ? 3 : groupSlidesCount,
                      responsive: [
                        {
                          breakpoint: 1366,
                          settings: {
                            slidesToShow: groupSlidesCount >= 2 ? 2 : groupSlidesCount,
                            dots: true,
                            arrows: false,
                          },
                        },
                        {
                          breakpoint: 1024,
                          settings: {
                            slidesToShow: groupSlidesCount >= 1 ? 1 : groupSlidesCount,
                            dots: true,
                            arrows: false,
                          },
                        },
                        {
                          breakpoint: 600,
                          settings: {
                            slidesToShow: 1,
                            dots: true,
                            arrows: false,
                          },
                        },
                      ],
                    };
                    return (
                      <div key={groupIndex} className="slider_group_wrapper">
                        <Slider {...groupSettings}>
                          {packagees.map((item, index) => (
                            <div key={item._id} className="currency_list_b" >
                              <ul>
                                <li>
                                  <div className="currency_bit">
                                    <img
                                      src={ApiConfig?.baseImage + item?.icon_path}
                                      className="img-fluid"
                                      alt={item?.currency_fullname}
                                    />
                                    <h2>
                                      {item?.currency}
                                      <span>({item?.currency_fullname})</span>
                                    </h2>
                                    <span className='newtag'>New User Exclusive</span>
                                  </div>

                                  <ul className='usd_detail_list'>
                                    <li> <span>{item?.duration_days}</span> Days</li>
                                    <li className='pricevalue'><span>% APY</span>{item?.return_percentage?.toFixed(2)}</li>
                                  </ul>
                                  <button className="subscribe_btn">
                                    {token ? <a href="#/" onClick={() => showPackageDetails(item)}>Subscribe</a> : <Link to="/login">Login</Link>}
                                  </button>

                                </li>
                              </ul>
                            </div>
                          ))}
                        </Slider>
                      </div>
                    );
                  }) : <div className="no_data_outer">
                    <div className="no_data_vector">
                      <img src="/images/Group 1171275449 (1).svg" alt="no-data" />
                    </div>
                    <p>No data found</p>
                  </div>}

                  <div className='all_product_data'>
                    <h3>All Products</h3>
                    <table class="table ">
                      <thead>
                        <tr>
                          <th> Token</th>
                          <th> Est. APR</th>
                          <th> Duration</th>
                          <th className='action_td'> Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <div class="td_div"><span class="star_btn btn_icon active"><i class="ri ri-star-line me-2 "></i></span><img alt="" src="https://backend.gatbits.com/icons/coin-image-1751740819775-850287886.jpeg" class="img-fluid icon_img coinimg me-2 " />WIF/USDT</div>
                          </td>
                          <td>15.00% ~ 600.00%</td>
                          <td>30/360 days</td>
                          <td className='action_td'> <span class="btn custom-btn subscribebtn"><button data-bs-toggle="modal" data-bs-target="#earningpopup">Subscribe</button></span></td>
                        </tr>
                        <tr>
                          <td>
                            <div class="td_div"><span class="star_btn btn_icon active"><i class="ri ri-star-line me-2 "></i></span><img alt="" src="https://backend.gatbits.com/icons/coin-image-1751740819775-850287886.jpeg" class="img-fluid icon_img coinimg me-2 " />WIF/USDT</div>
                          </td>
                          <td>15.00% ~ 600.00%</td>
                          <td>30/360 days</td>
                          <td className='action_td'> <span class="btn custom-btn subscribebtn"><button data-bs-toggle="modal" data-bs-target="#earningpopup">Subscribe</button></span></td>
                        </tr>
                        <tr>
                          <td>
                            <div class="td_div"><span class="star_btn btn_icon active"><i class="ri ri-star-line me-2 "></i></span><img alt="" src="https://backend.gatbits.com/icons/coin-image-1751740819775-850287886.jpeg" class="img-fluid icon_img coinimg me-2 " />WIF/USDT</div>
                          </td>
                          <td>15.00% ~ 600.00%</td>
                          <td>30/360 days</td>
                          <td className='action_td'> <span class="btn custom-btn subscribebtn"><button data-bs-toggle="modal" data-bs-target="#earningpopup">Subscribe</button></span></td>
                        </tr>
                        <tr>
                          <td>
                            <div class="td_div"><span class="star_btn btn_icon active"><i class="ri ri-star-line me-2 "></i></span><img alt="" src="https://backend.gatbits.com/icons/coin-image-1751740819775-850287886.jpeg" class="img-fluid icon_img coinimg me-2 " />WIF/USDT</div>
                          </td>
                          <td>15.00% ~ 600.00%</td>
                          <td>30/360 days</td>
                          <td className='action_td'> <span class="btn custom-btn subscribebtn"><button data-bs-toggle="modal" data-bs-target="#earningpopup">Subscribe</button></span></td>
                        </tr>
                        <tr>
                          <td>
                            <div class="td_div"><span class="star_btn btn_icon active"><i class="ri ri-star-line me-2 "></i></span><img alt="" src="https://backend.gatbits.com/icons/coin-image-1751740819775-850287886.jpeg" class="img-fluid icon_img coinimg me-2 " />WIF/USDT</div>
                          </td>
                          <td>15.00% ~ 600.00%</td>
                          <td>30/360 days</td>
                          <td className='action_td'> <span class="btn custom-btn subscribebtn"><button data-bs-toggle="modal" data-bs-target="#earningpopup">Subscribe</button></span></td>
                        </tr>
                        <tr>
                          <td>
                            <div class="td_div"><span class="star_btn btn_icon active"><i class="ri ri-star-line me-2 "></i></span><img alt="" src="https://backend.gatbits.com/icons/coin-image-1751740819775-850287886.jpeg" class="img-fluid icon_img coinimg me-2 " />WIF/USDT</div>
                          </td>
                          <td>15.00% ~ 600.00%</td>
                          <td>30/360 days</td>
                          <td className='action_td'> <span class="btn custom-btn subscribebtn"><button data-bs-toggle="modal" data-bs-target="#earningpopup">Subscribe</button></span></td>
                        </tr>
                        <tr>
                          <td>
                            <div class="td_div"><span class="star_btn btn_icon active"><i class="ri ri-star-line me-2 "></i></span><img alt="" src="https://backend.gatbits.com/icons/coin-image-1751740819775-850287886.jpeg" class="img-fluid icon_img coinimg me-2 " />WIF/USDT</div>
                          </td>
                          <td>15.00% ~ 600.00%</td>
                          <td>30/360 days</td>
                          <td className='action_td'> <span class="btn custom-btn subscribebtn"><button data-bs-toggle="modal" data-bs-target="#earningpopup">Subscribe</button></span></td>
                        </tr>
                        <tr>
                          <td>
                            <div class="td_div"><span class="star_btn btn_icon active"><i class="ri ri-star-line me-2 "></i></span><img alt="" src="https://backend.gatbits.com/icons/coin-image-1751740819775-850287886.jpeg" class="img-fluid icon_img coinimg me-2 " />WIF/USDT</div>
                          </td>
                          <td>15.00% ~ 600.00%</td>
                          <td>30/360 days</td>
                          <td className='action_td'> <span class="btn custom-btn subscribebtn"><button data-bs-toggle="modal" data-bs-target="#earningpopup">Subscribe</button></span></td>
                        </tr>
                        <tr>
                          <td>
                            <div class="td_div"><span class="star_btn btn_icon active"><i class="ri ri-star-line me-2 "></i></span><img alt="" src="https://backend.gatbits.com/icons/coin-image-1751740819775-850287886.jpeg" class="img-fluid icon_img coinimg me-2 " />WIF/USDT</div>
                          </td>
                          <td>15.00% ~ 600.00%</td>
                          <td>30/360 days</td>
                          <td className='action_td'> <span class="btn custom-btn subscribebtn"><button data-bs-toggle="modal" data-bs-target="#earningpopup">Subscribe</button></span></td>
                        </tr>
                        <tr>
                          <td>
                            <div class="td_div"><span class="star_btn btn_icon active"><i class="ri ri-star-line me-2 "></i></span><img alt="" src="https://backend.gatbits.com/icons/coin-image-1751740819775-850287886.jpeg" class="img-fluid icon_img coinimg me-2 " />WIF/USDT</div>
                          </td>
                          <td>15.00% ~ 600.00%</td>
                          <td>30/360 days</td>
                          <td className='action_td'> <span class="btn custom-btn subscribebtn"><button data-bs-toggle="modal" data-bs-target="#earningpopup">Subscribe</button></span></td>
                        </tr>
                        <tr>
                          <td>
                            <div class="td_div"><span class="star_btn btn_icon active"><i class="ri ri-star-line me-2 "></i></span><img alt="" src="https://backend.gatbits.com/icons/coin-image-1751740819775-850287886.jpeg" class="img-fluid icon_img coinimg me-2 " />WIF/USDT</div>
                          </td>
                          <td>15.00% ~ 600.00%</td>
                          <td>30/360 days</td>
                          <td className='action_td'> <span class="btn custom-btn subscribebtn"><button data-bs-toggle="modal" data-bs-target="#earningpopup">Subscribe</button></span></td>
                        </tr>
                        <tr>
                          <td>
                            <div class="td_div"><span class="star_btn btn_icon active"><i class="ri ri-star-line me-2 "></i></span><img alt="" src="https://backend.gatbits.com/icons/coin-image-1751740819775-850287886.jpeg" class="img-fluid icon_img coinimg me-2 " />WIF/USDT</div>
                          </td>
                          <td>15.00% ~ 600.00%</td>
                          <td>30/360 days</td>
                          <td className='action_td'> <span class="btn custom-btn subscribebtn"><button data-bs-toggle="modal" data-bs-target="#earningpopup">Subscribe</button></span></td>
                        </tr>
                        <tr>
                          <td>
                            <div class="td_div"><span class="star_btn btn_icon active"><i class="ri ri-star-line me-2 "></i></span><img alt="" src="https://backend.gatbits.com/icons/coin-image-1751740819775-850287886.jpeg" class="img-fluid icon_img coinimg me-2 " />WIF/USDT</div>
                          </td>
                          <td>15.00% ~ 600.00%</td>
                          <td>30/360 days</td>
                          <td className='action_td'> <span class="btn custom-btn subscribebtn"><button data-bs-toggle="modal" data-bs-target="#earningpopup">Subscribe</button></span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>


                </div>
              </div>
              <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">


                <div className='exchange_earning_bnr'>
                  <div className='earningbnr_cnt'>
                    <h2>Wrathcode Exchange Earning Balance</h2>
                    <p>View your total earnings, rewards, and growth in one place.</p>
                    <button className='signbtn'>Sign Up Now</button>
                  </div>

                  <div className='earning_bnr'>
                    <img src="/images/earning_balance_vector.png" alt="Exchange Earning" />
                  </div>
                </div>

                <ul className='balance_list_s'>
                  <li>
                    <div className='balance_cnt'>
                      <h4>$60,230.00</h4>
                      <p>Total Earning Balance </p>
                    </div>
                    <div className='balance_vector'>
                      <img src="/images/wallet_coins_balance.svg" alt="Earning Balance" />
                    </div>
                  </li>
                  <li>
                    <div className='balance_cnt'>
                      <h4>$23,540.00</h4>
                      <p>Pending Reward</p>
                    </div>
                    <div className='balance_vector'>
                      <img src="/images/wallet_coins_balance2.svg" alt="Earning Balance" />
                    </div>
                  </li>
                  <li>
                    <div className='balance_cnt'>
                      <h4>$23.00</h4>
                      <p>Yesterday Earning</p>
                    </div>
                    <div className='balance_vector'>
                      <img src="/images/wallet_coins_balance3.svg" alt="Earning Balance" />
                    </div>
                  </li>
                  <li>
                    <div className='balance_cnt'>
                      <h4>$3,540.20</h4>
                      <p>Cumulative Earning</p>
                    </div>
                    <div className='balance_vector'>
                      <img src="/images/wallet_coins_balance4.svg" alt="Earning Balance" />
                    </div>
                  </li>
                </ul>


                <div className="wallet_balance_tb">
                  <div className="user_list_top walletbalance_t">
                    <div className="user_list_l">
                      <h4>Earning Assets</h4>
                    </div>

                  </div>

                  <ul className='earning_assets_list'>
                    <li><span>Total Assets</span>$3,540.20</li>
                    <li><span>Total Earning</span>$7,230.20</li>
                    <li><span>Total Pending Reward</span>$730.20</li>
                    <li><span>Reward Type</span>$930.20</li>
                    <li className='exportbtn'><button><i class="ri-download-2-line"></i> Export</button></li>
                  </ul>


                </div>


                <div className="dashboard_recent_s productdata position_order">
                  <div className='d-flex justify-content-between align-items-center'>
                    <h4>Earning Balance History </h4>
                    <div className="searchBar custom-tabs">
                      <i className="ri-search-2-line"></i>
                      <input type="search" className="custom_search" placeholder="Search token" value={search} onChange={(e) => { setSearch(e.target.value); }} />
                    </div>
                  </div>
                  <div className="user_list_top rowtable">
                    <div className="user_list_l earning_section_cate responsive-table">
                      <ul class="position_list">
                        <li class="nav-item positions" role="presentation"><button>Active</button></li>
                        <li class="nav-item open" role="presentation"><button>Completed</button></li>
                      </ul>
                    </div>
                  </div>
                  <div className='table-responsive recenttable_s'>
                    <div className="cnt_table positions">
                      <table>
                        <thead>
                          <tr>
                            <th>S.No</th>
                            <th>Currency</th>
                            <th>Deducted From</th>
                            <th>Duration</th>
                            <th>Start date</th>
                            <th>Mature date</th>
                            <th>Subscription Amount</th>
                            <th>Bonus Amount</th>
                            <th>Receivable Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subscribedActivePackages?.length > 0 ? subscribedActivePackages?.map((item, index) => {
                            return (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item?.currency}</td>
                                <td className='text-warning'>{item?.wallet_type.charAt(0).toUpperCase() + item?.wallet_type.slice(1)} Wallet</td>
                                <td>{item?.duration_days}</td>
                                <td>{moment(item.start_date).format("YYYY-MM-DD")} </td>
                                <td>{moment(item.end_date).format("YYYY-MM-DD")} </td>
                                <td>{parseFloat(item?.invested_amount?.$numberDecimal || 0)}</td>
                                <td className='text-warning'>+{formatToNineDecimals(parseFloat(item?.expected_return?.$numberDecimal || 0) - parseFloat(item?.invested_amount?.$numberDecimal || 0))}</td>
                                <td>{parseFloat(item?.expected_return?.$numberDecimal || 0)}</td>
                                <td className='text-warning'>{item?.status}</td>
                              </tr>
                            )
                          }) :
                            <tr rowSpan="5">
                              <td colSpan="12">
                                <div className="no_data_outer">
                                  <div className="no_data_vector">
                                    <img src="/images/Group 1171275449 (1).svg" alt="no-data" />
                                  </div>
                                  {token ? <p>No plan found</p> : <p>Please <Link to='/login'>Login</Link> to continue</p>}
                                </div>
                              </td>
                            </tr>}
                        </tbody>
                      </table>
                      {/* <div className="pagination_list">
                  <ul className="pagination">
                    <li className="page-item">
                      <a className="page-link" href="#" aria-label="Previous">
                        <span aria-hidden="true">«</span>
                      </a>
                    </li>
                    <li className="page-item active"><a className="page-link" href="#">1</a></li>
                    <li className="page-item"><a className="page-link" href="#">2</a></li>
                    <li className="page-item"><a className="page-link" href="#">3</a></li>
                    <li className="page-item"><a className="page-link" href="#">4</a></li>
                    <li className="page-item"><a className="page-link" href="#">5</a></li>
                    <li className="page-item"><a className="page-link" href="#">...</a></li>
                    <li className="page-item">
                      <a className="page-link" href="#" aria-label="Next">
                        <span aria-hidden="true">»</span>
                      </a>
                    </li>
                  </ul>
                </div> */}
                    </div>
                    <div className="cnt_table open">
                      <table>
                        <thead>
                          <tr>
                            <th>S.No</th>
                            <th>Currency</th>
                            <th>Received In</th>
                            <th>Duration</th>
                            <th>Start date</th>
                            <th>Mature date</th>
                            <th>Subscription Amount</th>
                            <th>Bonus</th>
                            <th>Received Amount</th>
                            <th>Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {subscribedCompletedPackage?.length > 0 ? subscribedCompletedPackage?.map((item, index) => {
                            return (

                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item?.currency}</td>
                                <td className='text-success'>{item?.credited_wallet_type.charAt(0).toUpperCase() + item?.credited_wallet_type.slice(1)} Wallet</td>
                                <td>{item?.duration_days}</td>
                                <td>{moment(item.start_date).format("YYYY-MM-DD")} </td>
                                <td>{moment(item.end_date).format("YYYY-MM-DD")} </td>
                                <td>{parseFloat(item?.invested_amount?.$numberDecimal || 0)}</td>
                                <td className='text-success'>+{formatToNineDecimals(parseFloat(item?.expected_return?.$numberDecimal || 0) - parseFloat(item?.invested_amount?.$numberDecimal || 0))}</td>
                                <td className='text-success'>{parseFloat(item?.expected_return?.$numberDecimal || 0)}</td>
                                <td className='text-success'>{item?.status}</td>
                              </tr>

                            )
                          }) :
                            <tr rowSpan="5">
                              <td colSpan="12">
                                <div className="no_data_outer">
                                  <div className="no_data_vector">
                                    <img src="/images/Group 1171275449 (1).svg" alt="no-data" />

                                  </div>

                                  {token ? <p>No plan found</p> : <p>Please <Link to='/login'>Login</Link> to continue</p>}


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


      </section >


      {/* <!-- Modal earning popup start --> */}


      <div
        className="modal fade earningpopup"
        id="earningpopup"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body text-center">
              <div className='earining_popup_exchange'>
                <div className='lft_pop_cnt'>
                  <h3><img src="/images/tether_icon.png" alt="usdt" />USDT</h3>

                  <ul className='daylist'>
                    <li className='active'>
                      <span>30 Day</span>600.00%
                    </li>
                    <li>
                      <span>60 Day</span>600.00%
                    </li>
                    <li>
                      <span>90 Day</span>600.00%
                    </li>
                    <li>
                      <span>180 Day</span>600.00%
                    </li>
                    <li>
                      <span>270 Day</span>600.00%
                    </li>
                    <li>
                      <span>360 Day</span>600.00%
                    </li>

                  </ul>

                  <ul className='termslist'>
                    <li>Reference <span className='text-green'>3.0%</span></li>
                    <li>Term<span><strong>30 days</strong></span></li>
                  </ul>

                  <div className='payment_method_f'>

                    <div className='payment_inquery'>
                      <h3>Payment Method</h3>
                      <div className='select_option'>
                        <select>
                          <option>MAIN</option>
                          <option>MAIN</option>
                        </select>
                      </div>
                    </div>

                    <div className='payment_inquery'>
                      <h3>Subscription Amount </h3>
                      <div className='amount_input'>
                        <input type='text' placeholder='Enter Subscription Amount ' />
                        <span className='max text-green'>Max</span>
                      </div>
                    </div>

                  </div>

                  <ul className='termslist border-0'>
                    <li>Funding Account <span>0 USDT<i class="ri-add-circle-line"></i></span></li>
                    <li>Max Account<span className='text-light'>3,000,000 USDT</span></li>
                  </ul>


                </div>

                <div className='right_cnt_pop'>
                  <h4>Preview</h4>

                  <ul className='subscriptionlist'>
                    <li>Subscription <span>Date1/5/2026, 10:44</span></li>
                    <li>Accrual Date <span>Date1/5/2026, 10:44</span></li>
                    <li>Profit Distribution Date <span>1/6/2026, 17:30</span></li>
                    <li>Date of Maturity <span>4/6/2026</span></li>
                  </ul>

                  <ul className='termslist border-0'>
                    <li>Redemption Period <span>0 day</span></li>
                    <li>Profit Received<span>Daily </span></li>
                  </ul>

                  <div className='estimated'>
                    <h4>Estimated Returns</h4>

                    <ul className='termslist border-0 mb-0'>
                      <li>USDT Earnings <span>- USDT / D</span></li>
                    </ul>

                    <ul className='estimatedlist'>
                      <li>* At maturity, your funds are seamlessly transferred to the corresponding Flexible Promotions plans.</li>
                      <li>* Early withdrawal is allowed; however, any earnings already credited will be adjusted accordingly.</li>
                    </ul>
                    <label><input type='checkbox' /> I have read and agree to the <a href='#'>Earn Service Agreement.</a></label>
                    <button className='subscribebtn'>Subscription</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Modal   more details Pop Up End --> */}
    </ >
  )
}

export default Earning
