import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import LoaderHelper from '../../../customComponents/Loading/LoaderHelper';
import AuthService from '../../../api/services/AuthService';
import { alertErrorMessage, alertSuccessMessage } from '../../../customComponents/CustomAlertMessage';
import { ApiConfig } from '../../../api/apiConfig/apiConfig';
import { SocketContext } from '../../../customComponents/SocketContext';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

function ClassicOptions() {
    const userId = sessionStorage.getItem('userId');
    const { contractSymbol } = useParams();

    const { socket } = useContext(SocketContext);
    const socketRef = useRef(null);
    const currentSymbolRef = useRef(null);
    const pendingSubscriptionRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const navigate = useNavigate()
    const [wsConnected, setWsConnected] = useState(false);

    const orderBookColor = { buy: "#1c2a2b", sell: "#301e27" }
    const [optionsPairs, setOptionsPairs] = useState([]);
    const [balance, setBalance] = useState(0);
    const [availableExpiryDates, setavailableExpiryDates] = useState([]);
    const [selectedPair, setSelectedPair] = useState({});
    const [contractList, setContractList] = useState([]);
    const [selectedContract, setSelectedContract] = useState({});
    const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
    const [isMobileViewActive, setIsMobileViewActive] = useState(false);
    const [fees, setFees] = useState({});
    const [openOrder, setOpenOrder] = useState([]);
    const [openPositions, setOpenPositions] = useState([]);
    const [orderHistory, setOrderHistory] = useState([]);
    const [positionInput, setPositionInput] = useState({});
    const [exerciseHistory, setExerciseHistory] = useState([]);


    const [price, setPrice] = useState(0);
    const [quantity, setQuantity] = useState("");
    const [Side, setSide] = useState("BUY");

    const [timeLeft, setTimeLeft] = useState("");

    const hanldeGetPairs = async () => {
        try {
            const result = await AuthService.optionPairs()
            if (result?.success) {
                setOptionsPairs(result?.data);
                const getFirstData = `${result?.data[0]?.base_currency}${result?.data[0]?.quote_currency}`
                setSelectedPair((curValue) => ({ ...curValue, ...result?.data[0] }))
                await getExpiryDates(getFirstData)
            }
        } catch (error) {
            console.log(error?.message);
        } finally {
        }

    };

    const handleplaceOrder = async () => {
        try {
            // 🌀 Prevent duplicate requests

            LoaderHelper.loaderStatus(true);

            // --- Validate selected contract ---
            if (!selectedContract) {
                return alertErrorMessage("Please select an option contract before placing an order.");
            }

            const { symbol, tickSize, minQty, maxQty } = selectedContract;

            if (!symbol) {
                return alertErrorMessage("Invalid contract. Please refresh the page and try again.");
            }

            // --- Validate Side ---
            if (!Side || !["BUY", "SELL"].includes(Side.toUpperCase())) {
                return alertErrorMessage("Invalid order side. Please select BUY or SELL.");
            }

            // --- Validate Price ---
            if (!price || isNaN(price) || Number(price) <= 0) {
                return alertErrorMessage("Please enter a valid price greater than 0.");
            }

            // --- Validate Quantity ---
            if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
                return alertErrorMessage("Please enter a valid quantity greater than 0.");
            }

            // --- Enforce minQty and maxQty from contract ---
            const numQty = Number(quantity);
            const min = Number(minQty) || 0;
            const max = Number(maxQty) || Infinity;

            if (numQty < min) {
                return alertErrorMessage(`Minimum order quantity is ${min}. Please increase your quantity.`);
            }

            if (numQty > max) {
                return alertErrorMessage(`Maximum order quantity is ${max}. Please reduce your quantity.`);
            }

            // --- Validate Tick Size ---
            if (tickSize && Number(tickSize) > 0) {
                const validStep = Number(tickSize);
                const remainder = (Number(price) / validStep) % 1;

                if (remainder !== 0) {
                    const nearestValid = Math.round(Number(price) / validStep) * validStep;
                    return alertErrorMessage(
                        `Invalid price step. Price must be in multiples of ${validStep}. Try ${nearestValid.toFixed(2)} instead.`
                    );
                }
            }


            // --- Execute API call ---
            const result = await AuthService.placeOptionOrder(
                symbol,
                Side,
                Number(price),
                Number(quantity)
            );

            // --- Handle result ---
            if (result?.success) {
                alertSuccessMessage(result?.message || "Your order has been placed successfully!");
            } else {
                alertErrorMessage(result?.message || "Failed to place order. Please try again later.");
            }
        } catch (error) {
            console.error("⚠️ handlePlaceOrder error:", error);

            // --- Graceful error display ---
            const msg =
                error?.response?.data?.message ||
                error?.message ||
                "Unexpected error occurred while placing the order. Please try again.";
            alertErrorMessage(msg);
        } finally {
            LoaderHelper.loaderStatus(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {
            // 🧩 Basic validation
            if (!orderId) {
                return alertErrorMessage("Invalid order. Please try again.");
            }

            // 🌀 Prevent duplicate requests
            if (LoaderHelper.loaderStatusValue) return;

            LoaderHelper.loaderStatus(true);

            // --- Execute API call ---
            const result = await AuthService.cancelOptionOrder(orderId);

            // --- Handle result ---
            if (result?.success) {
                const msg =
                    result?.message ||
                    "Order cancelled successfully. Unfilled amount has been refunded.";
                alertSuccessMessage(msg);

            } else {
                const msg =
                    result?.message ||
                    "Failed to cancel the order. Please try again later.";
                alertErrorMessage(msg);
            }
        } catch (error) {
            console.error("⚠️ handleCancelOrder error:", error);

            // --- Graceful error display ---
            const msg =
                error?.response?.data?.message ||
                error?.message ||
                "Unexpected error occurred while cancelling the order. Please try again.";
            alertErrorMessage(msg);
        } finally {
            LoaderHelper.loaderStatus(false);
        }
    };

    const updatePositionInput = (id, field, value) => {
        setPositionInput(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));
    };


    const handleClosePosition = async (pos) => {
        try {
            LoaderHelper.loaderStatus(true);

            // ------------------------------
            // 1️⃣ SET SIDE BASED ON POSITION
            // ------------------------------
            const closeSide = "SELL";

            // ------------------------------
            // 2️⃣ INPUT VALUES (with fallback)
            // ------------------------------
            const priceInput = positionInput[pos._id]?.price;
            const sizeInput = positionInput[pos._id]?.size;

            const price = Number(priceInput ?? pos.entryPrice);
            const quantity = Number(sizeInput ?? pos.quantity);

            // ------------------------------
            // 3️⃣ VALIDATE PRICE
            // ------------------------------
            if (!price || isNaN(price) || price <= 0)
                return alertErrorMessage("Please enter a valid price greater than 0.");

            // ------------------------------
            // 4️⃣ VALIDATE SIZE 
            // ------------------------------
            if (!quantity || isNaN(quantity) || quantity <= 0)
                return alertErrorMessage("Please enter a valid size greater than 0.");

            if (quantity > Number(pos.quantity))
                return alertErrorMessage("Close size cannot be greater than your open position size.");

            // ------------------------------
            // 5️⃣ MATCH CONTRACT (for tickSize)
            // ------------------------------
            const matchedContract = contractList?.find(
                (item) =>
                    item?.call?.symbol === pos.symbol ||
                    item?.put?.symbol === pos.symbol
            );

            if (!matchedContract)
                return alertErrorMessage("Unable to match contract details.");

            const contract =
                matchedContract?.call?.symbol === pos.symbol
                    ? matchedContract.call
                    : matchedContract.put;

            const { tickSize } = contract;

            // ------------------------------
            // 6️⃣ VALIDATE TICK SIZE
            // ------------------------------
            if (tickSize && Number(tickSize) > 0) {
                const step = Number(tickSize);
                const remainder = (price / step) % 1;

                if (remainder !== 0) {
                    const nearestValid = Math.round(price / step) * step;
                    return alertErrorMessage(
                        `Invalid price step. Must be in multiples of ${step}. Try ${nearestValid.toFixed(4)}.`
                    );
                }
            }

            // ------------------------------
            // 7️⃣ EXECUTE API CALL (SELL ORDER)
            // ------------------------------
            const result = await AuthService.placeOptionOrder(
                pos.symbol,
                closeSide,
                price,
                quantity
            );

            // ------------------------------
            // 8️⃣ Handle Response
            // ------------------------------
            if (result?.success) {
                alertSuccessMessage(result?.message || "Position close order placed successfully!");
            } else {
                alertErrorMessage(result?.message || "Failed to close position.");
            }

        } catch (err) {
            console.error("⚠️ handleClosePosition error:", err);

            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Unexpected error occurred while closing the position.";

            alertErrorMessage(msg);
        } finally {
            LoaderHelper.loaderStatus(false);
        }
    };



    const getExpiryDates = async (underlying) => {
        try {
            const result = await AuthService.contractDates(underlying)
            if (result?.success) {
                setavailableExpiryDates(result?.expiries);
                setSelectedPair((curValue) => ({ ...curValue, selectedExpiry: result?.expiries[0]?.expiryDate, selectedExpiryTimestamp: Number(result?.expiries[0]?.expiryTimestamp || 0), }))
            }
        } catch (error) {
            console.log(error?.message);
        } finally {
        }

    };

    const handleSelectPair = async (item) => {
        if (item?.base_currency === selectedPair?.base_currency) return;
        setSelectedPair(item);
        const underlying = `${item?.base_currency}${item?.quote_currency}`;
        await getExpiryDates(underlying);
        setContractList([]);
        setSelectedContract({});
    };

    const handleSelectExpiry = async (expiry) => {
        if (expiry?.expiryDate === selectedPair?.selectedExpiry) return;
        setSelectedPair((curValue) => ({ ...curValue, selectedExpiry: expiry?.expiryDate, selectedExpiryTimestamp: Number(expiry?.expiryTimestamp || 0), }));
        setContractList([]);
        setSelectedContract({})
    };

    function calcOrderFee(optionPrice = 0, indexPrice = 0, quantity = 1) {
        try {
            console.log(optionPrice, indexPrice, quantity, "qqqq");

            // ✅ Input validation
            if (
                typeof optionPrice !== "number" ||
                typeof indexPrice !== "number" ||
                typeof quantity !== "number" ||
                optionPrice <= 0 ||
                indexPrice <= 0 ||
                quantity <= 0
            ) {
                console.warn("⚠️ Invalid parameters passed to calcOrderFee()");
                return 0;
            }

            // ✅ Compute both fee bases
            const feeBasedOnIndex = (fees?.transactionFee / 100) * indexPrice * fees?.CONTRACT_UNIT;
            const feeCap = fees?.FEE_CAP_RATE * optionPrice;

            // ✅ Apply Binance fee rule (minimum)
            const perContractFee = Math.min(feeBasedOnIndex, feeCap);

            // ✅ Total fee for all contracts
            const totalFee = perContractFee * quantity;

            // ✅ Return clean rounded number
            return Number(totalFee.toFixed(5));
        } catch (error) {
            console.error("❌ Error calculating order fee:", error);
            return 0;
        }
    };

    const finalCost = calcOrderFee(Number(price), Number(selectedPair?.buy_price), Number(quantity)) + (price * quantity)
    console.log(calcOrderFee(price, selectedPair?.buy_price, quantity), "feeeeee");


    const handleSelecteContract = async (contract) => {
        if (contract?.symbol === selectedContract?.symbol) return
        setSelectedContract(contract)
        setPrice(contract?.lastPrice)

        if (!contract?.symbol) return;
        navigate(`/options/${contract?.symbol}`);
        
        // Clear order book when switching contracts
        setOrderBook({ bids: [], asks: [] });

        // Check if WebSocket is connected and ready
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            // Store pending subscription to be executed when connected
            pendingSubscriptionRef.current = contract.symbol;
            console.log("⏳ WebSocket not ready, queuing subscription for:", contract.symbol);
            return;
        }

        // Unsubscribe previous
        if (currentSymbolRef.current) {
            socketRef.current.send(
                JSON.stringify({
                    method: "UNSUBSCRIBE",
                    params: [`${currentSymbolRef.current}@depth50@1000ms`],
                    id: 1,
                })
            );
        }

        // Subscribe new
        socketRef.current.send(
            JSON.stringify({
                method: "SUBSCRIBE",
                params: [`${contract.symbol}@depth50@1000ms`],
                id: 2,
            })
        );

        currentSymbolRef.current = contract.symbol;
    };

    const connectWebSocket = useCallback(() => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            return; // Already connected
        }

        const ws = new WebSocket("wss://nbstream.binance.com/eoptions/ws");
        socketRef.current = ws;

        ws.onopen = () => {
            console.log("✅ Connected to Binance Options stream");
            setWsConnected(true);
            
            // Subscribe to pending symbol if any
            if (pendingSubscriptionRef.current) {
                ws.send(
                    JSON.stringify({
                        method: "SUBSCRIBE",
                        params: [`${pendingSubscriptionRef.current}@depth50@1000ms`],
                        id: 2,
                    })
                );
                currentSymbolRef.current = pendingSubscriptionRef.current;
                pendingSubscriptionRef.current = null;
            }
        };

        ws.onclose = () => {
            console.log("❌ Disconnected from Binance stream");
            setWsConnected(false);
            
            // Auto-reconnect after 3 seconds
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            reconnectTimeoutRef.current = setTimeout(() => {
                console.log("🔄 Attempting to reconnect...");
                connectWebSocket();
            }, 3000);
        };

        ws.onerror = (err) => {
            console.error("⚠️ Binance WebSocket Error:", err);
            setWsConnected(false);
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);

                if (msg?.b || msg?.a) {
                    const bids = (msg?.b || []).map(([price, size]) => ({
                        price: parseFloat(price),
                        size: parseFloat(size),
                    }));

                    const asks = (msg?.a || []).map(([price, size]) => ({
                        price: parseFloat(price),
                        size: parseFloat(size),
                    }));

                    setOrderBook({
                        bids: bids?.slice(0, 20)?.reverse(), // top 20 levels
                        asks: asks?.slice(0, 20),
                    });
                }

            } catch (err) {
                console.error("Parse error:", err);
            }
        };
    }, []);

    useEffect(() => {
        connectWebSocket();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [connectWebSocket]);

    // Handle pending subscriptions when WebSocket connects/reconnects
    useEffect(() => {
        if (!wsConnected || socketRef.current?.readyState !== WebSocket.OPEN) return;

        const symbolToSubscribe = pendingSubscriptionRef.current || currentSymbolRef.current;
        
        if (symbolToSubscribe) {
            console.log("✅ WebSocket connected, subscribing to:", symbolToSubscribe);
            
            try {
                socketRef.current.send(
                    JSON.stringify({
                        method: "SUBSCRIBE",
                        params: [`${symbolToSubscribe}@depth50@1000ms`],
                        id: 2,
                    })
                );
                currentSymbolRef.current = symbolToSubscribe;
                pendingSubscriptionRef.current = null;
            } catch (err) {
                console.error("Error subscribing:", err);
            }
        }
    }, [wsConnected]);

    // Cleanup subscription on unmount
    useEffect(() => {
        return () => {
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && currentSymbolRef.current) {
                try {
                    socketRef.current.send(
                        JSON.stringify({
                            method: "UNSUBSCRIBE",
                            params: [`${currentSymbolRef.current}@depth50@1000ms`],
                            id: 3,
                        })
                    );
                } catch (err) {
                    console.error("Error unsubscribing on unmount:", err);
                }
            }
        };
    }, []);

    const formatNumber = (data, decimal = 1) => {
        // Try to convert strings like "22" or "22.567" into numbers
        const num = typeof data === "string" ? Number(data) : data;

        // Check if it's a valid number (not NaN, not undefined/null)
        if (typeof num === "number" && !isNaN(num)) {
            return (parseFloat(num.toFixed(decimal)));
        }

        return "0.00"; // "0.00"
    };

    const formattedDate = selectedPair?.selectedExpiry ? new Date(selectedPair?.selectedExpiry).toISOString().split("T")[0] : "---";

    async function handleContractExpired(underlying) {
        Swal.fire({
            title: "Contract Expired!",
            text: "Contract has expired. Please refresh expiry dates to continue.",
            icon: "warning",
            showCancelButton: false, // ❌ user must confirm
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Refresh Now",
            allowOutsideClick: false, // ❌ can't close without confirming
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Refreshing...",
                    text: "Fetching updated expiry dates...",
                    didOpen: async () => {
                        Swal.showLoading();
                        await getExpiryDates(underlying);
                        Swal.close();
                        Swal.fire({
                            title: "Updated!",
                            text: "Expiry dates refreshed successfully.",
                            icon: "success",
                            timer: 1500,
                            showConfirmButton: false,
                        });
                    },
                });
            }
        });
    };

    useEffect(() => {
        if (!selectedPair?.selectedExpiryTimestamp) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = selectedPair.selectedExpiryTimestamp - now;

            if (diff <= 0) {
                setTimeLeft("Expired");
                clearInterval(interval);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            // ✅ Display format
            if (diff < 24 * 60 * 60 * 1000) {
                // less than 24 hours → show HH:MM:SS
                setTimeLeft(
                    `${hours.toString().padStart(2, "0")}:${minutes
                        .toString()
                        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
                );
            } else {
                // more than 24 hours → show "X days Y hours"
                setTimeLeft(
                    `${days} day${days !== 1 ? "s" : ""} ${hours} hour${hours !== 1 ? "s" : ""}`
                );
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [selectedPair?.selectedExpiryTimestamp]);


    useEffect(() => {
        if (!socket || !selectedPair?.base_currency || !selectedPair?.selectedExpiry) return;

        const payload = {
            underlying: `${selectedPair.base_currency}${selectedPair.quote_currency}`,
            expiry: selectedPair.selectedExpiry,
            userId: userId,
        };

        socket.emit("subscribe", payload);

        socket.on("options:update", (data) => {
            setContractList(data?.data);
            setOptionsPairs(data?.pairs);
            setBalance(data?.balance);
            setFees(data?.fees);
            setOpenOrder(data?.openOrder);
            setOpenPositions(data?.openPositions);
            setOrderHistory(data?.orderhistory);
            setExerciseHistory(data?.exerciseHistory);
        });
        let showRefreshModal = true;
        socket.on("options:contract:event", (data) => {
            if (data?.event === "EXPIRED") {
                if (showRefreshModal) {
                    const underlying = `${selectedPair.base_currency}${selectedPair.quote_currency}`;
                    handleContractExpired(underlying);
                    showRefreshModal = false
                }

            }
        });

        // ✅ Cleanup only when component unmounts
        return () => {
            console.log("🔴 Page unmounted → unsubscribing socket...");
            socket.emit("unsubscribe");
            socket.off("options:update");
            socket.off("options:contract:event");
        };

        // ✅ Run only once per selected expiry
        // (won’t rerun unnecessarily)
    }, [socket, selectedPair?.base_currency, selectedPair?.selectedExpiry]);


    useEffect(() => {
        if (optionsPairs?.length > 0) {
            const filteredData = optionsPairs?.filter((item) => item?.base_currency === selectedPair?.base_currency)[0];
            setSelectedPair((currVal) => ({ ...currVal, ...filteredData }))
        }
    }, [optionsPairs]);


    useEffect(() => {
        if (contractList?.length > 0 && Object.keys(selectedContract)?.length === 0) {
            let contract = {}
            if (contractSymbol) {
                const filteredData = contractList?.filter((item) => item?.call?.symbol === contractSymbol || item?.put?.symbol === contractSymbol)[0]

                if (filteredData) {
                    contract =
                        filteredData.call?.symbol === contractSymbol
                            ? filteredData.call
                            : filteredData.put;
                } else {
                    contract = contractList[0]?.call || {}
                }
            } else {
                contract = contractList[0]?.call || {}
            }

            setSelectedContract(contract)
            setPrice(contract?.lastPrice)
            navigate(`/options/${contract?.symbol}`);
            
            if (!contract?.symbol) return;

            // Check if WebSocket is connected and ready
            if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
                // Store pending subscription to be executed when connected
                pendingSubscriptionRef.current = contract.symbol;
                console.log("⏳ WebSocket not ready on initial load, queuing subscription for:", contract.symbol);
                return;
            }

            // Unsubscribe previous
            if (currentSymbolRef.current) {
                setOrderBook({ bids: [], asks: [] })
                socketRef.current.send(
                    JSON.stringify({
                        method: "UNSUBSCRIBE",
                        params: [`${currentSymbolRef.current}@depth50@1000ms`],
                        id: 1,
                    })
                );
            }

            // Subscribe new
            socketRef.current.send(
                JSON.stringify({
                    method: "SUBSCRIBE",
                    params: [`${contract.symbol}@depth50@1000ms`],
                    id: 2,
                })
            );

            currentSymbolRef.current = contract.symbol;

        }
    }, [contractList, wsConnected]);


    useEffect(() => {
        hanldeGetPairs();
    }, []);



    const maxBuyVolume = Math.max(...orderBook?.bids.map(order => order.size), 1);
    const maxSellVolume = Math.max(...orderBook?.asks.map(order => order.size), 1);



    const handleShowMobileView = () => {
        setIsMobileViewActive(true);
    };

    // 🔴 Close mobile view
    const handleCloseMobileView = () => {
        setIsMobileViewActive(false);
    };

    return (
        <>


            <Helmet>
                <title>Options Market – Wrathcode | Trade Crypto Options</title>

                <meta
                    name="description"
                    content="Start trading options on crypto with Wrathcode: transparent pricing, secure platform and global reach."
                />

                <meta
                    name="keywords"
                    content="crypto option contracts, trade options bitcoin, Wrathcode option market, option trading web3"
                />
            </Helmet>


            <div class="usd_future_dashboard">

                <div class="classic_grid_dashboard_bl d-flex option_datatable_bl">
                    <div class="classic_grid_dashboard_left">
                        <div class="row classic_favorites_bl">

                            <div className={`rightdata_s mobileview ${isMobileViewActive ? "active" : ""
                                }`}>
                                <div className="selected_product_info">
                                    {/* --- Mobile Header --- */}
                                    <div className="product_flex">
                                        <div className="product_name" onClick={handleCloseMobileView}>
                                            <div aria-hidden="true" className="favorite-icon me-1"></div>
                                            {selectedContract?.symbol || "---"}
                                            <span className="arrowmobile">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="9"
                                                    height="5"
                                                    viewBox="0 0 9 5"
                                                    data-palette="ArrowDownThin"
                                                >
                                                    <path
                                                        fill="var(--brand-bg-primary)"
                                                        d="M7.833.13a.51.51 0 01.68 0 .419.419 0 010 .627l-3.846 3.55a.51.51 0 01-.68 0L.141.757C-.047.584-.047.303.14.13s.492-.173.68 0l3.506 3.235L7.833.13z"
                                                    ></path>
                                                </svg>
                                            </span>
                                        </div>

                                        <div className="product_header ms-auto">
                                            {/* --- Delta --- */}


                                            {/* --- Contract Size --- */}


                                            {/* --- Min Order Size --- */}
                                            <button type="button">
                                                <span>Min Order Size:</span>
                                                <div className="style--pepV_">
                                                    <div data-palette="DeltaValue">
                                                        {formatNumber(selectedContract?.minQty || 0)}
                                                    </div>
                                                </div>

                                            </button>
                                        </div>
                                    </div>

                                    {/* --- Mobile Info Table --- */}
                                    <div className="product_data_info">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <td>
                                                        Price
                                                        <span className="succes">
                                                            {formatNumber(selectedPair?.buy_price || 0)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        24h Change
                                                        <span
                                                            className={
                                                                selectedPair?.change_percentage > 0 ? "succes" : "danger"
                                                            }
                                                        >
                                                            {formatNumber(selectedPair?.change_percentage || 0)}%
                                                        </span>
                                                    </td>
                                                    <td>
                                                        24h High
                                                        <span>{formatNumber(selectedPair?.high || 0)}</span>
                                                    </td>


                                                    <td>
                                                        Contract Size
                                                        <span> 1 {selectedPair?.base_currency || "---"}</span>
                                                    </td>

                                                </tr>
                                            </thead>
                                        </table>
                                    </div>
                                </div>


                                <div className='flex_right_option'>
                                    <div className="order_trade_s">
                                        <div className="trade_movers_tb">

                                            {/* Mobile Main Tabs */}
                                            <ul className="nav-check nav-tabs-check" role="tablist">
                                                <li className="nav-item-check" role="presentation">
                                                    <button
                                                        className={`nav-link-check active}`}

                                                    >
                                                        Order Book
                                                    </button>
                                                </li>

                                            </ul>

                                            {/*Mobile Main Tabs Content */}
                                            <div className="tab-content table-trade">

                                                {/*Mobile ORDER BOOK DATA */}

                                                <div className="tab-pane show active" id="order">

                                                    {/*Mobile Inner tabs for buy/sell/all */}


                                                    {/* Mobile Inner Tab Content */}
                                                    <div className="tab-content buy_sell_row_price">
                                                        <div className="tab-pane show active toggle2" id="all_orders">
                                                            <div className="table_info_data">

                                                                {/* === Header === */}
                                                                <div className="price_card_head">
                                                                    <div className="ps-0">
                                                                        Price ({selectedPair?.quote_currency || "---"})
                                                                    </div>
                                                                    <div>
                                                                        Size ({selectedPair?.base_currency || "---"})
                                                                    </div>
                                                                </div>

                                                                {/* === BUY ORDERS (BIDS) === */}
                                                                <div className="scroll_y scroll_y_reverse">
                                                                    <table>
                                                                        <tbody>
                                                                            {/* <tr className="totaltb cursor-pointer" style={{
                                                                                        background: `linear-gradient(to left, ${orderBookColor?.buy} ${50}%, transparent ${50}%)`
                                                                                    }} >
                                                                                        <td className="sucess">1234</td>
                                                                                        <td className='right_alien'>64</td>
                                                                                        <td className='right_alien'>12345</td>

                                                                                    </tr>
                                                                                    <tr className="totaltb cursor-pointer" style={{
                                                                                        background: `linear-gradient(to left, ${orderBookColor?.buy} ${50}%, transparent ${50}%)`
                                                                                    }} >
                                                                                        <td className="sucess">1234</td>
                                                                                        <td className='right_alien'>64</td>
                                                                                        <td className='right_alien'>12345</td>

                                                                                    </tr> */}

                                                                            {orderBook?.bids?.length > 0 ? (
                                                                                orderBook.bids.map((bid, i) => {
                                                                                    const fillPercentage = (bid?.size / maxBuyVolume) * 100;
                                                                                    return (
                                                                                        <tr
                                                                                            key={`bid-${i}`}
                                                                                            className="totaltb cursor-pointer"
                                                                                            style={{
                                                                                                background: `linear-gradient(to left, ${orderBookColor?.buy} ${fillPercentage}%, transparent ${fillPercentage}%)`,
                                                                                            }} onClick={() => setPrice(bid?.price)}
                                                                                        >
                                                                                            <td className="sucess">{formatNumber(bid?.price)}</td>
                                                                                            <td className="right_alien">{formatNumber(bid?.size)}</td>
                                                                                        </tr>
                                                                                    );
                                                                                })
                                                                            ) : (
                                                                                <tr>
                                                                                    <td colSpan="2">
                                                                                        <div className="d-flex justify-content-center">
                                                                                            <img
                                                                                                src="/images/option-img/search_not_found.svg"
                                                                                                alt="not found"
                                                                                                width="80"
                                                                                            />
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>

                                                                {/* === MID MARKET PRICE === */}
                                                                <div className="mrkt_trde_tab justify-space-between">
                                                                    <b
                                                                        className={
                                                                            selectedContract?.lastPrice > selectedContract?.lastMarkPrice
                                                                                ? "text-success"
                                                                                : "text-danger"
                                                                        }
                                                                    >
                                                                        {formatNumber(selectedContract?.lastPrice)}
                                                                    </b>
                                                                    {selectedPair?.change_percentage > 0 ? (
                                                                        <i className="ri-arrow-up-line ri-xl mx-3 text-success"></i>
                                                                    ) : (
                                                                        <i className="ri-arrow-down-line ri-xl mx-3 text-danger"></i>
                                                                    )}
                                                                    <span>{formatNumber(selectedPair?.change_percentage)}%</span>
                                                                </div>

                                                                {/* === SELL ORDERS (ASKS) === */}
                                                                <div className="table_info_data">
                                                                    <div className="price_card_body scroll_y">
                                                                        <table>
                                                                            <tbody>
                                                                                {/* <tr className="totaltb cursor-pointer" style={{
                                                                                        background: `linear-gradient(to left, ${orderBookColor?.sell} ${50}%, transparent ${50}%)`
                                                                                    }} >
                                                                                        <td className="danger">1234</td>
                                                                                        <td className='right_alien'>64</td>
                                                                                        <td className='right_alien'>12345</td>

                                                                                    </tr>
                                                                                    <tr className="totaltb cursor-pointer" style={{
                                                                                        background: `linear-gradient(to left, ${orderBookColor?.sell} ${50}%, transparent ${50}%)`
                                                                                    }} >
                                                                                        <td className="danger">1234</td>
                                                                                        <td className='right_alien'>64</td>
                                                                                        <td className='right_alien'>12345</td>

                                                                                    </tr> */}


                                                                                {orderBook?.asks?.length > 0 ? (
                                                                                    orderBook.asks.map((ask, i) => {
                                                                                        const fillPercentage = (ask?.size / maxSellVolume) * 100;
                                                                                        return (
                                                                                            <tr
                                                                                                key={`ask-${i}`}
                                                                                                className="totaltb cursor-pointer"
                                                                                                style={{
                                                                                                    background: `linear-gradient(to left, ${orderBookColor?.sell} ${fillPercentage}%, transparent ${fillPercentage}%)`,
                                                                                                }} onClick={() => setPrice(ask?.price)}
                                                                                            >
                                                                                                <td className="danger">{formatNumber(ask?.price)}</td>
                                                                                                <td className="right_alien">{formatNumber(ask?.size)}</td>
                                                                                            </tr>
                                                                                        );
                                                                                    })
                                                                                ) : (
                                                                                    <tr>
                                                                                        <td colSpan="2">
                                                                                            <div className="d-flex justify-content-center">
                                                                                                <img
                                                                                                    src="/images/option-img/search_not_found.svg"
                                                                                                    alt="not found"
                                                                                                    width="80"
                                                                                                />
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



                                            </div>
                                        </div>



                                    </div>

                                    <div className="relative_select_right">

                                        {/* Mobile Buy Sell */}
                                        <div className='buysell_heder padding_space_l'>
                                            <ul className="nav nav-tabs custom-tabs mb-3" id="tradeTabs" role="tablist">
                                                <li className="nav-item" role="presentation">
                                                    <button
                                                        class="nav-link active"
                                                        id="buy-tab"
                                                        data-bs-toggle="tab"
                                                        data-bs-target="#buy"
                                                        type="button"
                                                        role="tab"
                                                        aria-controls="buy"
                                                        onClick={() => setSide("BUY")}
                                                    >
                                                        <span> Buy</span>
                                                    </button>
                                                </li>

                                                <li className="nav-item" role="presentation">
                                                    <button
                                                        class="nav-link selltab"
                                                        id="sell-tab"
                                                        data-bs-toggle="tab"
                                                        data-bs-target="#sell"
                                                        type="button"
                                                        role="tab"
                                                        aria-controls="sell"
                                                        onClick={() => setSide("SELL")}
                                                    >
                                                        <span> Sell</span>
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="tab-content" id="tradeTabsContent">

                                            {/* BUY TAB */}
                                            <div className="tab-pane fade show active" id="buy" role="tabpanel" aria-labelledby="buy-tab">

                                                <form className="price_info">
                                                    {/* Price */}
                                                    <div className="price_inputbl">
                                                        <label>Price</label>
                                                        <div className="price_select_option">
                                                            <input
                                                                className="inputtype"
                                                                type="number"
                                                                placeholder="Price"
                                                                value={price}
                                                                onChange={(e) => setPrice(e.target.value)}
                                                                onWheel={(e) => e.target.blur()}
                                                            />
                                                            <select>
                                                                <option>{selectedPair?.quote_currency || "---"}</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* Size */}
                                                    <div className="price_inputbl">
                                                        <label>Size <span className="btctoggle">({selectedPair?.base_currency || "---"})</span></label>
                                                        <div className="price_select_option">
                                                            <input
                                                                className="inputtype"
                                                                type="number"
                                                                placeholder="Size"
                                                                value={quantity}
                                                                onChange={(e) => setQuantity(e.target.value)}
                                                                onWheel={(e) => e.target.blur()}
                                                            />
                                                            <select>
                                                                <option>{selectedPair?.base_currency || "---"}</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* COST - BALANCE - SYMBOL - EXPIRY DATE */}
                                                    <div className="price_inputbl">
                                                        <div className="avail_total_usd">
                                                            <label>Cost</label>
                                                            <div className="usd_price">
                                                                {formatNumber(finalCost, 3) || "---"}
                                                            </div>
                                                        </div>

                                                        <div className="avail_total_usd">
                                                            <label>Avail.</label>
                                                            <div className="usd_price">
                                                                {formatNumber(balance)} {selectedPair?.quote_currency}
                                                            </div>
                                                        </div>

                                                        <div className="avail_total_usd">
                                                            <label>Symbol</label>
                                                            <div className="usd_price">
                                                                {selectedContract?.symbol || "---"}
                                                            </div>
                                                        </div>

                                                        <div className="avail_total_usd">
                                                            <label>Expiry</label>
                                                            <div className="usd_price">
                                                                {formattedDate}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Buy Button */}
                                                    <div className="price_inputbl">
                                                        <div className="buysell_btn d-flex gap-2 align-items-center">
                                                            <button
                                                                className="buybtn"
                                                                type="button"
                                                                onClick={handleplaceOrder}
                                                            >
                                                                Buy
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Contract info */}
                                                    <div className="price_inputbl mt-2">
                                                        <div className="d-flex justify-content-between costbtc_total">
                                                            <h5>Min Size <span>{formatNumber(selectedContract?.minQty)}</span></h5>
                                                            <h5>Max Size <span>{formatNumber(selectedContract?.maxQty)}</span></h5>
                                                        </div>

                                                        <div className="d-flex justify-content-between costbtc_total">
                                                            <h5>Delta <span>{formatNumber(selectedContract?.delta)}</span></h5>
                                                            <h5>Gamma <span>{formatNumber(selectedContract?.gamma)}</span></h5>
                                                        </div>

                                                        <div className="d-flex justify-content-between costbtc_total">
                                                            <h5>Strike <span>{formatNumber(selectedContract?.strikePrice)}</span></h5>
                                                            <h5>Mark <span>{formatNumber(selectedContract?.lastMarkPrice)}</span></h5>
                                                        </div>

                                                        <div className="d-flex justify-content-between costbtc_total">
                                                            <h5>Fees</h5>
                                                            <h5>
                                                                T: {formatNumber(fees?.transactionFee)}% /
                                                                E: {formatNumber(fees?.exerciseFee)}%
                                                            </h5>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>

                                            {/* SELL TAB */}
                                            <div className="tab-pane fade" id="sell" role="tabpanel" aria-labelledby="sell-tab">

                                                <form className="price_info">
                                                    {/* Price */}
                                                    <div className="price_inputbl">
                                                        <label>Price</label>
                                                        <div className="price_select_option">
                                                            <input
                                                                className="inputtype"
                                                                type="number"
                                                                placeholder="Price"
                                                                value={price}
                                                                onChange={(e) => setPrice(e.target.value)}
                                                                onWheel={(e) => e.target.blur()}
                                                            />
                                                            <select>
                                                                <option>{selectedPair?.quote_currency || "---"}</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* Size */}
                                                    <div className="price_inputbl">
                                                        <label>Size <span className="btctoggle">({selectedPair?.base_currency || "---"})</span></label>
                                                        <div className="price_select_option">
                                                            <input
                                                                className="inputtype"
                                                                type="number"
                                                                placeholder="Size"
                                                                value={quantity}
                                                                onChange={(e) => setQuantity(e.target.value)}
                                                                onWheel={(e) => e.target.blur()}
                                                            />
                                                            <select>
                                                                <option>{selectedPair?.base_currency || "---"}</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* COST - BALANCE - SYMBOL - EXPIRY DATE */}
                                                    <div className="price_inputbl">
                                                        <div className="avail_total_usd">
                                                            <label>Cost</label>
                                                            <div className="usd_price">
                                                                {formatNumber(
                                                                    calcOrderFee(Number(price), Number(selectedPair?.buy_price), Number(quantity)),
                                                                    3
                                                                ) || "---"}
                                                            </div>
                                                        </div>

                                                        <div className="avail_total_usd">
                                                            <label>Avail.</label>
                                                            <div className="usd_price">
                                                                {formatNumber(balance)} {selectedPair?.quote_currency}
                                                            </div>
                                                        </div>

                                                        <div className="avail_total_usd">
                                                            <label>Symbol</label>
                                                            <div className="usd_price">
                                                                {selectedContract?.symbol || "---"}
                                                            </div>
                                                        </div>

                                                        <div className="avail_total_usd">
                                                            <label>Expiry</label>
                                                            <div className="usd_price">
                                                                {formattedDate}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Sell Button */}
                                                    <div className="price_inputbl">
                                                        <div className="buysell_btn d-flex gap-2 align-items-center">
                                                            <button
                                                                className="sellbtn"
                                                                type="button"
                                                                onClick={handleplaceOrder}
                                                            >
                                                                Sell
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Contract info */}
                                                    <div className="price_inputbl mt-2">
                                                        <div className="d-flex justify-content-between costbtc_total">
                                                            <h5>Min Size <span>{formatNumber(selectedContract?.minQty)}</span></h5>
                                                            <h5>Max Size <span>{formatNumber(selectedContract?.maxQty)}</span></h5>
                                                        </div>

                                                        <div className="d-flex justify-content-between costbtc_total">
                                                            <h5>Delta <span>{formatNumber(selectedContract?.delta)}</span></h5>
                                                            <h5>Gamma <span>{formatNumber(selectedContract?.gamma)}</span></h5>
                                                        </div>

                                                        <div className="d-flex justify-content-between costbtc_total">
                                                            <h5>Strike <span>{formatNumber(selectedContract?.strikePrice)}</span></h5>
                                                            <h5>Mark <span>{formatNumber(selectedContract?.lastMarkPrice)}</span></h5>
                                                        </div>

                                                        <div className="d-flex justify-content-between costbtc_total">
                                                            <h5>Fees</h5>
                                                            <h5>
                                                                T: {formatNumber(fees?.transactionFee)}% /
                                                                E: {formatNumber(fees?.exerciseFee)}%
                                                            </h5>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>

                                        </div>
                                    </div>

                                </div>

                            </div>

                            <div class="col-sm-7">
                                <div className='view_data'>

                                    <div className='desktop_view'>

                                        <div class="classic_option_top">

                                            <div class="classic_usd_right">
                                                <ul>
                                                    {optionsPairs?.length > 0 ? optionsPairs?.map((pair) => {
                                                        return (
                                                            <li className={selectedPair?.base_currency === pair?.base_currency && "active"} onClick={() => handleSelectPair(pair)}>
                                                                <button>
                                                                    <img src={ApiConfig?.baseImage + pair?.icon_path} alt="bitcoin" />
                                                                    <div class="cnt_top_cl">
                                                                        <h6>{`${pair?.base_currency}${pair?.quote_currency}`}</h6>
                                                                    </div>
                                                                </button>
                                                            </li>
                                                        )
                                                    }) : <li >
                                                        <button>

                                                            <div class="cnt_top_cl">
                                                                <h6>----</h6>
                                                            </div>
                                                        </button>
                                                    </li>}


                                                </ul>
                                            </div>
                                        </div>

                                        <div class="d-flex topnav_selected">
                                            <ul class="date_tbl">
                                                {availableExpiryDates?.length > 0 ? availableExpiryDates?.map((item, index) => {
                                                    // Convert ISO date to yyyy-mm-dd
                                                    const formattedDate = new Date(item?.expiryDate).toISOString().split("T")[0];
                                                    return (
                                                        <li className={`${selectedPair?.selectedExpiry === item?.expiryDate && "active"} nav-item`} key={index} onClick={() => handleSelectExpiry(item)}>
                                                            <button className="nav-link">{formattedDate}</button>
                                                        </li>
                                                    );
                                                }) : <li className="nav-item" >
                                                    <button className="nav-link">----</button>
                                                </li>}


                                            </ul>

                                        </div>

                                        <div className="data_option_calls mobile_data_table">
                                            {contractList?.length > 0 ? <>
                                                <div className="top_table_data">
                                                    <div className="table-responsive">
                                                        <div className="lefside_data">

                                                            {/* --- STRIKE LIST --- */}
                                                            <div className="mid_data mobile_view">

                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Strike</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {contractList?.map((item, i) => (
                                                                            <tr key={i}>
                                                                                <td>{formatNumber(item?.strikePrice)}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                                :

                                                            </div>

                                                            {/* --- CALL & PUT TABLE --- */}
                                                            <>
                                                                <div className="scroll_y">
                                                                    <table>
                                                                        <thead>
                                                                            <tr>
                                                                                <th>Type</th>
                                                                                <th>Open</th>
                                                                                <th>High</th>
                                                                                <th>Bid Size</th>
                                                                                <th>Last Bid</th>
                                                                                <th>Mark</th>
                                                                                <th>Last Ask</th>
                                                                                <th>Delta</th>
                                                                                <th>Theta</th>
                                                                                <th>Gamma</th>
                                                                            </tr>
                                                                        </thead>

                                                                        <tbody>
                                                                            {contractList?.map((item, index) => {
                                                                                const isCallActive = item?.call?.symbol === selectedContract?.symbol;
                                                                                const isPutActive = item?.put?.symbol === selectedContract?.symbol;

                                                                                return (
                                                                                    <tr key={index}>
                                                                                        {/* Type */}
                                                                                        <td>
                                                                                            <div className="data_put">
                                                                                                <div
                                                                                                    className={`danger ${isCallActive ? "active" : ""}`}
                                                                                                    onClick={() => { handleSelecteContract(item?.call); handleShowMobileView() }}
                                                                                                >
                                                                                                    C
                                                                                                </div>
                                                                                                <div
                                                                                                    className={`succes ${isPutActive ? "active" : ""}`}
                                                                                                    onClick={() => { handleSelecteContract(item?.put); handleShowMobileView() }}
                                                                                                >
                                                                                                    P
                                                                                                </div>
                                                                                            </div>
                                                                                        </td>

                                                                                        {/* Open */}
                                                                                        <td>
                                                                                            <div className="datatable">
                                                                                                <div onClick={() => { handleSelecteContract(item?.call); handleShowMobileView() }}>{formatNumber(item?.call?.openPrice)}</div>
                                                                                                <div onClick={() => { handleSelecteContract(item?.put); handleShowMobileView() }}>{formatNumber(item?.put?.openPrice)}</div>
                                                                                            </div>
                                                                                        </td>

                                                                                        {/* High */}
                                                                                        <td>
                                                                                            <div className="datatable">
                                                                                                <div className="text-succes" onClick={() => { handleSelecteContract(item?.call); handleShowMobileView() }}>{formatNumber(item?.call?.highPrice)}</div>
                                                                                                <div className="text-succes" onClick={() => { handleSelecteContract(item?.put); handleShowMobileView() }}>{formatNumber(item?.put?.highPrice)}</div>
                                                                                            </div>
                                                                                        </td>

                                                                                        {/* Bid Size */}
                                                                                        <td>
                                                                                            <div className="datatable">
                                                                                                <div onClick={() => { handleSelecteContract(item?.call); handleShowMobileView() }}>{formatNumber(item?.call?.volume)}</div>
                                                                                                <div onClick={() => { handleSelecteContract(item?.put); handleShowMobileView() }}>{formatNumber(item?.put?.volume)}</div>
                                                                                            </div>
                                                                                        </td>

                                                                                        {/* Last Bid */}
                                                                                        <td>
                                                                                            <div className="datatable">
                                                                                                <div className="text-succes" onClick={() => { handleSelecteContract(item?.call); handleShowMobileView() }}>{formatNumber(item?.call?.lastBid)}</div>
                                                                                                <div className="text-succes" onClick={() => { handleSelecteContract(item?.put); handleShowMobileView() }}>{formatNumber(item?.put?.lastBid)}</div>
                                                                                            </div>
                                                                                        </td>

                                                                                        {/* Mark */}
                                                                                        <td>
                                                                                            <div className="datatable">
                                                                                                <div onClick={() => { handleSelecteContract(item?.call); handleShowMobileView() }}>{formatNumber(item?.call?.lastMarkPrice)}</div>
                                                                                                <div onClick={() => { handleSelecteContract(item?.put); handleShowMobileView() }}>{formatNumber(item?.put?.lastMarkPrice)}</div>
                                                                                            </div>
                                                                                        </td>

                                                                                        {/* Last Ask */}
                                                                                        <td>
                                                                                            <div className="datatable">
                                                                                                <div className="danger" onClick={() => { handleSelecteContract(item?.call); handleShowMobileView() }}>{formatNumber(item?.call?.lastAsk)}</div>
                                                                                                <div className="danger" onClick={() => { handleSelecteContract(item?.put); handleShowMobileView() }}>{formatNumber(item?.put?.lastAsk)}</div>
                                                                                            </div>
                                                                                        </td>

                                                                                        {/* Delta */}
                                                                                        <td>
                                                                                            <div className="datatable">
                                                                                                <div onClick={() => { handleSelecteContract(item?.call); handleShowMobileView() }}>{formatNumber(item?.call?.delta)}</div>
                                                                                                <div onClick={() => { handleSelecteContract(item?.put); handleShowMobileView() }}>{formatNumber(item?.put?.delta)}</div>
                                                                                            </div>
                                                                                        </td>

                                                                                        {/* Theta */}
                                                                                        <td>
                                                                                            <div className="datatable">
                                                                                                <div onClick={() => { handleSelecteContract(item?.call); handleShowMobileView() }}>{formatNumber(item?.call?.theta)}</div>
                                                                                                <div onClick={() => { handleSelecteContract(item?.put); handleShowMobileView() }}>{formatNumber(item?.put?.theta)}</div>
                                                                                            </div>
                                                                                        </td>

                                                                                        {/* Gamma */}
                                                                                        <td>
                                                                                            <div className="datatable">
                                                                                                <div onClick={() => { handleSelecteContract(item?.call); handleShowMobileView() }}>{formatNumber(item?.call?.gamma)}</div>
                                                                                                <div onClick={() => { handleSelecteContract(item?.put); handleShowMobileView() }}>{formatNumber(item?.put?.gamma)}</div>
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                );
                                                                            })}
                                                                        </tbody>
                                                                    </table>
                                                                </div>

                                                            </>

                                                        </div>
                                                    </div>
                                                </div>
                                            </> : <div className="top_table_data d-flex justify-content-center align-items-center"><div className="spinner-border text-primary" role="status" /></div>}
                                        </div>

                                    </div>

                                    <div class="data_option_calls">
                                        <div class="top_barcalls_put_cnt">
                                            <ul>
                                                <li><strong>Calls</strong> {`${selectedPair?.base_currency || "---"}${selectedPair?.quote_currency || "---"}`} Price: {formatNumber(selectedPair?.buy_price)}</li>
                                                <li className='nthchild2'><strong>{formattedDate}</strong></li>
                                                <li><strong>Puts</strong> {"  "}Time to Expiry: {timeLeft || "---"}</li>
                                            </ul>
                                        </div>

                                        <div className={`top_table_data border-0 ${contractList?.length === 0 && "d-flex justify-content-center align-items-center"} `}>
                                            {contractList?.length > 0 ? <>
                                                {/*WEB  LEFT SIDE - CALLS */}
                                                <div className="lefside_data">
                                                    <div className="table-responsive">
                                                        <table>
                                                            <thead>
                                                                <tr>
                                                                    <th>Open</th>
                                                                    <th>High</th>
                                                                    <th>Bid Size</th>
                                                                    <th>Last Bid</th>
                                                                    <th>Mark</th>
                                                                    <th>Last Ask</th>
                                                                    <th>Delta</th>
                                                                    <th>Theta</th>
                                                                    <th>Gamma</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {contractList?.map((item, index) => {
                                                                    const isAbove =
                                                                        item?.strikePrice < selectedPair?.buy_price;
                                                                    return (
                                                                        <tr
                                                                            key={index}
                                                                            className={`${isAbove ? "green_light " : ""
                                                                                }${item?.call?.symbol === selectedContract?.symbol ? "active" : ""}`} onClick={() => handleSelecteContract(item?.call)}>
                                                                            <td>{formatNumber(item?.call?.openPrice)}</td>
                                                                            <td className="text-succes">{formatNumber(item?.call?.highPrice)}</td>
                                                                            <td>{formatNumber(item?.call?.volume)}</td>
                                                                            <td className="text-succes">
                                                                                {formatNumber(item?.call?.lastBid)}
                                                                            </td>
                                                                            <td>
                                                                                {formatNumber(item?.call?.lastMarkPrice)}
                                                                            </td>
                                                                            <td className="danger">
                                                                                {formatNumber(item?.call?.lastAsk)}
                                                                            </td>
                                                                            <td>{formatNumber(item?.call?.delta)}</td>
                                                                            <td >
                                                                                {formatNumber(item?.call?.theta)}
                                                                            </td>
                                                                            <td >
                                                                                {formatNumber(item?.call?.gamma)}
                                                                            </td>

                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/*WEB  MIDDLE - STRIKE PRICES */}
                                                <div className="mid_data">
                                                    <div className="table-responsive">
                                                        <table>
                                                            <thead>
                                                                <tr>
                                                                    <th>Strike</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {contractList?.map((item, index) => (
                                                                    <tr key={index}>
                                                                        <td >{formatNumber(item?.strikePrice)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/*WEB RIGHT SIDE - PUTS */}
                                                <div className="right_data">
                                                    <div className="table-responsive">
                                                        <table>
                                                            <thead>
                                                                <tr>
                                                                    <th>Open</th>
                                                                    <th>High</th>
                                                                    <th>Bid Size</th>
                                                                    <th>Last Bid</th>
                                                                    <th>Mark</th>
                                                                    <th>Last Ask</th>
                                                                    <th>Delta</th>
                                                                    <th>Theta</th>
                                                                    <th>Gamma</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {contractList?.map((item, index) => {
                                                                    const isBelow =
                                                                        item?.strikePrice > selectedPair?.buy_price;

                                                                    return (
                                                                        <tr
                                                                            key={index}

                                                                            className={`${isBelow ? "danger_light " : ""
                                                                                }${item?.put?.symbol === selectedContract?.symbol ? "active" : ""}`}



                                                                            onClick={() => handleSelecteContract(item?.put)}>
                                                                            <td>{formatNumber(item?.put?.openPrice)}</td>
                                                                            <td className="text-succes">{formatNumber(item?.call?.highPrice)}</td>
                                                                            <td>{formatNumber(item?.put?.volume)}</td>
                                                                            <td className="text-succes">
                                                                                {formatNumber(item?.put?.lastBid)}
                                                                            </td>
                                                                            <td>
                                                                                {formatNumber(item?.put?.lastMarkPrice)}
                                                                            </td>
                                                                            <td className="danger">
                                                                                {formatNumber(item?.put?.lastAsk)}
                                                                            </td>
                                                                            <td>{formatNumber(item?.put?.delta)}</td>
                                                                            <td >
                                                                                {formatNumber(item?.put?.theta)}
                                                                            </td>
                                                                            <td >
                                                                                {formatNumber(item?.put?.gamma)}
                                                                            </td>
                                                                            {/* <td>{formatNumber(item.put.openInterest)}</td> */}
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>

                                                        </table>
                                                    </div>
                                                </div>

                                            </> :
                                                <div className="spinner-border text-primary" role="status" />
                                            }
                                        </div>

                                    </div>



                                </div>



                            </div>
                            <div class="col-sm-5">
                                <div className='rightdata_s'>
                                    <div className='selected_product_info'>

                                        <div className='product_flex'>
                                            <div className='product_name'>
                                                <div aria-hidden="true" class="favorite-icon me-1"></div> {selectedContract?.symbol || "---"}
                                                <span className='arrowmobile'>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="5" viewBox="0 0 9 5" class="" data-palette="ArrowDownThin"><path fill="var(--brand-bg-primary)" d="M7.833.13a.51.51 0 01.68 0 .419.419 0 010 .627l-3.846 3.55a.51.51 0 01-.68 0L.141.757C-.047.584-.047.303.14.13s.492-.173.68 0l3.506 3.235L7.833.13z"></path></svg>
                                                </span>
                                            </div>

                                            <div className='product_header ms-auto'>

                                                <button type="button"><span>Delta:</span>
                                                    <div class="style--pepV_">
                                                        <div data-palette="DeltaValue">{formatNumber(selectedContract?.delta || null)}</div></div></button>

                                                <button type="button"><span>Contract Size:</span>
                                                    <div class="style--pepV_">
                                                        <div data-palette="DeltaValue"> 1 {selectedPair?.base_currency || "---"} </div></div></button>
                                                <button type="button"><span>Min Order Size:</span>
                                                    <div class="style--pepV_">
                                                        <div data-palette="DeltaValue"> {formatNumber(selectedContract?.minQty || null)} </div></div></button>


                                            </div>

                                        </div>



                                        <div className='product_data_info'>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <td>Price<span className='succes'>{formatNumber(selectedPair?.buy_price || null)}</span></td>
                                                        <td>24h Change<span className={selectedPair?.change_percentage > 0 ? 'succes' : 'danger'}>{formatNumber(selectedPair?.change_percentage || null)}%</span></td>
                                                        <td>24h High<span>{formatNumber(selectedPair?.high || null)}</span></td>
                                                        <td>24h Low<span>{formatNumber(selectedPair?.low || null)}</span></td>
                                                        <td>Spot Open<span>{formatNumber(selectedPair?.open || null)}</span></td>
                                                    </tr>
                                                </thead>
                                            </table>
                                        </div>
                                    </div>

                                    <div className='flex_right_option'>
                                        <div className="order_trade_s">
                                            <div className="trade_movers_tb">

                                                {/*Web OrderBook Main Tabs */}
                                                <ul className="nav-check nav-tabs-check" role="tablist">
                                                    <li className="nav-item-check" role="presentation">
                                                        <button
                                                            className={`nav-link-check active`}
                                                        >
                                                            Order Book
                                                        </button>
                                                    </li>

                                                </ul>

                                                {/*Web OrderBook Inner Tab Content */}
                                                <div className="tab-content table-trade">
                                                    <div className="tab-pane show active" id="order">
                                                        <div className="tab-content mt-2 buy_sell_row_price">

                                                            <div className="tab-pane show active toggle2" id="all_orders">
                                                                <div className="table_info_data">
                                                                    <div class="price_card_head">
                                                                        <div class="ps-0">Price({selectedPair?.quote_currency || "---"})</div>
                                                                        <div>Size({selectedPair?.base_currency || "---"})</div>
                                                                        <div>Sum</div>
                                                                    </div>
                                                                    <div className="scroll_y scroll_y_reverse">
                                                                        <table>

                                                                            <tbody>
                                                                                {orderBook?.bids?.length > 0 ? orderBook?.bids?.map((bids) => {
                                                                                    const fillPercentage = (bids?.size / maxBuyVolume) * 100;

                                                                                    return (
                                                                                        <tr className="totaltb cursor-pointer" style={{
                                                                                            background: `linear-gradient(to left, ${orderBookColor?.buy} ${fillPercentage}%, transparent ${fillPercentage}%)`
                                                                                        }} onClick={() => setPrice(bids?.price)} >
                                                                                            <td className="sucess">{formatNumber(bids?.price)}</td>
                                                                                            <td className='right_alien'>{formatNumber(bids?.size)}</td>
                                                                                            <td className='right_alien'>{formatNumber(bids?.size * bids?.price)}</td>

                                                                                        </tr>
                                                                                    )
                                                                                }) : <tr>
                                                                                    <td colspan="10">
                                                                                        <div class="d-flex justify-content-center">
                                                                                            <img src="/images/option-img/search_not_found.svg"
                                                                                                alt="not found" width="80" /></div>
                                                                                    </td>
                                                                                </tr>}



                                                                            </tbody>
                                                                        </table>
                                                                    </div>

                                                                    <div class="mrkt_trde_tab justify-space-between">
                                                                        <b class={`${selectedContract?.lastPrice >= selectedContract?.lastMarkPrice ? "text-success" : "text-danger"}`}>{selectedContract?.lastPrice > 0 ? formatNumber(selectedContract?.lastPrice, 2) : "----"}</b>
                                                                        {selectedContract?.lastPrice >= selectedContract?.lastMarkPrice ? <i class="ri-arrow-up-line  ri-xl mx-3 text-success"></i> : <i class="ri-arrow-down-line ri-xl mx-3 text-danger"></i>}
                                                                        {/* <i class="ri-arrow-up-line"></i> */}
                                                                        {/* <span>{formatNumber(selectedPair?.change_percentage)}%</span> */}
                                                                    </div>


                                                                    <div className="table_info_data">
                                                                        <div className="price_card_body scroll_y">
                                                                            <table>


                                                                                <tbody>
                                                                                    {orderBook?.asks?.length > 0 ? orderBook?.asks?.map((asks) => {
                                                                                        const fillPercentage = (asks?.size / maxSellVolume) * 100;
                                                                                        return (
                                                                                            <tr className="totaltb cursor-pointer" style={{
                                                                                                background: `linear-gradient(to left, ${orderBookColor?.sell} ${fillPercentage}%, transparent ${fillPercentage}%)`
                                                                                            }} onClick={() => setPrice(asks?.price)} >
                                                                                                <td className="danger">{formatNumber(asks?.price)}</td>
                                                                                                <td className='right_alien'>{formatNumber(asks?.size)}</td>
                                                                                                <td className='right_alien'>{formatNumber(asks?.size * asks?.price)}</td>

                                                                                            </tr>
                                                                                        )
                                                                                    }) : <tr>
                                                                                        <td colspan="10">
                                                                                            <div class="d-flex justify-content-center">
                                                                                                <img src="/images/option-img/search_not_found.svg"
                                                                                                    alt="not found" width="80" />
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
                                            </div>



                                        </div>


                                        {/* Web BUy and SELL tab */}

                                        <div class="relative_select_right">

                                            <div className='buysell_heder padding_space_l'>
                                                <ul class="limit_tabs custom-tabs mb-3">
                                                    <li class={`nav-item positions_two ${Side === "BUY" ? "active" : ""}`} role="presentation">
                                                        <button onClick={() => setSide("BUY")}>
                                                            <span> Buy</span>
                                                        </button>
                                                    </li>
                                                    <li class={`nav-item open_two selltab ${Side === "SELL" ? "active" : ""}`} role="presentation">
                                                        <button class="selltab" id="sell-tab" onClick={() => setSide("SELL")}>
                                                            <span>Sell</span>
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>

                                            <div className={`cnt_table_two positions_two ${Side === "BUY" ? "active" : ""}`}>

                                                <form class="price_info">
                                                    <div class="price_inputbl">
                                                        <label>Price</label>
                                                        <div class="price_select_option">
                                                            <input class="inputtype" type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} onWheel={(e) => e.target.blur()} />
                                                            <select>
                                                                <option>{selectedPair?.quote_currency || "---"}</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div class="price_inputbl">
                                                        <label>Size <span class="btctoggle">({selectedPair?.base_currency || "---"})</span></label>
                                                        <div class="price_select_option">
                                                            <input class="inputtype" type="number" placeholder="Size" value={quantity} onChange={(e) => setQuantity(e.target.value)} onWheel={(e) => e.target.blur()} />
                                                            <select>
                                                                <option>{selectedPair?.base_currency || "---"}</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div class="price_inputbl value_choose">
                                                        {/* <ul>
                                                                <li><button type="button" onClick={() => setQuantity(1)} >1 Cont.</button></li>
                                                                <li><button type="button" onClick={() => setQuantity(2)}>2 Cont.</button></li>
                                                                <li><button type="button" onClick={() => setQuantity(3)}>3 Cont.</button></li>
                                                                <li><button type="button" onClick={() => setQuantity(4)}>4 Cont.</button></li>
                                                                <li><button type="button" onClick={() => setQuantity(5)}>5 Cont.</button></li>
                                                            </ul> */}
                                                    </div>

                                                    <div class="price_inputbl">
                                                        <div class="avail_total_usd">
                                                            <label>Cost</label>
                                                            <div class="usd_price">{formatNumber(finalCost, 3) || "---"}</div>
                                                        </div>
                                                        <div class="avail_total_usd">
                                                            <label>Avail.</label>
                                                            <div class="usd_price">{formatNumber(balance)} {selectedPair?.quote_currency || "---"}</div>
                                                        </div>
                                                        <div class="avail_total_usd">
                                                            <label>Symbol</label>
                                                            <div class="usd_price">{(selectedContract?.symbol)}</div>
                                                        </div>
                                                        <div class="avail_total_usd">
                                                            <label>Expiry Date</label>
                                                            <div class="usd_price">{formattedDate}</div>
                                                        </div>
                                                    </div>



                                                    <div class="price_inputbl">
                                                        <div class="buysell_btn d-flex gap-2 align-items-center">
                                                            <button class="buybtn" type="button" onClick={handleplaceOrder}>Buy</button>
                                                        </div>
                                                    </div>

                                                    <div class="price_inputbl mt-2">
                                                        <div class="d-flex justify-content-between costbtc_total liq_price">
                                                            <div class="d-flex align-items-center">
                                                                <h5>Min Size <span> {formatNumber(selectedContract?.minQty, 2)}</span></h5>
                                                            </div>
                                                            <div class="d-flex align-items-center">
                                                                <h5>Max Size <span>{formatNumber(selectedContract?.maxQty)}</span></h5>
                                                            </div>
                                                        </div>

                                                        <div class="d-flex justify-content-between costbtc_total">
                                                            <div class="d-flex align-items-center">
                                                                <h5>Delta <span> {formatNumber(selectedContract?.delta, 4)}</span></h5>
                                                            </div>
                                                            <div class="d-flex align-items-center">
                                                                <h5>Gamma <span> {formatNumber(selectedContract?.gamma, 4)}</span></h5>
                                                            </div>
                                                        </div>

                                                        <div class="d-flex justify-content-between costbtc_total">
                                                            <div class="d-flex align-items-center">
                                                                <h5>Strike <span> {formatNumber(selectedContract?.strikePrice)}</span></h5>
                                                            </div>
                                                            <div class="d-flex align-items-center">
                                                                <h5>Mark <span> {formatNumber(selectedContract?.lastMarkPrice)}</span></h5>
                                                            </div>
                                                        </div>


                                                        <div class="d-flex justify-content-between costbtc_total">
                                                            <div class="d-flex align-items-center">
                                                                <h5>Transaction Fee <span> {formatNumber(fees?.transactionFee, 4)}%</span></h5>
                                                            </div>
                                                            <div class="d-flex align-items-center">
                                                                <h5>Exercise Fee <span> {formatNumber(fees?.exerciseFee, 4)}%</span></h5>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </form>

                                            </div>

                                            <div className={`cnt_table_two open_two ${Side === "SELL" ? "active" : ""}`}>

                                                <form class="price_info">
                                                    <div class="price_inputbl">
                                                        <label>Price</label>
                                                        <div class="price_select_option">
                                                            <input class="inputtype" type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} onWheel={(e) => e.target.blur()} />
                                                            <select>
                                                                <option>{selectedPair?.quote_currency || "---"}</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div class="price_inputbl">
                                                        <label>Size <span class="btctoggle">({selectedPair?.base_currency || "---"})</span></label>
                                                        <div class="price_select_option">
                                                            <input class="inputtype" type="number" placeholder="Size" value={quantity} onChange={(e) => setQuantity(e.target.value)} onWheel={(e) => e.target.blur()} />
                                                            <select>
                                                                <option>{selectedPair?.base_currency || "---"}</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div class="price_inputbl value_choose">
                                                        {/* <ul>
                                                                <li><button type="button" onClick={() => setQuantity(1)} >1 Cont.</button></li>
                                                                <li><button type="button" onClick={() => setQuantity(2)}>2 Cont.</button></li>
                                                                <li><button type="button" onClick={() => setQuantity(3)}>3 Cont.</button></li>
                                                                <li><button type="button" onClick={() => setQuantity(4)}>4 Cont.</button></li>
                                                                <li><button type="button" onClick={() => setQuantity(5)}>5 Cont.</button></li>
                                                            </ul> */}
                                                    </div>

                                                    <div class="price_inputbl">
                                                        <div class="avail_total_usd">
                                                            <label>Cost</label>
                                                            <div class="usd_price">{formatNumber(calcOrderFee(Number(price), Number(selectedPair?.buy_price), Number(quantity)), 3) || "---"}</div>
                                                        </div>
                                                        <div class="avail_total_usd">
                                                            <label>Avail.</label>
                                                            <div class="usd_price">{formatNumber(balance)} {selectedPair?.quote_currency || "---"}</div>
                                                        </div>
                                                        <div class="avail_total_usd">
                                                            <label>Symbol</label>
                                                            <div class="usd_price">{(selectedContract?.symbol)}</div>
                                                        </div>
                                                        <div class="avail_total_usd">
                                                            <label>Expiry Date</label>
                                                            <div class="usd_price">{formattedDate}</div>
                                                        </div>
                                                    </div>


                                                    <div class="price_inputbl">
                                                        <div class="buysell_btn d-flex gap-2 align-items-center">
                                                            <button class="sellbtn" type="button" onClick={handleplaceOrder}>Sell</button>
                                                        </div>
                                                    </div>

                                                    <div class="price_inputbl mt-2">
                                                        <div class="d-flex justify-content-between costbtc_total liq_price">
                                                            <div class="d-flex align-items-center">
                                                                <h5>Min Size <span> {formatNumber(selectedContract?.minQty, 2)}</span></h5>
                                                            </div>
                                                            <div class="d-flex align-items-center">
                                                                <h5>Max Size <span>{formatNumber(selectedContract?.maxQty)}</span></h5>
                                                            </div>
                                                        </div>

                                                        <div class="d-flex justify-content-between costbtc_total">
                                                            <div class="d-flex align-items-center">
                                                                <h5>Delta <span> {formatNumber(selectedContract?.delta, 4)}</span></h5>
                                                            </div>
                                                            <div class="d-flex align-items-center">
                                                                <h5>Gamma <span> {formatNumber(selectedContract?.gamma, 4)}</span></h5>
                                                            </div>
                                                        </div>

                                                        <div class="d-flex justify-content-between costbtc_total">
                                                            <div class="d-flex align-items-center">
                                                                <h5>Strike <span> {formatNumber(selectedContract?.strikePrice)}</span></h5>
                                                            </div>
                                                            <div class="d-flex align-items-center">
                                                                <h5>Mark <span> {formatNumber(selectedContract?.lastMarkPrice)}</span></h5>
                                                            </div>
                                                        </div>


                                                        <div class="d-flex justify-content-between costbtc_total">
                                                            <div class="d-flex align-items-center">
                                                                <h5>Transaction Fee <span> {formatNumber(fees?.transactionFee, 4)}%</span></h5>
                                                            </div>
                                                            <div class="d-flex align-items-center">
                                                                <h5>Exercise Fee <span> {formatNumber(fees?.exerciseFee, 4)}%</span></h5>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </form>

                                            </div>

                                            {/* <div class="tab-content" id="tradeTabsContent">

                                                <div class="tab-pane fade show active" id="buy-web" role="tabpanel" aria-labelledby="buy-tab">


                                                </div>

                                                <div class="tab-pane fade" id="sell-web" role="tabpanel" aria-labelledby="sell-tab">


                                                  


                                                </div>

                                            </div> */}


                                        </div>
                                    </div>

                                </div>



                            </div>

                            <div className='col-sm-12'>

                                <div class="trade_summary_table_lft mt-4 position_order">
                                    <div class="top_th_easyop">
                                        <div class="row">
                                            <div class="col-sm-12">
                                                <ul class="position_list">
                                                    <li class="nav-item positions" role="presentation">
                                                        <button>Positions({openPositions?.length})</button>
                                                    </li>
                                                    <li class="nav-item open" role="presentation">
                                                        <button>Open
                                                            Orders({openOrder?.length})</button>
                                                    </li>
                                                    <li class="nav-item order_history" role="presentation">
                                                        <button>Order
                                                            History</button>
                                                    </li>

                                                    <li class="nav-item exercise_history" role="presentation">
                                                        <button>Exercise History</button>
                                                    </li>
                                                </ul>

                                                <div className='cnt_table positions'>
                                                    {openPositions && openPositions.length > 0 ? <div className="table-responsive">
                                                        <table className="table table-striped align-middle">
                                                            <thead>
                                                                <tr>
                                                                    <th>Side</th>
                                                                    <th>Symbol</th>
                                                                    <th>Entry Price</th>
                                                                    <th>Current Price</th>
                                                                    <th>Size (Cont)</th>
                                                                    <th>Unrealized PnL</th>
                                                                    <th>Realized PnL</th>
                                                                    <th>Status</th>
                                                                    <th>Time</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {openPositions && openPositions.length > 0 ? (
                                                                    openPositions.map((pos) => {
                                                                        // --- current market price (lastTradedPrice from contract) ---
                                                                        const matchedContract = contractList?.find(
                                                                            (item) =>
                                                                                item?.call?.symbol === pos?.symbol ||
                                                                                item?.put?.symbol === pos?.symbol
                                                                        );

                                                                        const filteredContract =
                                                                            matchedContract?.call?.symbol === pos?.symbol
                                                                                ? matchedContract?.call
                                                                                : matchedContract?.put;

                                                                        const currentPrice = filteredContract?.lastPrice;

                                                                        // --- compute unrealized PnL only if valid ---
                                                                        let unrealizedPnL = null;
                                                                        let unrealizedPercent = null;
                                                                        if (currentPrice && pos.entryPrice && pos.quantity) {
                                                                            unrealizedPnL = (currentPrice - pos.entryPrice) * pos.quantity;
                                                                            unrealizedPercent =
                                                                                ((currentPrice - pos.entryPrice) / pos.entryPrice) * 100;
                                                                        }

                                                                        // --- determine color (green for profit, red for loss) ---
                                                                        const pnlClass =
                                                                            unrealizedPnL > 0
                                                                                ? "text-success"
                                                                                : unrealizedPnL < 0
                                                                                    ? "text-danger"
                                                                                    : "text-muted";

                                                                        return (
                                                                            <tr key={pos._id}>
                                                                                <td>
                                                                                    <span
                                                                                        className={`badge ${pos.side === "LONG" ? "bg-success" : "bg-danger"
                                                                                            }`}
                                                                                    >
                                                                                        {pos.side}
                                                                                    </span>
                                                                                </td>

                                                                                <td>{pos.symbol || "--"}</td>
                                                                                <td>{formatNumber(pos.entryPrice, 2)}</td>

                                                                                <td>
                                                                                    {currentPrice
                                                                                        ? <span
                                                                                            className={
                                                                                                currentPrice > pos.entryPrice
                                                                                                    ? "text-success"
                                                                                                    : currentPrice < pos.entryPrice
                                                                                                        ? "text-danger"
                                                                                                        : "text-muted"
                                                                                            }
                                                                                        >
                                                                                            {formatNumber(currentPrice, 2)}
                                                                                        </span>
                                                                                        : "---"}
                                                                                </td>

                                                                                <td>{formatNumber(pos.quantity, 4)}</td>

                                                                                <td className={pnlClass}>
                                                                                    {currentPrice
                                                                                        ? `${formatNumber(unrealizedPnL, 2)} (${formatNumber(
                                                                                            unrealizedPercent,
                                                                                            2
                                                                                        )}%)`
                                                                                        : "---"}
                                                                                </td>

                                                                                <td
                                                                                    className={
                                                                                        Number(pos.realizedPnl) > 0
                                                                                            ? "text-success"
                                                                                            : Number(pos.realizedPnl) < 0
                                                                                                ? "text-danger"
                                                                                                : "text-muted"
                                                                                    }
                                                                                >
                                                                                    {formatNumber(pos.realizedPnl, 2)}
                                                                                </td>

                                                                                <td>
                                                                                    <div className='status_info'>
                                                                                        <input
                                                                                            className="inputtype"
                                                                                            type="number"
                                                                                            placeholder="Price"
                                                                                            value={
                                                                                                positionInput[pos._id]?.price ??
                                                                                                pos.entryPrice // DEFAULT VALUE
                                                                                            }
                                                                                            onChange={(e) =>
                                                                                                updatePositionInput(pos._id, "price", e.target.value)
                                                                                            }
                                                                                            onWheel={(e) => e.target.blur()}
                                                                                        />

                                                                                        <input
                                                                                            className="inputtype"
                                                                                            type="number"
                                                                                            placeholder="Size"
                                                                                            value={
                                                                                                positionInput[pos._id]?.size ??
                                                                                                pos.quantity // DEFAULT VALUE
                                                                                            }
                                                                                            onChange={(e) =>
                                                                                                updatePositionInput(pos._id, "size", e.target.value)
                                                                                            }
                                                                                            onWheel={(e) => e.target.blur()}
                                                                                        />

                                                                                        <button
                                                                                            type="button"
                                                                                            disabled={(() => {
                                                                                                const price =
                                                                                                    positionInput[pos._id]?.price ??
                                                                                                    pos.entryPrice;

                                                                                                const size =
                                                                                                    positionInput[pos._id]?.size ??
                                                                                                    pos.quantity;

                                                                                                // ❌ Empty OR zero
                                                                                                if (!price || !size) return true;

                                                                                                // ❌ Size greater than original position
                                                                                                if (Number(size) > Number(pos.quantity)) return true;

                                                                                                // ❌ Size <= 0
                                                                                                if (Number(size) <= 0) return true;

                                                                                                return false; // ✔ Valid
                                                                                            })()}
                                                                                            onClick={() => handleClosePosition(pos)}
                                                                                        >
                                                                                            Close
                                                                                        </button>
                                                                                    </div>
                                                                                </td>


                                                                                <td>
                                                                                    {pos.createdAt
                                                                                        ? new Date(pos.createdAt).toLocaleString()
                                                                                        : "--"}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <tr>
                                                                        <td colSpan="15">
                                                                            <div class="notfound_vector">
                                                                                <img
                                                                                    src="/images/option-img/search_not_found.svg"
                                                                                    alt="not found"
                                                                                    width="80"
                                                                                />
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>


                                                        : <div class="notfound_vector">
                                                            <img
                                                                src="/images/option-img/search_not_found.svg"
                                                                alt="not found"
                                                                width="80"
                                                            />
                                                        </div>}
                                                </div>

                                                <div className='cnt_table open'>
                                                    {openOrder && openOrder.length > 0 ? <div className="table-responsive">
                                                        <table className="table table-striped align-middle">
                                                            <thead>
                                                                <tr>
                                                                    <th>Side 55</th>
                                                                    <th>Symbol</th>
                                                                    <th>Price (USDT)</th>
                                                                    <th>Size (Cont)</th>
                                                                    <th>Filled</th>
                                                                    <th>Avg. Fill</th>
                                                                    <th>Index Price</th>
                                                                    <th>Status</th>
                                                                    <th>Time</th>
                                                                    <th>Close</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {openOrder && openOrder.length > 0 ? (
                                                                    openOrder.map((order) => (
                                                                        <tr key={order._id}>
                                                                            <td
                                                                                className={`badge ${order.side === "BUY" ? "bg-success" : "bg-danger"
                                                                                    }`}
                                                                            >
                                                                                {order.side}

                                                                            </td>
                                                                            <td>{order.symbol || "--"}</td>
                                                                            <td>{formatNumber(order.price, 2)}</td>
                                                                            <td>{formatNumber(order.quantity, 4)}</td>
                                                                            <td>{formatNumber(order.filledQty, 4)}</td>
                                                                            <td>{formatNumber(order.avgFillPrice, 2)}</td>
                                                                            <td>{formatNumber(order.spotPrice, 2)}</td>
                                                                            <td
                                                                                className={`badge ${order.status === "WORKING"
                                                                                    ? "bg-warning text-dark"
                                                                                    : order.status === "FILLED"
                                                                                        ? "bg-success"
                                                                                        : "bg-secondary"
                                                                                    }`}
                                                                            >
                                                                                {order.status}

                                                                            </td>
                                                                            <td>
                                                                                {order.createdAt
                                                                                    ? new Date(order.createdAt).toLocaleString()
                                                                                    : "--"}
                                                                            </td>
                                                                            <td>
                                                                                <button className="btn text-danger btn-sm btn-icon" type="button" onClick={() => handleCancelOrder(order?.orderId)} ><i className="ri-delete-bin-6-line pr-0"></i>
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                ) : (
                                                                    <tr>
                                                                        <td colSpan="10" className="text-center py-4">
                                                                            <div className="notfound_vector d-flex flex-column align-items-center">
                                                                                <img
                                                                                    src="/images/option-img/search_not_found.svg"
                                                                                    alt="not found"
                                                                                    width="80"
                                                                                />
                                                                                <p className="mt-2 text-muted">No open orders found</p>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div> :

                                                        <div class="notfound_vector">
                                                            <img
                                                                src="/images/option-img/search_not_found.svg"
                                                                alt="not found"
                                                                width="80"
                                                            />
                                                        </div>
                                                    }
                                                </div>

                                                <div className='cnt_table order_history'>
                                                    {orderHistory && orderHistory.length > 0 ? <div className="table-responsive">

                                                        <table className="table table-striped align-middle">
                                                            <thead>
                                                                <tr>
                                                                    <th>Side</th>
                                                                    <th>Symbol</th>
                                                                    <th>Order Type</th>
                                                                    <th>Size (Cont)</th>
                                                                    <th>Filled (Cont)</th>
                                                                    <th>Avg. Price</th>
                                                                    <th>Fee (USDT)</th>
                                                                    <th>Total Value</th>
                                                                    <th>Total Cost</th>
                                                                    <th>Index Price</th>
                                                                    <th>Status</th>
                                                                    <th>Time</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {orderHistory && orderHistory.length > 0 ? (
                                                                    orderHistory.map((order) => {

                                                                        const totalValue = order.price * order.filledQty;
                                                                        const totalCost = totalValue + order.feePaid;

                                                                        return (
                                                                            <tr key={order._id}>

                                                                                <td>
                                                                                    <span
                                                                                        className={`badge ${order.side === "BUY" ? "bg-success" : "bg-danger"
                                                                                            }`}
                                                                                    >
                                                                                        {order.side}
                                                                                    </span>
                                                                                </td>


                                                                                <td>{order.symbol || "--"}</td>


                                                                                <td>{order.type || "--"}</td>



                                                                                <td>{formatNumber(order.quantity, 4)}</td>
                                                                                <td>{formatNumber(order.filledQty, 4)}</td>


                                                                                <td>{formatNumber(order.price, 2)}</td>


                                                                                <td>{formatNumber(order.feePaid, 5)}</td>


                                                                                <td>{formatNumber(totalValue, 5)}</td>


                                                                                <td>{formatNumber(totalCost, 5)}</td>


                                                                                <td>{formatNumber(order.spotPrice, 2)}</td>


                                                                                <td>
                                                                                    <span
                                                                                        className={`badge ${order.status === "FILLED"
                                                                                            ? "bg-success"
                                                                                            : order.status === "CANCELLED"
                                                                                                ? "bg-secondary"
                                                                                                : order.status === "WORKING"
                                                                                                    ? "bg-warning text-dark"
                                                                                                    : "bg-light text-dark"
                                                                                            }`}
                                                                                    >
                                                                                        {order.status}
                                                                                    </span>
                                                                                </td>


                                                                                <td>
                                                                                    {order.updatedAt
                                                                                        ? new Date(order.updatedAt).toLocaleString()
                                                                                        : "--"}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <tr>
                                                                        <td colSpan="15">
                                                                            <div class="notfound_vector">
                                                                                <img
                                                                                    src="/images/option-img/search_not_found.svg"
                                                                                    alt="not found"
                                                                                    width="80"
                                                                                />
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div> :

                                                        <div class="notfound_vector">
                                                            <img
                                                                src="/images/option-img/search_not_found.svg"
                                                                alt="not found"
                                                                width="80"
                                                            />
                                                        </div>
                                                    }
                                                </div>

                                                <div className='cnt_table exercise_history'>
                                                    {exerciseHistory && exerciseHistory.length > 0 ? <div className="table-responsive">
                                                        <table className="table table-striped align-middle">
                                                            <thead>
                                                                <tr>
                                                                    <th>Side</th>
                                                                    <th>Symbol</th>
                                                                    <th>Strike</th>
                                                                    <th>Settlement</th>
                                                                    <th>Size</th>
                                                                    <th>Exercise Profit</th>
                                                                    <th>Fee</th>
                                                                    <th>Net PnL</th>
                                                                    <th>Exercised At</th>
                                                                </tr>
                                                            </thead>

                                                            <tbody>
                                                                {exerciseHistory && exerciseHistory.length > 0 ? (
                                                                    exerciseHistory.map((pos) => (
                                                                        <tr key={pos._id}>


                                                                            <td>
                                                                                <span
                                                                                    className={`badge ${pos.optionType === "CALL" ? "bg-success" : "bg-danger"}`}
                                                                                >
                                                                                    {pos.optionType}
                                                                                </span>
                                                                            </td>


                                                                            <td>{pos.symbol}</td>


                                                                            <td>{formatNumber(pos.strikePrice, 2)}</td>


                                                                            <td>{formatNumber(pos.settlementPrice, 2)}</td>


                                                                            <td>{formatNumber(pos.amount, 4)}</td>


                                                                            <td className={pos.exerciseProfit >= 0 ? "text-success" : "text-danger"}>
                                                                                {formatNumber(pos.exerciseProfit, 2)}
                                                                            </td>


                                                                            <td>{formatNumber(pos.exerciseFee, 2)}</td>


                                                                            <td className={pos.netProfit >= 0 ? "text-success" : "text-danger"}>
                                                                                {formatNumber(pos.netProfit, 2)}
                                                                            </td>


                                                                            <td>
                                                                                {pos.exercisedAt
                                                                                    ? new Date(pos.exercisedAt).toLocaleString()
                                                                                    : "--"}
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                ) : (
                                                                    <tr>
                                                                        <td colSpan="9" className="text-center py-4">
                                                                            <div className="notfound_vector d-flex flex-column align-items-center">
                                                                                <img
                                                                                    src="/images/option-img/search_not_found.svg"
                                                                                    alt="not found"
                                                                                    width="80"
                                                                                />
                                                                                <p className="mt-2 text-muted">No exercise history found</p>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </tbody>

                                                        </table>
                                                    </div> :

                                                        <div class="notfound_vector">
                                                            <img
                                                                src="/images/option-img/search_not_found.svg"
                                                                alt="not found"
                                                                width="80"
                                                            />
                                                        </div>
                                                    }
                                                </div>

                                            </div>

                                        </div>
                                    </div>

                                    {/* <div class="tab-content pt-1" id="myTabContent2">
                                        <div
                                            class="tab-pane fade active show"
                                            id="positions"
                                            role="tabpanel"
                                            aria-labelledby="positions-tab"
                                        >

                                        </div>


                                        <div
                                            className="tab-pane fade show active"
                                            id="opentwo"
                                            role="tabpanel"
                                            aria-labelledby="open-tabtwo"
                                        >
                                            <div className="table-responsive">
                                                <table className="table table-striped align-middle">
                                                    <thead>
                                                        <tr>
                                                            <th>Side</th>
                                                            <th>Symbol</th>
                                                            <th>Price (USDT)</th>
                                                            <th>Size (Cont)</th>
                                                            <th>Filled</th>
                                                            <th>Avg. Fill</th>
                                                            <th>Index Price</th>
                                                            <th>Status</th>
                                                            <th>Time</th>
                                                            <th>Close</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {openOrder && openOrder.length > 0 ? (
                                                            openOrder.map((order) => (
                                                                <tr key={order._id}>
                                                                    <td
                                                                        className={`badge ${order.side === "BUY" ? "bg-success" : "bg-danger"
                                                                            }`}
                                                                    >
                                                                        {order.side}

                                                                    </td>
                                                                    <td>{order.symbol || "--"}</td>
                                                                    <td>{formatNumber(order.price, 2)}</td>
                                                                    <td>{formatNumber(order.quantity, 4)}</td>
                                                                    <td>{formatNumber(order.filledQty, 4)}</td>
                                                                    <td>{formatNumber(order.avgFillPrice, 2)}</td>
                                                                    <td>{formatNumber(order.spotPrice, 2)}</td>
                                                                    <td
                                                                        className={`badge ${order.status === "WORKING"
                                                                            ? "bg-warning text-dark"
                                                                            : order.status === "FILLED"
                                                                                ? "bg-success"
                                                                                : "bg-secondary"
                                                                            }`}
                                                                    >
                                                                        {order.status}

                                                                    </td>
                                                                    <td>
                                                                        {order.createdAt
                                                                            ? new Date(order.createdAt).toLocaleString()
                                                                            : "--"}
                                                                    </td>
                                                                    <td>
                                                                        <button className="btn text-danger btn-sm btn-icon" type="button" onClick={() => handleCancelOrder(order?.orderId)} ><i className="ri-delete-bin-6-line pr-0"></i>
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="9" className="text-center py-4">
                                                                    <div className="notfound_vector d-flex flex-column align-items-center">
                                                                        <img
                                                                            src="/images/option-img/search_not_found.svg"
                                                                            alt="not found"
                                                                            width="80"
                                                                        />
                                                                        <p className="mt-2 text-muted">No open orders found</p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div class="tab-pane fade" id="order_hist" role="tabpanel" aria-labelledby="order_hist-tab">
                                            <div class="table-responsive">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>Side</th>
                                                            <th>Symbol</th>
                                                            <th>Order Type</th>
                                                            <th>Size (Cont)</th>
                                                            <th>Avg. Price</th>
                                                            <th>Fee (USDT)</th>
                                                            <th>Total Value</th>
                                                            <th>Total Cost</th>
                                                            <th>Index Price</th>
                                                            <th>Status</th>
                                                            <th>Time</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {orderHistory && orderHistory.length > 0 ? (
                                                            orderHistory.map((order) => {
                                                               
                                                                const totalValue = order.avgFillPrice * order.filledQty;
                                                                const totalCost = totalValue + order.feePaid;

                                                                return (
                                                                    <tr key={order._id}>
                                                                       
                                                                        <td>
                                                                            <span
                                                                                className={`badge ${order.side === "BUY" ? "bg-success" : "bg-danger"
                                                                                    }`}
                                                                            >
                                                                                {order.side}
                                                                            </span>
                                                                        </td>

                                                                       
                                                                        <td>{order.symbol || "--"}</td>

                                                                       
                                                                        <td>{order.type || "--"}</td>


                                                                       
                                                                        <td>{formatNumber(order.quantity, 4)}</td>

                                                                      
                                                                        <td>{formatNumber(order.price, 2)}</td>

                                                                        
                                                                        <td>{formatNumber(order.feePaid, 5)}</td>

                                                                       
                                                                        <td>{formatNumber(totalValue, 5)}</td>

                                                                       
                                                                        <td>{formatNumber(totalCost, 5)}</td>

                                                                       
                                                                        <td>{formatNumber(order.spotPrice, 2)}</td>

                                                                        
                                                                        <td>
                                                                            <span
                                                                                className={`badge ${order.status === "FILLED"
                                                                                    ? "bg-success"
                                                                                    : order.status === "CANCELLED"
                                                                                        ? "bg-secondary"
                                                                                        : order.status === "WORKING"
                                                                                            ? "bg-warning text-dark"
                                                                                            : "bg-light text-dark"
                                                                                    }`}
                                                                            >
                                                                                {order.status}
                                                                            </span>
                                                                        </td>

                                                                       
                                                                        <td>
                                                                            {order.updatedAt
                                                                                ? new Date(order.updatedAt).toLocaleString()
                                                                                : "--"}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="15">
                                                                    <div class="notfound_vector">
                                                                        <img
                                                                            src="/images/option-img/search_not_found.svg"
                                                                            alt="not found"
                                                                            width="80"
                                                                        />
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>


                                        <div class="tab-pane fade" id="Exercise" role="tabpanel"
                                            aria-labelledby="transaction-tab">
                                            <div class="table-responsive">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>Side</th>
                                                            <th>Symbol</th>
                                                            <th>Price</th>
                                                            <th>Size (Cont)</th>
                                                            <th>Time</th>
                                                            <th>Side</th>
                                                            <th>Symbol</th>
                                                            <th>Price</th>
                                                            <th>Size (Cont)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td colspan="15">
                                                                <div class="notfound_vector"><img src="/images/option-img/search_not_found.svg"
                                                                    alt="not found" width="80" /></div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>


                                    </div> */}

                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </div >

            {/* <!-- Modal Start leverage --> */}
            <div class="modal fade currency_popup_s crosstabs" id="twox" tabindex="-1"
                aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="btn-close" data-bs-dismiss="modal"
                                aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <h3>Adjust Leverage</h3>

                            <div className='range_value'>
                                <h4>Leverage</h4>

                                <div className='range_valuebox'>
                                    <div className='mines' o>-</div>
                                    <div className='inputvalue'>
                                        <input
                                            type='text'

                                        />
                                    </div>
                                    <div className='plus' >+</div>
                                </div>

                                <div
                                    className='progress-bar'

                                >
                                    <div
                                        className='progress-fill'
                                    // style={{ width: `${(Leverage / maxValue) * 100}%` }}
                                    ></div>
                                    <div
                                        className='progress-thumb'
                                    // style={{ left: `${(Leverage / maxValue) * 100}%` }}
                                    ></div>
                                </div>

                                <div className='value_selected'>
                                    <ul>
                                        {/* {leverageOptions.map((val) => (
                                                                    <li key={val} onClick={() => handleSelectClick(val)}>
                                                                        {val}x
                                                                    </li>
                                                                ))} */}
                                    </ul>
                                </div>
                            </div>

                            {/* <p>* Maximum position at current leverage: 50,000,000 USDT</p> */}
                            {/* <p>Please note that leverage changing will also apply for open positions and open orders.
                                                    </p> */}

                            <p className='redcolor'>* Selecting higher leverage such as [10x] increases your liquidation
                                risk. Always manage your risk levels. See our help article for more information.</p>
                            <div className='bn-modal-footer d-flex btnsupport'>
                                <button class="bn-button verifybtn" data-bs-dismiss="modal">Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <!-- Modal End --> */}

        </>
    )
}

export default ClassicOptions