import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TVChartContainer from "../../../customComponents/Libraries/TVChartContainer/indexmobile";
import { SocketContext } from '../../../customComponents/SocketContext';

const MobileChart = () => {
    const { socket } = useContext(SocketContext);
    const params = useParams();
    const theme = params?.theme;

    // Initial symbol from URL if present
    const initialPair = params?.pairs?.split('_') || ["BTC", "USDT"];
    const [selectedCoin, setSelectedCoin] = useState({
        base_currency: initialPair[0],
        quote_currency: initialPair[1]
    });

    let socketId = localStorage.getItem("socketId");

    // Listen for RN WebView messages to change symbol without reload
    useEffect(() => {
        const handleMessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === "CHANGE_SYMBOL" && data.symbol) {
                    const [base, quote] = data.symbol.split('_');
                    if (base && quote) {
                        setSelectedCoin({ base_currency: base, quote_currency: quote });
                    }
                }
            } catch (err) {
                console.error("Invalid message received:", event.data);
            }
        };
    
        // Listen for React Native messages
        document.addEventListener("message", handleMessage); // Android
        window.addEventListener("message", handleMessage);   // iOS
    
        return () => {
            document.removeEventListener("message", handleMessage);
            window.removeEventListener("message", handleMessage);
        };
    }, []);

    // Send socket updates
    useEffect(() => {
        let interval;
        if (selectedCoin && socket) {
            interval = setInterval(() => {
                const payload = {
                    message: 'phone-chart',
                    socketId: socketId,
                    base_currency: selectedCoin.base_currency,
                    quote_currency: selectedCoin.quote_currency,
                };
                socket.emit('message', payload);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [selectedCoin, socket, socketId]);

    // Apply theme
    useEffect(() => {
        if (theme === "light") {
            document.body.classList.add("light_theme");
        } else {
            document.body.classList.remove("light_theme");
        }
    }, [theme]);

    return (
        <div className="trade-wrapper mobile_trade spot login_bg mb-5 pb-3">
            <div className="spot-container mobile-spot-container container-fluid p-0">
                <div className="row g-2">
                    <div className="col-12">
                        <div className="mb-1 p-0">
                            <div className="cstm_tabs">
                                {selectedCoin.base_currency === undefined ? (
                                     <div className="spinner-border text-primary" role="status">
                                   </div>
                                ) : (
                                    <TVChartContainer
                                        symbol={`${selectedCoin.base_currency}/${selectedCoin.quote_currency}`}
                                        theme={theme}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileChart;
