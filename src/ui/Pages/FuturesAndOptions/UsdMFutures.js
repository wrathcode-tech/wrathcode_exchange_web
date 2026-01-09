import React, { useContext, useEffect, useRef, useState } from 'react'
import './CoinFutures.css'
import TVFuturesChartContainer from '../../../customComponents/Libraries/FuturesChartContainer';
import { SocketContext } from '../../../customComponents/SocketContext';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiConfig } from '../../../api/apiConfig/apiConfig';
import AuthService from '../../../api/services/AuthService';
import LoaderHelper from '../../../customComponents/Loading/LoaderHelper';
import { alertErrorMessage, alertSuccessMessage } from '../../../customComponents/CustomAlertMessage';
function UsdMFutures() {
    const socketId = sessionStorage.getItem("socketIdFuture")
    const userId = sessionStorage.getItem('userId');
    const token = sessionStorage.getItem('token');
    const orderBookColor = { buy: "#1c2a2b", sell: "#301e27" };

    let params = useParams()
    const wsRef = useRef(null);
    const reconnectIntervalRef = useRef(null);
    const currentSubscriptionRef = useRef(null);
    const navigate = useNavigate()

    const { socket } = useContext(SocketContext);
    const binanceEndpoint = 'wss://fstream.binance.com/ws';

    let URL = params?.pairs?.split('_');
    const [urlPath, setUrlPath] = useState(URL ? URL : []);
    const [pairData, setPairData] = useState([]);
    const [topPairs, setTopPairs] = useState([]);
    const [selectedCoin, setSelectedCoin] = useState({});
    const [BuyOrders, setBuyOrders] = useState([]);
    const [RecentTrade, setRecentTrade] = useState([]);
    const [SellOrders, setSellOrders] = useState([]);
    const [isPricePositive, setIsPricePositive] = useState(true);
    const [balance, setBalance] = useState({ baseCurrency: 0, quoteCurrency: 0 });
    const [estimatedportfolio, setEstimatedportfolio] = useState(0);
    const [leverageOptions, setLeverageOptions] = useState([]);


    const [showTpSlOption, setShowTpSlOption] = useState(false);
    const [Leverage, setLeverage] = useState(1);
    const [limitPrice, setLimitPrice] = useState(0);
    const [quantity, setQuantity] = useState("");
    const [orderType, setOrderType] = useState("Limit");
    const [takeProfit, setTakeProfit] = useState("");
    const [stopLoss, setStopLoss] = useState("");

    const [OpenOrders, setOpenOrders] = useState([]);
    const [openPositions, setOpenPositions] = useState([]);
    const [totalMaintenanceMargin, setTotalMaintenanceMargin] = useState(0);
    const [totalUnrealizedPnl, setTotalUnrealizedPnl] = useState(0);
    const [totalIsolatedMargin, setTotalIsolatedMargin] = useState(0);
    const [ordersHistory, setOrdersHistory] = useState([]);
    const [tradeHistory, setTradeHistory] = useState([]);
    const [closePositions, setClosePositions] = useState([]);


    const [activeMainTab, setActiveMainTab] = useState("order");
    const [activeInnerTab, setActiveInnerTab] = useState("all_orders");



    useEffect(() => {
        if (socket) {
            let payload = {
                'message': 'futures',
                'userId': userId,
                'futureSocketId': socketId,
            };
            socket.emit('message', payload);
            socket.on('message', (data) => {
                // if (data?.base_currency_id === "66138abf4197cf39e73e3bd9" || data.quote_currency_id === "66138abf4197cf39e73e3bd9") {
                //     setBuyOrders(data?.buy_order);
                //     setSellOrders(data?.sell_order);
                // }
                setPairData(data?.pairs);
                let filteredData = data?.pairs?.filter((item) => item?.short_name === "BTC" || item?.short_name === "ETH" || item?.short_name === "BNB")
                setTopPairs(filteredData)
                const positions = data?.open_position || [];
                setOpenPositions(positions);
                setClosePositions(data?.close_position);
                setOpenOrders(data?.open_orders || []);
                setOrdersHistory(data?.orders_history || []);
                setTradeHistory(data?.trade_history || []);
                const totalMaint = positions.reduce(
                    (sum, pos) => sum + (pos.maintenanceMargin || 0),
                    0
                );
                const totalPnl = positions.reduce(
                    (sum, pos) => sum + (pos.unrealizedPnl || 0),
                    0
                );
                const totalIM = positions.reduce(
                    (sum, pos) => sum + (pos.isolatedMargin || 0),
                    0
                );
                setTotalMaintenanceMargin(toFixedFive(totalMaint));
                setTotalUnrealizedPnl(toFixedFive(totalPnl));
                setTotalIsolatedMargin(toFixedFive(totalIM));

                setBalance({ baseCurrency: toFixedFive(data?.balance?.base_currency_balance) || 0, quoteCurrency: toFixedFive(data?.balance?.quote_currency_balance) || 0 })
            });
        }
    }, [socket]);

    useEffect(() => {
        let interval;
        // if (baseCurId && quoteCurId && socket) {
        if (socket) {

            interval = setInterval(() => {
                let payload = {
                    'message': 'futures',
                    'userId': userId,
                    'futureSocketId': socketId,
                    'base_currency_id': selectedCoin?.base_currency_id,
                    'quote_currency_id': selectedCoin?.quote_currency_id,
                }
                socket.emit('message', payload);
            }, 1000)
        }
        return (() => {
            clearInterval(interval)
        })
    }, [socket, selectedCoin]);

    // ********* Auto Select Coin Pair after Socket Connection ********** //
    useEffect(() => {
        if (Object.keys(selectedCoin)?.length === 0 && pairData?.length > 0) {
            var Pair;
            var filteredData;
            if (urlPath?.length > 0) {
                filteredData = pairData?.filter?.((item) => {
                    return urlPath[0]?.includes(item?.short_name) && urlPath[1]?.includes(item?.margin_asset)
                })
            }
            if (filteredData?.length > 0) {
                Pair = filteredData[0]
            }
            else {
                Pair = pairData[0]
            }
            navigate(`/usd_futures/${Pair?.short_name}_${Pair?.margin_asset}`);
            setSelectedCoin(Pair);
            const steps = 6;
            const options = [];

            for (let i = 0; i < steps; i++) {
                const val = Math.round((Pair?.max_leverage / (steps - 1)) * i);
                options.push(val < 1 ? 1 : val); // ensure minimum 1x
            }

            setLeverageOptions(options.slice(0, 6))
            setLimitPrice(Pair?.buy_price)

            subscribeToFuturesPair(Pair);

            let payload = {
                'message': 'futures',
                'futureSocketId': socketId,
                'userId': userId,
                'base_currency_id': Pair?.base_currency_id,
                'quote_currency_id': Pair?.quote_currency_id,
            }
            socket.emit('message', payload);
        } else if (Object.keys(selectedCoin)?.length > 0 && pairData?.length > 0) {
            let selectedItem = pairData?.filter?.((item) => {
                return selectedCoin?.short_name === item?.short_name && selectedCoin?.margin_asset === item?.margin_asset
            })[0] || {}

            if (selectedItem?.buy_price >= selectedCoin?.buy_price) {
                setIsPricePositive(true)
            } else {
                setIsPricePositive(false)
            }

            setSelectedCoin(selectedItem);


        }
    }, [pairData]);


    const connectFuturesWebSocket = () => {
        if (!selectedCoin) return;

        const endpoint = `wss://fstream.binance.com/stream`;
        const ws = new WebSocket(endpoint);
        wsRef.current = ws;

        let bufferBids = [];
        let bufferAsks = [];
        let initializedTrades = false; // flag per pair session

        ws.onopen = () => {
            subscribeToFuturesPair(selectedCoin);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const message = data?.data;

            if (message?.a && message?.b) {
                const transform = (arr) =>
                    arr.map(([p, q], i) => ({
                        price: parseFloat(p),
                        size: parseFloat(q),
                        sum: arr.slice(0, i + 1).reduce((acc, [_, qty]) => acc + parseFloat(qty), 0),
                    }));

                bufferBids = transform(message.b.slice(0, 30));
                bufferAsks = transform(message.a.slice(0, 30));

                // 🔥 Only prefill once per pair
                if (!initializedTrades && bufferBids.length && bufferAsks.length) {
                    const trades = Array.from({ length: 20 }, () =>
                        generateFakeTrade(bufferBids, bufferAsks)
                    );
                    setRecentTrade(trades); // dump 20 trades instantly
                    initializedTrades = true;
                }
            }
        };

        const orderbookInterval = setInterval(() => {
            if (bufferBids.length) setBuyOrders(bufferBids);
            if (bufferAsks.length) setSellOrders(bufferAsks?.reverse());
        }, 1500);

        const fakeTradeInterval = setInterval(() => {
            if (!initializedTrades) return;
            if (!bufferBids.length || !bufferAsks.length) return;

            const newTrade = generateFakeTrade(bufferBids, bufferAsks);
            setRecentTrade((prev) => {
                const next = [newTrade, ...prev];
                if (next.length > 20) next.pop(); // keep max 20
                return next;
            });
        }, 1500);

        ws.onerror = (e) => console.warn("❌ Futures WebSocket error:", e);

        ws.onclose = () => {
            console.warn("🔌 WebSocket closed. Reconnecting...");
            clearInterval(orderbookInterval);
            clearInterval(fakeTradeInterval);
            reconnectIntervalRef.current = setTimeout(connectFuturesWebSocket, 3000);
        };
    };

    const handleSelectCoin = (data) => {

        navigate(`/usd_futures/${data?.short_name}_${data?.margin_asset}`);
        setSelectedCoin(data)
        setLimitPrice(data?.buy_price)
        subscribeToFuturesPair(data);
        let payload = {
            'message': 'futures',
            'userId': userId,
            'futureSocketId': socketId,
            'base_currency_id': data?.base_currency_id,
            'quote_currency_id': data?.quote_currency_id,
        }
        socket.emit('message', payload);
    };

    // 🔧 Helper function for generating fake trades
    function generateFakeTrade(bids, asks) {
        const isBuy = Math.random() > 0.5;
        const orders = isBuy ? bids : asks;
        const selected = orders[Math.floor(Math.random() * orders.length)];
        if (!selected) return null;

        const qty = Math.max(Math.random() * selected.size, 0.001);

        return {
            id: Date.now() + Math.random(),
            side: isBuy ? "BUY" : "SELL",
            price: selected.price,
            quantity: parseFloat(qty.toFixed(3)),
            time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
        };
    }

    // Subscribe to a Futures Pair
    const subscribeToFuturesPair = (pair) => {
        setSellOrders([]);
        setBuyOrders([]);
        setRecentTrade([]);

        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            wsRef.current.onopen = () => subscribeToFuturesPair(pair);
            return;
        }

        // 🔴 Unsubscribe old subscription if exists
        if (currentSubscriptionRef.current?.length) {
            const unsubscribeMsg = {
                method: "UNSUBSCRIBE",
                params: currentSubscriptionRef.current,
                id: Date.now(),
            };
            wsRef.current.send(JSON.stringify(unsubscribeMsg));
            currentSubscriptionRef.current = [];
        }

        if (!pair) return; // ⚡ do not subscribe if no coin selected

        const data = `${pair?.short_name?.toLowerCase()}${pair?.margin_asset?.toLowerCase()}`;
        const depthStream = `${data}@depth20@100ms`;
        const tradeStream = `${data}@trade`;

        // ✅ Subscribe new
        const subscribeMsg = {
            method: "SUBSCRIBE",
            params: [depthStream, tradeStream],
            id: Date.now(),
        };
        wsRef.current.send(JSON.stringify(subscribeMsg));

        currentSubscriptionRef.current = [depthStream, tradeStream];
    };

    useEffect(() => {
        connectFuturesWebSocket();

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
                    connectFuturesWebSocket();
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            if (wsRef.current) {
                try {
                    wsRef.current.close();
                } catch (e) {
                    console.warn("Failed to close WebSocket on unmount");
                }
            }
            clearTimeout(reconnectIntervalRef.current);
        };
    }, [binanceEndpoint]);

    const estimatedPortfolio = async () => {
        try {
            LoaderHelper.loaderStatus(true);
            const result = await AuthService.estimatedPortfolio("");
            if (result?.success) {
                setEstimatedportfolio(result?.data?.dollarPrice);
            }
        } catch (error) {
        }
        finally { LoaderHelper.loaderStatus(false); }
    };

    useEffect(() => {
        estimatedPortfolio()
    }, []);


    const toFixedFive = (data) => {
        if (typeof (data) === "number") {
            return parseFloat(data?.toFixed(5));
        } else {
            return data;
        }
    };
    const toFixedThree = (data) => {
        if (typeof (data) === "number") {
            return parseFloat(data?.toFixed(5));
        } else {
            return data;
        }
    };

    const qunaityPrecision = (data) => {
        if (typeof (data) === "number") {
            return parseFloat(data?.toFixed(selectedCoin?.quantity_precision));
        } else {
            return data;
        }
    };

    const pricePrecision = (data) => {
        if (typeof (data) === "number") {
            return parseFloat(data?.toFixed(selectedCoin?.price_precision));
        } else {
            return data;
        }
    };

    const orderTabs = document.getElementById('orderTabs');
    if (orderTabs) {
        orderTabs.addEventListener('shown.bs.tab', function (e) {
            // remove active from dropdown toggle always
            orderTabs.querySelectorAll('.dropdown-toggle').forEach(el => el.classList.remove('active'));

            // if the newly activated tab is inside dropdown -> mark parent active
            if (e.target.closest('.dropdown-menu')) {
                e.target.closest('.dropdown').querySelector('.dropdown-toggle').classList.add('active');
            }
        });
    }


    const maxBuyVolume = Math.max(...BuyOrders.map(order => order.sum), 1);
    const maxSellVolume = Math.max(...SellOrders.map(order => order.sum), 1);




    const minValue = 1;
    const maxValue = selectedCoin?.max_leverage;

    const handleDecrease = () => {
        setLeverage(prev => (prev > minValue ? prev - 1 : prev));
        setPercentage(0);
    };

    const handleIncrease = () => {
        setLeverage(prev => (prev < maxValue ? prev + 1 : prev));
        setPercentage(0);
    };

    const handleInputChange = (e) => {
        let val = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
        if (val > maxValue) val = maxValue;
        if (val < minValue) val = minValue;
        setLeverage(val);
        setPercentage(0);
    };

    const handleSelectClick = (val) => {
        setLeverage(val);
        setPercentage(0);
    };

    // Drag handle for circle
    const handleDrag = (e) => {
        const bar = e.currentTarget.getBoundingClientRect();
        const percent = ((e.clientX - bar.left) / bar.width) * 100;
        const newVal = Math.round((percent / 100) * (maxValue - minValue) + minValue);
        if (newVal >= minValue && newVal <= maxValue) setLeverage(newVal);
    };


    const [searchTerm, setSearchTerm] = useState("");

    // Filter pairs based on search term
    const filteredPairs = pairData?.filter((pair) => {
        const term = searchTerm.toLowerCase();
        return (
            pair?.short_name?.toLowerCase().includes(term) ||
            pair?.margin_asset?.toLowerCase().includes(term) ||
            pair?.name?.toLowerCase().includes(term)
        );
    });

    function computeFuturesRisk(entryPrice = 0, qty = 0, leverage = 0, maintRate = 0.005) {
        if (!entryPrice || !qty || !leverage) {
            console.log("Missing required parameters");
            return { cost: 0, longLiq: 0, shortLiq: 0 };
        }

        // Use entry price for Limit, or selectedCoin price for Market
        let currentPrice = orderType === "Limit" ? entryPrice : selectedCoin?.buy_price || 0;

        // Add +0.1%
        const fractionPer = orderType === "Market" ? 1.001 : 1 // 0.1%
        currentPrice = currentPrice * fractionPer;

        entryPrice = currentPrice;

        const notional = entryPrice * qty;
        const cost = notional / leverage;

        const maintenance = notional * maintRate;
        const maintFraction = maintenance / notional;

        const longLiq = entryPrice * (1 - 1 / leverage + maintFraction);
        const shortLiq = entryPrice * (1 + 1 / leverage - maintFraction);

        return {
            cost: toFixedFive(cost),
            longLiq: pricePrecision(longLiq || 0),
            shortLiq: pricePrecision(shortLiq || 0),
        };
    }

    const [percentage, setPercentage] = useState(0);

    function computeQuantityFromBalance(percentage) {

        const fractionPer = orderType === "Market" ? 1.001 : 1 // 0.1%
        const price =
            orderType === "Limit"
                ? pricePrecision(limitPrice)
                : pricePrecision(selectedCoin?.buy_price * fractionPer) || 0;

        const marginBalance = balance?.quoteCurrency
        const leverage = Leverage

        if (!marginBalance || !percentage || !leverage || !price) return 0;

        // Step 1: balance % user selected
        const usableBalance = (marginBalance * percentage) / 100;

        // Step 2: max notional possible with leverage
        const maxNotional = usableBalance * leverage;

        // Step 3: qty = notional / price
        const qty = maxNotional / price;

        setQuantity(qunaityPrecision(qty || 0))
        setPercentage(percentage)
    }



    const [futuresRisk, setFuturesRisk] = useState({ cost: 0, longLiq: 0, shortLiq: 0 });

    useEffect(() => {
        if (orderType === "Market") return
        const riskData = computeFuturesRisk(limitPrice || 0, quantity || 0, Leverage || 0)
        setFuturesRisk(riskData)


    }, [limitPrice, quantity, Leverage, orderType]);

    useEffect(() => {
        if (orderType !== "Market") return
        const riskData = computeFuturesRisk(limitPrice || 0, quantity || 0, Leverage || 0)
        setFuturesRisk(riskData)


    }, [limitPrice, quantity, Leverage, selectedCoin, orderType]);

    function validateOrder({ balance, futuresRisk, quantity, orderType, limitPrice }) {
        if (balance < futuresRisk?.cost) {
            alertErrorMessage("Insufficient balance");
        }
        if (quantity <= 0) {
            alertErrorMessage("Quantity must be greater than 0");
            return { valid: false, message: "Quantity must be greater than 0" };
        }

        if (orderType === "Limit" && limitPrice <= 0) {
            alertErrorMessage("Limit price must be greater than 0");
        }

        return { valid: true };
    };

    const placeFutureOrder = async (side) => {
        try {
            LoaderHelper.loaderStatus(true);
            // ====== Validation ======
            if (side !== "LONG" && side !== "SHORT") {
                return alertErrorMessage("Invalid side. Must be LONG or SHORT.");
            }

            if (!selectedCoin) {
                return alertErrorMessage("No trading pair selected.");
            }

            if (!orderType) {
                return alertErrorMessage("Please select order type (Limit/Market).");
            }

            if (Leverage <= 0) {
                return alertErrorMessage("Invalid leverage selected.");
            }

            // Ensure balance is available
            if (!balance?.quoteCurrency || balance?.quoteCurrency <= 0) {
                return alertErrorMessage("Insufficient balance.");
            }

            // Price validations
            if (orderType === "Limit") {
                if (!limitPrice || limitPrice <= 0) {
                    return alertErrorMessage("Please enter a valid limit price.");
                }
            }

            // Quantity validation
            if (!quantity || quantity <= 0) {
                return alertErrorMessage("Please enter a valid quantity.");
            }

            // Cost check
            if (balance?.quoteCurrency < futuresRisk?.cost) {
                return alertErrorMessage("Insufficient balance for this order.");
            }

            const finalOrderType = orderType.toUpperCase();

            if (finalOrderType !== "LIMIT" && finalOrderType !== "MARKET") {
                return alertErrorMessage("Invalid order type. Must be LIMIT or MARKET.");
            }


            // ====== Prepare data with precision ======
            const finalPrice = finalOrderType === "LIMIT"
                ? pricePrecision(limitPrice)
                : pricePrecision(selectedCoin?.buy_price);
            console.log("🚀 ~ placeFutureOrder ~ finalPrice:", finalPrice)

            if (!finalPrice || finalPrice <= 0) {
                return alertErrorMessage("Please enter a valid limit price.");
            }

            const finalQuantity = qunaityPrecision(quantity);

            // ====== Send to backend ======
            const result = await AuthService?.placeFutureOrder(
                selectedCoin?.short_name,
                selectedCoin?.margin_asset,
                finalOrderType,
                side,
                +finalQuantity,
                +finalPrice,
                +Leverage,
                +takeProfit,
                +stopLoss,
                showTpSlOption
            );

            if (!result?.success) {
                return alertErrorMessage(result?.message || "Failed to place order.");
            }

            // ✅ Success
            alertSuccessMessage("Order placed successfully!");

        } catch (err) {
            alertErrorMessage(err?.message || "Something went wrong while placing the order.");
        } finally {
            LoaderHelper.loaderStatus(false);
        }
    };

    const placeReverseOrder = async (side, quantityToReverse, leverage, positionId, positionSide, pairId) => {
        // console.log("🚀 ~ placeReverseOrder ~ side, quantityToReverse, leverage, positionId, positionSide, pairId:", side, quantityToReverse, leverage, positionId, positionSide, pairId)
        // return
        try {
            LoaderHelper.loaderStatus(true);

            // ====== Validation ======
            if (!["LONG", "SHORT"].includes(side)) return alertErrorMessage("Invalid side. Must be LONG or SHORT.");
            if (!["LONG", "SHORT"].includes(positionSide)) return alertErrorMessage("Invalid position side. Must be LONG or SHORT.");
            if (leverage <= 0) return alertErrorMessage("Invalid leverage selected.");
            if (!balance?.quoteCurrency || balance?.quoteCurrency <= 0) return alertErrorMessage("Insufficient balance.");
            if (!quantityToReverse || quantityToReverse <= 0) return alertErrorMessage("Please enter a valid quantity.");

            // ====== Find pair info from pairData ======
            const pair = pairData?.find(p => p._id === pairId);
            if (!pair) return alertErrorMessage("Trading pair not found.");

            const fractionPer = 1.001; // Price fraction %
            const feePer = 0.0004; // Fee%
            const price = pair.buy_price * fractionPer;

            const finalQuantity = qunaityPrecision(quantityToReverse);

            // ====== Cost check ======
            const estimatedCost = (price * finalQuantity) / leverage;
            const estimatedFeeCOst = estimatedCost * feePer
            if (balance?.quoteCurrency < (estimatedCost + estimatedFeeCOst)) return alertErrorMessage("Insufficient balance for this reverse order.");

            // ====== Close current position ======
            const closeRes = await AuthService?.closePosition(positionId);
            if (!closeRes?.success) return alertErrorMessage(closeRes?.message || "Failed to close position.");

            alertSuccessMessage("Position close order placed successfully");

            // ====== Place reverse market order ======
            const oppositeSide = side; // the new side
            const result = await AuthService?.placeReverseFutureOrder(
                pair.short_name,
                pair.margin_asset,
                oppositeSide,
                +finalQuantity,
                +leverage
            );

            if (!result?.success) return alertErrorMessage(result?.message || "Failed to place reverse order.");
            alertSuccessMessage("Reverse order placed successfully!");
        } catch (err) {
            alertErrorMessage(err?.message || "Something went wrong while placing the reverse order.");
        } finally {
            LoaderHelper.loaderStatus(false);
        }
    };


    const closePosition = async (positionId) => {
        try {
            LoaderHelper.loaderStatus(true);
            if (!positionId) {
                return alertErrorMessage("Invalid position id");
            }

            // ====== API call ======
            const result = await AuthService?.closePosition(positionId)

            if (!result?.success) {
                return alertErrorMessage(result?.message || "Failed to close position.");
            }

            alertSuccessMessage("Position close order placed successfully");
        } catch (err) {
            alertErrorMessage(err?.message || "Something went wrong while closing the position.");
        } finally {
            LoaderHelper.loaderStatus(false);
        }
    };

    const cancelFutureOrder = async (orderId) => {
        try {
            LoaderHelper.loaderStatus(true);
            if (!orderId) {
                return alertErrorMessage("Invalid order id");
            }

            // ====== API call ======
            const result = await AuthService?.cancelFutureOrder(orderId)

            if (!result?.success) {
                return alertErrorMessage(result?.message || "Failed to cancel order.");
            }

            alertSuccessMessage("Order cancelled placed successfully");
        } catch (err) {
            alertErrorMessage(err?.message || "Something went wrong while cancelling the order.");
        } finally {
            LoaderHelper.loaderStatus(false);
        }
    };

    const loginScreen = () => {
        navigate(`/login`);
    }



    return (
        <>


            <div class="usd_future_dashboard">
                <div class="top_bar_usd_future">
                    <div class="top_future_left_s">
                        <div class="usd_left_pr">
                            <div class="btcusd__currency " data-bs-toggle="modal" data-bs-target="#exampleModal2">
                                <img className='icon_img' src={ApiConfig?.baseImage + selectedCoin?.icon_path} alt="bitcoin" /> {selectedCoin?.short_name}/{selectedCoin?.margin_asset} <span> <img src="/images/futures_img/arrowbottom_icon.svg" alt="arrow" /></span>
                            </div>
                            {/* <!-- Modal Start --> */}
                            <div class="modal fade currency_popup_s" id="exampleModal2" tabindex="-1"
                                aria-labelledby="exampleModalLabel" aria-hidden="true">
                                <div class="modal-dialog">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <button type="button" class="btn-close" data-bs-dismiss="modal"
                                                aria-label="Close"></button>
                                        </div>
                                        <div class="modal-body">
                                            <div class="search_form">
                                                <i class="ri-search-2-line"></i>
                                                <input
                                                    type="search"
                                                    placeholder="Search"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            <div class="bn-tabs_favorites_bl">
                                                <div class="top_tabs_center">
                                                    <ul class="nav nav-tabs" id="myTab" role="tablist">

                                                        <li class="nav-item" role="presentation">
                                                            <button class="nav-link active" id="usd-tab" data-bs-toggle="tab"
                                                                data-bs-target="#main-tab" type="button" role="tab"
                                                                aria-controls="usd-m" aria-selected="false">USDⓈ-M</button>
                                                        </li>
                                                    </ul>

                                                </div>

                                                <div class="tab-content" id="myTabContent">


                                                    <div class="tab-pane fade show active" id="main-tab" role="tabpanel"
                                                        aria-labelledby="favorites-tab">
                                                        <div id="all" role="tabpanel"
                                                            aria-labelledby="all-tab">
                                                            <div class="currency_data_list">
                                                                <div class="table-responsive ">
                                                                    <table>
                                                                        <thead>
                                                                            <tr>
                                                                                <th>Symbols/Vol</th>
                                                                                <th>Last Price</th>
                                                                                <th>24h Change</th>
                                                                                <th>Max Leverage</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {filteredPairs?.length > 0 ?
                                                                                filteredPairs?.map((pair) => {
                                                                                    return (
                                                                                        <tr key={pair?._id} onClick={() => handleSelectCoin(pair)} className='cursor-pointer' data-bs-dismiss="modal" aria-label="Close">
                                                                                            <td>
                                                                                                <div className="cnt_first_t">
                                                                                                    <div className="icon_currency icon">
                                                                                                        {/* <i className={"ri ri-star-line  ri-xl"}  >
                                                                                                        </i> */}
                                                                                                        <img src={ApiConfig?.baseImage + pair?.icon_path} alt="currency" className='' />
                                                                                                    </div>
                                                                                                    <div className="cnt">
                                                                                                        <h6>
                                                                                                            {pair?.short_name}/{pair?.margin_asset} <span>Perp</span>
                                                                                                        </h6>
                                                                                                        <p>Vol {toFixedThree(pair?.volume)}</p>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </td>
                                                                                            <td>{pricePrecision(pair?.buy_price)}</td>
                                                                                            <td class={pair?.change_percentage > 0 ? "text-success" : "danger"}>{toFixedThree(pair?.change_percentage)}%</td>
                                                                                            <td>{pair?.max_leverage}x</td>
                                                                                        </tr>
                                                                                    )
                                                                                })

                                                                                : <div> <p className="text-center no-data h-100 mb-0 center_b" >
                                                                                    <div className="no_data_s">
                                                                                        <img src="/images/no_data_vector.svg" className='img-fluid ' alt="no data" width="52" />
                                                                                        <small>No pair available</small>
                                                                                    </div>
                                                                                </p> </div>}

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
                            </div>
                            {/* <!-- Modal End --> */}


                            <div className="price_top_right">
                                <strong className={isPricePositive ? "text-green" : "text-red"}>
                                    {pricePrecision(selectedCoin?.buy_price) || "0.00"}
                                </strong>
                                <span className={selectedCoin?.change > 0 ? "text-green" : "text-red"}>
                                    {toFixedFive(selectedCoin?.change) || "0.00"} (
                                    {toFixedFive(selectedCoin?.change_percentage) || "0.00"}%)
                                </span>
                            </div>
                        </div>

                        <div className="market_price_list_top">
                            <ul>

                                {/* High / Low */}
                                {selectedCoin?.high && (
                                    <li>
                                        <span>24h High</span>
                                        <div className="price_tag">{toFixedFive(selectedCoin.high)}</div>
                                    </li>
                                )}
                                {selectedCoin?.low && (
                                    <li>
                                        <span>24h Low</span>
                                        <div className="price_tag">{toFixedFive(selectedCoin.low)}</div>
                                    </li>
                                )}


                                {/* Change & % */}
                                {(selectedCoin?.change || selectedCoin?.change_percentage) && (
                                    <li>
                                        <span>24h Change</span>
                                        <div className={`price_tag ${selectedCoin.change > 0 ? "text-green" : "text-red"}`}>
                                            {toFixedThree(selectedCoin.change)} ({toFixedThree(selectedCoin.change_percentage)}%)
                                        </div>
                                    </li>
                                )}

                                {/* Volume */}
                                {selectedCoin?.volume && (
                                    <li>
                                        <span>24h Volume</span>
                                        <div className="price_tag">{toFixedThree(selectedCoin.volume)} {selectedCoin?.short_name}</div>
                                    </li>
                                )}
                                {selectedCoin?.volumeQuote && (
                                    <li>
                                        <span>24h Turnover</span>
                                        <div className="price_tag">{toFixedFive(selectedCoin.volumeQuote)} {selectedCoin?.margin_asset}</div>
                                    </li>
                                )}

                                {/* Leverage */}

                                {selectedCoin?.max_leverage && (
                                    <li>
                                        <span>Max Leverage</span>
                                        <div className="price_tag">{selectedCoin.max_leverage}x</div>
                                    </li>
                                )}



                                {/* Fees */}
                                {/* {selectedCoin?.maker_fee && (
                                    <li>
                                        <span>Maker Fee</span>
                                        <div className="price_tag">{selectedCoin.maker_fee}%</div>
                                    </li>
                                )}
                                {selectedCoin?.taker_fee && (
                                    <li>
                                        <span>Taker Fee</span>
                                        <div className="price_tag">{selectedCoin.taker_fee}%</div>
                                    </li>
                                )} */}
                            </ul>
                        </div>


                    </div>

                    <div class="top_future_right_s">
                        <ul>
                            {topPairs?.length > 0 && topPairs?.map((item) => {
                                return (
                                    <>
                                        <li key={item?._id} onClick={() => handleSelectCoin(item)}><img src="/images/futures_img/tradetop_icon.svg" alt="Trade Information" />{item?.short_name}{item?.margin_asset}  <small className={item?.change_percentage > 0 ? 'success-color' : 'danger-color'}>{toFixedThree(item?.change_percentage)}%</small></li>

                                    </>
                                )
                            })}

                        </ul>
                    </div>
                </div>

                <div class="dashboard_mid_s space_gap_0 pa_2">
                    <div class="dashboard_summary_lft">
                        {Object.keys(selectedCoin)?.length > 0 ?
                            <TVFuturesChartContainer symbol={`${selectedCoin?.short_name}${selectedCoin?.margin_asset}_PERP`} />
                            : <div className="favouriteData dsfdsf" style={{ width: '100%', height: '100%', alignItems: 'center' }}>
                                <div class="spinner-border m-5" role="status">
                                    <span class="sr-only"></span>
                                </div>
                            </div>}
                        {/* <img src="/images/futures_img/dashboard_summry_left.svg" alt="dashboard" /> */}
                    </div>
                    <div className="order_trade_s">
                        <div className="trade_movers_tb">

                            {/* Main Tabs */}
                            <ul className="nav nav-tabs" role="tablist">
                                <li className="nav-item" role="presentation">
                                    <button
                                        className={`nav-link ${activeMainTab === "order" ? "active" : ""}`}
                                        onClick={() => setActiveMainTab("order")}
                                    >
                                        Order Book
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button
                                        className={`nav-link ${activeMainTab === "trades" ? "active" : ""}`}
                                        onClick={() => setActiveMainTab("trades")}
                                    >
                                        Recent Trades
                                    </button>
                                </li>
                            </ul>

                            {/* Main Tabs Content */}
                            <div className="tab-content table-trade">

                                {/* ORDER BOOK DATA */}
                                {activeMainTab === "order" && (
                                    <div className="tab-pane show active" id="order">

                                        {/* Inner tabs for buy/sell/all */}
                                        <div className="order_tabs buy_sell_cards buy_sell_row d-flex-between">
                                            <ul className="nav custom-tabs nav_order">
                                                <li className="fav-tab">
                                                    <a
                                                        className={activeInnerTab === "all_orders" ? "active" : ""}
                                                        onClick={() => setActiveInnerTab("all_orders")}
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        <img alt="" src="/images/order_1.svg" width="22" height="11" />
                                                    </a>
                                                </li>
                                                <li className="usdt-tab">
                                                    <a
                                                        className={activeInnerTab === "buy_orders" ? "active" : ""}
                                                        onClick={() => setActiveInnerTab("buy_orders")}
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        <img alt="" src="/images/order_2.svg" width="22" height="11" />
                                                    </a>
                                                </li>
                                                <li className="btc-tab">
                                                    <a
                                                        className={activeInnerTab === "sell_orders" ? "active me-0" : "me-0"}
                                                        onClick={() => setActiveInnerTab("sell_orders")}
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        <img alt="" src="/images/order_3.svg" width="22" height="11" />
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                        {/* Inner Tab Content */}
                                        <div className="tab-content mt-2 buy_sell_row_price">
                                            <div className='table_info_data'>



                                                {/* All Orders */}
                                                {activeInnerTab === "all_orders" && (
                                                    <div className="tab-pane show active toggle2" id="all_orders">
                                                        <div className="table_info_data">

                                                            {/* <div class="price_card_head">
                                                                <div class="ps-0">Price(USDT)</div><div>Quantity(BTC)</div><div>Total(USDT)</div></div> */}
                                                            <div className="scroll_y scroll_y_reverse">
                                                                {SellOrders?.length > 0 ?
                                                                    <table>
                                                                        <thead>
                                                                        <tr>
                                                                            <th>Price ({selectedCoin?.margin_asset || "---"})</th>
                                                                            <th>Size ({selectedCoin?.short_name || "---"})</th>
                                                                            <th>Sum ({selectedCoin?.short_name || "---"})</th>
                                                                        </tr>
                                                                    </thead>
                                                                        <tbody>
                                                                            {SellOrders?.length > 0 ? (
                                                                                SellOrders.map((item) => {
                                                                                    const fillPercentage = (item.size / maxSellVolume) * 100;
                                                                                    return (
                                                                                        <tr
                                                                                            key={item?._id}
                                                                                            style={{
                                                                                                background: `linear-gradient(to left, ${orderBookColor?.sell} ${fillPercentage}%, transparent ${fillPercentage}%)`,
                                                                                            }}
                                                                                            className="cursor-pointer"
                                                                                            onClick={() => {
                                                                                                setLimitPrice(pricePrecision(item?.price));
                                                                                                setPercentage(0);
                                                                                            }}
                                                                                        >
                                                                                            <td className="danger">{pricePrecision(item?.price)}</td>
                                                                                            <td>{qunaityPrecision(item?.size)}</td>
                                                                                            <td>{toFixedFive(item?.sum)}</td>
                                                                                        </tr>
                                                                                    );
                                                                                })
                                                                            ) : (
                                                                                <tr colSpan="12">
                                                                                    <td colSpan="12">
                                                                                        <div className="favouriteData lodericon d-flex justify-content-center align-items-center">
                                                                                            <div className="spinner-border" role="status"></div>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            )}


                                                                        </tbody>
                                                                    </table>
                                                                    : <div className="favouriteData lodericon d-flex justify-content-center align-items-center">
                                                                        <div className="spinner-border" role="status"></div>
                                                                    </div>}
                                                            </div>

                                                            <div className="mrkt_trde_tab justify-content-center">
                                                                <table>

                                                                    <tbody>


                                                                        {/* Total Row */}
                                                                        <tr className="totaltb">
                                                                            <td className="danger">{pricePrecision(selectedCoin?.buy_price)}</td>
                                                                            <td></td>
                                                                            <td>
                                                                                <div className="subtotal">
                                                                                    <div>
                                                                                        <span>%</span>
                                                                                        {toFixedFive(selectedCoin?.change_percentage)}
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                        </tr>

                                                                    </tbody>
                                                                </table>
                                                            </div>

                                                            <div className="price_card_body scroll_y">
                                                                {BuyOrders?.length > 0 ? <table>
                                                                    {/* <thead>
                                                                        <tr>
                                                                            <th>Price ({selectedCoin?.margin_asset || "---"})</th>
                                                                            <th>Size ({selectedCoin?.short_name || "---"})</th>
                                                                            <th>Sum ({selectedCoin?.short_name || "---"})</th>
                                                                        </tr>
                                                                    </thead> */}
                                                                    <tbody>

                                                                        {BuyOrders?.length > 0 ? (
                                                                            BuyOrders.map((item) => {
                                                                                const fillPercentage = (item.size / maxBuyVolume) * 100;
                                                                                return (
                                                                                    <tr
                                                                                        key={item?._id}
                                                                                        style={{
                                                                                            background: `linear-gradient(to left, ${orderBookColor?.buy} ${fillPercentage}%, transparent ${fillPercentage}%)`,
                                                                                        }}
                                                                                        className="cursor-pointer"
                                                                                        onClick={() => {
                                                                                            setLimitPrice(pricePrecision(item?.price));
                                                                                            setPercentage(0);
                                                                                        }}
                                                                                    >
                                                                                        <td className="sucess">{pricePrecision(item?.price)}</td>
                                                                                        <td>{qunaityPrecision(item?.size)}</td>
                                                                                        <td>{toFixedFive(item?.sum)}</td>
                                                                                    </tr>
                                                                                );
                                                                            })
                                                                        ) : (
                                                                            // <tr>
                                                                            //     <td colSpan="3">
                                                                            <div className="favouriteData d-flex justify-content-center align-items-center">
                                                                                <div className="spinner-border" role="status"></div>
                                                                            </div>
                                                                            //     </td>
                                                                            // </tr>
                                                                        )}
                                                                    </tbody>
                                                                </table> :
                                                                    <div className="favouriteData lodericon d-flex justify-content-center align-items-center">
                                                                        <div className="spinner-border" role="status"></div>
                                                                    </div>}
                                                            </div>

                                                        </div>
                                                    </div>
                                                )}


                                                {/* Buy Orders */}
                                                {activeInnerTab === "buy_orders" && (
                                                    <div className="tab-pane show active" id="buy_orders">
                                                        <div className="table_info_data">
                                                            
                                                            <div className="table-responsive">
                                                                {BuyOrders?.length > 0 ? <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Price ({selectedCoin?.margin_asset || "---"})</th>
                                                                            <th>Size ({selectedCoin?.short_name || "---"})</th>
                                                                            <th>Sum ({selectedCoin?.short_name || "---"})</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {BuyOrders?.length > 0 ? (
                                                                            BuyOrders.map((item) => {
                                                                                const fillPercentage = (item.size / maxBuyVolume) * 100;
                                                                                return (
                                                                                    <tr
                                                                                        key={item?._id}
                                                                                        style={{
                                                                                            background: `linear-gradient(to left, ${orderBookColor?.buy} ${fillPercentage}%, transparent ${fillPercentage}%)`,
                                                                                        }}
                                                                                        className="cursor-pointer"
                                                                                        onClick={() => {
                                                                                            setLimitPrice(pricePrecision(item?.price));
                                                                                            setPercentage(0);
                                                                                        }}
                                                                                    >
                                                                                        <td className="sucess">{pricePrecision(item?.price)}</td>
                                                                                        <td>{qunaityPrecision(item?.size)}</td>
                                                                                        <td>{toFixedFive(item?.sum)}</td>
                                                                                    </tr>
                                                                                );
                                                                            })
                                                                        ) : (
                                                                            // <tr>
                                                                            //     <td colSpan="3">
                                                                            <div className="favouriteData d-flex justify-content-center align-items-center">
                                                                                <div className="spinner-border" role="status"></div>
                                                                            </div>
                                                                            //     </td>
                                                                            // </tr>
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                                    : <div className="favouriteData lodericon d-flex justify-content-center align-items-center">
                                                                        <div className="spinner-border" role="status"></div>
                                                                    </div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}




                                                {/* Sell Orders */}
                                                {activeInnerTab === "sell_orders" && (
                                                    <div className="tab-pane show active" id="sell_orders">
                                                        <div className="table_info_data">
                                                            <div className="table-responsive">
                                                                {SellOrders?.length > 0 ?
                                                                    <table>
                                                                        <thead>
                                                                            <tr>
                                                                                <th>Price ({selectedCoin?.margin_asset || "---"})</th>
                                                                                <th>Size ({selectedCoin?.short_name || "---"})</th>
                                                                                <th>Sum ({selectedCoin?.short_name || "---"})</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {SellOrders?.length > 0 ? (
                                                                                SellOrders.map((item) => {
                                                                                    const fillPercentage = (item.size / maxSellVolume) * 100;
                                                                                    return (
                                                                                        <tr
                                                                                            key={item?._id}
                                                                                            style={{
                                                                                                background: `linear-gradient(to left, ${orderBookColor?.sell} ${fillPercentage}%, transparent ${fillPercentage}%)`,
                                                                                            }}
                                                                                            className="cursor-pointer"
                                                                                            onClick={() => {
                                                                                                setLimitPrice(pricePrecision(item?.price));
                                                                                                setPercentage(0);
                                                                                            }}
                                                                                        >
                                                                                            <td className="danger">{pricePrecision(item?.price)}</td>
                                                                                            <td>{qunaityPrecision(item?.size)}</td>
                                                                                            <td>{toFixedFive(item?.sum)}</td>
                                                                                        </tr>
                                                                                    );
                                                                                })
                                                                            ) : (
                                                                                // <tr>
                                                                                //     <td colSpan="3">
                                                                                <div className="favouriteData d-flex justify-content-center align-items-center">
                                                                                    <div className="spinner-border" role="status"></div>
                                                                                </div>
                                                                                //     </td>
                                                                                // </tr>
                                                                            )}
                                                                        </tbody>
                                                                    </table> : <div className="favouriteData d-flex justify-content-center align-items-center">
                                                                        <div className="spinner-border" role="status"></div>
                                                                    </div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                            </div>

                                        </div>
                                    </div>
                                )}

                                {/* RECENT TRADES */}
                                {activeMainTab === "trades" && (
                                    <div className="tab-pane show active mt-2" id="trades">
                                        <div className="table_info_data">
                                            <div className="table-responsive">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>Price({selectedCoin?.margin_asset || "---"})</th>
                                                            <th>Amount({selectedCoin?.short_name || "---"})</th>
                                                            <th>Time</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {RecentTrade?.length > 0 ? (
                                                            RecentTrade.map((order) => (
                                                                <tr key={order.id}>
                                                                    <td className={order?.side === "BUY" ? "sucess" : "danger"}>
                                                                        {toFixedThree(order?.price)}
                                                                    </td>
                                                                    <td>{toFixedThree(order?.quantity)}</td>
                                                                    <td>{order?.time}</td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="3">
                                                                    <div className="no_data_s text-center">
                                                                        <div className="spinner-border text-secondary" role="status"></div>
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
                            </div>
                        </div>



                    </div>

                    <div class="relative_select_right">
                        <div class="top_cross_dashboard">
                            <ul>
                                <li>
                                    <a href="#" data-bs-toggle="modal" data-bs-target="#cross">Cross <i class="ri-arrow-down-s-fill"></i></a>

                                    {/* <!-- Modal Start Margin  --> */}
                                    <div class="modal fade currency_popup_s crosstabs" id="cross" tabindex="-1"
                                        aria-labelledby="exampleModalLabel" aria-hidden="true">
                                        <div class="modal-dialog modal-dialog-centered">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <button type="button" class="btn-close" data-bs-dismiss="modal"
                                                        aria-label="Close"></button>
                                                </div>
                                                <div class="modal-body">

                                                    <h3>Margin Mode</h3>
                                                    <h4>{selectedCoin?.short_name}{selectedCoin?.margin_asset} <sup>Perp</sup></h4>
                                                    <div className='isolated_checked'>Isolated</div>
                                                    <p>* Changing the margin mode will only affect the contract you have selected.</p>
                                                    <p>* Cross Margin Mode: All positions that use the same margin asset share a combined balance. If liquidation occurs, the total balance of that asset, along with any other open positions under it, may be at risk.</p>
                                                    <p>* Isolated Margin Mode: Each position has its own dedicated margin, allowing you to control risk individually. If a position’s margin ratio reaches 100%, it will be liquidated. You can add or remove margin for each position while using this mode.</p>



                                                    <div className='bn-modal-footer d-flex btnsupport'>
                                                        <button class="bn-button verifybtn" data-bs-dismiss="modal">Got it</button>
                                                        {/* <button class="customerbtn">Customer Support</button> */}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>



                                    {/* <div class="modal fade currency_popup_s crosstabs" id="cross" tabindex="-1"
                                        aria-labelledby="exampleModalLabel" aria-hidden="true">
                                        <div class="modal-dialog modal-dialog-centered">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <button type="button" class="btn-close" data-bs-dismiss="modal"
                                                        aria-label="Close"></button>
                                                </div>
                                                <div class="modal-body">
                                                    <div className='user_identyid'>
                                                        <img src="/images/user_identy.svg" alt="copy icon" />
                                                    </div>
                                                    <h4>Identity Verification Required</h4>
                                                    <p>To comply with regulations, complete identity verification to access Binance Futures services.</p>
                                                    <div className='bn-modal-footer d-flex btnsupport'>
                                                        <button class="bn-button verifybtn">Verify Now</button>
                                                        <button class="customerbtn">Customer Support</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div> */}
                                    {/* <!-- Modal End --> */}

                                </li>
                                <li>
                                    <a href="#" data-bs-toggle="modal" data-bs-target="#twox">{Leverage}x <i class="ri-arrow-down-s-fill"></i></a>
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
                                                            <div className='mines' onClick={handleDecrease}>-</div>
                                                            <div className='inputvalue'>
                                                                <input
                                                                    type='text'
                                                                    value={Leverage + 'x'}
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                            <div className='plus' onClick={handleIncrease}>+</div>
                                                        </div>

                                                        {/* Progress Bar with Circle */}
                                                        <div
                                                            className='progress-bar'
                                                            onMouseDown={(e) => handleDrag(e)} // click से भी value बदलेगी
                                                            onMouseMove={(e) => e.buttons === 1 && handleDrag(e)} // drag के लिए
                                                        >
                                                            <div
                                                                className='progress-fill'
                                                                style={{ width: `${(Leverage / maxValue) * 100}%` }}
                                                            ></div>
                                                            <div
                                                                className='progress-thumb'
                                                                style={{ left: `${(Leverage / maxValue) * 100}%` }}
                                                            ></div>
                                                        </div>

                                                        <div className='value_selected'>
                                                            <ul>
                                                                {leverageOptions.map((val) => (
                                                                    <li key={val} onClick={() => handleSelectClick(val)}>
                                                                        {val}x
                                                                    </li>
                                                                ))}
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
                                </li>
                                {/* <li><a href="#" data-bs-toggle="modal" data-bs-target="#twox">S</a></li> */}
                            </ul>

                        </div>

                        <div class="spot_future_">
                            <ul>
                                {/* <li><a href="/trade/futures">Spot <i class="ri-external-link-line"></i></a></li> */}

                                {/* <li class="active"><a href="#">Futures</a></li> */}
                            </ul>
                        </div>
                        <div class="leverage_bl cursor-pointer" data-bs-toggle="modal" data-bs-target="#twox" >
                            <div>
                                <div class="rage_txt" >
                                    <img src="/images/futures_img/irage_icon.svg" alt="leverage" /> Leverage
                                </div>
                                <div class="range_price">{Leverage}x <img src="/images/futures_img/arrowright_dotted.svg" /></div>
                            </div>


                        </div>

                        <div class="market_spot_form">


                            <ul class="limit_tabs">
                                <li class="nav-item positions_two" role="presentation">
                                    <button type="button" onClick={() => { setOrderType("Limit"); setShowTpSlOption(false); setQuantity(""); setPercentage(0) }}>
                                        Limit
                                    </button>
                                </li>
                                <li class="nav-item open_two" role="presentation">
                                    <button type="button" onClick={() => { setOrderType("Market"); setShowTpSlOption(false); setQuantity(""); setPercentage(0) }}>
                                        Market
                                    </button>
                                </li>

                            </ul>
                            {/* 

                            <ul class="nav nav-tabs" id="orderTabs" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link active" id="limit-tab" data-bs-toggle="tab" data-bs-target="#limit"
                                        type="button" role="tab" aria-controls="limit" aria-selected="true" onClick={() => { setOrderType("Limit"); setShowTpSlOption(false); setQuantity(""); setPercentage(0) }}>
                                        Limit
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="market-tab" data-bs-toggle="tab" data-bs-target="#market"
                                        type="button" role="tab" aria-controls="market" aria-selected="false" onClick={() => { setOrderType("Market"); setShowTpSlOption(false); setQuantity(""); setPercentage(0) }}>
                                        Market
                                    </button>
                                </li>
                            </ul> */}


                            <div className='cnt_table_two positions_two'>
                                <form class="price_info">
                                    <div class="price_inputbl">
                                        <label>Price</label>
                                        <div class="price_select_option">
                                            <input class="inputtype" type="number" placeholder="Price" value={limitPrice} onWheel={(e) => e.target.blur()} onChange={(e) => { setLimitPrice(pricePrecision(+e.target.value)); setPercentage(0) }} />
                                            <select>
                                                <option>{selectedCoin?.margin_asset}</option>
                                                {/* <option>BTC</option> */}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="price_inputbl">
                                        <label>Size <span class="btctoggle">({selectedCoin?.short_name})

                                        </span></label>
                                        <div class="price_select_option">
                                            <input class="inputtype" type="number" placeholder="Size" value={quantity} onWheel={(e) => e.target.blur()} onChange={(e) => { setQuantity(qunaityPrecision(+e.target.value)); setPercentage(0) }} />
                                            <select>
                                                <option>{selectedCoin?.short_name}</option>
                                                {/* <option>BTC</option> */}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="price_inputbl value_choose">
                                        <ul>
                                            {[20, 40, 60, 80, 100].map((perc) => (
                                                <li><button type='button' className={percentage === perc && "active"} onClick={() => computeQuantityFromBalance(perc)}>{perc}%</button></li>
                                            ))}
                                            {/* <li><button type='button'>40%</button></li>
                                                <li><button type='button'>60%</button></li>
                                                <li><button type='button'>80%</button></li>
                                                <li><button type='button'>100%</button></li> */}
                                        </ul>
                                    </div>
                                    <div class="price_inputbl">
                                        <div class="avail_total_usd">
                                            <label>Avail.</label>
                                            <div class="usd_price">{toFixedFive(balance?.quoteCurrency)} {selectedCoin?.margin_asset}</div>
                                        </div>
                                    </div>
                                    <div class="price_inputbl">
                                        <div class="tpsl_reduce d-flex gap-1">
                                            <div class="form-check">
                                                <div className='tpsltabs'>
                                                    <input class="form-check-input" type="checkbox" id="tp-sl" checked={showTpSlOption} onChange={(e) => setShowTpSlOption(e.target.checked)} />
                                                    <label class="form-check-label" for="tp-sl">TP/SL</label>
                                                </div>

                                                {/* <!-- TP/SL ON CLICK CONTENT COMMENT START --> */}

                                                {showTpSlOption &&
                                                    <div className='tp_sl_option'>
                                                        <div class="price_inputbl">
                                                            <label>Take Profit</label>
                                                            <div class="price_select_option">
                                                                <input class="inputtype" type="number" placeholder="PnL" onWheel={(e) => e.target.blur()} value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} />
                                                                <select>
                                                                    <option>PnL</option>
                                                                    {/* <option>Lst</option> */}
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div class="price_inputbl">
                                                            <label>Stop Loss</label>
                                                            <div class="price_select_option">
                                                                <input
                                                                    className="inputtype"
                                                                    type="number"
                                                                    placeholder="PnL"
                                                                    onWheel={(e) => e.target.blur()}
                                                                    value={stopLoss}
                                                                    onChange={(e) => {
                                                                        let val = Number(e.target.value);
                                                                        if (isNaN(val)) {
                                                                            setStopLoss(""); // allow clearing input
                                                                        } else {
                                                                            setStopLoss(val > 0 ? -val : val); // always keep negative
                                                                        }
                                                                    }}
                                                                />

                                                                <select>
                                                                    <option>PnL</option>
                                                                    {/* <option>Lst</option> */}
                                                                </select>
                                                            </div>
                                                        </div>

                                                    </div>
                                                }
                                                {/* <!-- TP/SL ON CLICK CONTENT COMMENT END --> */}

                                            </div>


                                        </div>
                                    </div>
                                    <div class="price_inputbl">
                                        <div class="buysell_btn d-flex gap-2 align-items-center">
                                            {!token ? (
                                                <button className="buybtn" type="button" onClick={() => loginScreen()}>
                                                    Login
                                                </button>
                                            ) : (balance?.quoteCurrency < futuresRisk?.cost || quantity <= 0 ||
                                                (orderType === "Limit" && limitPrice <= 0)) ? (
                                                <button
                                                    className="buybtn"
                                                    type="button"
                                                    onClick={() => {
                                                        validateOrder({
                                                            balance: balance?.quoteCurrency || 0,
                                                            futuresRisk,
                                                            quantity,
                                                            orderType,
                                                            limitPrice,
                                                        });
                                                    }}
                                                >
                                                    Buy/Long
                                                </button>

                                            ) : (
                                                <button className="buybtn" type="button" onClick={() => placeFutureOrder("LONG")}>
                                                    Buy/Long
                                                </button>
                                            )}

                                            {!token ? (
                                                <button className="sellbtn" type="button" onClick={() => loginScreen()}>
                                                    Login
                                                </button>
                                            ) : (balance?.quoteCurrency < futuresRisk?.cost || quantity <= 0 ||
                                                (orderType === "Limit" && limitPrice <= 0)) ? (
                                                <button
                                                    className="sellbtn"
                                                    type="button"
                                                    onClick={() => {
                                                        validateOrder({
                                                            balance: balance?.quoteCurrency || 0,
                                                            futuresRisk,
                                                            quantity,
                                                            orderType,
                                                            limitPrice,
                                                        });
                                                    }}
                                                >
                                                    Sell/Short
                                                </button>

                                            ) : (
                                                <button className="sellbtn" type="button" onClick={() => placeFutureOrder("SHORT")}>
                                                    Sell/Short
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div class="price_inputbl  mt-2">

                                        <div class="d-flex justify-content-between costbtc_total liq_price">
                                            <div class="d-flex align-items-center">
                                                <h5>Liq Price <span> {futuresRisk?.shortLiq || "---"} {selectedCoin?.margin_asset}</span></h5>
                                            </div>
                                            <div class="d-flex align-items-center">
                                                <h5>Liq Price <span> {futuresRisk?.longLiq || "---"} {selectedCoin?.margin_asset}</span></h5>
                                            </div>
                                        </div>

                                        <div class="d-flex justify-content-between costbtc_total">
                                            <div class="d-flex align-items-center">
                                                <h5>Cost <span>{futuresRisk?.cost || "---"} {selectedCoin?.margin_asset}</span></h5>
                                            </div>
                                            <div class="d-flex align-items-center">
                                                <h5>Cost <span>{futuresRisk?.cost || "---"} {selectedCoin?.margin_asset}</span></h5>
                                            </div>
                                        </div>
                                        <div class="d-flex justify-content-between costbtc_total">
                                            <div class="d-flex align-items-center">
                                                <h5>Max long <span> NL</span></h5>
                                            </div>
                                            <div class="d-flex align-items-center">
                                                <h5>Max short <span> NL</span></h5>
                                            </div>
                                        </div>
                                        <div class="d-flex justify-content-between costbtc_total">
                                            <div class="d-flex align-items-center">
                                                <h5>Taker Fee <span> 0.4%</span></h5>
                                            </div>
                                            <div class="d-flex align-items-center">
                                                <h5>Maker Fee <span> 0.2%</span></h5>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className='cnt_table_two open_two'>
                                <form class="price_info">
                                    <div class="price_inputbl">
                                        <label>Price</label>
                                        <div class="price_select_option">
                                            <input class="inputtype" type="text" placeholder="Market Price" disabled />
                                            <select>
                                                <option>{selectedCoin?.margin_asset}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="price_inputbl">
                                        <label>Amount <span class="btctoggle">({selectedCoin?.short_name}) <img
                                            src="/images/futures_img/arrowright_dotted.svg" /></span></label>
                                        <div class="price_select_option">
                                            <input class="inputtype" type="number" placeholder="Size" value={quantity} onWheel={(e) => e.target.blur()} onChange={(e) => { setQuantity(e.target.value); setPercentage(0) }} />                                                <select>
                                                <option>{selectedCoin?.short_name}</option>
                                                {/* <option>USDT</option> */}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="price_inputbl value_choose">
                                        <ul>
                                            {[20, 40, 60, 80, 100].map((perc) => (
                                                <li><button type='button' className={percentage === perc && "active"} onClick={() => computeQuantityFromBalance(perc)}>{perc}%</button></li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div class="price_inputbl">
                                        <div class="avail_total_usd">
                                            <label>Avail.</label>
                                            <div class="usd_price">{toFixedFive(balance?.quoteCurrency)} {selectedCoin?.margin_asset}</div>
                                        </div>
                                    </div>
                                    <div class="price_inputbl">
                                        <div class="tpsl_reduce d-flex gap-3">
                                            <div class="form-check">
                                                <div className='tpsltabs'>
                                                    <input class="form-check-input" type="checkbox" id="tp-sl" checked={showTpSlOption} onChange={(e) => setShowTpSlOption(e.target.checked)} />
                                                    <label class="form-check-label" for="tp-sl">TP/SL</label>
                                                </div>
                                            </div>

                                            {showTpSlOption &&
                                                <div className='tp_sl_option'>
                                                    <div class="price_inputbl">
                                                        <label>Take Profit</label>
                                                        <div class="price_select_option">
                                                            <input class="inputtype" type="number" placeholder="PnL" onWheel={(e) => e.target.blur()} value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} />
                                                            <select>
                                                                <option>PnL</option>
                                                                {/* <option>Lst</option> */}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div class="price_inputbl">
                                                        <label>Stop Loss</label>
                                                        <div class="price_select_option">
                                                            <input
                                                                className="inputtype"
                                                                type="number"
                                                                placeholder="PnL"
                                                                onWheel={(e) => e.target.blur()}
                                                                value={stopLoss}
                                                                onChange={(e) => {
                                                                    let val = Number(e.target.value);
                                                                    if (isNaN(val)) {
                                                                        setStopLoss(""); // allow clearing input
                                                                    } else {
                                                                        setStopLoss(val > 0 ? -val : val); // always keep negative
                                                                    }
                                                                }}
                                                            />
                                                            <select>
                                                                <option>PnL</option>
                                                                {/* <option>Lst</option> */}
                                                            </select>
                                                        </div>
                                                    </div>

                                                </div>
                                            }




                                            {/* <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="reduce-only" />
                                                    <label class="form-check-label" for="reduce-only">Reduce only</label>
                                                </div> */}
                                        </div>
                                    </div>
                                    <div class="price_inputbl">
                                        <div class="buysell_btn d-flex gap-2 align-items-center">
                                            {!token ? (
                                                <button className="buybtn" type="button" onClick={() => loginScreen()}>
                                                    Login
                                                </button>
                                            ) : (balance?.quoteCurrency < futuresRisk?.cost || quantity <= 0 ||
                                                (orderType === "Limit" && limitPrice <= 0)) ? (
                                                <button
                                                    className="buybtn"
                                                    type="button"
                                                    onClick={() => {
                                                        validateOrder({
                                                            balance: balance?.quoteCurrency || 0,
                                                            futuresRisk,
                                                            quantity,
                                                            orderType,
                                                            limitPrice,
                                                        });
                                                    }}
                                                >
                                                    Buy/Long
                                                </button>

                                            ) : (
                                                <button className="buybtn" type="button" onClick={() => placeFutureOrder("LONG")}>
                                                    Buy/Long
                                                </button>
                                            )}

                                            {!token ? (
                                                <button className="sellbtn" type="button" onClick={() => loginScreen()}>
                                                    Login
                                                </button>
                                            ) : (balance?.quoteCurrency < futuresRisk?.cost || quantity <= 0 ||
                                                (orderType === "Limit" && limitPrice <= 0)) ? (
                                                <button
                                                    className="sellbtn"
                                                    type="button"
                                                    onClick={() => {
                                                        validateOrder({
                                                            balance: balance?.quoteCurrency || 0,
                                                            futuresRisk,
                                                            quantity,
                                                            orderType,
                                                            limitPrice,
                                                        });
                                                    }}
                                                >
                                                    Sell/Short
                                                </button>

                                            ) : (
                                                <button className="sellbtn" type="button" onClick={() => placeFutureOrder("SHORT")}>
                                                    Sell/Short
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div class="price_inputbl  mt-2">

                                        <div class="d-flex justify-content-between costbtc_total liq_price">
                                            <div class="d-flex align-items-center">
                                                <h5>Liq Price <span> {futuresRisk?.shortLiq || "---"} {selectedCoin?.margin_asset}</span></h5>
                                            </div>
                                            <div class="d-flex align-items-center">
                                                <h5>Liq Price <span> {futuresRisk?.longLiq || "---"} {selectedCoin?.margin_asset}</span></h5>
                                            </div>
                                        </div>

                                        <div class="d-flex justify-content-between costbtc_total">
                                            <div class="d-flex align-items-center">
                                                <h5>Cost <span>{futuresRisk?.cost || "---"} {selectedCoin?.margin_asset}</span></h5>
                                            </div>
                                            <div class="d-flex align-items-center">
                                                <h5>Cost <span>{futuresRisk?.cost || "---"} {selectedCoin?.margin_asset}</span></h5>
                                            </div>
                                        </div>
                                        <div class="d-flex justify-content-between costbtc_total">
                                            <div class="d-flex align-items-center">
                                                <h5>Max long <span> NL</span></h5>
                                            </div>
                                            <div class="d-flex align-items-center">
                                                <h5>Max short <span> NL</span></h5>
                                            </div>
                                        </div>
                                        <div class="d-flex justify-content-between costbtc_total">
                                            <div class="d-flex align-items-center">
                                                <h5>Taker Fee <span> 0.4%</span></h5>
                                            </div>
                                            <div class="d-flex align-items-center">
                                                <h5>Maker Fee <span> 0.2%</span></h5>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* <div class="tab-content pt-1" id="myTabContent2">
                                <div class="tab-pane fade show active" id="limit" role="tabpanel" aria-labelledby="limit-tab">

                                

                                </div>
                                <div class="tab-pane fade" id="market" role="tabpanel" aria-labelledby="market-tab">
                                   

                                </div>
                                <div class="tab-pane fade" id="stop-market" role="tabpanel" aria-labelledby="stop-market-tab">

                                    <form class="price_info">
                                        <div class="price_inputbl">
                                            <label>Price</label>
                                            <div class="price_select_option">
                                                <input class="inputtype" type="text" placeholder="29197" />
                                                <select>
                                                    <option>USDT</option>
                                                    <option>BTC</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="price_inputbl">
                                            <label>Price 2</label>
                                            <div class="price_select_option">
                                                <input class="inputtype" type="text" placeholder="29197" />
                                                <select>
                                                    <option>USDT</option>
                                                    <option>BTC</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="price_inputbl">
                                            <label>Amount <span class="btctoggle">(BTC) <img
                                                src="/images/futures_img/arrowright_dotted.svg" /></span></label>
                                            <div class="price_select_option">
                                                <input class="inputtype" type="text" placeholder="0.000" />
                                                <select>
                                                    <option>BTC</option>
                                                    <option>USDT</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="price_inputbl">
                                            <ul>
                                                <li><button>20%</button></li>
                                                <li><button>40%</button></li>
                                                <li><button>60%</button></li>
                                                <li><button>80%</button></li>
                                                <li><button>100%</button></li>
                                            </ul>
                                        </div>
                                        <div class="price_inputbl">
                                            <div class="avail_total_usd">
                                                <label>Avail.</label>
                                                <div class="usd_price">0 USDT <img src="/images/futures_img/usd_icon_refersh.svg" /></div>
                                            </div>
                                        </div>
                                        <div class="price_inputbl">
                                            <div class="tpsl_reduce d-flex gap-3">
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="tp-sl" />
                                                    <label class="form-check-label" for="tp-sl">TP/SL</label>
                                                </div>
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="reduce-only" />
                                                    <label class="form-check-label" for="reduce-only">Reduce only</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="price_inputbl">
                                            <div class="buysell_btn d-flex gap-2 align-items-center">
                                                <button class="buybtn" data-bs-toggle="modal" data-bs-target="#buypop">Buy/Long</button>
                                                <button class="sellbtn" data-bs-toggle="modal" data-bs-target="#buypop">Sell/Short</button>
                                            </div>
                                        </div>
                                        <div class="price_inputbl  mt-2">
                                            <div class="d-flex justify-content-between costbtc_total">
                                                <div class="d-flex align-items-center">
                                                    <h5>Cost <span>- BTC</span></h5>
                                                </div>
                                                <div class="d-flex align-items-center">
                                                    <h5>Cost <span>- BTC</span></h5>
                                                </div>
                                            </div>
                                            <div class="d-flex justify-content-between costbtc_total">
                                                <div class="d-flex align-items-center">
                                                    <h5>Max long <span> 0.1230 BTC</span></h5>
                                                </div>
                                                <div class="d-flex align-items-center">
                                                    <h5>Max short <span> 0.0845 BTC</span></h5>
                                                </div>
                                            </div>
                                        </div>
                                    </form>

                                </div>
                                <div class="tab-pane fade" id="stop-limit" role="tabpanel" aria-labelledby="stop-limit-tab">

                                    <form class="price_info">
                                        <div class="price_inputbl">
                                            <label>Price</label>
                                            <div class="price_select_option">
                                                <input class="inputtype" type="text" placeholder="29197" />
                                                <select>
                                                    <option>USDT</option>
                                                    <option>BTC</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="price_inputbl">
                                            <label>Price 2</label>
                                            <div class="price_select_option">
                                                <input class="inputtype" type="text" placeholder="29197" />
                                                <select>
                                                    <option>USDT</option>
                                                    <option>BTC</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="price_inputbl">
                                            <label>Amount <span class="btctoggle">(BTC) <img
                                                src="/images/futures_img/arrowright_dotted.svg" /></span></label>
                                            <div class="price_select_option">
                                                <input class="inputtype" type="text" placeholder="0.000" />
                                                <select>
                                                    <option>BTC</option>
                                                    <option>USDT</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="price_inputbl value_choose">
                                            <ul>
                                                <li><button>20%</button></li>
                                                <li><button>40%</button></li>
                                                <li><button>60%</button></li>
                                                <li><button>80%</button></li>
                                                <li><button>100%</button></li>
                                            </ul>
                                        </div>
                                        <div class="price_inputbl">
                                            <div class="avail_total_usd">
                                                <label>Avail.</label>
                                                <div class="usd_price">0 USDT <img src="/images/futures_img/usd_icon_refersh.svg" /></div>
                                            </div>
                                        </div>
                                        <div class="price_inputbl">
                                            <div class="tpsl_reduce d-flex gap-3">
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="tp-sl" />
                                                    <label class="form-check-label" for="tp-sl">TP/SL</label>
                                                </div>
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="reduce-only" />
                                                    <label class="form-check-label" for="reduce-only">Reduce only</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="price_inputbl">
                                            <div class="buysell_btn d-flex gap-2 align-items-center">
                                                <button class="buybtn" data-bs-toggle="modal" data-bs-target="#buypop">Buy/Long</button>
                                                <button class="sellbtn" data-bs-toggle="modal" data-bs-target="#buypop">Sell/Short</button>
                                            </div>
                                        </div>
                                        <div class="price_inputbl  mt-2">
                                            <div class="d-flex justify-content-between costbtc_total">
                                                <div class="d-flex align-items-center">
                                                    <h5>Cost <span>- BTC</span></h5>
                                                </div>
                                                <div class="d-flex align-items-center">
                                                    <h5>Cost <span>- BTC</span></h5>
                                                </div>
                                            </div>
                                            <div class="d-flex justify-content-between costbtc_total">
                                                <div class="d-flex align-items-center">
                                                    <h5>Max long <span> 0.1230 BTC</span></h5>
                                                </div>
                                                <div class="d-flex align-items-center">
                                                    <h5>Max short <span> 0.0845 BTC</span></h5>
                                                </div>
                                            </div>
                                        </div>
                                    </form>

                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>

                <div class="trade_account_summary_assets">




                    <div class="trade_summary_table_lft mt-0 position_order">
                        <div class="top_th_easyop border-0">
                            <ul class="position_list">
                                <li class="nav-item positions" role="presentation">
                                    <button>Positions({openPositions?.length || 0})</button>
                                </li>
                                <li class="nav-item open" role="presentation">
                                    <button>Open Orders({OpenOrders?.length || 0})</button>
                                </li>
                                <li class="nav-item order_history" role="presentation">
                                    <button>Order History</button>
                                </li>
                                <li class="nav-item exercise_history" role="presentation">
                                    <button>Trade History</button>
                                </li>

                                <li class="nav-item position_history" role="presentation">
                                    <button>Position History</button>
                                </li>

                            </ul>
                            <div className='cnt_table positions'>
                                <div class="table-responsive">
                                    {openPositions?.length > 0 ?
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Symbol</th>
                                                    <th>Size</th>
                                                    <th>Entry Price</th>
                                                    <th>Mark Price</th>
                                                    <th>Liq. Price</th>
                                                    <th>Isolated Margin</th>
                                                    <th>Maintenance Margin</th>
                                                    <th>PNL</th>
                                                    <th className='yellowcolor'>MKT Close</th>
                                                    {/* <th>Reverse</th> */}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {openPositions?.map((pos) => {
                                                    const oppositeSide = pos.side === "LONG" ? "SHORT" : "LONG";

                                                    const handleReverse = () => {
                                                        // place double quantity opposite order
                                                        placeReverseOrder(oppositeSide, pos.quantity, pos.leverage, pos._id, pos.side, pos.pair_id);
                                                    };


                                                    return (
                                                        <tr key={pos._id}>
                                                            <td className={pos?.side === "LONG" ? "text-green" : "text-red"}>
                                                                {pos.symbol}
                                                                <div className='fulltbl'>
                                                                    <span className='subtxt'>Perp </span>
                                                                    <span className='subtxt'>{pos.leverage}x</span>
                                                                </div>
                                                            </td>
                                                            <td >{toFixedFive(pos.quantity)} {pos.baseCurrency} </td>
                                                            <td>{toFixedFive(pos.entryPrice)}</td>
                                                            <td>{toFixedFive(pos.lastMarkPrice)}</td>
                                                            <td>{toFixedFive(pos.liquidationPrice) || "---"}</td>
                                                            <td >{toFixedFive(pos.isolatedMargin)} {pos.marginAsset || "USDT"} (Cross)</td>
                                                            <td>{toFixedFive(pos.maintenanceMargin)} {pos.marginAsset || "USDT"}</td>
                                                            <td className={pos.unrealizedPnl >= 0 ? "text-green" : "text-red"}>{toFixedFive(pos.unrealizedPnl)} </td>
                                                            <td>
                                                                <button type='button' onClick={() => closePosition(pos._id)}>Market Close</button>
                                                            </td>
                                                            {/* <td>
                                                                <button className='reverse' type='button' onClick={handleReverse}>Reverse</button>
                                                            </td> */}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table> : <p className="text-center no-data h-100 mb-0 center_b" >
                                            <div className="no_data_s">
                                                <img src="/images/option-img/search_not_found.svg" className='img-fluid ' alt="no data" width="80" />
                                                {/* <small>No open position</small> */}
                                            </div>
                                        </p>}

                                </div>
                            </div>

                            <div className='cnt_table open'>
                                <div class="table-responsive">
                                    {OpenOrders?.length > 0 ?
                                        <table>

                                            <thead>
                                                <tr>
                                                    <th>Time</th>
                                                    <th>Symbol</th>
                                                    <th>Type</th>
                                                    <th>Side</th>
                                                    <th>Price</th>
                                                    <th>Average</th>
                                                    <th>Amount</th>
                                                    <th>Filled</th>
                                                    <th>Reduce Only</th>
                                                    <th>Post Only</th>
                                                    <th>Trigger Conditi ons</th>
                                                    <th>TP/SL</th>
                                                    <th>TIF</th>
                                                    <th className='yellowcolor'>Cancel All</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(
                                                    OpenOrders.map((order) => {
                                                        // Determine trigger condition display
                                                        let triggerCondition = "---";
                                                        if (order.isSL && order.positionSide) {
                                                            triggerCondition =
                                                                order.positionSide === "LONG"
                                                                    ? `<= ${pricePrecision(order.price)}`
                                                                    : `>= ${pricePrecision(order.price)}`;
                                                        } else if (order.isTP && order.positionSide) {
                                                            triggerCondition =
                                                                order.positionSide === "LONG"
                                                                    ? `>=  ${pricePrecision(order.price)}`
                                                                    : `<= ${pricePrecision(order.price)}`;
                                                        }

                                                        return (
                                                            <tr key={order._id}>
                                                                {/* Time */}
                                                                <td>
                                                                    {new Date(order.createdAt).toLocaleDateString()}{" "}
                                                                    <span className="time">{new Date(order.createdAt).toLocaleTimeString()}</span>
                                                                </td>

                                                                {/* Symbol */}
                                                                <td>
                                                                    {order.symbol}
                                                                    <div className="fulltbl">
                                                                        <span className="subtxt">Perp </span>
                                                                    </div>
                                                                </td>

                                                                {/* Type */}
                                                                <td>{order.type} {order.isTP ? "TAKE PROFIT" : order.isSL ? "STOP LOSS" : ""}</td>

                                                                {/* Side */}
                                                                <td className={order.side === "LONG" ? "greencolor" : "redcolor"}>
                                                                    {order.side === "LONG" ? "Buy" : "Sell"}
                                                                </td>

                                                                {/* Price */}
                                                                <td>
                                                                    {!order.isTP && !order.isSL
                                                                        ? order.price
                                                                            ? pricePrecision(order.price)
                                                                            : "-"
                                                                        : "---"}
                                                                </td>

                                                                {/* Avg Filled Price */}
                                                                <td>{pricePrecision(order.avgFillPrice) || "---"}</td>

                                                                {/* Amount / Quantity */}
                                                                <td>{order.quantity} {order.baseCurrency}</td>

                                                                {/* Filled */}
                                                                <td>{order.filledQty || 0} {order.baseCurrency}</td>

                                                                {/* Reduce Only */}
                                                                <td>{order.reduceOnly ? "Yes" : "No"}</td>

                                                                {/* Post Only */}
                                                                <td>{order.postOnly ? "Yes" : "No"}</td>

                                                                {/* Trigger Conditions */}
                                                                <td>{triggerCondition}</td>

                                                                {/* TP/SL */}
                                                                <td className={order.isTP ? "text-green" : order.isSL ? "text-red" : ""}>
                                                                    {order.isTP
                                                                        ? pricePrecision(order.takeProfitPnl)
                                                                        : order.isSL
                                                                            ? pricePrecision(order.stopLossPnl)
                                                                            : "---"}
                                                                </td>


                                                                {/* TIF */}
                                                                <td>{order.timeInForce || "GTC"}</td>

                                                                {/* Cancel / Action */}
                                                                <td className="yellowcolor">
                                                                    <button type='button' onClick={() => cancelFutureOrder(order?.orderId)}>
                                                                        Cancel <i className="ri-delete-bin-6-line"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>

                                        </table> : <p className="text-center no-data h-100 mb-0 center_b" >
                                            <div className="no_data_s">
                                                <img src="/images/option-img/search_not_found.svg" className='img-fluid ' alt="no data" width="80" />
                                                {/* <small>No open position</small> */}
                                            </div>
                                        </p>
                                    }
                                </div>
                            </div>

                            <div className='cnt_table order_history'>
                                <div class="table-responsive">
                                    {ordersHistory?.length > 0 ? <table>
                                        <thead>
                                            <tr>
                                                <th>Time</th>
                                                <th>Symbol</th>
                                                <th>Type</th>
                                                <th>Side</th>
                                                <th>Price</th>
                                                <th>Average</th>
                                                <th>Amount</th>
                                                <th>Filled</th>
                                                <th>Reduce Only</th>
                                                <th>TP/SL</th>
                                                <th>Status</th>
                                                <th className="yellowcolor">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ordersHistory.map((order) => (
                                                <tr key={order._id}>
                                                    {/* Time */}
                                                    <td>
                                                        {new Date(order.createdAt).toLocaleDateString()}{" "}
                                                        <span className="time">
                                                            {new Date(order.createdAt).toLocaleTimeString()}
                                                        </span>
                                                    </td>

                                                    {/* Symbol */}
                                                    <td>
                                                        {order.symbol}
                                                        <div className="fulltbl">
                                                            <span className="subtxt">Perp</span>
                                                        </div>
                                                    </td>

                                                    {/* Type */}
                                                    <td>{order.type}</td>

                                                    {/* Side */}
                                                    <td className={order.side === "LONG" ? "text-green" : "text-red"}>
                                                        {order.side === "LONG" ? "Buy" : "Sell"}
                                                    </td>

                                                    {/* Price */}
                                                    <td>
                                                        {order.price
                                                            ? toFixedFive(order.price)
                                                            : "---"}
                                                    </td>
                                                    <td>
                                                        {order.avgFillPrice
                                                            ? toFixedFive(order.avgFillPrice)
                                                            : "-"}
                                                    </td>

                                                    {/* Amount */}
                                                    <td>
                                                        {toFixedFive(order.quantity)} {order.baseCurrency}
                                                    </td>

                                                    {/* Filled */}
                                                    <td>
                                                        {toFixedFive(order.filledQty)} {order.baseCurrency}
                                                    </td>

                                                    {/* Reduce Only */}
                                                    <td>{order.reduceOnly ? "Yes" : "No"}</td>


                                                    {/* TP/SL */}
                                                    <td>
                                                        {order.isTP ? "TP" : order.isSL ? "SL" : "--"}
                                                    </td>

                                                    {/* Status */}
                                                    <td className={order.status ? "text-green" : "text-red"}>{order.status}</td>

                                                    {/* Error  */}
                                                    <td className="yellowcolor">
                                                        {order.error || "---"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table> : <p className="text-center no-data h-100 mb-0 center_b" >
                                        <div className="no_data_s">
                                            <img src="/images/option-img/search_not_found.svg" className='img-fluid ' alt="no data" width="80" />
                                            {/* <small>No open position</small> */}
                                        </div>
                                    </p>}
                                </div>
                            </div>
                            <div className='cnt_table exercise_history'>

                                <div class="table-responsive">
                                    {tradeHistory.length > 0 ? <table>
                                        <thead>
                                            <tr>
                                                <th>Time</th>
                                                <th>Symbol</th>
                                                <th>Type</th>
                                                <th>Side</th>
                                                <th>Price</th>
                                                <th>Amount</th>
                                                <th>Fee</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(
                                                tradeHistory.map((trade) => {
                                                    const createdAt = new Date(trade.createdAt);
                                                    const date = createdAt.toISOString().split("T")[0];
                                                    const time = createdAt.toTimeString().split(" ")[0];

                                                    return (
                                                        <tr key={trade._id}>
                                                            {/* Time */}
                                                            <td>
                                                                {date} <span className="time">{time}</span>
                                                            </td>

                                                            {/* Symbol */}
                                                            <td className={trade.side === "LONG" ? "text-green" : "text-red"}>
                                                                {trade.symbol}
                                                                <div className="fulltbl">
                                                                    <span className="subtxt">Perp</span>
                                                                </div>
                                                            </td>

                                                            {/* Order Type */}
                                                            <td>{trade.role === "TAKER" ? "Market" : "Limit"}</td>

                                                            {/* Side */}
                                                            <td className={trade.side === "LONG" ? "text-green" : "text-red"}>
                                                                {trade.side === "LONG" ? "BUY" : "SELL"}
                                                            </td>

                                                            {/* Price */}
                                                            <td>
                                                                {toFixedFive(trade.price)}{" "}
                                                            </td>

                                                            {/* Amount */}
                                                            <td>
                                                                {toFixedFive(trade.quantity)}{" "}
                                                            </td>

                                                            {/* Fee */}
                                                            <td>{toFixedFive(trade.fee)}</td>


                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table> : <p className="text-center no-data h-100 mb-0 center_b" >
                                        <div className="no_data_s">
                                            <img src="/images/option-img/search_not_found.svg" className='img-fluid ' alt="no data" width="80" />
                                            {/* <small>No open position</small> */}
                                        </div>
                                    </p>}

                                </div>

                            </div>
                            <div className='cnt_table position_history'>

                                <div class="table-responsive">
                                    {closePositions?.length > 0 ? <table>
                                        <thead>
                                            <tr>
                                                <th>Symbol</th>
                                                <th>Size</th>
                                                <th>Entry Price</th>
                                                <th>Exit Price</th>
                                                <th>PNL</th>
                                                <th>Open</th>
                                                <th>Closed</th>
                                                <th>Is liquidated?</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                closePositions?.map((pos) => {
                                                    const createdAt = new Date(pos.createdAt);
                                                    const updatedAt = new Date(pos.updatedAt);

                                                    const openDate = createdAt.toISOString().split("T")[0];
                                                    const openTime = createdAt.toTimeString().split(" ")[0];

                                                    const closeDate = updatedAt.toISOString().split("T")[0];
                                                    const closeTime = updatedAt.toTimeString().split(" ")[0];

                                                    return (
                                                        <tr key={pos._id}>
                                                            <td className={pos?.side === "LONG" ? "text-green" : "text-red"}>
                                                                {pos.symbol}
                                                                <div className="fulltbl">
                                                                    <span className="subtxt">Perp </span>
                                                                    <span className="subtxt">{pos?.side} </span>
                                                                    <span className="subtxt">{pos.leverage}x</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                {pos?.side === "LONG"
                                                                    ? toFixedFive(pos.totalLongQty)
                                                                    : toFixedFive(pos.totalShortQty)}{" "}
                                                                {pos.baseCurrency}
                                                            </td>
                                                            <td>{toFixedFive(pos.entryPrice)}</td>
                                                            <td>{toFixedFive(pos.exit_price)}</td>
                                                            <td
                                                                className={
                                                                    pos.realizedPnl >= 0 ? "text-green" : "text-red"
                                                                }
                                                            >
                                                                {toFixedFive(pos.realizedPnl)}
                                                            </td>
                                                            <td>
                                                                {openDate} <span className="time">{openTime}</span>
                                                            </td>
                                                            <td>
                                                                {closeDate} <span className="time">{closeTime}</span>
                                                            </td>
                                                            <td>
                                                                {pos.liquidated ? "YES" : "NO"}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            }
                                        </tbody>
                                    </table> : <p className="text-center no-data h-100 mb-0 center_b" >
                                        <div className="no_data_s">
                                            <img src="/images/option-img/search_not_found.svg" className='img-fluid ' alt="no data" width="80" />
                                            {/* <small>No open position</small> */}
                                        </div>
                                    </p>}

                                </div>

                            </div>

                        </div>

                    </div>

                    <div class="assets_right">
                        <h2>Assets</h2>
                        <div class="asset_total_value costbtc_total">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <h5>USDT-Perp</h5>
                                </div>
                            </div>
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <h6>Total Assets</h6>
                                </div>
                                <div><span>{toFixedFive(estimatedportfolio + totalIsolatedMargin) || 0} {selectedCoin?.margin_asset}</span></div>
                            </div>
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <h6>Available</h6>
                                </div>
                                <div><span>{toFixedFive(balance?.quoteCurrency + totalIsolatedMargin) || 0} {selectedCoin?.margin_asset}</span></div>
                            </div>
                            <hr />
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <h5>USDT-Perp</h5>
                                </div>
                            </div>
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <h6>Maintance Margin</h6>
                                </div>
                                <div><span>{totalMaintenanceMargin || 0} {selectedCoin?.margin_asset}</span></div>
                            </div>

                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <h6>Unrealized PNL</h6>
                                </div>
                                <div><span class={`text-${totalUnrealizedPnl > 0 ? "green" : "red"}`}>{totalUnrealizedPnl || 0} USDT</span></div>
                            </div>


                            <div class="d-flex align-items-center justify-content-between buy_transferbtn">
                                <Link to='/asset_managemnet/deposit'>Deposit Crypto</Link>
                                <Link to='/user_profile/asset_overview'>Transfer</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
            {/* <!-- buy/long / sell short pop-up --> */}
            <div class="modal fade currency_popup_s crosstabs" id="buypop" tabindex="-1" aria-labelledby="buypopLabel" aria-hidden="true" >
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="btn-close" data-bs-dismiss="modal"
                                aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div className='user_identyid'>
                                <img src="/images/user_identy.svg" alt="copy icon" />
                            </div>
                            <h4>3 Identity Verification Required</h4>
                            <p>To comply with regulations, complete identity verification to access Binance Futures services.</p>
                            <div className='bn-modal-footer d-flex btnsupport'>
                                <button class="bn-button verifybtn">Verify Now</button>
                                <button class="customerbtn">Customer Support</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* <!-- Modal End --> */}
            {/* 
            {showPopup && (
                <div style={styles.overlay}>
                    <div className="popup_modal" style={styles.popup}>
                        <img src="/images/Futures_cs.svg" alt="Coming Soon" style={styles.image} />
                    </div>

                </div>
            )} */}



        </>
    )
}

export default UsdMFutures