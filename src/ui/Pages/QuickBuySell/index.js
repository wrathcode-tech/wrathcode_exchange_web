import React, { useContext, useEffect, useState } from "react";
import Select from 'react-select'
import { ProfileContext } from "../../../context/ProfileProvider";
import { SocketContext } from "../../../customComponents/SocketContext";
import { alertErrorMessage, alertSuccessMessage } from "../../../customComponents/CustomAlertMessage";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import AuthService from "../../../api/services/AuthService";
import { ApiConfig } from "../../../api/apiConfig/apiConfig";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
const BuySell = () => {
    const { userDetails } = useContext(ProfileContext);
    const [socketData, setSocketData] = useState([]);
    const [currency, setCurrency] = useState("");
    const [currencyPrice, setCurrencyPrice] = useState("");
    const [payAmount, setPayAmount] = useState(0);
    const [secondPriceName, setSecondPriceName] = useState('');
    const [getCurrency, setGetCurrency] = useState('');
    const [AllData, setAllData] = useState([]);
    const [selectedCurrImg, setSelectedCurrImg] = useState();
    const { socket } = useContext(SocketContext);
    const token = sessionStorage.getItem('token');
    const toFixed = (value) => parseFloat(value?.toFixed(6))


    const handleChange = (selectedOption) => {
        setCurrency(selectedOption.value.split("/")[0]);
        setSelectedCurrImg(selectedOption.image);
        setCurrencyPrice(selectedOption.price);
        setSecondPriceName(selectedOption.secondPrice)
    };

    useEffect(() => {
        let interval;
        if (socket) {
            let payload = {
                'message': 'market',
            }
            interval = setInterval(() => {
                let payload = {
                    'message': 'market',
                }
                socket.emit('message', payload);
            }, 2000)

            socket.emit('message', payload);
            socket.on('message', (data) => {
                let filteredData = data?.pairs?.filter((item) => item?.base_currency !== "CVT" && item?.quote_currency !== "CVT");
                if (filteredData?.length > 0) {
                    setAllData(filteredData)

                }
            });

        }
        return (() => {
            clearInterval(interval)
        })

    }, [socket]);

    useEffect(() => {
        if (AllData?.length > 0) {
            let sortedData = AllData;
            if (currency && currencyPrice) {
                sortedData = [...AllData].sort((a, b) => {
                    if (a.base_currency === currency && a.quote_currency === secondPriceName) return -1;
                    return 0;
                });
            }
            setSocketData(sortedData);
            setSelectedCurrImg(sortedData[0]?.icon_path)
            setCurrency(sortedData[0]?.base_currency);
            setCurrencyPrice(sortedData[0]?.buy_price);
            setSecondPriceName(sortedData[0]?.quote_currency);
        }
    }, [AllData]);


    const handleBuySell = async (currency, secondPriceName, side, payAmount, getCurrency) => {
        if (!payAmount) {
            alertErrorMessage('Please Enter Amount');
            return;
        } else if (payAmount <= 0) {
            alertErrorMessage('Amount must be greater then 0');
            return;
        } else if (getCurrency <= 0) {
            alertErrorMessage('Amount must be greater then 0');
            return;
        } else if (!currency) {
            alertErrorMessage('Please choose currency');
            return;
        } else if (!secondPriceName) {
            alertErrorMessage('Please choose currency');
            return;
        }
        try {
            LoaderHelper.loaderStatus(true);
            const result = await AuthService.swapToken(currency, secondPriceName, side, +payAmount, +getCurrency);
            if (result?.success) {
                alertSuccessMessage(result?.message);
                setPayAmount(0);
            }
            else {
                alertErrorMessage(result?.message || "Something went wrong... Please try again later")
            }
        } catch (error) {
            alertErrorMessage(error.message);
        } finally { LoaderHelper.loaderStatus(false); }
    };



    return (
        <>
            <Helmet>
                <title> Wrathcode | The world class new generation crypto asset exchange</title>
            </Helmet>
            <section className="buy_banner" >
            </section>
            <section className="buy_page mt-5  hero-1" >
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-8 col-lg-6 col-12 mx-auto ">
                            <form className="custom-form  card_qbs  ticket-form mb-5 mb-lg-0" >
                                <div className="ticket-header login-header">
                                    <ul className="nav nav-pills login-pills login-pillss" id="pills-tab" role="tablist">
                                        <li className="nav-item" role="presentation">
                                            <button className="nav-link active nav_success" id="pills-Buy-tab"
                                                data-bs-toggle="pill" data-bs-target="#pills-Buy" type="button"
                                                role="tab" aria-controls="pills-Buy" aria-selected="true" onClick={() => { setPayAmount(0); }}>
                                                <span>Buy</span>
                                            </button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button className="nav-link nav_danger" id="pills-Sell-tab"
                                                data-bs-toggle="pill" data-bs-target="#pills-Sell" type="button"
                                                role="tab" aria-controls="pills-Sell" aria-selected="false" onClick={() => { setPayAmount(0); }}>
                                                <span>Sell</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                                <div className="tab-content" id="pills-tabContent">
                                    <div className="tab-pane show active" id="pills-Buy" role="tabpanel"
                                        aria-labelledby="pills-Buy-tab">
                                        <div className="card-body ">
                                            <div className="swap_form form-group mb-3">
                                                <div className="mb-1 fornewlabel" >Choose Cryptocurrency</div>

                                                <Select

                                                    className="custom-select-container"
                                                    classNamePrefix="custom-select"
                                                    options={socketData.map(item => ({
                                                        value: `${item.base_currency}/${item.quote_currency}`,
                                                        image: item.icon_path,
                                                        label: <><div className="d-flex"> <img alt="" src={ApiConfig?.baseImage + item?.icon_path} width="20" height="20" />
                                                            <span className="mx-2"> {item.base_currency} / {item.quote_currency}</span></div></>,
                                                        price: item.buy_price,
                                                        secondPrice: item.quote_currency
                                                    }))}
                                                    onChange={handleChange}
                                                    value={{
                                                        value: `${currency}/${secondPriceName}`,
                                                        label: selectedCurrImg ? <><img alt="" src={ApiConfig?.baseImage + selectedCurrImg} width="20" height="20" />
                                                            <span> {currency} </span></> : <div className="spinner-border text-light text-center" role="status">
                                                            <span className="visually-hidden">Loading...</span></div>
                                                    }}
                                                    styles={{
                                                        singleValue: !selectedCurrImg ? (provided) => ({
                                                            ...provided,
                                                            display: 'block',
                                                            textAlign: "center"
                                                        }) : "",
                                                    }}
                                                />
                                            </div>

                                            <div className="balance-libra card-success mb-4 d-flex justify-content-between">
                                                <div className="token-img-bg_right " id="lc-data">
                                                    <div>
                                                        Price:- <b>1 {currency} = {" "}
                                                            {" "} {currencyPrice} {secondPriceName}</b></div>

                                                </div>
                                                <div className="token-img-bg_right " id="lc-data">
                                                    Fee:- <b>0.2%</b>
                                                </div>
                                            </div>
                                            <div className="field-box mb-2">
                                                <label className="form-label" htmlFor="buypayamount"> Pay Amount </label>
                                                <div className=" field-otp-box">
                                                    <input className="form-control" type="number" name="amount" id="buypayamount" value={payAmount} onWheel={(e) => e.target.blur()} onChange={(e) => { setPayAmount(e.target.value); setGetCurrency(toFixed(e.target.value / currencyPrice)) }} />
                                                    <button className="btn btn-xs  custom-btn btn-muted">{secondPriceName}</button >
                                                </div>
                                            </div>
                                            <div className="py-4 d-flex justify-contennt-center text-center">
                                                <img alt="" src={ApiConfig?.baseImage + selectedCurrImg} width="25" height="25" className=" mx-auto " />
                                            </div>

                                            <div className="field-box mb-5">
                                                <label className="form-label" htmlFor="buycurrency"> Currency You Get </label>
                                                <div className="field-otp-box">
                                                    <input className="form-control" type="text" name="amount" id="buycurrency" value={toFixed(payAmount / currencyPrice)} disabled />
                                                    <button className="btn btn-xs  custom-btn btn-muted">{currency}</button >
                                                </div>
                                            </div>
                                            <div className="col-lg-12 col-md-10 col-12 mx-auto">
                                                <button type="button" className="btn btn-success w-100 justify-content-center btn-medium" disabled>
                                                  Coming Soon
                                                </button>
                                                {/* {token ? userDetails?.kycVerified != 2 ? <Link to='/user_profile/user_kyc' className="btn btn-primary w-100 justify-content-center btn-medium" >
                                                    Verify KYC
                                                </Link> :
                                                    <button type="button" className="btn btn-success w-100 justify-content-center btn-medium" onClick={() => handleBuySell(currency, secondPriceName, "BUY", payAmount, getCurrency)}>
                                                        Buy {currency}
                                                    </button>
                                                    : <Link to='/login' className="btn custom-btn btn-primary justify-content-center w-100 my-1 my-md-0" >
                                                        Log In/Sign Up
                                                    </Link>} */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tab-pane" id="pills-Sell" role="tabpanel"
                                        aria-labelledby="pills-Sell-tab">

                                        <div className="card-body ">
                                            <div className="swap_form form-group mb-3">

                                                <div className="mb-1 fornewlabel" >Choose Cryptocurrency</div>
                                                <Select
                                                    className="custom-select-container"
                                                    classNamePrefix="custom-select"
                                                    options={socketData.map(item => ({
                                                        value: `${item.base_currency}/${item.quote_currency}`,
                                                        image: item.icon_path,
                                                        label: <><div className="d-flex"> <img alt="" src={ApiConfig?.baseImage + item?.icon_path} width="20" height="20" />
                                                            <span className="mx-2"> {item.base_currency} / {item.quote_currency}</span></div></>,
                                                        price: item.buy_price,
                                                        secondPrice: item.quote_currency,
                                                    }))}
                                                    onChange={handleChange}
                                                    value={{
                                                        value: `${currency}/${secondPriceName}`,
                                                        label: selectedCurrImg ? <><img alt="" src={ApiConfig?.baseImage + selectedCurrImg} width="20" height="20" />
                                                            <span> {currency} </span></> : <div className="spinner-border text-light text-center" role="status">
                                                            <span className="visually-hidden">Loading...</span></div>
                                                    }}
                                                    styles={{
                                                        singleValue: !selectedCurrImg ? (provided) => ({
                                                            ...provided,
                                                            display: 'block',
                                                            textAlign: "center"
                                                        }) : "",
                                                    }}

                                                />
                                            </div>

                                            <div className="balance-libra card-success mb-4 d-flex justify-content-between">
                                                <div className="token-img-bg_right " id="lc-data">
                                                    <div>
                                                        Price:- <b>1 {currency} = {" "}
                                                            {" "} {currencyPrice} {secondPriceName}</b></div>

                                                </div>
                                                <div className="token-img-bg_right " id="lc-data">
                                                    Fee:- <b>0.2%</b>
                                                </div>
                                            </div>

                                            <div className="swap_form form-group mb-2">
                                                <label className="form-label" htmlFor="payamount"> Pay Amount </label>
                                                <div className=" field-otp-box">
                                                    <input className="form-control" type="number" name="amount" id="payamount" value={payAmount} onChange={(e) => {
                                                        setPayAmount(e.target.value);
                                                        setGetCurrency(toFixed(e.target.value * currencyPrice))
                                                    }} onWheel={(e) => e.target.blur()} />
                                                    <button className="btn btn-xs  custom-btn btn-muted">{currency}</button >
                                                </div>
                                            </div>

                                            <div className="py-4 d-flex justify-contennt-center text-center">
                                                <img alt="" src={ApiConfig?.baseImage + selectedCurrImg} width="25" height="25" className=" mx-auto " />
                                            </div>

                                            <div className="swap_form form-group mb-5">
                                                <label className="form-label" htmlFor="currencyget"> Currency You Get </label>
                                                <div className="field-otp-box">
                                                    <input className="form-control" type="text" name="amount" id="currencyget" value={toFixed(payAmount * currencyPrice)} disabled />
                                                    <button className="btn btn-xs  custom-btn btn-muted">{secondPriceName}</button >
                                                </div>
                                            </div>
                                            <div className="col-lg-12 col-md-10 col-12 mx-auto">
                                            <button type="button" className="btn btn-success w-100 justify-content-center btn-medium" disabled>
                                                  Coming Soon
                                                </button>
                                                {/* {token ? userDetails?.kycVerified != 2 ? <Link to='/user_profile/user_kyc' className="btn btn-primary w-100 justify-content-center btn-medium" >
                                                    Verify KYC
                                                </Link> : <button type="button" className="btn btn-danger w-100 justify-content-center btn-medium" onClick={() => handleBuySell(currency, secondPriceName, 'SELL', payAmount, getCurrency)}>
                                                    Sell {currency}
                                                </button>
                                                    : <Link to='/login' className="btn custom-btn btn-primary justify-content-center w-100 my-1 my-md-0" >
                                                        Log In/Sign Up
                                                    </Link>} */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default BuySell
