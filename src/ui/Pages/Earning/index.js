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
        <div className='container'>
          <div className='earning_section_cate'>
            <div className='row'>
              <div className='col-sm-2'>
                <div className='earning_tp_heading'>
                  <img src="/images/earning_vector.png" className="img-fluid" alt="earning" /><h4>Earning</h4>
                </div>
              </div>
              <div className='col-sm-10'>
                <div className='earning_right_tab'>
                  <div className='responsive-table'>
                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                      <li className="nav-item" role="presentation">
                        <button className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">Earning</button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button className="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">Earning Balance</button>
                      </li>
                      <li className="nav-item" role="presentation" >
                        <button className="nav-link" id="earning-tab" data-bs-toggle="tab" data-bs-target="#earning" type="button" role="tab" aria-controls="earning" aria-selected="false">Earning Dashboard</button>
                      </li>
                    </ul>

                  </div>

                </div>
              </div>
            </div>

            <div className="tab-content" id="myTabContent">

              <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">



                <div className="user_search earningtop_search">
                  <form className='searchinput'>
                    <button><i className="ri-search-line"></i></button>
                    <input type="text" placeholder="Search" onChange={(e) => setSearchPackage(e.target.value)} value={searchPackage} />

                  </form>

                </div>

                <div className='earning_list_block'>
                  {filteredPackageList?.length > 0 ? filteredPackageList?.map((packagees, groupIndex) => {
                    const groupSlidesCount = packagees.length;
                    const groupSettings = {
                      ...settings,
                      dots: true,
                      slidesToShow: groupSlidesCount >= 6 ? 6 : groupSlidesCount,
                      responsive: [
                        {
                          breakpoint: 1366,
                          settings: {
                            slidesToShow: groupSlidesCount >= 4 ? 4 : groupSlidesCount,
                            dots: true,
                          },
                        },
                        {
                          breakpoint: 1024,
                          settings: {
                            slidesToShow: groupSlidesCount >= 3 ? 3 : groupSlidesCount,
                            dots: true,
                          },
                        },
                        {
                          breakpoint: 600,
                          settings: {
                            slidesToShow: 1,
                            dots: true,
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
                                  </div>
                                  <h2>
                                    {item?.currency}
                                    <span>({item?.currency_fullname})</span>
                                  </h2>
                                  <p>
                                    {item?.duration_days} Days
                                    <span>{item?.return_percentage?.toFixed(2)}% APY</span>
                                  </p>
                                  <button className="subscribe_btn">
                                    {token ? <a href="#/" onClick={() => showPackageDetails(item)}>Subscribe</a> : <Link to="/login">Login</Link>}
                                  </button>
                                  <div className="vector_bottom">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="60"
                                      height="52"
                                      viewBox="0 0 60 52"
                                      fill="none"
                                    >
                                      <path d="M59.6296 0L60 52H0L59.6296 0Z" fill="#3B3B3B" />
                                    </svg>
                                  </div>
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
                </div>
              </div>
              <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                <div className="wallet_balance_tb">
                  <div className="user_list_top walletbalance_t">
                    <div className="user_list_l">
                      <h4>Earning Wallet Balance</h4>
                    </div>
                    <div className="user_search ">
                      <div className="coin_right">
                        <a className="search_icon2" href="#/"> <i class="ri-search-line"></i><input type="search" placeholder='Search coin name' value={search} onChange={(event) => setSearch(event.target.value)} /></a>
                        <div className="checkbox">
                          <input type="checkbox" checked={hideAssets} onChange={() => handleCheckboxChange('balance')} /> Hide 0 Balance
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='table-responsive recenttable_s'>
                    <table>
                      <thead>
                        <tr>
                          <th>CURRENCY</th>
                          <th>BALANCE</th>
                          <th>INORDER-BALANCE</th>
                          <th>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCoinList?.length > 0 ? filteredCoinList?.map((wallet) => {
                          return (
                            <tr>
                              <td>
                                <div className='currency_td icon'>
                                  <img src={ApiConfig?.baseImage + wallet?.icon_path} alt="bitcoin" />
                                  <div className='pricetag'>{wallet?.short_name}<span>{wallet?.currency}</span></div>
                                </div> </td>
                              <td>
                                {wallet?.balance}
                              </td>
                              <td>
                                {wallet?.locked_balance}
                              </td>
                              <td>
                                <div class="td_btn_balance">
                                  <Link to={`/asset_managemnet/deposit`}> <button class="deposit">  Deposit</button></Link>
                                  <Link to={`/user_profile/asset_overview`}><button class="walletbtn">Wallet Transfer</button></Link>
                                </div>
                              </td>
                            </tr>
                          )
                        }) : <tr rowSpan="5">
                          <td colSpan="12">
                            <div className="no_data_outer">
                              <div className="no_data_vector">
                                <img src="/images/Group 1171275449 (1).svg" alt="no-data" />
                              </div>
                              {token ? <p>No data found</p> : <p>Please <Link to='/login'>Login</Link> to continue</p>}
                            </div>
                          </td>
                        </tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="tab-pane fade" id="earning" role="tabpanel" aria-labelledby="earning-tab">
                <div className="wallet_balance_tb earningbouns_tb">
                  {token ? <>
                    <div className="user_list_top">
                      <div className="user_list_l">
                        <h4>Earning Bonus Portfolio</h4>
                      </div>
                      <div className="user_search">
                        {/* <form className='searchinput'>
                          <button><i class="ri-search-line"></i></button>
                          <input type="text" placeholder="Search" />
                        </form> */}
                      </div>
                    </div>
                    <div className='table-responsive recenttable_s'>
                      <table>
                        <tbody>
                          {portfolio?.length > 0 ? portfolio?.map((item, index) => (
                            <tr key={index}>
                              <td>
                                <div className='currency_td'>
                                  <div className="select_currency_s">
                                    <div className="currency_option">
                                      <div className="custom-select">
                                        <div className="selected-option">
                                          <img
                                            src={ApiConfig?.baseImage + item?.icon_path}
                                            alt={item?.currency}
                                            className="currency_icon"
                                          />
                                          {item?.currency} <span>({item?.currency_fullname})</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className='balance_td'>
                                  {formatToNineDecimals(item?.invested_amount)} {item?.currency}
                                </div>
                                <div className='subtotal'>Total Subscription Amount</div>
                              </td>
                              <td>
                                <div className='balance_td text-blue'>
                                  {formatToNineDecimals(item?.running_investment)} {item?.currency}
                                </div>
                                <div className='subtotal'>In-Order Balance</div>
                              </td>
                              <td>
                                <div className='balance_td text-blue'>
                                  {formatToNineDecimals(item?.bonus_remaining)} {item?.currency}
                                </div>
                                <div className='subtotal'>Remaining Bonus </div>
                              </td>
                              <td>
                                <div className='balance_td text-blue'>
                                  {formatToNineDecimals(item?.bonus_given)} {item?.currency}
                                </div>
                                <div className='subtotal'>Earned Bonus </div>
                              </td>
                            </tr>
                          )) : <tr rowSpan="5">
                            <td colSpan="12">
                              <div className="no_data_outer">
                                <div className="no_data_vector">
                                  <img src="/images/Group 1171275449 (1).svg" alt="no-data" />
                                </div>
                                <p>No data found</p>
                              </div>
                            </td>
                          </tr>}
                        </tbody>
                      </table>
                    </div>
                  </> :
                    <div className="no_data_outer">
                      <div className="no_data_vector">
                        <img src="/images/Group 1171275449 (1).svg" alt="no-data" />
                      </div>
                      {token ? <p>No data found</p> : <p>Please <Link to='/login'>Login</Link> to continue</p>}
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
          <div className="dashboard_recent_s">
            <div className='d-flex justify-content-between align-items-center'>
              <h4>Recent Plans </h4>
              <Link className="more_btn" to="/user_profile/earning_plan_history">More &gt;</Link>
            </div>
            <div className="user_list_top rowtable">
              <div className="user_list_l earning_section_cate responsive-table">
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button className="nav-link active" id="active-tab" data-bs-toggle="tab" data-bs-target="#active" type="button" role="tab" aria-controls="active" aria-selected="true">Active</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="completed-tab" data-bs-toggle="tab" data-bs-target="#completed" type="button" role="tab" aria-controls="completed" aria-selected="false">Completed</button>
                  </li>
                </ul>
              </div>
              <div className="user_search">
                {/* <form className='searchinput'>
                  <button><i class="ri-search-line"></i></button>
                  <input type="text" placeholder="Search" />
                </form> */}
              </div>
            </div>
            <div className='table-responsive recenttable_s'>
              <div className="tab-pane fade active show" id="active" role="tabpanel" aria-labelledby="active-tab">
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
              <div className="tab-pane fade " id="completed" role="tabpanel" aria-labelledby="completed-tab">
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

      </section >

      {/* <!-- Modal  more details Pop Up Start --> */}

      <div className="modal fade search_form order_detail_pop modelbg2 " id="package_details" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Buy Package  <i className="ri-arrow-right-double-line"></i> USDT (TetherUS)</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body modal-swap ">

              <div className='row'>
                <div className='col-sm-6'>
                  <div className="hot_trading_t model_height">
                    <div className='table-responsive'>
                      <table>
                        <tbody>

                          <tr>
                            {/* <td className="right_t price_tb">  */}
                            <div className="form_select">
                              <span>Choose Wallet</span>

                              <select value={selectedWallet} onChange={(e) => setSelectedWallet(e.target.value)}>
                                <option hidden selected>Select Wallet</option>
                                {walletType?.length > 0 ? walletType?.map((wallet) => {
                                  return (
                                    <option value={wallet}>  {typeof wallet === 'string' && wallet.length > 0
                                      ? wallet.charAt(0).toUpperCase() + wallet.slice(1)
                                      : 'N/A'} Wallet</option>
                                  )
                                }) : <option>Wallet Not Available</option>}
                              </select>

                            </div>
                            {/* </td> */}
                          </tr>
                          <tr>
                            <td>{selectedWallet.charAt(0).toUpperCase() + selectedWallet.slice(1)} Balance: </td>
                            <td className="right_t price_tb">
                              {walletBalance} {packageDetails?.currency} </td>
                          </tr>

                          <tr>
                            <div className="price_max_total">
                              <input type="number" placeholder={`Enter Subscription Amount`} onWheel={(e) => e.target.blur()} name="fromSwap" value={subscriptionAmount} onChange={(e) => setSubscriptionAmount(e.target.value)} />
                              <button onClick={() => setSubscriptionAmount(walletBalance)} >Max</button>

                            </div>

                          </tr>
                          {(walletBalance < packageDetails?.min_amount || subscriptionAmount > walletBalance) &&
                            <tr>
                              <td className='text-danger'>Insufficient Balance
                              </td>
                              <td className="right_t price_tb">
                              </td>
                            </tr>
                          }
                          <tr>
                            <td>Minimum Amount :
                            </td>
                            <td className="right_t price_tb">
                              10 USDT</td>
                          </tr>

                          <tr>
                            <td className="text-warning">
                              <i className="ri-information-2-line"></i> Don't have enough balance? <a href='/asset_managemnet/deposit' className="text-info">  <span>Deposit Now</span></a>
                            </td>
                          </tr>

                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className='col-sm-6'>
                  <div className="hot_trading_t model_height">
                    <div className='table-responsive'>
                      <table>
                        <tbody>
                          <tr>
                            <td></td>
                          </tr>
                          <tr>
                            <td>Duration: </td>
                            <td className="right_t price_tb text-warning">
                              {packageDetails?.duration_days || 0} Days </td>
                          </tr>

                          <tr>
                            <td></td>
                          </tr>
                          <tr>
                            <td></td>
                          </tr>

                          <tr>
                            <td>Bonus Rate
                            </td>

                          </tr>
                          <tr>
                            <td className='padding-0'><i className="ri-arrow-right-line"></i> Earning Bonus (%):
                            </td>
                            <td className="right_t price_tb padding-0">
                              {packageDetails?.return_percentage || 0} %</td>
                          </tr>
                          <tr>
                            <td className='padding-0'><i className="ri-arrow-right-line"></i> Estimated Bonus:
                            </td>
                            <td className="right_t price_tb padding-0">
                              {formatToNineDecimals((packageDetails?.return_percentage * +subscriptionAmount) / 100) || 0} USDT</td>
                          </tr>
                          <tr>
                            <td className='padding-0'><i className="ri-arrow-right-line"></i> Receive Amount:
                            </td>
                            <td className="right_t price_tb padding-0">
                              {formatToNineDecimals(+subscriptionAmount + ((packageDetails?.return_percentage * +subscriptionAmount) / 100)) || 0} {packageDetails?.currency}</td>
                          </tr>



                          <div className="mt-2">
                            {(walletBalance < packageDetails?.min_amount || subscriptionAmount > walletBalance) ?
                              <button className="orderbtn" disabled>Insufficient Balance</button> :
                              subscriptionAmount < packageDetails?.min_amount ?
                                <button className="orderbtn" disabled>Next</button> :
                                <button className="orderbtn" onClick={showOrderDetail}>Next</button>
                            }
                          </div>

                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>


            </div>
          </div>
        </div>
      </div>


      {/* <!-- Modal   more details Pop Up End --> */}

      {/* <!-- Modal  more details Pop Up Start --> */}

      <div className="modal fade search_form order_detail_pop" id="more_details" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">

          <div className="modal-content">
            <div className="modal-header justify-content-start gap-3 ">
              <h5><i class="ri-arrow-left-line text-warning cursor-pointer" onClick={showBackModel}></i> Order Details</h5>

              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body modal-swap ">

              {/* <div>
                  <img src='/images/plan_verified.png' height="100px" alt='order-details'/>
                </div> */}
              <div className='row'>
                <div className='col-sm-12'>
                  <div className="hot_trading_t model_height">
                    <div className='table-responsive'>
                      <table>
                        <tbody>
                          <tr>
                            <td>Duration:</td>
                            <td className="right_t price_tb text-warning">
                              {packageDetails?.duration_days} <span></span></td>
                          </tr>
                          <tr>
                            <td>Subscription Amount:</td>
                            <td className="">
                              {subscriptionAmount} {packageDetails?.currency}</td>
                          </tr>
                          <tr>
                            <td>{packageDetails?.duration_days || 0} Days</td>
                          </tr>
                          <tr>
                            <td><img src="images/date_vector.svg" alt='date' width={42} /> Start Date:
                            </td>
                            <td className="right_t price_tb">
                              {packageDetails?.subscriptionDate}</td>
                          </tr>
                          <tr>
                            <td><img src="images/date_vector.svg" alt='date' width={42} /> End Date:
                            </td>
                            <td className="right_t price_tb">
                              {packageDetails?.redemptionDate}</td>
                          </tr>
                          <tr>
                            <td>Bonus Rate</td>
                          </tr>
                          <tr>
                            <td>Earning Bonus <i className="ri-discount-percent-line"></i>:
                            </td>
                            <td className="right_t price_tb">
                              {packageDetails?.return_percentage} %</td>
                          </tr>
                          <tr>
                            <td>Estimated Bonus:
                            </td>
                            <td className="right_t price_tb">
                              <span className='usd_price_tb2'> {formatToNineDecimals((packageDetails?.return_percentage * +subscriptionAmount) / 100) || 0} {packageDetails?.currency} </span></td>
                          </tr>
                          <tr>
                            <td>Receive Amount:
                            </td>
                            <td className="right_t price_tb">
                              {+subscriptionAmount + formatToNineDecimals((packageDetails?.return_percentage * +subscriptionAmount) / 100) || 0} {packageDetails?.currency}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-21">
                      <button className="orderbtn" onClick={subscribeEarningPackage}>Buy Package</button>
                    </div>
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
