import React, { useState, useEffect, useRef, useContext } from "react";
import AuthService from "../../../api/services/AuthService";
import { alertErrorMessage, alertSuccessMessage, alertWarningMessage, } from "../../../customComponents/CustomAlertMessage";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import moment from "moment";
import { Col, Row } from "react-bootstrap";
import { $ } from "react-jquery-plugin";
import copy from 'copy-to-clipboard';
import QRCode from 'qrcode.react';
import { Link, useNavigate } from "react-router-dom";
import { ProfileContext } from "../../../context/ProfileProvider";

const FundPage = (props) => {

  const { handleUserDetails, userDetails } = useContext(ProfileContext)

  const modalRef = useRef(null);
  const [fundData, setfundData] = useState([]);
  const [p2pWallet, setP2pWallet] = useState([]);
  const [estimatedportfolio, setEstimatedportfolio] = useState();
  const [selectedDeposit, setSelectDeposit] = useState("");
  const [tradeHistoryData, setTradeHistoryData] = useState([]);
  const [amountValue, setAmountValue] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [updatedLength, setupdatedLength] = useState(5);
  const [walletHistory, setWalletHistory] = useState([]);
  const [selectedChain, setSelectedchain] = useState({ chain: '', name: '' });
  const [otp, setOtp] = useState("");
  const [disableBtn, setDisbaleBtn] = useState(false);
  const [modelData, setModelData] = useState();
  const [fundModelData, setFundModelData] = useState({});
  const [withdrawalData, setWithdrawalData] = useState();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [amountInr, setAmountInr] = useState("");
  const [localInrImage, setLocalInrImage] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [bankDetails, setBankDetails] = useState();
  const [emailId, setEmailId] = useState()
  const [mobileNumber, setMobileNumber] = useState()
  const [tradeTab, setTradeTab] = useState(false)
  const [search, setSearch] = useState("");
  const [refferalBalance, setRefferalBalance] = useState("");
  const [joiningbalance, setJoiningbalance] = useState(5000);
  const [refferalCount, setRefferalCount] = useState([]);
  const [coinDetails, setCoinDetails] = useState([]);
  const [adjustedAmount, setAdjustedAmount] = useState(null);
  const [totalDataLength, setTotalDataLength] = useState();
  const [allOpenOrders, setAllOpenOrders] = useState([]);
  const [totalAllOpen, setTotalAllOpen] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [swapHistory, setSwapHistory] = useState([])
  const [buySellHist, setBuySellHist] = useState([]);
  const [kycVerified, setKycVerified] = useState(0);
  const [skipWalletHistory, setSkipWalletHistory] = useState(0);
  const [skipQbsHistory, setSkipQbsHistory] = useState(0);
  const [usdtBalance, setUsdtBalance] = useState(0);
  const [usdtCurrData, setUsdtCurrData] = useState({});
  const [cvBotBal, setcvBotBal] = useState("");
  const [cvBotId, setCvBotId] = useState("");
  const [timer, setTimer] = useState(0);
  const [depositChains, setDepositChains] = useState([]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setDisbaleBtn(false);
    }
    return () => clearInterval(interval);
  }, [timer]);


  const [skip, setSkip] = useState(0);
  const [skipAllOrder, setSkipAllOrder] = useState(0);
  const limit = 10;
  const limitAllorder = 10;

  const [hideAssets, setHideAssets] = useState(true);
  const [hideAssetsLocked, setHideAssetsLocked] = useState(false);



  useEffect(() => {
    setEmailId(props?.userDetails?.emailId);
    setMobileNumber(props?.userDetails?.mobileNumber);
    setKycVerified(props?.userDetails?.kycVerified);
    setCvBotId(props?.userDetails?.cv_bot_id);
  }, [props]);


  useEffect(() => {
    if (tradeTab) {
      handleTradeHistory(skip, limit);
    }
  }, [skip, limit]);



  const handlePagination = (action) => {
    if (action === 'prev') {
      if (skip - limit >= 0) {
        setSkip(skip - limit);
      }
    } else if (action === 'next') {
      if (skip + limit < totalDataLength) {
        setSkip(skip + limit);
      }
    } else if (action === 'first') {
      setSkip(0);
    } else if (action === 'last') {
      const lastPageSkip = Math.floor(totalDataLength);
      if (totalDataLength > 10) {
        const data = lastPageSkip - 10
        setSkip(data);
      }
    }
  };

  const handlePaginationWalletHistory = (action) => {
    if (action === 'prev') {
      if (skipWalletHistory - limit >= 0) {
        handleWalletHistory(skipWalletHistory - limit);
      }
    } else if (action === 'next') {
      if (skipWalletHistory + limit < totalDataLength) {
        handleWalletHistory(skipWalletHistory + limit);
      }
    } else if (action === 'first') {
      handleWalletHistory(0);
    } else if (action === 'last') {
      const lastPageSkip = Math.floor(totalDataLength);
      if (totalDataLength > 10) {
        const data = lastPageSkip - 10
        handleWalletHistory(data);
      }
    }
  };

  const handlePaginationQbsHistory = (action) => {
    if (action === 'prev') {
      if (skipQbsHistory - limit >= 0) {
        getBuySellHistory(skipQbsHistory - limit);
      }
    } else if (action === 'next') {
      if (skipQbsHistory + limit < totalDataLength) {
        getBuySellHistory(skipQbsHistory + limit);
      }
    } else if (action === 'first') {
      getBuySellHistory(0);
    } else if (action === 'last') {
      const lastPageSkip = Math.floor(totalDataLength);
      if (totalDataLength > 10) {
        const data = lastPageSkip - 10
        getBuySellHistory(data);
      }
    }
  };

  const handlePaginationAllOrder = (action) => {
    if (action === 'prev') {
      if (skipAllOrder - limitAllorder >= 0) {
        setSkipAllOrder(skipAllOrder - limitAllorder);
      }
    } else if (action === 'next') {
      if (skipAllOrder + limitAllorder < totalAllOpen) {
        setSkipAllOrder(skipAllOrder + limitAllorder);
      }
    } else if (action === 'first') {
      setSkipAllOrder(0);
    } else if (action === 'last') {
      const lastPageSkip = Math.floor(totalAllOpen);
      if (totalAllOpen > 10) {
        const data = lastPageSkip - 10
        setSkipAllOrder(data);
      }
    }
  };


  useEffect(() => {
    executeFunInSrq();
    handleReffrals();
    SwapHistory();
  }, []);

  const executeFunInSrq = async () => {
    await handleUserFunds();
    await userP2PWallet();
    await estimatedPortfolio("");
    await handleVerifyDeposit();
  }

  // ********* Funds Data ********** //
  const getBuySellHistory = async (skip) => {
    LoaderHelper.loaderStatus(true);
    try {
      const result = await AuthService.quickBuySellHistory(skip, limit)
      if (result?.success) {
        if (result?.data?.length > 0) {
          setSkipQbsHistory(skip);
          setBuySellHist(result?.data);
          setTotalDataLength(result.totalCount)
          return;
        } else if (skip !== 0) {
          alertWarningMessage('No more data found')
          return;
        }
      }
    } finally { LoaderHelper.loaderStatus(false); }
  };


  const handleChangeInrImage = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      const maxSize = 2 * 1024 * 1024; // 5MB
      if (allowedTypes.includes(file.type) && file.size <= maxSize) {
        setLocalInrImage(file);
        alertSuccessMessage(file?.name)
      } else {
        if (!allowedTypes.includes(file.type)) {
          alertErrorMessage("Only PNG, JPEG, and JPG file types are allowed.");
        } else {
          alertErrorMessage("Max image size is 2MB.");
        }
      }
    }
  };

  const handleDepositInr = async (amountInr, localInrImage, transactionNumber) => {
    if (!amountInr) {
      alertErrorMessage('Please Enter Amount...')
    } else if (!localInrImage) {
      alertErrorMessage('Please Upload Image...')
    } else if (!transactionNumber) {
      alertErrorMessage('Please Enter Transaction Number...')
    } else {
      var formData = new FormData();
      formData.append("amount", amountInr);
      formData.append("deposit_slip", localInrImage);
      formData.append("transaction_number", transactionNumber);
      LoaderHelper.loaderStatus(true);
      await AuthService.inrDeposit(formData).then(async (result) => {
        if (result?.success) {
          LoaderHelper.loaderStatus(false);
          try {
            $("#Deposit_modal").modal('hide');
          } catch (error) {
            alertErrorMessage(result?.message);
          }
        } else {
          LoaderHelper.loaderStatus(false);
          alertErrorMessage(result?.message);
        }
      });
    }
  };


  const handleWithdrawInr = async (withdrawAmount) => {
    await AuthService.inrWithdrawal(withdrawAmount).then((result) => {
      if (result?.success) {
        LoaderHelper.loaderStatus(false);
        $("#Withdraw_modal3").modal('hide');
      } else {
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result?.message);
        $("#Withdraw_modal").modal('show');
        $("#Withdraw_modal3").modal('hide');
      }
    });
  }

  const handleBankDetails = async () => {
    LoaderHelper.loaderStatus(true);
    await AuthService.getBankDetails().then(async (result) => {
      if (result?.success) {
        LoaderHelper.loaderStatus(false);
        setBankDetails(result?.data?.[0]);
      } else {
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result?.message);
      }
    })
  };

  const handleCvBotDetails = async (id) => {
    if (!id) return;
    LoaderHelper.loaderStatus(true);
    await AuthService.getCvbotUserWallet(id).then(async (result) => {
      if (result?.success) {
        LoaderHelper.loaderStatus(false);
        alertSuccessMessage("CV Bot connected successfully")
        if (!props?.userDetails?.cv_bot_id) {
          handleUserDetails()
        }
        setcvBotBal(result?.data?.balance || 0);
        $("#cv_bot_detail_modal").modal('hide');
        $("#cv_bot_transfer_modal").modal('show');
      } else {
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result?.message);
      }
    })
  };

  const depositCvbotFunds = async (id) => {
    if (!id) return;
    LoaderHelper.loaderStatus(true);
    await AuthService.depositCvbotFunds(id).then(async (result) => {
      if (result?.success) {
        LoaderHelper.loaderStatus(false);
        alertSuccessMessage(result?.message)
        handleUserFunds();
      } else {
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result?.message);
      }
      $("#cv_bot_transfer_modal").modal('hide');
    })
  };


  const handleUserFunds = async (orderId) => {
    try {
      const result = await AuthService.getUserfunds(orderId)
      const coins = await AuthService.getCoinList()
      if (result?.success && coins?.success) {
        let filteredData = result?.data?.map((wallet) => {
          const matchingCoin = coins?.data?.find(coin => coin?._id === wallet?.currency_id);
          return {
            ...wallet,
            p2pStatus: matchingCoin ? matchingCoin?.p2p : undefined
          };
        });
        setfundData(filteredData);
        let UsdtData = filteredData?.filter((item) => item?.short_name === "USDT")[0];
        setUsdtBalance(UsdtData?.balance || "")
        setUsdtCurrData(UsdtData)
        return
      } else if (result?.success) {
        setfundData(result?.data)
        let UsdtData = result?.data?.filter((item) => item?.short_name === "USDT")[0];
        setUsdtBalance(UsdtData?.balance || "")
        setUsdtCurrData(UsdtData)
      }
    } catch (error) {

    }

  };

  const userP2PWallet = async (orderId) => {
    try {
      LoaderHelper.loaderStatus(true);
      const result = await AuthService.userP2pWallet(orderId)
      if (result?.success) {
        setP2pWallet(result?.data);
      } else {
        alertErrorMessage(result?.message);
      }
    } finally { LoaderHelper.loaderStatus(false); }
  };


  const handleWalletHistory = async (skip) => {
    LoaderHelper.loaderStatus(true);
    await AuthService.walletHistory(skip, limit).then(async (result) => {
      if (result?.success) {
        setSkipWalletHistory(skip)
        LoaderHelper.loaderStatus(false);
        setWalletHistory(result?.data);
        setTotalDataLength(result.totalCount)
      } else {
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result?.message);
      }
    })
  };

  const handleTradeHistory = async (skip, limit) => {
    LoaderHelper.loaderStatus(true);
    await AuthService.tradeHistory(skip, limit).then(async (result) => {
      if (result?.success) {
        LoaderHelper.loaderStatus(false);
        setTradeHistoryData(result?.data);
        setTotalDataLength(result.totalCount);
      } else {
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result?.message);
      }
    })
  };


  const handleOpenOrders = async (skipAllOrder, limitAllorder) => {
    LoaderHelper.loaderStatus(true);
    await AuthService.allOpenOrder(skipAllOrder, limitAllorder).then(async (result) => {
      if (result?.success) {
        LoaderHelper.loaderStatus(false);
        setAllOpenOrders(result?.data);
        setTotalAllOpen(result.total_count);
      } else {
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result?.message);
      }
    })
  };

  const getDepostAddress = async (currId, chain) => {
    LoaderHelper.loaderStatus(true);
    await AuthService.generateAddress(currId, chain).then((result) => {
      if (result?.success) {
        LoaderHelper.loaderStatus(false);
        try {
          setSelectDeposit(result?.data);
        } catch (error) {
          LoaderHelper.loaderStatus(false);
        }
      }
      else {
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result?.message)
        setSelectDeposit('');
      }
    });
  };

  const estimatedPortfolio = async () => {
    await AuthService.estimatedPortfolio().then((result) => {
      if (result?.success) {
        setEstimatedportfolio(result?.data);
      }
      return;
    });
  };


  const handleGetOtp = async (emailId, resend) => {
    if (!emailId || emailId === "") {
      alertErrorMessage("Please update email in profile section")
      return
    }
    LoaderHelper.loaderStatus(true);
    await AuthService.getOtp(emailId, resend).then(async (result) => {
      LoaderHelper.loaderStatus(false);
      if (result.success) {
        try {
          alertSuccessMessage(`OTP sent to ${emailId}`);
          setDisbaleBtn(true);
          setTimer(30);
        } catch (error) {
          alertErrorMessage(error);
        }
      } else {
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result.message);
      }
    });
  };

  const handleWithdrawCurrency = async () => {
    if (selectedChain?.chain !== "BEP20") {
      alertWarningMessage("Withdrawal is available on BEP20 only")
      $('#Withdraw_modal').modal('show');
      return
    }
    if (amountValue > coinDetails?.max_withdrawal) {
      alertWarningMessage(`Minimum withdrawal amount should be less than ${coinDetails?.max_withdrawal} ${coinDetails?.short_name}`)
      $('#Withdraw_modal').modal('show');
      return
    }
    if (amountValue < coinDetails?.min_withdrawal) {
      alertWarningMessage(`Withdrawal amount should be greater than ${coinDetails?.min_withdrawal} ${coinDetails?.short_name}`)
      $('#Withdraw_modal').modal('show');
      return
    }
    LoaderHelper.loaderStatus(true);
    await AuthService.withdrawalCurrency(walletAddress, amountValue, otp, selectedChain, emailId, estimatedportfolio?.currencyPrice).then(async (result) => {
      LoaderHelper.loaderStatus(false);
      if (result.success) {
        try {
          if (result?.message === "please send otp first") {
            alertErrorMessage("please send otp first");
          } else {
            alertSuccessMessage(result.message);
            handleResetInput();
            handleUserFunds();
          }
        } catch (error) {
          alertErrorMessage(error);
        }
      } else {
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result.message);
        $('#Withdraw_modal').modal('show');
      }
    });
  };

  const handleResetInput = () => {
    setOtp('')
    setWalletAddress('')
    setAmountValue('')
    setDisbaleBtn(false);
  }

  const handleDepositDetails = (item) => {
    if (item?.short_name !== "INR") {

      setFundModelData(item);
      handleCoinDetails(item?.currency_id, "deposit", item);
    } else {
      setFundModelData(item);
      handleBankDetails();
      handleCoinDetails(item?.currency_id);
      $("#Deposit_modal").modal('show');
    }
  }

  const handleWithdrawalDetails = (item) => {
    setWithdrawalData(item);
    // setSelectedchain({ chain: item?.chain[0], name: item?.short_name })
    if (item?.chain?.includes("BEP20")) setSelectedchain({ chain: "BEP20", name: item?.short_name });
    else { alertErrorMessage('Withdrawal is temporary not available in this currency'); return };
    handleCoinDetails(item?.currency_id, "withdrawal", item);
    // $("#Withdraw_modal").modal('show');
  }

  const finalFundData = fundData?.filter((item) =>
    item?.short_name?.toLowerCase()?.includes(search?.toLowerCase())
  );
  const navigate = useNavigate();


  const nextPage = (data) => {
    navigate("/user_profile", { state: data });
  };

  const handleReffrals = async () => {
    LoaderHelper.loaderStatus(true);
    await AuthService.totalReferCount().then(async (result) => {
      LoaderHelper.loaderStatus(false);
      if (result?.success) {
        setRefferalCount(result?.TotalCount);
        setRefferalBalance(result?.TotalSHIB);
      }
    });
  };


  const handleCoinDetails = async (currency_id, type, data) => {
    LoaderHelper.loaderStatus(true);
    await AuthService.getCoinDetails(currency_id).then((result) => {
      if (result?.success) {
        LoaderHelper.loaderStatus(false);
        setCoinDetails(result?.data);

        if (type === 'deposit') {

          // $("#Deposit_modal").modal("show"); // Close after testinng
          // getDepostAddress(data.currency_id, data.chain[0]);



          if (result?.data?.deposit_status === "INACTIVE") {
            alertErrorMessage('Deposit is disabled for this Coin');
            return;
          } else {
            setSelectedchain({ chain: result?.data.chain[0] });
            setDepositChains(result?.data.chain)
            getDepostAddress(data.currency_id, result?.data.chain[0]);
            $("#Deposit_modal").modal("show");
          }
        }

        if (type === 'withdrawal') {
          if (result?.data?.withdrawal_status === 'INACTIVE') {
            alertErrorMessage('Withdrawal is disabled for this Coin');
            return;
          } else {
            $("#Withdraw_modal").modal("show");
          }

        }
      } else {
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result?.message);
      }
    });
  };

  const handleCancelWithdrawal = async (item) => {
    LoaderHelper.loaderStatus(true);
    await AuthService.cancelWithdrawal(item?._id, item?.amount, item?.currency_id, item?.fee).then(async (result) => {
      LoaderHelper.loaderStatus(false);
      if (result.success) {
        try {
          alertSuccessMessage(result.message);
          handleWalletHistory();
        } catch (error) {
          alertErrorMessage(error);
        }
      } else {
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result.message);
      }
    });
  };

  const handleInputChange = (e) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) {
      setAmountValue("");
      setAdjustedAmount(null);
    } else {
      setAmountValue(value);
      if (value >= coinDetails?.min_withdrawal) {
        setAdjustedAmount(value - coinDetails?.withdrawal_fee);
      } else {
        setAdjustedAmount(null);
      }
    }
  };

  const SwapHistory = async () => {
    LoaderHelper.loaderStatus(true);
    await AuthService.swapHistory().then(async (result) => {
      if (result?.success) {
        setSwapHistory(result?.data?.reverse());
      }
    });
  };


  const handleVerifyDeposit = async (status) => {
    await AuthService.verifyDeposit(status, selectedChain?.chain, fundModelData?.currency_id).then(async (result) => {
      if (result?.success) {
        if (result?.message === "New Transactions Fetched") {
          alertSuccessMessage("New deposit fetched");
          await handleUserFunds();

        } else {
          if (status === "checkPayment") {
            alertWarningMessage("New deposit not found. Please check after some time.");
          }
        }

        LoaderHelper.loaderStatus(false);
      }
      if (status === "checkPayment") {
        setCheckDepositStatus(false)
        $("#Deposit_modal").modal("hide");
        AuthService.transfer_funds(result?.data)
      }
    })
  };

  const [checkDepositStatus, setCheckDepositStatus] = useState(false);

  const completeDeposit = async () => {
    setCheckDepositStatus(true)
    // await new Promise((resolve) => {
    //   setTimeout(() => {
    //     handleVerifyDeposit("checkPayment")
    //     resolve();

    //   }, 10000);
    // });
    handleVerifyDeposit("checkPayment")
  }



  const handleCheckboxChange = (type) => {
    if (type === "balance") {
      setHideAssets(!hideAssets);
      setHideAssetsLocked(false)
    } else {
      setHideAssetsLocked(!hideAssetsLocked)
      setHideAssets(false);
    }
  };

  const p2pTransferModal = (item) => {
    $("#p2p_modal").modal("show");
    setSelectedCurrency(item.short_name)
    setWithdrawAmount("")
  };

  const spotTransferModal = (item) => {
    $("#spot_modal").modal("show");
    setSelectedCurrency(item.short_name)
    setWithdrawAmount("")
  };

  const transferHandler = async (selectedCurrency, withdrawAmount) => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      alertErrorMessage("Enter amount to transfer")
      return
    };
    try {
      LoaderHelper.loaderStatus(true)
      const result = await AuthService.transferToP2P(selectedCurrency, withdrawAmount)
      if (result.success) {
        alertSuccessMessage(`${withdrawAmount} ${selectedCurrency} transferred to P2P wallet`)
        userP2PWallet();
        handleUserFunds();
        $("#p2p_modal").modal("hide");
      } else {
        alertErrorMessage(result.message)
      }
    } finally { LoaderHelper.loaderStatus(false) }
  }

  const transferHandlerToSpot = async (selectedCurrency, withdrawAmount) => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      alertErrorMessage("Enter amount to transfer")
      return
    };
    try {
      LoaderHelper.loaderStatus(true)
      const result = await AuthService.transferToSpot(selectedCurrency, withdrawAmount)
      if (result.success) {
        alertSuccessMessage(result.message)
        userP2PWallet();
        handleUserFunds();
        $("#spot_modal").modal("hide");
      } else {
        alertErrorMessage(result.message)
      }
    } finally { LoaderHelper.loaderStatus(false) }
  };


  const cancelOrder = async (orderId) => {
    await AuthService.cancelOrder(orderId).then((result) => {
      if (result?.success) {
        LoaderHelper.loaderStatus(false);
        try {
          alertSuccessMessage('Order Cancelled Successfully');
          handleOpenOrders()
        } catch (error) {
          LoaderHelper.loaderStatus(false);
        }
      } else {
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result?.message)
      }
    })
  };




  const filteredCoinList = hideAssets
    ? finalFundData.filter(item => (item.balance + item?.bonus || 0) > 0.000001)
    : hideAssetsLocked ? finalFundData.filter(item => item.locked_balance > 0.000001)
      : finalFundData;

  const toFixed = (data) => {
    if (typeof (data) === 'number') {
      return parseFloat(data?.toFixed(6));
    } else {
      return 0;
    }
  }

  return (
    <>
      <div className="wallet_bal_sec" >
        <div className="container">
          <div className="bbd_row row g-3 mt-0" >
            <div className="col-12" >
              <div className="card p-md-3">
                <div className="card-body" >
                  <div className="row align-items-center" >
                    <div className="col-md-7" >
                      <div className="wallet__details">
                        <div className="wallet__info">Total Portfolio Value</div>
                        <div className="wallet__currency">
                          <div className="wallet__number">{estimatedportfolio?.Currency} {" "} {(estimatedportfolio?.currencyPrice?.toFixed(8)) || 0} </div>
                        </div>
                        <div className="wallet__price">${(estimatedportfolio?.dollarPrice?.toFixed(8)) || 0}</div>
                      </div>
                    </div>
                    <div className="col-md-5 d-flex justify-content-md-end">
                      <div className="cn_bt">
                        <button className={`btf`} data-bs-toggle="modal" data-bs-target="#cv_bot_detail_modal">
                          <div className="um_tab_link">
                            <img src="/images/bot.svg" className="img-fluid" alt="Wrathcode " />
                            <span> {props?.userDetails?.cv_bot_id ? "CV Bot Connected" : "Connect CV BOT"} </span>
                          </div>
                        </button>
                      </div>

                    </div>
                    <div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
            <div className="col-lg-4" >
              <div className="card w_card">
                <div className="card-body">
                  <img src="images/svg1.svg" width="42" className="img-fluid mb-3" alt="" />
                  <h5>Security</h5>
                  <ul className="sd-1" >
                    <li> <span onClick={() => nextPage('TwofactorPage')} className="cursor-pointer ">Two factor auth  <i className="text-gradient ri-arrow-right-line"></i> </span> </li>
                    <li> <Link to="/user_profile/user_kyc" >Kyc Status  <i className="text-gradient ri-arrow-right-line"></i> </Link> </li>
                    <li> <span onClick={() => nextPage('SecurityPage')} className="cursor-pointer">Change password  <i className=" text-gradient ri-arrow-right-line"></i> </span> </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* <div className="col-lg-4" >
              <div className="card w_card l_card">
                <div className="card-body">
                  <ul className="progress-bar">
                    <li className="active"> 
                      Personal
                      </li>
                    <li>Education</li>
                    <li>Work Experience</li> 
                  </ul>
                </div>
              </div>
            </div> */}
            <div className="col-lg-4" >
              <div className="card w_card">
                <div className="card-body">
                  <img src="images/sav2.svg" width="42" className="img-fluid mb-3" alt="" />
                  <h5>Staking</h5>
                  <p> <small>Earn up to 20% APY</small> </p>
                  <div className="sd sd-2" >
                    <h4 className="mb-0"> 0.0000 </h4>
                    <p className="mb-0 d-flex align-items-center justify-content-between"> Your active assets  <Link to="/comingsoon" >Details <i className="ri-arrow-right-line"></i>  </Link> </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4" >
              <div className="card w_card">
                <div className="card-body">
                  <img src="images/sav3.svg" width="42" className="img-fluid mb-3" alt="" />
                  <h5>Affiliate program</h5>
                  <p> <small>Earn 5000 SHIB for each friend you refer!</small> </p>
                  <div className="sd">
                    <span>Joining Bonus :  {joiningbalance || 0} SHIB </span>
                    <h4 className="mb-0"> {refferalBalance || 0} <small>SHIB </small> </h4>
                    <p className="mb-0 d-flex align-items-center justify-content-between"> <span>Total Referral :  {refferalCount || 0} </span> <Link to="/referal_list" >Details <i className="ri-arrow-right-line"></i>  </Link> </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section>
        <div className="container acc_tabs">
          {/* <div className="d-flex-between mb-3 custom_dlflex"> */}
          <ul className="nav nav-pills mb-2 overflowx_scroll funds_tab  market_tabs  flex-columns">
            <li className="nav-item">
              <a className=" active nav-link" data-bs-toggle="tab" href="#funds"><i className="ri-wallet-line ri-xl me-2"></i> Funds</a>
            </li>
            {/* 
              <li className="nav-item">
                <a className=" nav-link" data-bs-toggle="tab" href="#p2pWallet"><i className="ri-wallet-line ri-xl me-2"></i> P2P Wallet</a>
              </li>
              <li className="nav-item">
                <a className=" nav-link" data-bs-toggle="tab" href="#p2pSwap"><i className="ri-file-list-2-line ri-xl me-2"></i> P2P Swap History</a>
              </li> */}
            <li className="nav-item">
              <a className="nav-link" data-bs-toggle="tab" href="#tt_history" onClick={() => { handleWalletHistory(0); setTradeTab(false) }}>
                <i className="ri-wallet-line me-2"></i> Wallet History
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" data-bs-toggle="tab" href="#tradehistory_model" onClick={() => { handleTradeHistory(skip, limit); setTradeTab(true) }}>
                <i className="ri-file-list-3-line ri-xl me-2"></i>
                Trade History
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" data-bs-toggle="tab" href="#all_open_orders" onClick={() => handleOpenOrders(skipAllOrder, limitAllorder)}>
                <i className="ri-file-list-line ri-xl me-2"></i>
                All Open Orders
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" data-bs-toggle="tab" href="#quickbuySell" onClick={() => { getBuySellHistory(0, 10) }}>
                <i className="ri-file-list-line ri-xl me-2"></i>
                Buy / Sell History
              </a>
            </li>
          </ul>
          {/* </div> */}

          <div className="tab-content custom-tab-content p-0">
            <div className="tab-pane fade show container active form-field-wrapper table_scroll p-0 switch_btn border-dashed border-gray-300 bg-lighten card-rounded" id="funds">
              <div className="table_filter justify-content-between">
                <div className="form-check">
                  <div className="searchBar custom-tabs py-1">
                    <i className="ri-search-2-line"></i>
                    <input type="search" className="custom_search" placeholder="Search Assets" onChange={(event) => setSearch(event.target.value)} />
                  </div>
                </div>
                <div className="d-flex gap-3">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="HideCheck1" checked={hideAssets} onChange={() => handleCheckboxChange('balance')} />
                    <label className="form-check-label" for="HideCheck1">
                      Hide 0 Balance
                    </label>
                  </div>

                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="lockedheck1" checked={hideAssetsLocked} onChange={() => handleCheckboxChange('locked_balance')} />
                    <label className="form-check-label" for="lockedheck1">
                      View locked Balance
                    </label>
                  </div>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table wallet_table">
                  <thead>
                    <tr>
                      <th>Sr No.</th>
                      <th>Currency </th>
                      <th>Available Balance</th>
                      <th>Locked</th>
                      <th>Bonus</th>
                      <th>Total</th>
                      <th className="text-end" >Action</th>
                    </tr>
                  </thead>
                  <tbody>

                    {filteredCoinList?.length > 0 ? (
                      filteredCoinList?.slice(0, updatedLength)?.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item?.short_name}</td>
                          <td>{toFixed(item?.balance)}</td>
                          <td>{toFixed(item?.locked_balance)}</td>
                          <td>{toFixed(item?.bonus || 0)}</td>
                          <td>{toFixed(item?.balance + item?.locked_balance + item?.bonus || 0)}</td>
                          <td className="text-end" >
                            {item?.p2pStatus === true && <button className=" btn btn-primary btn-sm mx-1" disabled={+item?.balance <= 0} onClick={() => p2pTransferModal(item)} > Transfer to P2P Wallet </button>}
                            <button className=" btn btn-success btn-sm mx-1" onClick={() => handleDepositDetails(item)}> Deposit </button>
                            <button className={`btn btn-danger btn-sm mx-1 ${item?.short_name === "SHIB" ? 'disabled' : ""}`} onClick={() => handleWithdrawalDetails(item)} > Withdraw </button>

                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr rowSpan="5">
                        <td colSpan="12">
                          <p className="text-center" style={{ textAlign: "center" }}>
                            <div className="favouriteData">
                              <img src="/images/no-data.svg" className="img-fluid" width="96" height="96" alt="" />
                              <p>No Data Available</p>
                            </div>
                          </p>
                        </td>
                      </tr>
                    )}
                    {(filteredCoinList?.length > 0 && updatedLength < filteredCoinList?.length) &&
                      <tr rowSpan="5">
                        <td colSpan="12" className="cursor-pointer" >
                          <p className="text-center cursor-pointer py-3 mb-0" style={{ cursor: 'pointer' }} onClick={() => {
                            setupdatedLength(updatedLength + 5); window.scrollTo({
                              top: document.documentElement.scrollHeight,
                              left: 0,
                              behavior: "smooth"
                            })
                          }} >
                            Load More...
                          </p>
                        </td>
                      </tr>}
                  </tbody>
                </table>
              </div>
            </div>


            <div className="tab-pane fade container form-field-wrapper table_scroll p-0 switch_btn border-dashed border-gray-300 bg-lighten card-rounded" id="p2pWallet">
              <div className="table-responsive">
                <table className="table wallet_table">
                  <thead>
                    <tr>
                      <th className="text-center" >Sr No.</th>
                      <th className="text-center" >Currency </th>
                      <th className="text-center" >P2P Balance</th>
                      <th className="text-center" >P2P Locked Balance</th>
                      <th className="text-center"  >Action</th>
                    </tr>
                  </thead>
                  <tbody>

                    {p2pWallet?.length > 0 ? (
                      p2pWallet?.slice(0, updatedLength)?.map((item, index) => (
                        <tr key={index}>
                          <td className="text-center" >{index + 1}</td>
                          <td className="text-center" >{item?.short_name}</td>
                          <td className="text-center" >{item?.p2p_balance}</td>
                          <td className="text-center" >{item?.p2p_locked_balance}</td>
                          <td className="text-center"  >
                            <button className=" btn btn-success btn-sm mx-1" disabled={+item?.p2p_balance <= 0} onClick={() => spotTransferModal(item)}  > Transfer to Spot Wallet </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr rowSpan="5">
                        <td colSpan="12">
                          <p className="text-center" style={{ textAlign: "center" }}>
                            <div className="favouriteData">
                              <img src="/images/no-data.svg" className="img-fluid" width="96" height="96" alt="" />
                              <p>No Data Available</p>
                            </div>
                          </p>
                        </td>
                      </tr>
                    )}
                    {(p2pWallet?.length > 0 && updatedLength < p2pWallet?.length) &&
                      <tr rowSpan="5">
                        <td colSpan="12" className="cursor-pointer" >
                          <p className="text-center cursor-pointer py-3 mb-0" style={{ cursor: 'pointer' }} onClick={() => {
                            setupdatedLength(updatedLength + 5); window.scrollTo({
                              top: document.documentElement.scrollHeight,
                              left: 0,
                              behavior: "smooth"
                            })
                          }} >
                            Load More...
                          </p>
                        </td>
                      </tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="tab-pane fade container form-field-wrapper table_scroll p-0 switch_btn border-dashed border-gray-300 bg-lighten card-rounded" id="p2pSwap">
              <div className="table-responsive">
                <table className="table wallet_table">
                  <thead>
                    <tr>
                      <th>Sr No.</th>
                      <th>Date/Time</th>
                      <th>Currency </th>
                      <th>Amount</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>

                    {swapHistory?.length > 0 ? (
                      swapHistory?.slice(0, updatedLength)?.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>   <small>
                            <div className="c_view justify-content-start" >
                              <span>{moment(item.updatedAt).format("DD/MM/YYYY  ")}
                                <small>{moment(item.updatedAt).format("hh:mm A")}</small>
                              </span>
                            </div>
                          </small></td>
                          <td>{item?.short_name}</td>
                          <td>{item?.amount}</td>
                          <td>{item?.wallet}</td>
                        </tr>
                      ))
                    ) : (
                      <tr rowSpan="5">
                        <td colSpan="12">
                          <p className="text-center" style={{ textAlign: "center" }}>
                            <div className="favouriteData">
                              <img src="/images/no-data.svg" className="img-fluid" width="96" height="96" alt="" />
                              <p>No Data Available</p>
                            </div>
                          </p>
                        </td>
                      </tr>
                    )}
                    {(swapHistory?.length > 0 && updatedLength < swapHistory?.length) &&
                      <tr rowSpan="5">
                        <td colSpan="12" className="cursor-pointer" >
                          <p className="text-center cursor-pointer py-3 mb-0" style={{ cursor: 'pointer' }} onClick={() => {
                            setupdatedLength(updatedLength + 5); window.scrollTo({
                              top: document.documentElement.scrollHeight,
                              left: 0,
                              behavior: "smooth"
                            })
                          }} >
                            Load More...
                          </p>
                        </td>
                      </tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="tab-pane container fade form-field-wrapper table_scroll p-0 switch_btn  border-dashed border-gray-300 bg-lighten card-rounded" id="tt_history" >
              <div className="table-responsive">
                <table className="table  ">
                  <thead>
                    <tr>
                      <th>Sr No</th>
                      <th>Date & Time</th>
                      <th>Currency </th>
                      <th>Chain</th>
                      <th>Transaction Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      {/* <th className="text-end">Cancel Withdrawal</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {walletHistory?.length > 0 ? (
                      walletHistory?.map((item, index) => (
                        <tr key={index} className="cursor-pointer" >
                          <td className="color-grey" ><small>{skipWalletHistory + index + 1}</small></td>
                          <td className="color-grey" data-bs-toggle="modal" data-bs-target="#wallet_history" onClick={() => setModelData(item)}>
                            <small>
                              <div className="c_view justify-content-start" >
                                <span>{moment(item.updatedAt).format("DD/MM/YYYY  ")}
                                  <small>{moment(item.updatedAt).format("hh:mm A")}</small>
                                </span>
                              </div>
                            </small>
                          </td>
                          <td className="color-grey" data-bs-toggle="modal" data-bs-target="#wallet_history" onClick={() => setModelData(item)}>
                            <small>{item?.short_name}</small>
                          </td>

                          <td className="color-grey" data-bs-toggle="modal" data-bs-target="#wallet_history" onClick={() => setModelData(item)}>
                            <small>{item?.chain || "------"}</small>
                          </td>
                          <td className="color-grey" data-bs-toggle="modal" data-bs-target="#wallet_history" onClick={() => setModelData(item)}>
                            <small>{item?.transaction_type}</small>
                          </td>

                          <td className="color-grey" data-bs-toggle="modal" data-bs-target="#wallet_history" onClick={() => setModelData(item)}>
                            <small>{item?.amount}</small>
                          </td>


                          <td data-bs-toggle="modal" data-bs-target="#wallet_history" onClick={() => setModelData(item)}>


                            <button type="button" className={`btn status_btn custom-btn btn-sm ${item?.status === "COMPLETE" ? "btn-success" : item?.status === "REJECTED" ? "btn-danger" : item?.status === "PENDING" ? "btn-warning" : item?.status === "CANCELLED" ? "btn-warning" : ""}`} >{item?.status}</button>

                          </td>



                          {/* <td className="text-end" >
                            {
                              item?.status === "CANCELLED" || item?.status === "REJECTED" || item?.status === "COMPLETE" ?
                                <button className="btn custom-btn custom-border-btn btn-sm custom-border-btn-white disabled" > updated </button>
                                :
                                <button className="btn btn-danger btn-sm mx-1" onClick={() => handleCancelWithdrawal(item)} > CANCEL </button>

                            }
                          </td> */}
                        </tr>
                      ))
                    ) : (
                      <tr rowSpan="5">
                        <td colSpan="12">
                          <div className="favouriteData">
                            <img src="/images/no-data.svg" className="img-fluid" width="96" height="96" alt="" />
                            <p>No Data Available</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {walletHistory?.length > 0 ?
                  < div className="hVPalX gap-2" >
                    <span className="" >{skipWalletHistory + 1}-{Math.min(skipWalletHistory + limit, totalDataLength)} of {totalDataLength}</span>
                    <div className="sc-eAKtBH gVtWSU">
                      <button type="button" aria-label="First Page" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationWalletHistory('first')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                          <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"></path>
                          <path fill="none" d="M24 24H0V0h24v24z"></path>
                        </svg>
                      </button>
                      <button type="button" aria-label="Next Page" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationWalletHistory('prev')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
                          <path d="M0 0h24v24H0z" fill="none"></path>
                        </svg>
                      </button>

                      <button type="button" aria-label="Next Page" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationWalletHistory('next')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
                          <path d="M0 0h24v24H0z" fill="none"></path>
                        </svg>
                      </button>
                      <button type="button" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationWalletHistory('last')}>
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

            {/* *****Trade History******** */}
            <div className="tab-pane container fade form-field-wrapper table_scroll p-0 switch_btn border-dashed border-gray-300 bg-lighten card-rounded" id="tradehistory_model">
              <div className="table-responsive">
                <table className="table ">
                  <thead>
                    <tr>
                      <th>Sr No.</th>
                      <th>Date/Time</th>
                      <th>Currency Pair</th>
                      <th>Credited Currency</th>
                      <th>Side</th>
                      <th>Price</th>
                      <th>Executed Quantity</th>
                      <th>Total</th>
                      <th>Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tradeHistoryData?.length > 0 ? (
                      tradeHistoryData?.map((item, index) => (
                        <tr key={index} className="cursor-pointer" data-bs-toggle="modal" data-bs-target="#transfer_history" onClick={() => setModelData(item)}>
                          <td className="color-grey"><small>{skip + index + 1}</small></td>
                          <td className="color-grey">

                            <small>
                              <div className="c_view justify-content-start" >
                                <span>{moment(item.createdAt).format("DD/MM/YYYY  ")}
                                  <small>{moment(item.createdAt).format("hh:mm A")}</small>
                                </span>
                              </div>
                            </small>

                          </td>
                          <td className="color-grey"><small>{item?.base_currency_name + "/" + item?.quote_currency_name}</small></td>
                          <td className="color-grey"><small>{item?.side === "SELL" ? item?.quote_currency_name : item?.base_currency_name}</small></td>
                          <td className="color-grey"><small>{item?.side}</small></td>
                          <td className="color-grey"><small> {toFixed(item?.price)}</small></td>
                          <td className="color-grey"><small>{toFixed(item?.quantity)}</small></td>
                          <td className="color-grey"><small> {toFixed((item?.price * item?.quantity))} </small></td>
                          <td className="color-grey"><small>{toFixed(item?.fee)}</small></td>
                        </tr>
                      ))
                    ) : (
                      <tr rowSpan="5">
                        <td colSpan="12">
                          <div className="favouriteData">
                            <img src="/images/no-data.svg" className="img-fluid" width="96" height="96" alt="" />
                            <p>No Data Available</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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



            {/* All Open Orders */}
            <div className="tab-pane container fade form-field-wrapper table_scroll p-0 switch_btn border-dashed border-gray-300 bg-lighten card-rounded" id="all_open_orders">
              <div className="table-responsive">
                <table className="table ">
                  <thead>
                    <tr>
                      <th>Sr No.</th>
                      <th>Date/Time</th>
                      <th>Currency Pair</th>
                      <th>Side</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Filled</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOpenOrders?.length > 0 ? (
                      allOpenOrders?.map((item, index) => (
                        <tr key={index} onClick={() => setModelData(item)}>
                          <td className="color-grey"><small>{index + 1}</small></td>
                          <td className="color-grey">
                            <small>
                              <div className="c_view justify-content-start" >
                                <span>{moment(item.createdAt).format("DD/MM/YYYY  ")}
                                  <small>{moment(item.createdAt).format("hh:mm A")}</small>
                                </span>
                              </div>
                            </small>
                          </td>
                          <td className="color-grey"><small>{item?.base_currency_short_name + "/" + item?.quote_currency_short_name}</small></td>
                          <td className="color-grey"><small>{item?.side}</small></td>
                          <td className="color-grey"><small> {toFixed(item?.price)}</small></td>
                          <td className="color-grey"><small>{toFixed(item?.quantity)}</small></td>
                          <td className="color-grey"><small>{toFixed(item?.filled)}</small></td>
                          <td className="color-grey"><small> {toFixed((item?.price * item?.quantity))} </small></td>
                          <td className="color-grey"><small>{item?.status}</small></td>
                          <td className="color-grey"> <button className="btn text-danger btn-sm btn-icon" type="button" title="Cancel order" onClick={() => { cancelOrder(item?._id) }}><i className="ri-delete-bin-6-line pr-0"></i>
                          </button></td>
                        </tr>
                      ))
                    ) : (
                      <tr rowSpan="5">
                        <td colSpan="12">
                          <div className="favouriteData">
                            <img src="/images/no-data.svg" className="img-fluid" width="96" height="96" alt="" />
                            <p>No Data Available</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {allOpenOrders?.length > 0 ?
                  < div className="hVPalX gap-2" >
                    <span className="" >{skipAllOrder + 1}-{Math.min(skipAllOrder + limit, totalAllOpen)} of {totalAllOpen}</span>
                    <div className="sc-eAKtBH gVtWSU">
                      <button type="button" aria-label="First Page" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationAllOrder('first')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                          <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"></path>
                          <path fill="none" d="M24 24H0V0h24v24z"></path>
                        </svg>
                      </button>
                      <button type="button" aria-label="Next Page" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationAllOrder('prev')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
                          <path d="M0 0h24v24H0z" fill="none"></path>
                        </svg>
                      </button>

                      <button type="button" aria-label="Next Page" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationAllOrder('next')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
                          <path d="M0 0h24v24H0z" fill="none"></path>
                        </svg>
                      </button>
                      <button type="button" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationAllOrder('last')}>
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

            {/* Quick Buy Sell History */}
            <div className="tab-pane container fade form-field-wrapper table_scroll p-0 switch_btn border-dashed border-gray-300 bg-lighten card-rounded" id="quickbuySell">
              <div className="table-responsive">
                <table className="table ">
                  <thead>
                    <tr>
                      <th>Sr No.</th>
                      <th>Date/Time</th>
                      <th>From Currency </th>
                      <th>To Currency </th>
                      <th>Paid Amount</th>
                      <th>Received Amount</th>
                      <th>Fee %</th>
                      <th>Fee</th>
                      <th>Side</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buySellHist?.length > 0 ? (
                      buySellHist?.map((item, index) => (
                        <tr key={index} onClick={() => setModelData(item)}>
                          <td className="color-grey"><small>{index + skipQbsHistory + 1}</small></td>
                          <td className="color-grey">
                            <small>
                              <div className="c_view justify-content-start" >
                                <span>{moment(item.createdAt).format("DD/MM/YYYY  ")}
                                  <small>{moment(item.createdAt).format("hh:mm A")}</small>
                                </span>
                              </div>
                            </small>
                          </td>
                          <td className="color-grey"><small>{item?.from}</small></td>
                          <td className="color-grey"><small>{item?.to}</small></td>
                          <td className="color-grey"><small> {toFixed(item.pay_amount)}</small></td>
                          <td className="color-grey"><small>{toFixed(item.get_amount)}</small></td>
                          <td className="color-grey"><small>{toFixed(item.fee_percentage)}</small></td>
                          <td className="color-grey"><small>{toFixed(item.fee)}</small></td>
                          <td className="color-grey"><small className={item.side === "BUY" ? "text-success" : "text-danger"}>{item.side}</small></td>
                        </tr>
                      ))
                    ) : (
                      <tr rowSpan="5">
                        <td colSpan="12">
                          <div className="favouriteData">
                            <img src="/images/no-data.svg" className="img-fluid" width="96" height="96" alt="" />
                            <p>No Data Available</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {buySellHist?.length > 0 ?
                  < div className="hVPalX gap-2" >
                    <span className="" >{skipQbsHistory + 1}-{Math.min(skipQbsHistory + limit, totalDataLength)} of {totalDataLength}</span>
                    <div className="sc-eAKtBH gVtWSU">
                      <button type="button" aria-label="First Page" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationQbsHistory('first')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                          <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"></path>
                          <path fill="none" d="M24 24H0V0h24v24z"></path>
                        </svg>
                      </button>
                      <button type="button" aria-label="Next Page" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationQbsHistory('prev')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
                          <path d="M0 0h24v24H0z" fill="none"></path>
                        </svg>
                      </button>

                      <button type="button" aria-label="Next Page" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationQbsHistory('next')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
                          <path d="M0 0h24v24H0z" fill="none"></path>
                        </svg>
                      </button>
                      <button type="button" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationQbsHistory('last')}>
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
      </section>

      {/* Deposit_modal modal */}
      <div className="modal fade" id="Deposit_modal" tabIndex="-1" aria-labelledby="Deposit_modalLaebl" aria-hidden="true" ref={modalRef}>
        <div className="modal-dialog mt-5 ">
          <div className="modal-content">
            <div className="modal-header flex-column px-8">
              <h3 className="modal-title" id="placeBitLaebl"> Deposit Funds </h3>
              <button type="button" className="btn-custom-closer" data-bs-dismiss="modal" aria-label="Close"><i className="ri-close-fill"></i></button>
            </div>
            <div className="modal-body px-8 py-3">
              <form action="#">
                {fundModelData?.short_name === "INR" ? (
                  <>
                    <h6 className="flex_amount mb-3"> Bank Account Details</h6>
                    <hr />
                    <div className="flex_amount mb-3">
                      <div className="d-flex   tt_item">
                        <strong>Bank Name :</strong> {bankDetails?.bank_name}
                      </div>
                      <div className="d-flex  tt_item">
                        <strong>Account Holder Name :</strong> {bankDetails?.holder_name}
                      </div>
                      <div className=" d-flex  tt_item">
                        <strong>Bank Account Number : </strong>  {bankDetails?.account_number}
                      </div>
                      <div className=" d-flex  tt_item">
                        <strong>Branch Name :</strong>  {bankDetails?.branch}
                      </div>
                      <div className=" d-flex  tt_item">
                        <strong>IFSC Code :</strong>  {bankDetails?.ifsc}
                      </div>
                    </div>
                    <div className="form-group mb-2">
                      <input className="form-control" type="text" placeholder="Enter Amount" value={amountInr} onChange={(e) => setAmountInr(e.target.value)} />
                    </div>
                    <div className="form-group mb-2">
                      <input className="form-control" type="text" placeholder="Enter Transaction Number" value={transactionNumber} onChange={(e) => setTransactionNumber(e.target.value)} />
                    </div>

                    <div className="row">
                      <div className="col-md-12 upload-area">
                        <div className="brows-file-wrapper">
                          <input id="file" className="inputfile" type="file" onChange={handleChangeInrImage} />
                          {localInrImage === "" ?
                            <label htmlFor="file" title="No File Choosen">
                              <i className="ri-upload-cloud-line"></i>
                              <span className="text-center mb-2">Choose a File</span>
                              < span className="file-type text-center mt--10">Drag or choose your file to upload</span>
                            </label>
                            : <label htmlFor="file" title="No File Choosen">
                              <i className=" text-success ri-check-double-fill"></i>
                              <span className="text-center mb-2">File Uploaded</span>
                              <span className="file-type text-center mt--10" >{localInrImage?.name}</span>
                            </label>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="form-group mb-4">
                      <button type="button" className="btn btn-gradient btn-small w-100 justify-content-center mt-4" onClick={() => handleDepositInr(amountInr, localInrImage, transactionNumber)}>
                        <span>Deposit INR</span>
                      </button>
                      <small className="mt-1 d-block text-center fw-small  mt-3 text-center  ">
                        <span className="onceDeposit "> Once Deposit It will Take Minimum Two Hours for Confirm </span>
                      </small>
                    </div>
                  </>
                ) :
                  (
                    selectedDeposit ? (
                      <>
                        <div className="btn-group btn_radio_group d-flex justify-content-center align-items-center m-auto">
                          {depositChains ? depositChains?.map((item) => {
                            return (
                              <><button type="button" className={`btn btn-outline-primary ${selectedChain?.chain === item && "active"}`} for={item} onClick={() => { getDepostAddress(fundModelData?.currency_id, item); setSelectedchain({ chain: item }) }}>
                                {item}
                              </button>


                              </>)
                          }) : ''}
                          {/* {fundModelData?.short_name === "CVT" &&
                            <button type="button" className={`btn btn-outline-primary ${selectedChain?.chain === "bot" && "active"}`} onClick={() => { setSelectedchain({ chain: "bot" }) }} data-bs-toggle="modal" data-bs-target="#cv_bot_detail_modal">
                              Connect CV Bot
                            </button>} */}
                        </div>
                        <div id="bnm">
                          <QRCode value={selectedDeposit} className="qr_img img-fluid" />

                          <div className="field-otp-box">
                            <input className="shareUrl-input copy_url js-shareUrl text-center form-control" type="text" readOnly="readOnly" value={selectedDeposit} />
                            <button className="btn btn-xs  custom-btn mw-auto" type="button" onClick={() => { navigator.clipboard.writeText(selectedDeposit); alertSuccessMessage("Copied!!"); }}> COPY </button>
                          </div>
                          {(fundModelData?.short_name === "USDT" && userDetails?.kycVerified === 2) && <div className="text-center">  <small className="text-warning">Get flat<strong>  2.5% KYC bonus </strong>on deposit of 100 USDT or more.</small></div>}
                          {(fundModelData?.short_name === "USDT" && userDetails?.kycVerified !== 2) && <div className="text-center">  <small className="text-warning"><a href="/user_profile/user_kyc">Complete your  KYC </a> and get flat<strong>  2.5% KYC bonus </strong>on deposit of 100 USDT or more.</small></div>}
                          <ul className="disclaimer mt-3">
                            <label>Disclaimer</label>
                            {fundModelData?.short_name === "CVT" && <li> • Deposit from CV Bot can only be done once in 12 hour.</li>}
                            <li> • Minimum deposit of {coinDetails?.min_deposit}, deposit below that cannot be recovered.</li>
                            <li> • Please deposit only {fundModelData?.currency} on this address. If you deposit any other coin, it will be lost forever. </li>
                            <li> • This is {selectedChain?.chain} deposit address type. Transferring to an unsupported network could result in loss of deposit.
                            </li>
                          </ul>

                          <div className="d-flex justify-content-center flex-column align-items-center">
                            {checkDepositStatus ? <><button className="btn btn-success w-50 mx-auto" type="button" > <div className="spinner-border text-white" role="status">
                              <span className="sr-only"></span>
                            </div> </button> <small className="text-success mt-2 text-center">Transaction in progress! Blockchain validation is underway. This may take a few minutes</small> </> : <><button className="btn btn-success w-50 mx-auto mt-3" type="button" onClick={() => { completeDeposit() }}> Transfer completed</button> <small className="text-danger mt-2 text-center">Click here once you have completed the payment on your end.</small> </>
                            }
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="favouriteData">
                        <img src="/images/no-data.svg" className="img-fluid" width="96" height="96" alt="" />
                        <p>No Data Available</p>
                      </div>
                    ))}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw_modal modal */}
      <div className="modal fade" id="Withdraw_modal" tabIndex="-1" aria-labelledby="Withdraw_modalLaebl" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header flex-column px-8 no-border p-0">
              {/* <h3 className="modal-title" id="placeBitLaebl"> Withdraw Funds </h3> */}
              <button type="button" className="btn-custom-closer" data-bs-dismiss="modal" aria-label="Close"> <i className="ri-close-fill"></i></button>
            </div>
            <div className="modal-body px-8 py-3">
              {withdrawalData?.short_name === "INR" ? (
                <>
                  <div className="form-group mb-4">
                    <input className="form-control" type="text" value={withdrawAmount} placeholder="Amount" onChange={(e) => setWithdrawAmount(e.target.value)} />
                  </div>
                  <div className="form-group mb-4">
                    <button type="button" data-bs-dismiss="modal" className="btn btn-gradient btn-small w-100 justify-content-center" data-bs-toggle="modal" data-bs-target="#Withdraw_modal3" disabled={!withdrawAmount}>
                      <span>Withdraw INR</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* <small><strong className="text-danger">(Withdrawal is available on BEP20 only)</strong> </small> */}
                  <div className="text-center"><small> <strong className="text-danger">Withdrawal is available on BEP20 only</strong> </small> </div>
                  <label className=""> <small>Select Network:  </small> </label>
                  <div className="btn-group btn_radio_group w-100 px-0 pt-0 mb-0">
                    {withdrawalData?.chain ? withdrawalData?.chain?.map((item) => {
                      return (
                        <button type="button" className={`btn btn-outline-primary ${selectedChain?.chain === item && "active"}`} for={item} onClick={() => { item !== "BEP20" ? alertErrorMessage(`Withdrawal is temporary not available in ${item}`) : setSelectedchain({ ...selectedChain, chain: item }) }} >
                          {item}
                        </button>)
                    }) : ''}
                  </div>

                  <div className="form-group mb-4">
                    <label> Address</label>
                    <input className="form-control" type="text" name="wallet_Add" value={walletAddress} placeholder="Wallet Address" onChange={(e) => setWalletAddress(e.target.value)} />
                  </div>
                  <div className="col-lg-12 col-md-12 col-12 mb-4">
                    <div className=" field-otp-box" >

                      <input
                        className="form-control"
                        type="number"
                        onWheel={e => e.target.blur()}
                        name="amount_val"
                        value={amountValue}
                        placeholder="Amount"
                        onChange={handleInputChange}
                        onBlur={(e) => {
                          const value = parseFloat(e.target.value);
                          if (value > parseFloat(withdrawalData?.balance)) {
                            setAmountValue(withdrawalData?.balance);
                            if (value >= coinDetails?.min_withdrawal) {
                              setAdjustedAmount(withdrawalData?.balance - coinDetails?.withdrawal_fee);
                            } else {
                              setAdjustedAmount(null);
                            }
                          }
                        }}
                        max={withdrawalData?.balance}
                      />

                      <button type="button" className="btn btn-xs custom-btn" onClick={() => setAmountValue(toFixed(withdrawalData?.balance || 0))}>
                        Max
                      </button>
                    </div>
                  </div>
                  <div className="col-lg-12 col-md-12 col-12 mb-4">
                    <div className=" field-otp-box" >
                      <input type="number" name="form-otp" id="form-otp" className="form-control" placeholder="Enter Verification Code" value={otp} onChange={(e) => setOtp(e.target.value)} onWheel={e => e.target.blur()} />
                      <button type="button" className="btn btn-xs  custom-btn" disabled={disableBtn} onClick={() => handleGetOtp(emailId, disableBtn)}>
                        <span>{disableBtn ? `Resend OTP (${timer}s)` : "GET OTP"}  </span>
                      </button>
                    </div>
                  </div>

                  <div className="tt_data mb-4 px-2">
                    <div className="tt_item no-border py-1">
                      <span className="text-muted"> Withdrawal fee: </span><span className="tt_normal">{coinDetails?.withdrawal_fee} {coinDetails?.short_name}</span>
                    </div>

                    <div className="tt_item no-border py-1">
                      <span className="text-muted">Min. withdrawal amount: </span><span className="tt_normal">{coinDetails?.min_withdrawal} {coinDetails?.short_name}</span>
                    </div>
                    <div className="tt_item no-border py-1">
                      <span className="text-muted">Max. withdrawal amount: </span><span className="tt_normal">{coinDetails?.max_withdrawal} {coinDetails?.short_name}</span>
                    </div>
                    <div className="tt_item py-1">
                      <span className="text-muted"> You will get: </span><span className="tt_normal h6"> <b>{parseFloat(adjustedAmount?.toFixed(8)) || 0} {coinDetails?.short_name}</b> </span>
                    </div>
                    <div className="tt_item no-border  py-1">
                      <span className="text-muted"> Available balance: </span><span className="tt_normal">{withdrawalData?.balance} {coinDetails?.short_name}</span>
                    </div>
                  </div>
                  {/*  {(amountValue || amountValue === 0) &&
                    (amountValue < coinDetails?.min_withdrawal ? (
                      <span className="mb-2 d-block text-center text-danger">
                        <small>Minimum withdrawal amount should be {coinDetails?.min_withdrawal} {coinDetails?.short_name}</small>
                      </span>
                    ) : (
                      amountValue > withdrawalData?.balance && (
                        <span className="mb-2 d-block text-center text-danger">
                          <small>Insufficient Available balance</small>
                        </span>
                      )
                    ))
                  } */}

                  {(amountValue || amountValue === 0) && (
                    <>
                      {amountValue < coinDetails?.min_withdrawal ? (
                        <span className="mb-2 d-block text-center text-danger">
                          <small>Minimum withdrawal amount should be {coinDetails?.min_withdrawal} {coinDetails?.short_name}</small>
                        </span>
                      ) : amountValue > withdrawalData?.balance ? (
                        <span className="mb-2 d-block text-center text-danger">
                          <small>You do not have sufficient  balance</small>
                        </span>
                      ) : adjustedAmount < 0 ? (
                        <span className="mb-2 d-block text-center text-danger">
                          <small> Withdrawal Amount too less</small>
                        </span>
                      ) : amountValue > coinDetails?.max_withdrawal ? (
                        <span className="mb-2 d-block text-center text-danger">
                          <small>Minimum withdrawal amount should be less than {coinDetails?.max_withdrawal} {coinDetails?.short_name}</small>
                        </span>) : null}
                    </>
                  )}

                  <div className="form-group mb-4">
                    {kycVerified === 2 ?
                      <button type="button" className="btn btn-gradient btn-small w-100 justify-content-center" data-bs-dismiss="modal"
                        data-bs-toggle="modal" data-bs-target="#Withdraw_modal2" disabled={!walletAddress || !amountValue || !otp || amountValue < coinDetails?.min_withdrawal || amountValue > withdrawalData?.balance || adjustedAmount < 0 || amountValue > coinDetails?.max_withdrawal}>
                        <span>Withdraw</span>
                      </button> :
                      <a href="/user_profile/user_kyc" className="btn btn-danger btn-small w-100 justify-content-center" >
                        <span>Verify KYC</span>
                      </a>
                    }
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal INR*/}
      <div className="modal fade" id="Withdraw_modal3" tabIndex="-1" aria-labelledby="Withdraw_modalLaebl" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header flex-column px-8">
              <h3 className="modal-title" id="placeBitLaebl"> Withdraw Funds </h3>
              <button type="button" className="btn-custom-closer" data-bs-dismiss="modal" aria-label="Close"><i className="ri-close-fill"></i></button>
            </div>
            <div className="modal-body px-8 py-3">
              <>
                <div className="form-group mb-4">
                  <strong> You are going to withdraw {withdrawalData?.short_name}, please confirm your withdraw by clicking 'Confirm' button below. </strong>
                </div>
                <hr />
                <Row>
                  <Col>
                    <div className="form-group mb-4">
                      <button type="button" className="btn btn-danger btn-small w-100 justify-content-center" data-bs-dismiss="modal" onClick={handleResetInput}>
                        <span>Cancel</span>
                      </button>
                    </div>
                  </Col>
                  <Col>
                    <div className="form-group mb-4">
                      <button type="button" className="btn btn-success btn-small w-100 justify-content-center" onClick={() => handleWithdrawInr(withdrawAmount)}>
                        <span>Confirm</span>
                      </button>
                    </div>
                  </Col>
                </Row>
              </>
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw_modal2 Modal */}
      <div className="modal fade" id="Withdraw_modal2" tabIndex="-1" aria-labelledby="Withdraw_modalLaebl" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header flex-column px-8">
              <h3 className="modal-title" id="placeBitLaebl"> Confirm withdrawal </h3>
              <button type="button" className="btn-custom-closer" data-bs-dismiss="modal" aria-label="Close"> <i className="ri-close-fill"></i></button>
            </div>
            <div className="modal-body px-8">
              <>
                <div className="mb-4">
                  <strong> You are going to withdraw {amountValue} {withdrawalData?.short_name}  please confirm your withdraw by clicking 'Confirm' button below. </strong>
                </div>
                <hr />
                <Row>
                  <Col>
                    <div className="form-group mb-4">
                      <button type="button" className="btn btn-danger btn-small w-100 justify-content-center" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#Withdraw_modal2" onClick={handleResetInput}>
                        <span>Cancel</span>
                      </button>
                    </div>
                  </Col>
                  <Col>
                    <div className="form-group">
                      <button onClick={() => handleWithdrawCurrency()} type="button" className="btn btn-success btn-small w-100 justify-content-center" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#Withdraw_modal2">
                        <span>Confirm</span>
                      </button>
                    </div>
                  </Col>
                </Row>
              </>
            </div>
          </div>
        </div>
      </div>

      {/* transfer_history modal */}
      <div className="modal fade" id="transfer_history" tabIndex="-1" aria-labelledby="transfer_history" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header flex-column px-8">
              <h3 className="modal-title" id="placeBitLaebl"> Transfer History </h3>
              <button type="button" className="btn-custom-closer" data-bs-dismiss="modal" aria-label="Close"><i className="ri-close-fill"></i></button>
            </div>
            <div className="modal-body px-8 py-2 body_history">
              <div className="tt_data">
                <div className="tt_item">
                  <span className="tt_disable">Amount</span>
                  <span className="tt_normal"> <b>{modelData?.price}</b></span>
                </div>
                <div className="tt_item ">
                  <span className="tt_disable">Date &amp; Time</span>
                  <span className="tt_normal"><b> <span> {moment(modelData?.createdAt).format("DD/MM/YYYY  ")}
                    {moment(modelData?.createdAt).format("hh:mm A")}
                  </span></b></span>
                </div>
                <div className="tt_item">
                  <span className="tt_disable">Currency</span>
                  <span className="tt_normal"><b>{modelData?.side === "SELL" ? modelData?.quote_currency_name : modelData?.base_currency_name}</b></span>
                </div>
                <div className="tt_item">
                  <span className="tt_disable">Order ID</span>
                  <span className="tt_normal"><b>{modelData?.order_id}</b></span>
                </div>
                <div className="tt_item ">
                  <span className="tt_disable"> Transaction Fee <br />
                    <small>Incl.of all applicable taxes</small>
                  </span>
                  <span className="tt_normal">  <b>{!modelData?.fee ? "0" : modelData?.fee}</b> </span>
                </div>

                <div className="tt_item">
                  <span className="tt_disable">Order Type</span>
                  <span className="tt_normal"><b>{modelData?.order_type}</b></span>
                </div>
                <div className="tt_item">
                  <span className="tt_disable">Price</span>
                  <span className="tt_normal"><b>{modelData?.price}</b></span>
                </div>
                <div className="tt_item">
                  <span className="tt_disable">Quantity</span>
                  <span className="tt_normal"><b>{modelData?.quantity}</b></span>
                </div>
                <div className="tt_item">
                  <span className="tt_disable">Credited Quantity</span>
                  <span className="tt_normal"><b>{modelData?.side === "SELL" ? (modelData?.price * modelData?.quantity - modelData?.fee || 0) : (modelData?.quantity - modelData?.fee || 0)} {" "}
                    {modelData?.side === "SELL" ? modelData?.quote_currency_name : modelData?.base_currency_name}</b></span>
                </div>
                <div className="tt_item">
                  <span className="tt_disable">Side</span>
                  <span className="tt_normal"><b>{modelData?.side}</b></span>
                </div>
                <div className="tt_item">
                  <span className="tt_disable">TDS</span>
                  <span className="tt_normal"><b>{modelData?.tds}</b></span>
                </div>
                <div className="tt_item ">
                  <span className="tt_disable">Remarks</span>
                  <span className="tt_normal"><b>Wrathcode</b> </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet_history modal */}
      <div className="modal fade" id="wallet_history" tabIndex="-1" aria-labelledby="wallet_history" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header flex-column px-8">
              <h3 className="modal-title" id="placeBitLaebl"> Wallet History </h3>
              <button type="button" className="btn-custom-closer" data-bs-dismiss="modal" aria-label="Close"><i className="ri-close-fill"></i></button>
            </div>
            <div className="modal-body px-8 py-2 body_history">
              <div className="tt_item ">
                <span className="tt_disable">Status</span>
                <span className={`${modelData?.status === "SUCCESS" ? "text-success" : modelData?.status === "REJECTED" ? "text-danger" : modelData?.status === "PENDING" ? "text-warning" : modelData?.status === "CANCELLED" ? "text-warning" : ""}`} >
                  <strong>{modelData?.status}</strong>
                </span>
              </div>
              <div className="tt_data">
                <div className="tt_item">
                  <span className="tt_disable">Amount</span>
                  <span className="tt_normal"> {modelData?.amount}</span>
                </div>
                <div className="tt_item ">
                  <span className="tt_disable">Date &amp; Time</span>
                  <span className="tt_normal"> {moment(modelData?.updatedAt).format("DD/MM/YYYY  ")}
                    {moment(modelData?.updatedAt).format("hh:mm A")} </span>
                </div>
                {modelData?.description &&
                  <div className="tt_item">
                    <span className="tt_disable">Description</span>
                    <span className="tt_normal">{modelData?.description || "------"}</span>
                  </div>}
                <div className="tt_item">
                  <span className="tt_disable">Currency</span>
                  <span className="tt_normal">{modelData?.currency}</span>
                </div>
                <div className="tt_item ">
                  <span className="tt_disable">Total Transaction Fee </span>
                  <span className="tt_normal">  {modelData?.description?.includes("CV Bot") ? modelData?.cvBotfee : modelData?.fee} </span>
                </div>
                {modelData?.description?.includes("CV Bot") && <div className="tt_item">
                  <span className="tt_disable">CV Bot Id</span>
                  <span className="tt_normal">{modelData?.cvBotID || "------"}</span>
                </div>}
                <div className="tt_item">
                  <span className="tt_disable">Chain</span>
                  <span className="tt_normal">{modelData?.chain || "------"}</span>
                </div>

                <div className="tt_item">
                  <span className="tt_disable">Address</span>
                  <span className="tt_normal">{modelData?.to_address || "------"}</span>
                </div>
                <div className="tt_item">
                  <span className="tt_disable">Transaction Hash </span>
                  <span className="tt_normal">{modelData?.transaction_hash || "------"}    {modelData?.transaction_hash && <span className="btn btn-link p-0" onClick={() => { copy(modelData?.transaction_hash); alertSuccessMessage("Transaction Hash copied..!!") }}>< i className="ri-file-copy-line"></i>
                  </span>}</span>

                </div>
                <div className="tt_item">
                  <span className="tt_disable">Short Name</span>
                  <span className="tt_normal">{modelData?.short_name}</span>
                </div>
                <div className="tt_item">
                  <span className="tt_disable">Transaction Type</span>
                  <span className="tt_normal"> {modelData?.transaction_type}</span>
                </div>
                <div className="tt_item ">
                  <span className="tt_disable">Remarks</span>
                  <span className="tt_normal">Wrathcode Exchange</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer to p2p modal  */}
      <div className="modal fade" id="p2p_modal" tabIndex="-1" aria-labelledby="p2p_modalLaebl" aria-hidden="true" >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header flex-column px-8">
              <h3 className="modal-title" id="placeBitLaebl">
                Transfer Funds
              </h3>
              <button type="button" className="btn-custom-closer" data-bs-dismiss="modal" aria-label="Close">
                <i className="ri-close-fill"></i>
              </button>
            </div>
            <div className="modal-body px-8 py-4">
              <>
                <div className="form-group mb-4">
                  <input className="form-control" type="text" value={selectedCurrency} disabled />
                </div>
                <div className="form-group mb-4">
                  <input className="form-control" type="number" name="amount_val" value={withdrawAmount} placeholder="Amount" onChange={(e) => setWithdrawAmount(e.target.value)} onWheel={(e) => e.target.blur()} />
                </div>
                <div className="form-group mb-4">
                  <button type="button" className="btn btn-gradient btn-small w-100 justify-content-center" disabled={!withdrawAmount} onClick={() => transferHandler(selectedCurrency, withdrawAmount)}>
                    <span>Transfer</span>
                  </button>
                </div>
              </>

            </div>
          </div>
        </div>
      </div>

      {/* Transfer to spot modal  */}
      <div className="modal fade" id="spot_modal" tabIndex="-1" aria-labelledby="spot_modalLaebl" aria-hidden="true" >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header flex-column px-8">
              <h3 className="modal-title" id="placeBitLaebl">
                Transfer Funds To Spot
              </h3>
              <button type="button" className="btn-custom-closer" data-bs-dismiss="modal" aria-label="Close">
                <i className="ri-close-fill"></i>
              </button>
            </div>
            <div className="modal-body px-8 py-4">

              <>
                <div className="form-group mb-4">
                  <input className="form-control" type="text" value={selectedCurrency} disabled />
                </div>
                <div className="form-group mb-4">
                  <input className="form-control" type="number" name="amount_val" value={withdrawAmount} placeholder="Amount" onChange={(e) => setWithdrawAmount(e.target.value)} onWheel={(e) => e.target.blur()} />
                </div>
                <div className="form-group mb-4">
                  <button type="button" className="btn btn-gradient btn-small w-100 justify-content-center" onClick={() => transferHandlerToSpot(selectedCurrency, withdrawAmount)} disabled={!withdrawAmount}>
                    <span>Transfer</span>
                  </button>
                </div>
              </>

            </div>
          </div>
        </div>
      </div>

      {/* Cv Bot Wallet details  */}
      <div className="modal fade cnbt_modal" id="cv_bot_detail_modal" tabIndex="-1" aria-labelledby="cv_bot_detail_modalLaebl" aria-hidden="true" >
        <div className="modal-dialog modal-dialog-centered modal-md modal-lg">
          <div className="modal-content">
            <button type="button" className="btn-custom-closer" data-bs-dismiss="modal" aria-label="Close">
              <i className="ri-close-fill"></i>
            </button>
            <div className="modal-body px-8 py-4">
              <div className="bt_row" >
                <div className="bt_left" >
                  <h4> Connect CV BOT </h4>
                  <p>A fee of 2 USDT will be deducted to connect the CV Bot and enable fund transfers</p>
                  <div className="bt_card" >
                    <div className="form-group mb-3">
                      <input className="form-control" type="text" placeholder="Enter CV Bot Id" disabled={props?.userDetails?.cv_bot_id} value={cvBotId} onChange={(e) => setCvBotId(e.target.value)} />

                    </div>
                    <div className="form-group mb-2">
                      {usdtBalance < 2 ?
                        <button type="button" className="btn btn-gradient btn-small w-100 justify-content-center" onClick={() => handleDepositDetails(usdtCurrData)} data-bs-dismiss="modal"  >
                          <span>Insufficient USDT</span>
                        </button> :
                        <button type="button" className="btn btn-gradient btn-small w-100 justify-content-center" onClick={() => handleCvBotDetails(cvBotId)} disabled={!cvBotId || usdtBalance < 2}>
                          <span>{usdtBalance < 2 ? "Insufficient USDT for fee" : props?.userDetails?.cv_bot_id ? "Next" : "Connect"} <i className="ri-rocket-fill rotate-45"></i></span>
                        </button>}
                    </div>
                  </div>
                  <small className="text-danger">Note: Please note that CV Bot ID can be connected only once, after which it will be permanently locked.</small>
                </div>
                <div className="bt_right" >
                  <img src="/images/bot_modal.svg" alt="" className="img-fluid" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Cv Bot Wallet Transfer details  */}
      <div className="modal fade" id="cv_bot_transfer_modal" tabIndex="-1" aria-labelledby="cv_bot_transfer_modalLaebl" aria-hidden="true" >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header flex-column px-8">
              <h3 className="modal-title" id="placeBitLaebl">
                Transfer CV Bot Funds
              </h3>
              <button type="button" className="btn-custom-closer" data-bs-dismiss="modal" aria-label="Close">
                <i className="ri-close-fill"></i>
              </button>
            </div>
            <div className="modal-body px-8 py-4">

              <>
                <div className="form-group mb-4">
                  <label for="CVTBal">Available Balance</label>
                  <input disabled className="form-control" id="CVTBal" type="number" name="amount_val" value={cvBotBal} placeholder="Available Balance" />
                </div>


                <div className="form-group mb-4">
                  <button type="button" className="btn btn-gradient btn-small w-100 justify-content-center" onClick={() => depositCvbotFunds(cvBotId)} disabled={cvBotBal <= 0}>
                    <span>Transfer funds</span>
                  </button>
                </div>
                <small className="text-danger">Note: A fee of 2 USDT will be deducted to connect the CV Bot and enable fund transfers.<br /> Please note that CV Bot ID can be connected only once, after which it will be permanently locked.</small>
              </>

            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default FundPage;
