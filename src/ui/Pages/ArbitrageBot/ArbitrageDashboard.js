import React, { useEffect, useState } from 'react'
import DashboardHeader from '../../../customComponents/DashboardHeader';
import { Link, useNavigate } from 'react-router-dom';
import LoaderHelper from '../../../customComponents/Loading/LoaderHelper';
import AuthService from '../../../api/services/AuthService';
import { alertErrorMessage, alertSuccessMessage } from '../../../customComponents/CustomAlertMessage';
import moment from 'moment';
import { $ } from 'react-jquery-plugin';

function ArbitrageDashboard(props) {
    const navigate = useNavigate()
    const [activePackeges, setActivePackeges] = useState({});
    const [packageDetails, setPackageDetails] = useState({});
    const [subscribedActivePackages, setSubscribedActivePackages] = useState([]);
    const [subscribedCompletedPackage, setSubscribedCompletedPackage] = useState();
    const [walletType, setWalletType] = useState([]);
    const [selectedWallet, setSelectedWallet] = useState("");
    const [walletBalance, setWalletBalance] = useState(0);
    const [subscriptionAmount, setSubscriptionAmount] = useState(0);
    const token = localStorage.getItem("token");

    const handlePackageList = async () => {
        LoaderHelper.loaderStatus(true);
        try {
            const result = await AuthService.getActivePackage();
            LoaderHelper.loaderStatus(false);
            if (result?.success) {
                setActivePackeges(result?.data[0]);

            } else {
                alertErrorMessage(result?.message || "Failed to fetch package list.");
            }
        } catch (err) {
            LoaderHelper.loaderStatus(false);
            alertErrorMessage("Something went wrong.");
        }
    };

    const addFunds = async () => {
        LoaderHelper.loaderStatus(true);
        try {
            const result = await AuthService.addFunds(+subscriptionAmount, selectedWallet);
            LoaderHelper.loaderStatus(false);
            if (result?.success) {
                alertSuccessMessage(result?.message)
                getWalletBalance()
                getInvestment()
                handlePackageList()
                $("#package_details").modal('hide');
            } else {
                alertErrorMessage(result?.message);
            }
        } catch (err) {
            LoaderHelper.loaderStatus(false);
            alertErrorMessage("Something went wrong.");
        }
    };

    const formatToNineDecimals = (data) => {
        if (typeof (data) === "number") {
            // return data
            return parseFloat(data?.toFixed(9))
        } else {
            return 0
        }
    };


    const getWalletBalance = async () => {
        try {
            LoaderHelper.loaderStatus(true);
            const result = await AuthService.getWalletBalance(packageDetails?.packageDetails?.currency_id, selectedWallet);
            if (result?.success) {
                setWalletBalance(formatToNineDecimals(result?.data?.balance || 0))
            }
        } catch (error) {
        }
        finally { LoaderHelper.loaderStatus(false); }
    };


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

    const getInvestment = async () => {
        try {
            LoaderHelper.loaderStatus(true);
            const result = await AuthService.getInvestment();
            if (result?.success) {
                let completedPackage = result?.data?.filter((item) => item?.status === "Completed")
                let activePackage = result?.data?.filter((item) => item?.status === "Active")
                setSubscribedActivePackages(activePackage);
                setSubscribedCompletedPackage(completedPackage);
            }
        } catch (error) {
        }
        finally { LoaderHelper.loaderStatus(false); }
    };

    const showPackageDetails = (data) => {
        setPackageDetails(data)
        $("#package_details").modal('show');
        getWalletType()

    };

    useEffect(() => {
        if (selectedWallet && selectedWallet !== "") {
            getWalletBalance()
        }

    }, [selectedWallet]);



    useEffect(() => {
        handlePackageList()
        getInvestment()

    }, []);
    return (
        <>
            <div className='dashboard_right'>
                <DashboardHeader props={props} />

                <div className='top_total_bar'>

                    <ul className="active_package_top">
                        <li><span>Total Invested Amount</span>: {activePackeges?.totalInvestedAmount} USDT
                        </li>
                        <li><span>Total Returned Amount</span>: {activePackeges?.totalReturnedAmount} USDT
                        </li>
                        <li><span>Total Profit</span>: {activePackeges?.totalProfit} USDT
                        </li>
                    </ul>
                    <div className='dashboard_bot_rightbtn'>
                        <button className="addfundsbtn" onClick={() => showPackageDetails(activePackeges)}><Link to="#/">Add Funds</Link></button>
                        <button className="addfundsbtn withdrawbtn"><Link to="/asset_managemnet/withdraw">Withdraw</Link></button>
                    </div>
                </div>


                <div className='package_card_block'>

                    <div className='d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3'>
                        <div>
                            <h5 className="mb-1 fw-bold">Active Bot Package</h5>
                            <small>Your current subscription details</small>

                            <div className='yellowcolor'><span>Your Package <strong className="fw-bold">"{activePackeges?.packageDetails?.name || "---"}"</strong> is Active</span>
                            </div>



                        </div>
                    </div>
                    <div className="row border p-3 mb-3 rounded package_date_s">
                        <div className="col-md-3 mb-2">
                            <div>Package Name:</div>
                            <div>{activePackeges?.packageDetails?.name || "---"}</div>
                        </div>
                        <div className="col-md-3 mb-2">
                            <div>Activation Date:</div>
                            <div>{moment(activePackeges.purchaseDate).format("YYYY-MM-DD")}</div>
                        </div>
                        <div className="col-md-3 mb-2">
                            <div>Expiry Date:</div>
                            <div>{moment(activePackeges.expiryDate).format("YYYY-MM-DD")}</div>
                        </div>

                        <div className="col-md-3 mb-2">
                            <div>Purchased From:</div>
                            <div>USDT {Object.keys(activePackeges)?.length > 0 ? (activePackeges?.deducted_from_wallet.charAt(0).toUpperCase() + activePackeges?.deducted_from_wallet.slice(1)) : "--"} Wallet</div>
                        </div>

                        <div className='row  p-3 '>

                            <div className="col-md-3 mt-2">
                                <div>Investment Limit:</div>
                                <div>{activePackeges?.packageDetails?.minTradeLimit || "---"} - {activePackeges?.packageDetails?.maxTradeLimit || "---"} USDT</div>
                            </div>
                            <div className="col-md-3 mt-2">
                                <div>Plan Validity:</div>
                                <div>{activePackeges?.packageDetails?.validityDays || "---"} days</div>
                            </div>
                            <div className="col-md-3 mt-2">
                                <div>Plan Status:</div>
                                <div>{activePackeges?.packageDetails?.status || "---"}</div>
                            </div>
                        </div>

                    </div>


                </div>

                <div className="dashboard_recent_s">
                    <div className='d-flex justify-content-between align-items-center'>
                        <h4>Recent Investment </h4>
                        <a className="more_btn" href="/user_profile/transaction_history">More &gt;</a>
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
                                        <th>Deducted from</th>
                                        <th>Duration</th>
                                        <th>Start date</th>
                                        <th>Invested amount</th>
                                        <th>Estimated profit %</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscribedActivePackages?.length > 0 ? subscribedActivePackages?.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td className='text-warning'>{item?.deducted_from_wallet.charAt(0).toUpperCase() + item?.deducted_from_wallet.slice(1)} Wallet</td>
                                                <td>{item?.profitDistributionDay} Days</td>
                                                <td>{moment(item.fundAddedDate).format("YYYY-MM-DD")} </td>
                                                <td>{parseFloat(item?.investedAmount)} USDT</td>
                                                <td>{parseFloat(item?.profitPercentage)}</td>

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

                        </div>
                        <div className="tab-pane fade " id="completed" role="tabpanel" aria-labelledby="completed-tab">
                            <table>
                                <thead>
                                    <tr>
                                        <th>S.No</th>
                                        <th>Credited to</th>
                                        <th>Duration</th>
                                        <th>Start date</th>
                                        <th>Invested amount</th>
                                        <th>Returned amount</th>
                                        <th>Profit amount</th>
                                        <th>Estimated profit %</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {subscribedCompletedPackage?.length > 0 ? subscribedCompletedPackage?.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td className='text-success'>{item?.credited_to_wallet.charAt(0).toUpperCase() + item?.credited_to_wallet.slice(1)} Wallet</td>
                                                <td>{item?.profitDistributionDay} Days</td>
                                                <td>{moment(item.fundAddedDate).format("YYYY-MM-DD")} </td>
                                                <td>{parseFloat(item?.investedAmount)} USDT</td>
                                                <td>{parseFloat(item?.returnedAmount)} USDT</td>
                                                <td className='text-success'>+{parseFloat(item?.bonusAmount)} USDT</td>
                                                <td>{parseFloat(item?.profitPercentage)}</td>

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



            <div className="modal fade search_form order_detail_pop modelbg2 " id="package_details" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5>Add funds</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body modal-swap ">

                            <div className='row'>
                                <div className='col-sm-12'>
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
                                                            {walletBalance} USDT </td>
                                                    </tr>


                                                    <tr>
                                                        <div className="price_max_total">
                                                            <input type="number" placeholder={`Enter Subscription Amount`} onWheel={(e) => e.target.blur()} name="fromSwap" value={subscriptionAmount} onChange={(e) => setSubscriptionAmount(e.target.value)} />
                                                            <button onClick={() => (walletBalance)} >Max</button>

                                                        </div>

                                                    </tr>

                                                    {(subscriptionAmount > walletBalance || walletBalance === 0) &&
                                                        <tr>
                                                            <td className='text-danger'>Insufficient Balance
                                                            </td>
                                                            <td className="right_t price_tb">
                                                            </td>
                                                        </tr>
                                                    }

                                                    <tr>
                                                        <td className="text-warning">
                                                            <i className="ri-information-2-line"></i> Don't have enough balance? <a href='/asset_managemnet/deposit' className="text-info">  <span>Deposit Now</span></a>
                                                        </td>
                                                    </tr>




                                                    <tr>
                                                        <td>ROI Rate
                                                        </td>

                                                    </tr>
                                                    <tr>
                                                        <td className='padding-0'><i className="ri-arrow-right-line"></i> Estimated ROI (%):
                                                        </td>
                                                        <td className="right_t price_tb padding-0">
                                                            {packageDetails?.packageDetails?.monthlyReturnMin} - {packageDetails?.packageDetails?.monthlyReturnMax}% / Month</td>

                                                    </tr>





                                                    <div className="mt-2">
                                                        {(subscriptionAmount > walletBalance || walletBalance === 0) ?
                                                            <button className="orderbtn" disabled>Insufficient Balance</button> :

                                                            <button className="orderbtn" onClick={addFunds} >Add Funds</button>
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
        </>
    )
}

export default ArbitrageDashboard
