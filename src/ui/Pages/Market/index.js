import React, { useState, useEffect, useContext, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { alertErrorMessage } from "../../../customComponents/CustomAlertMessage";
import { ApiConfig } from "../../../api/apiConfig/apiConfig";
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper";
import AuthService from "../../../api/services/AuthService";
import { SocketContext } from "../../../customComponents/SocketContext";
import { Helmet } from "react-helmet-async";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";

// Cache for chart data to prevent duplicate API calls
const chartDataCache = {};
const pendingRequests = {};
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 400; // 250ms between requests (max 4/second to stay under limit)

// Mini Sparkline Chart Component
const MiniSparkline = React.memo(({ symbol, isPositive }) => {
  const [chartData, setChartData] = useState([]);
  const canvasRef = useRef(null);

  // Fetch historical data from CryptoCompare with rate limiting
  useEffect(() => {
    if (!symbol) return;

    // Check cache first
    if (chartDataCache[symbol]) {
      setChartData(chartDataCache[symbol]);
      return;
    }

    // Check if there's already a pending request for this symbol
    if (pendingRequests[symbol]) {
      pendingRequests[symbol].then((prices) => {
        if (prices) setChartData(prices);
      });
      return;
    }

    const fetchChartData = async () => {
      // Rate limiting - wait if needed
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
      }
      lastRequestTime = Date.now();

      try {
        const response = await fetch(
          `https://min-api.cryptocompare.com/data/v2/histohour?fsym=${symbol}&tsym=USDT&limit=24`
        );
        const data = await response.json();
        
        if (data?.Response === 'Error') {
          // API error (rate limit, etc.) - use fallback
          return null;
        }
        
        if (data?.Data?.Data) {
          const prices = data.Data.Data.map(item => item.close);
          chartDataCache[symbol] = prices; // Cache the result
          return prices;
        }
        return null;
      } catch {
        // Silent fail - will show fallback
        return null;
      }
    };

    // Store the promise to prevent duplicate requests
    pendingRequests[symbol] = fetchChartData().then((prices) => {
      delete pendingRequests[symbol];
      if (prices) {
        setChartData(prices);
      }
      return prices;
    });
  }, [symbol]);

  // Draw sparkline on canvas
  useEffect(() => {
    if (!canvasRef.current || chartData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate min/max for scaling
    const min = Math.min(...chartData);
    const max = Math.max(...chartData);
    const range = max - min || 1;

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = isPositive ? '#00c853' : '#ff5252';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    chartData.forEach((price, index) => {
      const x = (index / (chartData.length - 1)) * width;
      const y = height - ((price - min) / range) * (height - 10) - 5;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, isPositive ? 'rgba(0, 200, 83, 0.3)' : 'rgba(255, 82, 82, 0.3)');
    gradient.addColorStop(1, isPositive ? 'rgba(0, 200, 83, 0)' : 'rgba(255, 82, 82, 0)');

    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
  }, [chartData, isPositive]);

  if (chartData.length === 0) {
    // Fallback to static image while loading
    return (
      <img 
        src="/images/trade_vector.svg" 
        className="img-fluid" 
        alt="chart"
        style={{ 
          filter: isPositive ? "none" : "hue-rotate(180deg) saturate(1.5)",
          opacity: 0.5 
        }}
      />
    );
  }

  return (
    <canvas 
      ref={canvasRef} 
      width={160} 
      height={50} 
      style={{ width: '100%', height: '60px' }}
    />
  );
});


const Market = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [favCoins, setFavCoins] = useState([]);
  const [coinData, setCoinData] = useState([]);
  const [futuresPairData, setFuturesPairData] = useState([]);
  const [filterPairData, setFilterPairData] = useState([]);
  const [filterFuturesData, setFilterFuturesData] = useState([]);
  const { socket } = useContext(SocketContext);
  const [activeTab, setActiveTab] = useState("Spot");
  const gainerElementRef = useRef(null);
  
  // Filter states for Spot
  const [spotQuoteCurrency, setSpotQuoteCurrency] = useState("USDT");
  const [spotFilterType, setSpotFilterType] = useState("All");
  
  // Filter states for Futures
  const [futuresQuoteCurrency, setFuturesQuoteCurrency] = useState("All");
  const [futuresFilterType, setFuturesFilterType] = useState("All");

  // Featured coins for top cards (BTC, ETH, BNB or fallback to first 3)
  const featuredCoins = useMemo(() => {
    if (!coinData || coinData.length === 0) return [];
    
    const preferredCoins = ['BTC', 'ETH', 'BNB'];
    const featured = [];
    
    // Try to find preferred coins
    for (const coinSymbol of preferredCoins) {
      const found = coinData.find(
        (item) => item?.base_currency?.toUpperCase() === coinSymbol && item?.quote_currency?.toUpperCase() === 'USDT'
      );
      if (found) {
        featured.push(found);
      }
    }
    
    // If we don't have 3 coins, fill with other coins from the list
    if (featured.length < 3) {
      const remaining = coinData.filter(
        (item) => !featured.some((f) => f?._id === item?._id)
      );
      for (let i = 0; i < remaining.length && featured.length < 3; i++) {
        featured.push(remaining[i]);
      }
    }
    
    return featured;
  }, [coinData]);

  // Get decimal places from tick_size
  const getDecimalsFromTickSize = useCallback((tickSize) => {
    // Convert to number first to handle scientific notation (e.g., 1e-8)
    const tickSizeNum = Number(tickSize);
    
    if (!tickSizeNum || tickSizeNum <= 0 || isNaN(tickSizeNum)) {
      return 2; // Default to 2 decimals
    }
    
    if (tickSizeNum < 1) {
      // For small numbers, calculate decimals from the value itself
      // e.g., 0.00000001 (1e-8) has 8 decimal places
      return Math.max(0, Math.ceil(-Math.log10(tickSizeNum)));
    }
    
    // For numbers >= 1, no decimal places needed
    return 0;
  }, []);

  // Format price based on tick_size
  const formatPrice = useCallback((price, tickSize) => {
    try {
      const num = typeof price === "string" ? Number(price) : price;
      if (typeof num === "number" && !isNaN(num) && isFinite(num)) {
        const decimals = getDecimalsFromTickSize(tickSize);
        return num.toFixed(decimals);
      }
      return "0.00";
    } catch {
      return "0.00";
    }
  }, [getDecimalsFromTickSize]);

  // Format number safely (for high, low, volume, change - 2 decimals)
  const formatNumber = useCallback((data, decimal = 2) => {
    try {
      const num = typeof data === "string" ? Number(data) : data;
      if (typeof num === "number" && !isNaN(num) && isFinite(num)) {
        return num.toFixed(decimal);
      }
      return "0.00";
    } catch {
      return "0.00";
    }
  }, []);

  // Socket for market data
  useEffect(() => {
    let interval;
    if (socket) {
      const payload = { 'message': 'market' };
      
      const handleMessage = (data) => {
        if (data?.pairs) {
          setCoinData(data.pairs);
        }
        if (data?.futures_pairs) {
          setFuturesPairData(data.futures_pairs);
        }
      };

      socket.emit('message', payload);
      socket.on('message', handleMessage);

      interval = setInterval(() => {
        socket.emit('message', payload);
      }, 2000);

      return () => {
        clearInterval(interval);
        socket.off('message', handleMessage);
      };
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [socket]);

  // Fetch favorite list on mount
  useEffect(() => {
    token && favoriteList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter pairs based on search, quote currency, and filter type
  useEffect(() => {
    if (!coinData) {
      setFilterPairData([]);
      return;
    }
    
    let filteredData = [...coinData];
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter((item) =>
        item?.base_currency?.toLowerCase()?.includes(searchLower) ||
        item?.quote_currency?.toLowerCase()?.includes(searchLower)
      );
    }
    
    // Filter by quote currency
    if (spotQuoteCurrency !== "All") {
      filteredData = filteredData.filter((item) =>
        item?.quote_currency?.toUpperCase() === spotQuoteCurrency || item?.base_currency?.toUpperCase() === spotQuoteCurrency
      );
    }
    
    // Filter by type (Gainers, Losers, Trending)
    if (spotFilterType === "Gainers") {
      filteredData = filteredData
        .filter((item) => Number(item?.change_percentage) > 0)
        .sort((a, b) => Number(b?.change_percentage) - Number(a?.change_percentage));
    } else if (spotFilterType === "Losers") {
      filteredData = filteredData
        .filter((item) => Number(item?.change_percentage) < 0)
        .sort((a, b) => Number(a?.change_percentage) - Number(b?.change_percentage));
    } else if (spotFilterType === "Trending") {
      filteredData = filteredData
        .sort((a, b) => Number(b?.volume) - Number(a?.volume));
    }
    
    setFilterPairData(filteredData);
  }, [search, coinData, spotQuoteCurrency, spotFilterType]);

  // Filter futures pairs based on search, quote currency, and filter type
  useEffect(() => {
    if (!futuresPairData) {
      setFilterFuturesData([]);
      return;
    }
    
    let filteredData = [...futuresPairData];
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter((item) =>
        item?.short_name?.toLowerCase()?.includes(searchLower) ||
        item?.name?.toLowerCase()?.includes(searchLower)
      );
    }
    
    // Filter by quote/margin currency
    if (futuresQuoteCurrency !== "All") {
      filteredData = filteredData.filter((item) =>
        item?.margin_asset?.toUpperCase() === futuresQuoteCurrency
      );
    }
    
    // Filter by type (Gainers, Losers, Trending)
    if (futuresFilterType === "Gainers") {
      filteredData = filteredData
        .filter((item) => Number(item?.change_percentage) > 0)
        .sort((a, b) => Number(b?.change_percentage) - Number(a?.change_percentage));
    } else if (futuresFilterType === "Losers") {
      filteredData = filteredData
        .filter((item) => Number(item?.change_percentage) < 0)
        .sort((a, b) => Number(a?.change_percentage) - Number(b?.change_percentage));
    } else if (futuresFilterType === "Trending") {
      filteredData = filteredData
        .sort((a, b) => Number(b?.volume) - Number(a?.volume));
    }
    
    setFilterFuturesData(filteredData);
  }, [search, futuresPairData, futuresQuoteCurrency, futuresFilterType]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Navigate to trade page
  const nextPage = useCallback((data) => {
    if (!data?.base_currency || !data?.quote_currency) return;
    try {
      localStorage.setItem('RecentPair', JSON.stringify(data));
      navigate(`/trade/${data.base_currency}_${data.quote_currency}`);
    } catch {
      // Silent fail
    }
  }, [navigate]);

  // Navigate to futures trade page
  const nextFuturesPage = useCallback((data) => {
    if (!data?.short_name) return;
    try {
      localStorage.setItem('FuturesPair', JSON.stringify(data));
      navigate(`/usd_futures/${data.short_name}_USDT`);
    } catch {
      // Silent fail
    }
  }, [navigate]);

  // Add/remove favorite
  const handleAddFav = useCallback(async (e, pairId) => {
    e.stopPropagation();
    if (!pairId) return;
    
    LoaderHelper.loaderStatus(true);
    try {
      const result = await AuthService.favoriteCoin(pairId);
      if (result?.success) {
        favoriteList();
      } else {
        alertErrorMessage(result?.message || "Failed to update favorite");
      }
    } catch {
      alertErrorMessage("Failed to update favorite");
    }
    LoaderHelper.loaderStatus(false);
  }, []);

  // Fetch favorite list
  const favoriteList = async () => {
    try {
      const result = await AuthService.favoriteList();
      if (result?.success) {
        setFavCoins(result?.data?.pairs || []);
      }
    } catch {
      // Silent fail
    }
  };

  // Render featured coin card
  const renderFeaturedCard = useCallback((coin, index) => {
    if (!coin) return null;
    
    const changePercent = Number(coin?.change_percentage) || 0;
    const isPositive = changePercent >= 0;
    
    return (
      <div key={coin?._id || index} className="trade_marketvalue" onClick={() => nextPage(coin)} style={{ cursor: 'pointer' }}>
        <div className="d-flex tophd">
          <h5>
            <img 
              alt={coin?.base_currency || "coin"} 
              src={coin?.icon_path ? ApiConfig.baseImage + coin.icon_path : "/images/default_coin.png"} 
              className="img-fluid icon_img coinimg me-2" 
              onError={(e) => { e.target.src = "/images/default_coin.png"; }}
            />
            {coin?.base_currency || "---"}
          </h5>
          <div className={`value ${isPositive ? "text-green" : "text-danger"}`}>
            {isPositive ? "+" : ""}{formatNumber(changePercent)}%
          </div>
        </div>
        <div className="price">
          ${formatPrice(coin?.buy_price, coin?.tick_size)}
        </div>
        <div className="privevolume">
          <span>24H Volume：</span>{formatNumber(coin?.volume)} (USD)
        </div>
        <div className="tradevector_r">
          <MiniSparkline symbol={coin?.base_currency} isPositive={isPositive} />
        </div>
      </div>
    );
  }, [formatNumber, formatPrice, nextPage]);

  return (
    <>
      <Helmet>
        <title>Wrathcode Market – Live Crypto Prices &amp; Trading Pairs</title>
        <meta
          name="description"
          content="Explore live market data on Wrathcode. View real-time prices, volumes and trading pairs for Bitcoin, Ethereum and top altcoins. Start trading today."
        />
        <meta
          name="keywords"
          content="crypto market, live crypto prices, bitcoin ethereum trading pairs, Wrathcode market"
        />
      </Helmet>

      <section className="section-padding login_bg login_sec market_page">
        <div className="market_trade_crypto">
          <div className="container">
            {/* Desktop View - Row/Col Structure */}
            <div className="row d-none d-md-flex">
              {featuredCoins.length > 0 ? (
                featuredCoins.map((coin, index) => (
                  <div className="col-sm-4" key={coin?._id || index}>
                    {renderFeaturedCard(coin, index)}
                  </div>
                ))
              ) : (
                // Loading skeleton
                [0, 1, 2].map((i) => (
                  <div className="col-sm-4" key={i}>
                    <div className="trade_marketvalue">
                      <div className="d-flex tophd">
                        <h5><span className="placeholder-glow"><span className="placeholder col-6"></span></span></h5>
                      </div>
                      <div className="price placeholder-glow"><span className="placeholder col-8"></span></div>
                      <div className="privevolume placeholder-glow"><span className="placeholder col-10"></span></div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Mobile View - Swiper Slider */}
            <div className="d-md-none market_trade_crypto_slider">
              {featuredCoins.length > 0 ? (
                <Swiper
                  modules={[Pagination]}
                  spaceBetween={15}
                  slidesPerView={1}
                  pagination={{
                    clickable: true,
                    dynamicBullets: true,
                  }}
                  className="market-crypto-swiper"
                >
                  {featuredCoins.map((coin, index) => (
                    <SwiperSlide key={coin?._id || index}>
                      {renderFeaturedCard(coin, index)}
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) :(
                // Loading skeleton
                [0].map((i) => (
                  <div className="col-sm-4" key={i}>
                    <div className="trade_marketvalue">
                      <div className="d-flex tophd">
                        <h5><span className="placeholder-glow"><span className="placeholder col-6"></span></span></h5>
                      </div>
                      <div className="price placeholder-glow"><span className="placeholder col-8"></span></div>
                      <div className="privevolume placeholder-glow"><span className="placeholder col-10"></span></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <section className="live_prices mt-0 market_prices market_update_sec market_update_table">
          <div className="container">
            <div className="row mb-4 g-2">
              {/* Commented sections removed for cleaner code */}
            </div>
          </div>
          
          <div className="container" ref={gainerElementRef}>
            <div className="d-flex-between mb-3 custom_dlflex">
              <ul className="nav nav-pills mb-2 overflowx_scroll funds_tab market_tabs">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === "Fav" ? 'active' : ""}`} 
                    onClick={() => setActiveTab('Fav')}
                  >
                    <i className="ri-star-s-line me-2 ri-xl"></i> Favourite
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === "Spot" ? 'active' : ""}`} 
                    onClick={() => setActiveTab('Spot')}
                  >
                    <i className="ri-list-unordered ri-xl me-2"></i> Spot
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === "Futures" ? 'active' : ""}`} 
                    onClick={() => setActiveTab('Futures')}
                  >
                    <i className="ri-arrow-right-up-line me-2"></i> Futures
                  </button>
                </li>
              </ul>
              
              <div className="searchBar custom-tabs">
                <i className="ri-search-2-line"></i>
                <input 
                  type="search" 
                  className="custom_search" 
                  placeholder="Search Crypto" 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                />
              </div>
            </div>

            <div className="tab-content custom-tab-content p-0">
              {/* Favourite Tab */}
              <div className={`tab-pane ${activeTab === "Fav" ? 'active' : ""}`}>
                <div className="card py-2">
                  <div className="card-body p-0 desktoptable">
                    <div className="table-responsive">
                      {token ? (
                        favCoins?.length > 0 && filterPairData?.some(item => favCoins.includes(item?._id)) ? (
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Pair</th>
                                <th>Price</th>
                                <th>24H Change</th>
                                <th>24H High</th>
                                <th>24H Low</th>
                                <th>24H Vol</th>
                                <th>Chart</th>
                                <th>Operation</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filterPairData?.map((item, index) => {
                                if (!favCoins.includes(item?._id)) return null;
                                const isPositive = (item?.change || 0) >= 0;
                                return (
                                  <tr key={item?._id || index} onClick={() => nextPage(item)}>
                                    <td>
                                      <div className="td_div">
                                        <span className="star_btn btn_icon active">
                                          <i 
                                            className="ri-star-fill text-warning me-2" 
                                            onClick={(e) => handleAddFav(e, item?._id)}
                                          ></i>
                                        </span>
                                        <img 
                                          alt={item?.base_currency || "coin"} 
                                          src={ApiConfig.baseImage + item?.icon_path} 
                                          className="img-fluid icon_img coinimg me-2"
                                          onError={(e) => { e.target.src = "/images/default_coin.png"; }}
                                        />
                                        {item?.base_currency}/{item?.quote_currency}
                                      </div>
                                    </td>
                                    <td><b>{formatPrice(item?.buy_price, item?.tick_size)}</b></td>
                                    <td className={isPositive ? "color-green green" : "color-red text-danger"}>
                                      <b>{formatNumber(item?.change)}</b>
                                    </td>
                                    <td><b>{formatNumber(item?.high)}</b></td>
                                    <td><b>{formatNumber(item?.low)}</b></td>
                                    <td><b>{formatNumber(item?.volume)}</b></td>
                                    <td>
                                      <img 
                                        src={isPositive ? "/images/trade_count_range.svg" : "/images/trade_count_red.svg"} 
                                        alt="chart"
                                        onError={(e) => { e.target.src = "/images/trade_count_range.svg"; }}
                                      />
                                    </td>
                                    <td>
                                      <span 
                                        onClick={(e) => { e.stopPropagation(); nextPage(item); }} 
                                        className="btn custom-btn btn-sm"
                                      >
                                        <span>Trade</span>
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        ) : (
                          <div className="table_responsive_2">
                        <div className="favouriteData">
                          <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="No data" />
                        </div>
                        </div>
                        )
                      ) : (
                        <div className="py-5 favouriteData">
                          <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="No data" />
                          <p className="mt-2">
                            No results.... Go to&nbsp;
                            <Link className="btn-link" to="/login"><b>&nbsp;Sign in&nbsp;</b></Link>
                            &nbsp;and add your favorite coins from Spot.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile Table for Favourites */}
                  <div className="card-body p-0 mobiletable">
                    <div className="table-responsive">
                      {token ? (
                        favCoins?.length > 0 && filterPairData?.some(item => favCoins.includes(item?._id)) ? (
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Pair/24h Vol</th>
                                <th>Price</th>
                                <th>24H Change</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filterPairData?.map((item, index) => {
                                if (!favCoins.includes(item?._id)) return null;
                                const isPositive = (item?.change || 0) >= 0;
                                return (
                                  <tr key={item?._id || index} onClick={() => nextPage(item)}>
                                    <td>
                                      <div className="td_div">
                                        <span className="star_btn btn_icon active">
                                          <i 
                                            className="ri-star-fill text-warning me-2" 
                                            onClick={(e) => handleAddFav(e, item?._id)}
                                          ></i>
                                        </span>
                                        <img 
                                          alt={item?.base_currency || "coin"} 
                                          src={ApiConfig.baseImage + item?.icon_path} 
                                          className="img-fluid icon_img coinimg me-2"
                                          onError={(e) => { e.target.src = "/images/default_coin.png"; }}
                                        />
                                        {item?.base_currency}/{item?.quote_currency}
                                      </div>
                                      <b>Vol {formatNumber(item?.volume)}</b>
                                    </td>
                                    <td>
                                      <b>{formatPrice(item?.buy_price, item?.tick_size)}</b>
                                      <div className={isPositive ? "color-green green" : "color-red text-danger"}>
                                        <b>{formatNumber(item?.change)}</b>
                                      </div>
                                    </td>
                                    <td>
                                      <b>{formatNumber(item?.high)}</b>
                                      <br />
                                      <b>{formatNumber(item?.low)}</b>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        ) : (
                          <div className="table_responsive_2">
                          <div className="favouriteData">
                            <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="No data" />
                          </div>
                          </div>
                        )
                      ) : (
                        <div className="py-5 favouriteData">
                          <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="No data" />
                          <p className="mt-2">
                            No results.... Go to&nbsp;
                            <Link className="btn-link" to="/login"><b>&nbsp;Sign in&nbsp;</b></Link>
                            &nbsp;and add your favorite coins from Spot.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Spot Tab */}
              <div className={`tab-pane ${activeTab === "Spot" ? 'active' : ""}`}>
                <ul className="tbltabs">
                  <li>
                    <select 
                      value={spotQuoteCurrency} 
                      onChange={(e) => setSpotQuoteCurrency(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="USDT">USDT</option>
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                      <option value="BNB">BNB</option>
                    </select>
                  </li>
                  <li className={spotFilterType === "All" ? "active" : ""}>
                    <button type="button" onClick={() => setSpotFilterType("All")}>All</button>
                  </li>
                  <li className={spotFilterType === "Gainers" ? "active" : ""}>
                    <button type="button" onClick={() => setSpotFilterType("Gainers")}>Gainers</button>
                  </li>
                  <li className={spotFilterType === "Losers" ? "active" : ""}>
                    <button type="button" onClick={() => setSpotFilterType("Losers")}>Losers</button>
                  </li>
                  <li className={spotFilterType === "Trending" ? "active" : ""}>
                    <button type="button" onClick={() => setSpotFilterType("Trending")}>Trending</button>
                  </li>
                </ul>

                <div className="card py-2 spot_table">
                  <div className="card-body p-0 desktoptable">
                    <div className="mrt_row"></div>
                    <div className="table-responsive">
                      {filterPairData?.length > 0 ? (
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Pair</th>
                              <th>Price</th>
                              <th>24H Change</th>
                              <th>24H High</th>
                              <th>24H Low</th>
                              <th>24H Vol</th>
                              <th>Operation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filterPairData.map((item, index) => {
                              const isPositive = (item?.change || 0) >= 0;
                              return (
                                <tr key={item?._id || index} onClick={() => nextPage(item)}>
                                  <td>
                                    <div className="td_div">
                                      {token && (
                                        <span className="star_btn btn_icon active">
                                          <i 
                                            className={favCoins.includes(item?._id) ? "ri ri-star-fill text-warning me-2" : "ri ri-star-line me-2"} 
                                            onClick={(e) => handleAddFav(e, item?._id)}
                                          ></i>
                                        </span>
                                      )}
                                      <img 
                                        alt={item?.base_currency || "coin"} 
                                        src={ApiConfig.baseImage + item?.icon_path} 
                                        className="img-fluid icon_img coinimg me-2"
                                        onError={(e) => { e.target.src = "/images/default_coin.png"; }}
                                      />
                                      {item?.base_currency}/{item?.quote_currency}
                                    </div>
                                  </td>
                                  <td><b>{formatPrice(item?.buy_price, item?.tick_size)}</b></td>
                                  <td className={isPositive ? "color-green text-green" : "color-red text-danger"}>
                                    <b>{formatNumber(item?.change)}</b>
                                  </td>
                                  <td><b>{formatNumber(item?.high)}</b></td>
                                  <td><b>{formatNumber(item?.low)}</b></td>
                                  <td><b>{formatNumber(item?.volume)}</b></td>
                                  <td>
                                    <span 
                                      onClick={(e) => { e.stopPropagation(); nextPage(item); }} 
                                      className="btn custom-btn btn-sm cursor-pointer"
                                    >
                                      <span>Trade</span>
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div className="table_responsive_2">
                        <div className="favouriteData">
                          <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="No data" />
                        </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile Table for Spot */}
                  <div className="card-body p-0 mobiletable">
                    <div className="table-responsive">
                      {filterPairData?.length > 0 ? (
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Pair/Vol</th>
                              <th>Price/Change</th>
                              <th>High/Low</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filterPairData.map((item, index) => {
                              const isPositive = (item?.change || 0) >= 0;
                              return (
                                <tr key={item?._id || index} onClick={() => nextPage(item)}>
                                  <td>
                                    <div className="td_div">
                                      {token && (
                                        <span className="star_btn btn_icon active">
                                          <i 
                                            className={favCoins.includes(item?._id) ? "ri ri-star-fill text-warning me-2" : "ri ri-star-line me-2"} 
                                            onClick={(e) => handleAddFav(e, item?._id)}
                                          ></i>
                                        </span>
                                      )}
                                      <img 
                                        alt={item?.base_currency || "coin"} 
                                        src={ApiConfig.baseImage + item?.icon_path} 
                                        className="img-fluid icon_img coinimg me-2"
                                        onError={(e) => { e.target.src = "/images/default_coin.png"; }}
                                      />
                                      {item?.base_currency}/{item?.quote_currency}
                                    </div>
                                    <b>{formatNumber(item?.volume)}</b>
                                  </td>
                                  <td className="price_change_value">
                                    <b>{formatPrice(item?.buy_price, item?.tick_size)}</b>
                                    <span className={isPositive ? "color-green text-green" : "color-red text-danger"}>
                                      <b>{formatNumber(item?.change)}</b>
                                    </span>
                                  </td>
                                  <td className="price_change_value color-green">
                                    <b>{formatNumber(item?.high)}</b>
                                    <span className="text-danger"><b>{formatNumber(item?.low)}</b></span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div className="table_responsive_2">
                        <div className="favouriteData">
                          <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="No data" />
                        </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Futures Tab */}
              <div className={`tab-pane ${activeTab === "Futures" ? 'active' : ""}`}>
                <ul className="tbltabs">
                  <li>
                    <select 
                      value={futuresQuoteCurrency} 
                      onChange={(e) => setFuturesQuoteCurrency(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="USDT">USDT</option>
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                      <option value="BNB">BNB</option>
                    </select>
                  </li>
                  <li className={futuresFilterType === "All" ? "active" : ""}>
                    <button type="button" onClick={() => setFuturesFilterType("All")}>All</button>
                  </li>
                  <li className={futuresFilterType === "Gainers" ? "active" : ""}>
                    <button type="button" onClick={() => setFuturesFilterType("Gainers")}>Gainers</button>
                  </li>
                  <li className={futuresFilterType === "Losers" ? "active" : ""}>
                    <button type="button" onClick={() => setFuturesFilterType("Losers")}>Losers</button>
                  </li>
                  <li className={futuresFilterType === "Trending" ? "active" : ""}>
                    <button type="button" onClick={() => setFuturesFilterType("Trending")}>Trending</button>
                  </li>
                </ul>

                <div className="card py-2">
                  <div className="card-body p-0 desktoptable">
                    <div className="mrt_row"></div>
                    <div className="table-responsive">
                      {filterFuturesData?.length > 0 ? (
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Pair</th>
                              <th>Price</th>
                              <th>24H Change</th>
                              <th>24H High</th>
                              <th>24H Low</th>
                              <th>24H Vol</th>
                              <th>Operation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filterFuturesData.map((item, index) => {
                              const isPositive = Number(item?.change_percentage) >= 0;
                              return (
                                <tr key={item?._id || index} onClick={() => nextFuturesPage(item)}>
                                  <td>
                                    <div className="td_div">
                                      <img 
                                        alt={item?.short_name || "coin"} 
                                        src={ApiConfig.baseImage + item?.icon_path} 
                                        className="img-fluid icon_img coinimg me-2"
                                        onError={(e) => { e.target.src = "/images/default_coin.png"; }}
                                      />
                                      {item?.short_name}/{item?.margin_asset}
                                      <span className="badge bg-secondary ms-2" style={{ fontSize: '10px' }}>Perp</span>
                                    </div>
                                  </td>
                                  <td><b>{formatPrice(item?.buy_price, item?.tickSize)}</b></td>
                                  <td className={isPositive ? "color-green text-green" : "color-red text-danger"}>
                                    <b>{isPositive ? "+" : ""}{formatNumber(item?.change_percentage)}%</b>
                                  </td>
                                  <td><b>{formatNumber(item?.high)}</b></td>
                                  <td><b>{formatNumber(item?.low)}</b></td>
                                  <td><b>{formatNumber(item?.volume)}</b></td>
                                  <td>
                                    <span 
                                      onClick={(e) => { e.stopPropagation(); nextFuturesPage(item); }} 
                                      className="btn custom-btn btn-sm cursor-pointer"
                                    >
                                      <span>Trade</span>
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div className="table_responsive_2">
                        <div className="favouriteData">
                          <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="No data" />
                        </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile Table for Futures */}
                  <div className="card-body p-0 mobiletable">
                    <div className="table-responsive">
                      {filterFuturesData?.length > 0 ? (
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Pair/Vol</th>
                              <th>Price/Change</th>
                              <th>High/Low</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filterFuturesData.map((item, index) => {
                              const isPositive = Number(item?.change_percentage) >= 0;
                              return (
                                <tr key={item?._id || index} onClick={() => nextFuturesPage(item)}>
                                  <td>
                                    <div className="td_div">
                                      <img 
                                        alt={item?.short_name || "coin"} 
                                        src={ApiConfig.baseImage + item?.icon_path} 
                                        className="img-fluid icon_img coinimg me-2"
                                        onError={(e) => { e.target.src = "/images/default_coin.png"; }}
                                      />
                                      {item?.short_name}/{item?.margin_asset}
                                    </div>
                                    <b>{formatNumber(item?.volume)}</b>
                                  </td>
                                  <td className="price_change_value">
                                    <b>{formatPrice(item?.buy_price, item?.tickSize)}</b>
                                    <span className={isPositive ? "color-green text-green" : "color-red text-danger"}>
                                      <b>{isPositive ? "+" : ""}{formatNumber(item?.change_percentage)}%</b>
                                    </span>
                                  </td>
                                  <td className="price_change_value color-green">
                                    <b>{formatNumber(item?.high)}</b>
                                    <span className="text-danger"><b>{formatNumber(item?.low)}</b></span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div className="table_responsive_2">
                        <div className="favouriteData">
                          <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="No data" />
                        </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </>
  );
};

export default Market;
