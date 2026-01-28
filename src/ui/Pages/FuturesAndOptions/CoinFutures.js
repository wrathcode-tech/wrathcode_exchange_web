import React, { useEffect, useState } from 'react'
import './CoinFutures.css'
function CoinFutures() {

    const [showPopup, setShowPopup] = useState(true);

    useEffect(() => {
        if (showPopup) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showPopup]);

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: '#000000d7',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            pointerEvents: 'auto',
        },
        popup: {
            background: 'transparent',
            borderRadius: '10px',
            padding: '0px',
            maxWidth: '1000px',
            width: '90vw',
            textAlign: 'center',        // ✅ Center image inside
        },
        image: {
            width: '45%',              // ✅ Let image fill container
            maxWidth: '800px',          // ✅ Control max image size
            height: 'auto',
            display: 'inline-block',
            borderRadius:"20px"
        },
    };





    return (
        <>
            <div className="usd_future_dashboard">
                <div className="top_bar_usd_future">
                    <div className="top_future_left_s">
                        <div className="usd_left_pr">
                            <div className="btcusd__currency" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                <img src="/images/futures_img/btc_usd_icon.svg" alt="bitcoin" /> BTC PERP/USDT
                                <span>
                                    <img src="/images/futures_img/arrowbottom_icon.svg" alt="arrow" />
                                </span>
                            </div>

                            {/* <!-- Modal --> */}
                            <div className="modal fade currency_popup_s" id="exampleModal" tabindex="-1"
                                aria-labelledby="exampleModalLabel" aria-hidden="true">
                                <div className="modal-dialog">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <button type="button" className="btn-close" data-bs-dismiss="modal"
                                                aria-label="Close"></button>
                                        </div>
                                        <div className="modal-body">
                                            <div className="search_form">
                                                <img src="/images/futures_img/search_icon.svg" alt="search" />
                                                <input type="search" placeholder="Search" />
                                            </div>
                                            <div className="bn-tabs_favorites_bl">
                                                <div className="top_tabs_center">
                                                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                                                        <li className="nav-item" role="presentation">
                                                            <button className="nav-link active" id="favorites-tab"
                                                                data-bs-toggle="tab" data-bs-target="#favorites" type="button"
                                                                role="tab" aria-controls="favorites"
                                                                aria-selected="true">Favorites</button>
                                                        </li>
                                                        <li className="nav-item" role="presentation">
                                                            <button className="nav-link" id="usd-tab" data-bs-toggle="tab"
                                                                data-bs-target="#usd-m" type="button" role="tab"
                                                                aria-controls="usd-m" aria-selected="false">USDⓈ-M</button>
                                                        </li>
                                                        <li className="nav-item" role="presentation">
                                                            <button className="nav-link" id="coin-tab" data-bs-toggle="tab"
                                                                data-bs-target="#coin-m" type="button" role="tab"
                                                                aria-controls="coin-m" aria-selected="false">COIN-M</button>
                                                        </li>
                                                    </ul>

                                                    <div className="all_tabs_toggle">
                                                        All <img src="/images/futures_img/arrowbottom_icon.svg" alt="arrow" />
                                                    </div>

                                                    <div className="orderbook_lightbox toggleactive">
                                                        <h6>Orderbook Preference</h6>
                                                        <form>
                                                            <div className="d-flex gap-3">
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="checkbox" id="all" />
                                                                    <label className="form-check-label" for="all">All</label>
                                                                </div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="checkbox" id="perpetual" />
                                                                    <label className="form-check-label" for="perpetual">Perpetual</label>
                                                                </div>

                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="checkbox" id="delivery" />
                                                                    <label className="form-check-label" for="delivery">Delivery</label>
                                                                </div>

                                                            </div>
                                                        </form>
                                                    </div>


                                                </div>

                                                <div className="tab-content" id="myTabContent">
                                                    <div className="tab-pane fade show active" id="favorites" role="tabpanel"
                                                        aria-labelledby="favorites-tab">

                                                        <ul className="nav nav-tabs" id="myTab_three" role="tablist">
                                                            <li className="nav-item" role="presentation">
                                                                <button className="nav-link active" id="all-tab"
                                                                    data-bs-toggle="tab" data-bs-target="#all" type="button"
                                                                    role="tab" aria-controls="all"
                                                                    aria-selected="true">All</button>
                                                            </li>
                                                            <li className="nav-item" role="presentation">
                                                                <button className="nav-link" id="new_listing-tab"
                                                                    data-bs-toggle="tab" data-bs-target="#new_listing"
                                                                    type="button" role="tab" aria-controls="new_listing"
                                                                    aria-selected="false">New Listing</button>
                                                            </li>
                                                            <li className="nav-item" role="presentation">
                                                                <button className="nav-link" id="usdc-tab" data-bs-toggle="tab"
                                                                    data-bs-target="#usdc" type="button" role="tab"
                                                                    aria-controls="usdc" aria-selected="false">USDC</button>
                                                            </li>
                                                            <li className="nav-item" role="presentation">
                                                                <button className="nav-link" id="ai-tab" data-bs-toggle="tab"
                                                                    data-bs-target="#ai" type="button" role="tab"
                                                                    aria-controls="ai" aria-selected="false">AI</button>
                                                            </li>
                                                            <li className="nav-item" role="presentation">
                                                                <button className="nav-link" id="rwa-tab" data-bs-toggle="tab"
                                                                    data-bs-target="#rwa" type="button" role="tab"
                                                                    aria-controls="rwa" aria-selected="false">RWA</button>
                                                            </li>
                                                            <li className="nav-item" role="presentation">
                                                                <button className="nav-link" id="layerone-tab" data-bs-toggle="tab"
                                                                    data-bs-target="#layerone" type="button" role="tab"
                                                                    aria-controls="layerone" aria-selected="false">Layer
                                                                    1</button>
                                                            </li>
                                                            <li className="nav-item" role="presentation">
                                                                <button className="nav-link" id="layertwo-tab" data-bs-toggle="tab"
                                                                    data-bs-target="#layertwo" type="button" role="tab"
                                                                    aria-controls="layertwo" aria-selected="false">Layer
                                                                    2</button>
                                                            </li>
                                                            <li className="nav-item dropdown" role="presentation">
                                                                <a className="nav-link dropdown-toggle" id="dropdownMenu"
                                                                    data-bs-toggle="dropdown" href="#" role="button">
                                                                    Gaming
                                                                </a>
                                                                <ul className="dropdown-menu">
                                                                    <li><a className="dropdown-item" data-bs-toggle="tab"
                                                                        href="#infrastructure">Infrastructure</a></li>
                                                                    <li><a className="dropdown-item" data-bs-toggle="tab"
                                                                        href="#DeFi">DeFi</a></li>
                                                                    <li><a className="dropdown-item" data-bs-toggle="tab"
                                                                        href="#metaverse">Metaverse</a></li>
                                                                    <li><a className="dropdown-item" data-bs-toggle="tab"
                                                                        href="#payment">Payment</a></li>
                                                                    <li><a className="dropdown-item" data-bs-toggle="tab"
                                                                        href="#pow">PoW</a></li>
                                                                    <li><a className="dropdown-item" data-bs-toggle="tab"
                                                                        href="#storage">Storage</a></li>
                                                                    <li><a className="dropdown-item" data-bs-toggle="tab"
                                                                        href="#nft">NFT</a></li>
                                                                </ul>
                                                            </li>
                                                        </ul>

                                                        <div className="tab-content" id="myTabContent">
                                                            <div className="tab-pane fade show active" id="all" role="tabpanel"
                                                                aria-labelledby="all-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <svg enable-background="new 0 0 500 500"
                                                                                                    height="500px" id="Layer_1"
                                                                                                    version="1.1"
                                                                                                    viewBox="0 0 500 500"
                                                                                                    width="500px"
                                                                                                    xmlspace="preserve"
                                                                                                >
                                                                                                    <path clip-rule="evenodd"
                                                                                                        d="M250,41.034c-8.091,0-14.808,5.448-16.902,12.901l-42.882,132.467 
                                                                                                 H49.392c-9.724,0-17.442,8.456-17.442,18.26c0,5.999,2.997,11.357,7.54,14.542c2.814,1.907,113.747,82.948,113.747,82.948 
                                                                                                  s-42.605,130.835-43.431,132.921c-0.63,1.907-1.083,4.001-1.083,6.175c0,9.813,7.897,17.718,17.622,17.718 
                                                                                                   c3.726,0,7.178-1.181,10.087-3.175L250,373.106c0,0,111.023,80.865,113.569,82.685c2.899,1.994,6.361,3.175,10.078,3.175 
                                                                                                    c9.725,0,17.63-7.994,17.63-17.718c0-2.174-0.45-4.268-1.092-6.175c-0.815-2.086-43.421-132.921-43.421-132.921 
                                                                                                     s110.924-81.041,113.744-82.948c4.543-3.185,7.542-8.543,7.542-14.63c0-9.717-7.542-18.172-17.267-18.172H309.961L266.892,53.935 
                                                                                                      C264.81,46.482,258.081,41.034,250,41.034z"
                                                                                                        fill="#010101"
                                                                                                        fill-rule="evenodd" />
                                                                                                </svg>
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <svg enable-background="new 0 0 500 500"
                                                                                                    height="500px" id="Layer_1"
                                                                                                    version="1.1"
                                                                                                    viewBox="0 0 500 500"
                                                                                                    width="500px"
                                                                                                    xmlspace="preserve"
                                                                                                >
                                                                                                    <path clip-rule="evenodd"
                                                                                                        d="M250,41.034c-8.091,0-14.808,5.448-16.902,12.901l-42.882,132.467 
                                                                                                 H49.392c-9.724,0-17.442,8.456-17.442,18.26c0,5.999,2.997,11.357,7.54,14.542c2.814,1.907,113.747,82.948,113.747,82.948 
                                                                                                  s-42.605,130.835-43.431,132.921c-0.63,1.907-1.083,4.001-1.083,6.175c0,9.813,7.897,17.718,17.622,17.718 
                                                                                                   c3.726,0,7.178-1.181,10.087-3.175L250,373.106c0,0,111.023,80.865,113.569,82.685c2.899,1.994,6.361,3.175,10.078,3.175 
                                                                                                    c9.725,0,17.63-7.994,17.63-17.718c0-2.174-0.45-4.268-1.092-6.175c-0.815-2.086-43.421-132.921-43.421-132.921 
                                                                                                     s110.924-81.041,113.744-82.948c4.543-3.185,7.542-8.543,7.542-14.63c0-9.717-7.542-18.172-17.267-18.172H309.961L266.892,53.935 
                                                                                                      C264.81,46.482,258.081,41.034,250,41.034z"
                                                                                                        fill="#010101"
                                                                                                        fill-rule="evenodd" />
                                                                                                </svg>
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <svg enable-background="new 0 0 500 500"
                                                                                                    height="500px" id="Layer_1"
                                                                                                    version="1.1"
                                                                                                    viewBox="0 0 500 500"
                                                                                                    width="500px"
                                                                                                    xmlspace="preserve"
                                                                                                >
                                                                                                    <path clip-rule="evenodd"
                                                                                                        d="M250,41.034c-8.091,0-14.808,5.448-16.902,12.901l-42.882,132.467 
                                                                                                 H49.392c-9.724,0-17.442,8.456-17.442,18.26c0,5.999,2.997,11.357,7.54,14.542c2.814,1.907,113.747,82.948,113.747,82.948 
                                                                                                  s-42.605,130.835-43.431,132.921c-0.63,1.907-1.083,4.001-1.083,6.175c0,9.813,7.897,17.718,17.622,17.718 
                                                                                                   c3.726,0,7.178-1.181,10.087-3.175L250,373.106c0,0,111.023,80.865,113.569,82.685c2.899,1.994,6.361,3.175,10.078,3.175 
                                                                                                    c9.725,0,17.63-7.994,17.63-17.718c0-2.174-0.45-4.268-1.092-6.175c-0.815-2.086-43.421-132.921-43.421-132.921 
                                                                                                     s110.924-81.041,113.744-82.948c4.543-3.185,7.542-8.543,7.542-14.63c0-9.717-7.542-18.172-17.267-18.172H309.961L266.892,53.935 
                                                                                                      C264.81,46.482,258.081,41.034,250,41.034z"
                                                                                                        fill="#010101"
                                                                                                        fill-rule="evenodd" />
                                                                                                </svg>
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <svg enable-background="new 0 0 500 500"
                                                                                                    height="500px" id="Layer_1"
                                                                                                    version="1.1"
                                                                                                    viewBox="0 0 500 500"
                                                                                                    width="500px"
                                                                                                    xmlspace="preserve"
                                                                                                >
                                                                                                    <path clip-rule="evenodd"
                                                                                                        d="M250,41.034c-8.091,0-14.808,5.448-16.902,12.901l-42.882,132.467 
                                                                                                 H49.392c-9.724,0-17.442,8.456-17.442,18.26c0,5.999,2.997,11.357,7.54,14.542c2.814,1.907,113.747,82.948,113.747,82.948 
                                                                                                  s-42.605,130.835-43.431,132.921c-0.63,1.907-1.083,4.001-1.083,6.175c0,9.813,7.897,17.718,17.622,17.718 
                                                                                                   c3.726,0,7.178-1.181,10.087-3.175L250,373.106c0,0,111.023,80.865,113.569,82.685c2.899,1.994,6.361,3.175,10.078,3.175 
                                                                                                    c9.725,0,17.63-7.994,17.63-17.718c0-2.174-0.45-4.268-1.092-6.175c-0.815-2.086-43.421-132.921-43.421-132.921 
                                                                                                     s110.924-81.041,113.744-82.948c4.543-3.185,7.542-8.543,7.542-14.63c0-9.717-7.542-18.172-17.267-18.172H309.961L266.892,53.935 
                                                                                                      C264.81,46.482,258.081,41.034,250,41.034z"
                                                                                                        fill="#010101"
                                                                                                        fill-rule="evenodd" />
                                                                                                </svg>
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <svg enable-background="new 0 0 500 500"
                                                                                                    height="500px" id="Layer_1"
                                                                                                    version="1.1"
                                                                                                    viewBox="0 0 500 500"
                                                                                                    width="500px"
                                                                                                    xmlspace="preserve"
                                                                                                >
                                                                                                    <path clip-rule="evenodd"
                                                                                                        d="M250,41.034c-8.091,0-14.808,5.448-16.902,12.901l-42.882,132.467 
                                                                                                 H49.392c-9.724,0-17.442,8.456-17.442,18.26c0,5.999,2.997,11.357,7.54,14.542c2.814,1.907,113.747,82.948,113.747,82.948 
                                                                                                  s-42.605,130.835-43.431,132.921c-0.63,1.907-1.083,4.001-1.083,6.175c0,9.813,7.897,17.718,17.622,17.718 
                                                                                                   c3.726,0,7.178-1.181,10.087-3.175L250,373.106c0,0,111.023,80.865,113.569,82.685c2.899,1.994,6.361,3.175,10.078,3.175 
                                                                                                    c9.725,0,17.63-7.994,17.63-17.718c0-2.174-0.45-4.268-1.092-6.175c-0.815-2.086-43.421-132.921-43.421-132.921 
                                                                                                     s110.924-81.041,113.744-82.948c4.543-3.185,7.542-8.543,7.542-14.63c0-9.717-7.542-18.172-17.267-18.172H309.961L266.892,53.935 
                                                                                                      C264.81,46.482,258.081,41.034,250,41.034z"
                                                                                                        fill="#010101"
                                                                                                        fill-rule="evenodd" />
                                                                                                </svg>
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <svg enable-background="new 0 0 500 500"
                                                                                                    height="500px" id="Layer_1"
                                                                                                    version="1.1"
                                                                                                    viewBox="0 0 500 500"
                                                                                                    width="500px"
                                                                                                    xmlspace="preserve"
                                                                                                >
                                                                                                    <path clip-rule="evenodd"
                                                                                                        d="M250,41.034c-8.091,0-14.808,5.448-16.902,12.901l-42.882,132.467 
                                                                                                 H49.392c-9.724,0-17.442,8.456-17.442,18.26c0,5.999,2.997,11.357,7.54,14.542c2.814,1.907,113.747,82.948,113.747,82.948 
                                                                                                  s-42.605,130.835-43.431,132.921c-0.63,1.907-1.083,4.001-1.083,6.175c0,9.813,7.897,17.718,17.622,17.718 
                                                                                                   c3.726,0,7.178-1.181,10.087-3.175L250,373.106c0,0,111.023,80.865,113.569,82.685c2.899,1.994,6.361,3.175,10.078,3.175 
                                                                                                    c9.725,0,17.63-7.994,17.63-17.718c0-2.174-0.45-4.268-1.092-6.175c-0.815-2.086-43.421-132.921-43.421-132.921 
                                                                                                     s110.924-81.041,113.744-82.948c4.543-3.185,7.542-8.543,7.542-14.63c0-9.717-7.542-18.172-17.267-18.172H309.961L266.892,53.935 
                                                                                                      C264.81,46.482,258.081,41.034,250,41.034z"
                                                                                                        fill="#010101"
                                                                                                        fill-rule="evenodd" />
                                                                                                </svg>
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <svg enable-background="new 0 0 500 500"
                                                                                                    height="500px" id="Layer_1"
                                                                                                    version="1.1"
                                                                                                    viewBox="0 0 500 500"
                                                                                                    width="500px"
                                                                                                    xmlspace="preserve"
                                                                                                >
                                                                                                    <path clip-rule="evenodd"
                                                                                                        d="M250,41.034c-8.091,0-14.808,5.448-16.902,12.901l-42.882,132.467 
                                                                                                 H49.392c-9.724,0-17.442,8.456-17.442,18.26c0,5.999,2.997,11.357,7.54,14.542c2.814,1.907,113.747,82.948,113.747,82.948 
                                                                                                  s-42.605,130.835-43.431,132.921c-0.63,1.907-1.083,4.001-1.083,6.175c0,9.813,7.897,17.718,17.622,17.718 
                                                                                                   c3.726,0,7.178-1.181,10.087-3.175L250,373.106c0,0,111.023,80.865,113.569,82.685c2.899,1.994,6.361,3.175,10.078,3.175 
                                                                                                    c9.725,0,17.63-7.994,17.63-17.718c0-2.174-0.45-4.268-1.092-6.175c-0.815-2.086-43.421-132.921-43.421-132.921 
                                                                                                     s110.924-81.041,113.744-82.948c4.543-3.185,7.542-8.543,7.542-14.63c0-9.717-7.542-18.172-17.267-18.172H309.961L266.892,53.935 
                                                                                                      C264.81,46.482,258.081,41.034,250,41.034z"
                                                                                                        fill="#010101"
                                                                                                        fill-rule="evenodd" />
                                                                                                </svg>
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="new_listing" role="tabpanel"
                                                                aria-labelledby="new_listing-tab">
                                                                <div className="no_data_found">
                                                                    <svg className="bn-svg text-[96px]" viewBox="0 0 96 96"
                                                                        xmlns="http://www.w3.org/2000/svg">
                                                                        <path opacity="0.5" d="M84 28H64V8l20 20z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path opacity="0.2" fill-rule="evenodd"
                                                                            clip-rule="evenodd"
                                                                            d="M24 8h40v20h20v60H24V8zm10 30h40v4H34v-4zm40 8H34v4h40v-4zm-40 8h40v4H34v-4z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                                                            d="M22.137 64.105c7.828 5.781 18.916 5.127 26.005-1.963 7.81-7.81 7.81-20.474 0-28.284-7.81-7.81-20.474-7.81-28.284 0-7.09 7.09-7.744 18.177-1.964
                                                                     26.005l-14.3 14.3 4.243 4.243 14.3-14.3zM43.9 57.9c-5.467 5.468-14.331 5.468-19.799 0-5.467-5.467-5.467-14.331 0-19.799 5.468-5.467
                                                                      14.332-5.467 19.8 0 5.467 5.468 5.467 14.332 0 19.8z" fill="#AEB4BC"></path>
                                                                    </svg>
                                                                    <p>No symbol under this category</p>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="usdc" role="tabpanel"
                                                                aria-labelledby="usdc-tab">
                                                                <div className="no_data_found">
                                                                    <svg className="bn-svg text-[96px]" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                                                                        <path opacity="0.5" d="M84 28H64V8l20 20z" fill="#AEB4BC" />
                                                                        <path
                                                                            opacity="0.2"
                                                                            fillRule="evenodd"
                                                                            clipRule="evenodd"
                                                                            d="M24 8h40v20h20v60H24V8zm10 30h40v4H34v-4zm40 8H34v4h40v-4zm-40 8h40v4H34v-4z"
                                                                            fill="#AEB4BC"
                                                                        />
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            clipRule="evenodd"
                                                                            d="M22.137 64.105c7.828 5.781 18.916 5.127 26.005-1.963 7.81-7.81 7.81-20.474 0-28.284-7.81-7.81-20.474-7.81-28.284 0-7.09 7.09-7.744 18.177-1.964
       26.005l-14.3 14.3 4.243 4.243 14.3-14.3zM43.9 57.9c-5.467 5.468-14.331 5.468-19.799 0-5.467-5.467-5.467-14.331 0-19.799 5.468-5.467
       14.332-5.467 19.8 0 5.467 5.468 5.467 14.332 0 19.8z"
                                                                            fill="#AEB4BC"
                                                                        />
                                                                    </svg>

                                                                    <p>No symbol under this category</p>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="ai" role="tabpanel"
                                                                aria-labelledby="ai-tab">
                                                                <div className="no_data_found">
                                                                    <svg className="bn-svg text-[96px]" viewBox="0 0 96 96"
                                                                        xmlns="http://www.w3.org/2000/svg">
                                                                        <path opacity="0.5" d="M84 28H64V8l20 20z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path opacity="0.2" fill-rule="evenodd"
                                                                            clip-rule="evenodd"
                                                                            d="M24 8h40v20h20v60H24V8zm10 30h40v4H34v-4zm40 8H34v4h40v-4zm-40 8h40v4H34v-4z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                                                            d="M22.137 64.105c7.828 5.781 18.916 5.127 26.005-1.963 7.81-7.81 7.81-20.474 0-28.284-7.81-7.81-20.474-7.81-28.284 0-7.09 7.09-7.744 18.177-1.964
                                                                     26.005l-14.3 14.3 4.243 4.243 14.3-14.3zM43.9 57.9c-5.467 5.468-14.331 5.468-19.799 0-5.467-5.467-5.467-14.331 0-19.799 5.468-5.467
                                                                      14.332-5.467 19.8 0 5.467 5.468 5.467 14.332 0 19.8z" fill="#AEB4BC"></path>
                                                                    </svg>
                                                                    <p>No symbol under this category</p>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="rwa" role="tabpanel"
                                                                aria-labelledby="rwa-tab">
                                                                <div className="no_data_found">
                                                                    <svg className="bn-svg text-[96px]" viewBox="0 0 96 96"
                                                                        xmlns="http://www.w3.org/2000/svg">
                                                                        <path opacity="0.5" d="M84 28H64V8l20 20z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path opacity="0.2" fill-rule="evenodd"
                                                                            clip-rule="evenodd"
                                                                            d="M24 8h40v20h20v60H24V8zm10 30h40v4H34v-4zm40 8H34v4h40v-4zm-40 8h40v4H34v-4z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                                                            d="M22.137 64.105c7.828 5.781 18.916 5.127 26.005-1.963 7.81-7.81 7.81-20.474 0-28.284-7.81-7.81-20.474-7.81-28.284 0-7.09 7.09-7.744 18.177-1.964
                                                                     26.005l-14.3 14.3 4.243 4.243 14.3-14.3zM43.9 57.9c-5.467 5.468-14.331 5.468-19.799 0-5.467-5.467-5.467-14.331 0-19.799 5.468-5.467
                                                                      14.332-5.467 19.8 0 5.467 5.468 5.467 14.332 0 19.8z" fill="#AEB4BC"></path>
                                                                    </svg>
                                                                    <p>No symbol under this category</p>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="layerone" role="tabpanel"
                                                                aria-labelledby="layerone-tab">
                                                                <div className="no_data_found">
                                                                    <svg className="bn-svg text-[96px]" viewBox="0 0 96 96"
                                                                        xmlns="http://www.w3.org/2000/svg">
                                                                        <path opacity="0.5" d="M84 28H64V8l20 20z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path opacity="0.2" fill-rule="evenodd"
                                                                            clip-rule="evenodd"
                                                                            d="M24 8h40v20h20v60H24V8zm10 30h40v4H34v-4zm40 8H34v4h40v-4zm-40 8h40v4H34v-4z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                                                            d="M22.137 64.105c7.828 5.781 18.916 5.127 26.005-1.963 7.81-7.81 7.81-20.474 0-28.284-7.81-7.81-20.474-7.81-28.284 0-7.09 7.09-7.744 18.177-1.964
                                                                     26.005l-14.3 14.3 4.243 4.243 14.3-14.3zM43.9 57.9c-5.467 5.468-14.331 5.468-19.799 0-5.467-5.467-5.467-14.331 0-19.799 5.468-5.467
                                                                      14.332-5.467 19.8 0 5.467 5.468 5.467 14.332 0 19.8z" fill="#AEB4BC"></path>
                                                                    </svg>
                                                                    <p>No symbol under this category</p>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="layertwo" role="tabpanel"
                                                                aria-labelledby="layertwo-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="infrastructure" role="tabpanel"
                                                                aria-labelledby="infrastructure-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="DeFi" role="tabpanel"
                                                                aria-labelledby="DeFi-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="metaverse" role="tabpanel"
                                                                aria-labelledby="metaverse-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="payment" role="tabpanel"
                                                                aria-labelledby="payment-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="tab-pane fade" id="pow" role="tabpanel"
                                                                aria-labelledby="pow-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="storage" role="tabpanel"
                                                                aria-labelledby="storage-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="nft" role="tabpanel"
                                                                aria-labelledby="nft-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    </div>
                                                    <div className="tab-pane fade" id="usd-m" role="tabpanel"
                                                        aria-labelledby="usd-m-tab">

                                                        <ul className="nav nav-tabs" id="myTab_three" role="tablist">
                                                            <li className="nav-item" role="presentation">
                                                                <button className="nav-link active" id="all_two-tab"
                                                                    data-bs-toggle="tab" data-bs-target="#all_two" type="button"
                                                                    role="tab" aria-controls="all_two"
                                                                    aria-selected="true">All</button>
                                                            </li>
                                                            <li className="nav-item" role="presentation">
                                                                <button className="nav-link" id="new_listing_two-tab"
                                                                    data-bs-toggle="tab" data-bs-target="#new_listing_two"
                                                                    type="button" role="tab" aria-controls="new_listing_two"
                                                                    aria-selected="false">New Listing</button>
                                                            </li>
                                                            <li className="nav-item" role="presentation">
                                                                <button className="nav-link" id="usdc_two-tab" data-bs-toggle="tab"
                                                                    data-bs-target="#usdc_two" type="button" role="tab"
                                                                    aria-controls="usdc_two" aria-selected="false">USDC</button>
                                                            </li>
                                                            <li className="nav-item" role="presentation">
                                                                <button className="nav-link" id="ai_two-tab" data-bs-toggle="tab"
                                                                    data-bs-target="#ai_two" type="button" role="tab"
                                                                    aria-controls="ai_two" aria-selected="false">AI</button>
                                                            </li>
                                                            <li className="nav-item" role="presentation">
                                                                <button className="nav-link" id="rwa_two-tab" data-bs-toggle="tab"
                                                                    data-bs-target="#rwa_two" type="button" role="tab"
                                                                    aria-controls="rwa_two" aria-selected="false">RWA</button>
                                                            </li>
                                                            <li className="nav-item" role="presentation">
                                                                <button className="nav-link" id="layerone_2-tab"
                                                                    data-bs-toggle="tab" data-bs-target="#layerone_2"
                                                                    type="button" role="tab" aria-controls="layerone_2"
                                                                    aria-selected="false">Layer
                                                                    1</button>
                                                            </li>
                                                            <li className="nav-item" role="presentation">
                                                                <button className="nav-link" id="layertwo_2-tab"
                                                                    data-bs-toggle="tab" data-bs-target="#layertwo_2"
                                                                    type="button" role="tab" aria-controls="layertwo_2"
                                                                    aria-selected="false">Layer
                                                                    2</button>
                                                            </li>
                                                            <li className="nav-item dropdown" role="presentation">
                                                                <a className="nav-link dropdown-toggle" id="dropdownMenu"
                                                                    data-bs-toggle="dropdown" href="#" role="button">
                                                                    Gaming
                                                                </a>
                                                                <ul className="dropdown-menu">
                                                                    <li><a className="dropdown-item" data-bs-toggle="tab"
                                                                        href="#infrastructure_1">Infrastructure</a></li>
                                                                    <li><a className="dropdown-item" data-bs-toggle="tab"
                                                                        href="#DeFi_1">DeFi</a></li>
                                                                    <li><a className="dropdown-item" data-bs-toggle="tab"
                                                                        href="#metaverse_1">Metaverse</a></li>
                                                                    <li><a className="dropdown-item" data-bs-toggle="tab"
                                                                        href="#payment_1">Payment</a></li>
                                                                    <li><a className="dropdown-item" data-bs-toggle="tab"
                                                                        href="#pow_1">PoW</a></li>
                                                                    <li><a className="dropdown-item" data-bs-toggle="tab"
                                                                        href="#storage_1">Storage</a></li>
                                                                    <li><a className="dropdown-item" data-bs-toggle="tab"
                                                                        href="#nft_1">NFT</a></li>
                                                                </ul>
                                                            </li>
                                                        </ul>

                                                        <div className="tab-content" id="myTabContent">
                                                            <div className="tab-pane fade show active" id="all_two" role="tabpanel"
                                                                aria-labelledby="all_two-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <svg enable-background="new 0 0 500 500"
                                                                                                    height="500px" id="Layer_1"
                                                                                                    version="1.1"
                                                                                                    viewBox="0 0 500 500"
                                                                                                    width="500px"
                                                                                                    xmlspace="preserve"
                                                                                                >
                                                                                                    <path clip-rule="evenodd"
                                                                                                        d="M250,41.034c-8.091,0-14.808,5.448-16.902,12.901l-42.882,132.467 
                                                                                                 H49.392c-9.724,0-17.442,8.456-17.442,18.26c0,5.999,2.997,11.357,7.54,14.542c2.814,1.907,113.747,82.948,113.747,82.948 
                                                                                                  s-42.605,130.835-43.431,132.921c-0.63,1.907-1.083,4.001-1.083,6.175c0,9.813,7.897,17.718,17.622,17.718 
                                                                                                   c3.726,0,7.178-1.181,10.087-3.175L250,373.106c0,0,111.023,80.865,113.569,82.685c2.899,1.994,6.361,3.175,10.078,3.175 
                                                                                                    c9.725,0,17.63-7.994,17.63-17.718c0-2.174-0.45-4.268-1.092-6.175c-0.815-2.086-43.421-132.921-43.421-132.921 
                                                                                                     s110.924-81.041,113.744-82.948c4.543-3.185,7.542-8.543,7.542-14.63c0-9.717-7.542-18.172-17.267-18.172H309.961L266.892,53.935 
                                                                                                      C264.81,46.482,258.081,41.034,250,41.034z"
                                                                                                        fill="#010101"
                                                                                                        fill-rule="evenodd" />
                                                                                                </svg>
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <svg enable-background="new 0 0 500 500"
                                                                                                    height="500px" id="Layer_1"
                                                                                                    version="1.1"
                                                                                                    viewBox="0 0 500 500"
                                                                                                    width="500px"
                                                                                                    xmlspace="preserve"
                                                                                                >
                                                                                                    <path clip-rule="evenodd"
                                                                                                        d="M250,41.034c-8.091,0-14.808,5.448-16.902,12.901l-42.882,132.467 
                                                                                                 H49.392c-9.724,0-17.442,8.456-17.442,18.26c0,5.999,2.997,11.357,7.54,14.542c2.814,1.907,113.747,82.948,113.747,82.948 
                                                                                                  s-42.605,130.835-43.431,132.921c-0.63,1.907-1.083,4.001-1.083,6.175c0,9.813,7.897,17.718,17.622,17.718 
                                                                                                   c3.726,0,7.178-1.181,10.087-3.175L250,373.106c0,0,111.023,80.865,113.569,82.685c2.899,1.994,6.361,3.175,10.078,3.175 
                                                                                                    c9.725,0,17.63-7.994,17.63-17.718c0-2.174-0.45-4.268-1.092-6.175c-0.815-2.086-43.421-132.921-43.421-132.921 
                                                                                                     s110.924-81.041,113.744-82.948c4.543-3.185,7.542-8.543,7.542-14.63c0-9.717-7.542-18.172-17.267-18.172H309.961L266.892,53.935 
                                                                                                      C264.81,46.482,258.081,41.034,250,41.034z"
                                                                                                        fill="#010101"
                                                                                                        fill-rule="evenodd" />
                                                                                                </svg>
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <svg enable-background="new 0 0 500 500"
                                                                                                    height="500px" id="Layer_1"
                                                                                                    version="1.1"
                                                                                                    viewBox="0 0 500 500"
                                                                                                    width="500px"
                                                                                                    xmlspace="preserve"
                                                                                                >
                                                                                                    <path clip-rule="evenodd"
                                                                                                        d="M250,41.034c-8.091,0-14.808,5.448-16.902,12.901l-42.882,132.467 
                                                                                                 H49.392c-9.724,0-17.442,8.456-17.442,18.26c0,5.999,2.997,11.357,7.54,14.542c2.814,1.907,113.747,82.948,113.747,82.948 
                                                                                                  s-42.605,130.835-43.431,132.921c-0.63,1.907-1.083,4.001-1.083,6.175c0,9.813,7.897,17.718,17.622,17.718 
                                                                                                   c3.726,0,7.178-1.181,10.087-3.175L250,373.106c0,0,111.023,80.865,113.569,82.685c2.899,1.994,6.361,3.175,10.078,3.175 
                                                                                                    c9.725,0,17.63-7.994,17.63-17.718c0-2.174-0.45-4.268-1.092-6.175c-0.815-2.086-43.421-132.921-43.421-132.921 
                                                                                                     s110.924-81.041,113.744-82.948c4.543-3.185,7.542-8.543,7.542-14.63c0-9.717-7.542-18.172-17.267-18.172H309.961L266.892,53.935 
                                                                                                      C264.81,46.482,258.081,41.034,250,41.034z"
                                                                                                        fill="#010101"
                                                                                                        fill-rule="evenodd" />
                                                                                                </svg>
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <svg enable-background="new 0 0 500 500"
                                                                                                    height="500px" id="Layer_1"
                                                                                                    version="1.1"
                                                                                                    viewBox="0 0 500 500"
                                                                                                    width="500px"
                                                                                                    xmlspace="preserve"
                                                                                                >
                                                                                                    <path clip-rule="evenodd"
                                                                                                        d="M250,41.034c-8.091,0-14.808,5.448-16.902,12.901l-42.882,132.467 
                                                                                                 H49.392c-9.724,0-17.442,8.456-17.442,18.26c0,5.999,2.997,11.357,7.54,14.542c2.814,1.907,113.747,82.948,113.747,82.948 
                                                                                                  s-42.605,130.835-43.431,132.921c-0.63,1.907-1.083,4.001-1.083,6.175c0,9.813,7.897,17.718,17.622,17.718 
                                                                                                   c3.726,0,7.178-1.181,10.087-3.175L250,373.106c0,0,111.023,80.865,113.569,82.685c2.899,1.994,6.361,3.175,10.078,3.175 
                                                                                                    c9.725,0,17.63-7.994,17.63-17.718c0-2.174-0.45-4.268-1.092-6.175c-0.815-2.086-43.421-132.921-43.421-132.921 
                                                                                                     s110.924-81.041,113.744-82.948c4.543-3.185,7.542-8.543,7.542-14.63c0-9.717-7.542-18.172-17.267-18.172H309.961L266.892,53.935 
                                                                                                      C264.81,46.482,258.081,41.034,250,41.034z"
                                                                                                        fill="#010101"
                                                                                                        fill-rule="evenodd" />
                                                                                                </svg>
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <svg enable-background="new 0 0 500 500"
                                                                                                    height="500px" id="Layer_1"
                                                                                                    version="1.1"
                                                                                                    viewBox="0 0 500 500"
                                                                                                    width="500px"
                                                                                                    xmlspace="preserve"
                                                                                                >
                                                                                                    <path clip-rule="evenodd"
                                                                                                        d="M250,41.034c-8.091,0-14.808,5.448-16.902,12.901l-42.882,132.467 
                                                                                                 H49.392c-9.724,0-17.442,8.456-17.442,18.26c0,5.999,2.997,11.357,7.54,14.542c2.814,1.907,113.747,82.948,113.747,82.948 
                                                                                                  s-42.605,130.835-43.431,132.921c-0.63,1.907-1.083,4.001-1.083,6.175c0,9.813,7.897,17.718,17.622,17.718 
                                                                                                   c3.726,0,7.178-1.181,10.087-3.175L250,373.106c0,0,111.023,80.865,113.569,82.685c2.899,1.994,6.361,3.175,10.078,3.175 
                                                                                                    c9.725,0,17.63-7.994,17.63-17.718c0-2.174-0.45-4.268-1.092-6.175c-0.815-2.086-43.421-132.921-43.421-132.921 
                                                                                                     s110.924-81.041,113.744-82.948c4.543-3.185,7.542-8.543,7.542-14.63c0-9.717-7.542-18.172-17.267-18.172H309.961L266.892,53.935 
                                                                                                      C264.81,46.482,258.081,41.034,250,41.034z"
                                                                                                        fill="#010101"
                                                                                                        fill-rule="evenodd" />
                                                                                                </svg>
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <svg enable-background="new 0 0 500 500"
                                                                                                    height="500px" id="Layer_1"
                                                                                                    version="1.1"
                                                                                                    viewBox="0 0 500 500"
                                                                                                    width="500px"
                                                                                                    xmlspace="preserve"
                                                                                                >
                                                                                                    <path clip-rule="evenodd"
                                                                                                        d="M250,41.034c-8.091,0-14.808,5.448-16.902,12.901l-42.882,132.467 
                                                                                                 H49.392c-9.724,0-17.442,8.456-17.442,18.26c0,5.999,2.997,11.357,7.54,14.542c2.814,1.907,113.747,82.948,113.747,82.948 
                                                                                                  s-42.605,130.835-43.431,132.921c-0.63,1.907-1.083,4.001-1.083,6.175c0,9.813,7.897,17.718,17.622,17.718 
                                                                                                   c3.726,0,7.178-1.181,10.087-3.175L250,373.106c0,0,111.023,80.865,113.569,82.685c2.899,1.994,6.361,3.175,10.078,3.175 
                                                                                                    c9.725,0,17.63-7.994,17.63-17.718c0-2.174-0.45-4.268-1.092-6.175c-0.815-2.086-43.421-132.921-43.421-132.921 
                                                                                                     s110.924-81.041,113.744-82.948c4.543-3.185,7.542-8.543,7.542-14.63c0-9.717-7.542-18.172-17.267-18.172H309.961L266.892,53.935 
                                                                                                      C264.81,46.482,258.081,41.034,250,41.034z"
                                                                                                        fill="#010101"
                                                                                                        fill-rule="evenodd" />
                                                                                                </svg>
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <svg enable-background="new 0 0 500 500"
                                                                                                    height="500px" id="Layer_1"
                                                                                                    version="1.1"
                                                                                                    viewBox="0 0 500 500"
                                                                                                    width="500px"
                                                                                                    xmlspace="preserve"
                                                                                                >
                                                                                                    <path clip-rule="evenodd"
                                                                                                        d="M250,41.034c-8.091,0-14.808,5.448-16.902,12.901l-42.882,132.467 
                                                                                                 H49.392c-9.724,0-17.442,8.456-17.442,18.26c0,5.999,2.997,11.357,7.54,14.542c2.814,1.907,113.747,82.948,113.747,82.948 
                                                                                                  s-42.605,130.835-43.431,132.921c-0.63,1.907-1.083,4.001-1.083,6.175c0,9.813,7.897,17.718,17.622,17.718 
                                                                                                   c3.726,0,7.178-1.181,10.087-3.175L250,373.106c0,0,111.023,80.865,113.569,82.685c2.899,1.994,6.361,3.175,10.078,3.175 
                                                                                                    c9.725,0,17.63-7.994,17.63-17.718c0-2.174-0.45-4.268-1.092-6.175c-0.815-2.086-43.421-132.921-43.421-132.921 
                                                                                                     s110.924-81.041,113.744-82.948c4.543-3.185,7.542-8.543,7.542-14.63c0-9.717-7.542-18.172-17.267-18.172H309.961L266.892,53.935 
                                                                                                      C264.81,46.482,258.081,41.034,250,41.034z"
                                                                                                        fill="#010101"
                                                                                                        fill-rule="evenodd" />
                                                                                                </svg>
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="new_listing_two" role="tabpanel"
                                                                aria-labelledby="new_listing_two-tab">
                                                                <div className="no_data_found">
                                                                    <svg className="bn-svg text-[96px]" viewBox="0 0 96 96"
                                                                        xmlns="http://www.w3.org/2000/svg">
                                                                        <path opacity="0.5" d="M84 28H64V8l20 20z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path opacity="0.2" fill-rule="evenodd"
                                                                            clip-rule="evenodd"
                                                                            d="M24 8h40v20h20v60H24V8zm10 30h40v4H34v-4zm40 8H34v4h40v-4zm-40 8h40v4H34v-4z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                                                            d="M22.137 64.105c7.828 5.781 18.916 5.127 26.005-1.963 7.81-7.81 7.81-20.474 0-28.284-7.81-7.81-20.474-7.81-28.284 0-7.09 7.09-7.744 18.177-1.964
                                                                     26.005l-14.3 14.3 4.243 4.243 14.3-14.3zM43.9 57.9c-5.467 5.468-14.331 5.468-19.799 0-5.467-5.467-5.467-14.331 0-19.799 5.468-5.467
                                                                      14.332-5.467 19.8 0 5.467 5.468 5.467 14.332 0 19.8z" fill="#AEB4BC"></path>
                                                                    </svg>
                                                                    <p>No symbol under this category</p>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="usdc_two" role="tabpanel"
                                                                aria-labelledby="usdc_two-tab">
                                                                <div className="no_data_found">
                                                                    <svg className="bn-svg text-[96px]" viewBox="0 0 96 96"
                                                                        xmlns="http://www.w3.org/2000/svg">
                                                                        <path opacity="0.5" d="M84 28H64V8l20 20z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path opacity="0.2" fill-rule="evenodd"
                                                                            clip-rule="evenodd"
                                                                            d="M24 8h40v20h20v60H24V8zm10 30h40v4H34v-4zm40 8H34v4h40v-4zm-40 8h40v4H34v-4z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                                                            d="M22.137 64.105c7.828 5.781 18.916 5.127 26.005-1.963 7.81-7.81 7.81-20.474 0-28.284-7.81-7.81-20.474-7.81-28.284 0-7.09 7.09-7.744 18.177-1.964
                                                                     26.005l-14.3 14.3 4.243 4.243 14.3-14.3zM43.9 57.9c-5.467 5.468-14.331 5.468-19.799 0-5.467-5.467-5.467-14.331 0-19.799 5.468-5.467
                                                                      14.332-5.467 19.8 0 5.467 5.468 5.467 14.332 0 19.8z" fill="#AEB4BC"></path>
                                                                    </svg>
                                                                    <p>No symbol under this category</p>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="ai_two" role="tabpanel"
                                                                aria-labelledby="ai_two-tab">
                                                                <div className="no_data_found">
                                                                    <svg className="bn-svg text-[96px]" viewBox="0 0 96 96"
                                                                        xmlns="http://www.w3.org/2000/svg">
                                                                        <path opacity="0.5" d="M84 28H64V8l20 20z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path opacity="0.2" fill-rule="evenodd"
                                                                            clip-rule="evenodd"
                                                                            d="M24 8h40v20h20v60H24V8zm10 30h40v4H34v-4zm40 8H34v4h40v-4zm-40 8h40v4H34v-4z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                                                            d="M22.137 64.105c7.828 5.781 18.916 5.127 26.005-1.963 7.81-7.81 7.81-20.474 0-28.284-7.81-7.81-20.474-7.81-28.284 0-7.09 7.09-7.744 18.177-1.964
                                                                     26.005l-14.3 14.3 4.243 4.243 14.3-14.3zM43.9 57.9c-5.467 5.468-14.331 5.468-19.799 0-5.467-5.467-5.467-14.331 0-19.799 5.468-5.467
                                                                      14.332-5.467 19.8 0 5.467 5.468 5.467 14.332 0 19.8z" fill="#AEB4BC"></path>
                                                                    </svg>
                                                                    <p>No symbol under this category</p>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="rwa_two" role="tabpanel"
                                                                aria-labelledby="rwa_two-tab">
                                                                <div className="no_data_found">
                                                                    <svg className="bn-svg text-[96px]" viewBox="0 0 96 96"
                                                                        xmlns="http://www.w3.org/2000/svg">
                                                                        <path opacity="0.5" d="M84 28H64V8l20 20z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path opacity="0.2" fill-rule="evenodd"
                                                                            clip-rule="evenodd"
                                                                            d="M24 8h40v20h20v60H24V8zm10 30h40v4H34v-4zm40 8H34v4h40v-4zm-40 8h40v4H34v-4z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                                                            d="M22.137 64.105c7.828 5.781 18.916 5.127 26.005-1.963 7.81-7.81 7.81-20.474 0-28.284-7.81-7.81-20.474-7.81-28.284 0-7.09 7.09-7.744 18.177-1.964
                                                                     26.005l-14.3 14.3 4.243 4.243 14.3-14.3zM43.9 57.9c-5.467 5.468-14.331 5.468-19.799 0-5.467-5.467-5.467-14.331 0-19.799 5.468-5.467
                                                                      14.332-5.467 19.8 0 5.467 5.468 5.467 14.332 0 19.8z" fill="#AEB4BC"></path>
                                                                    </svg>
                                                                    <p>No symbol under this category</p>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="layerone_2" role="tabpanel"
                                                                aria-labelledby="layerone_2-tab">
                                                                <div className="no_data_found">
                                                                    <svg className="bn-svg text-[96px]" viewBox="0 0 96 96"
                                                                        xmlns="http://www.w3.org/2000/svg">
                                                                        <path opacity="0.5" d="M84 28H64V8l20 20z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path opacity="0.2" fill-rule="evenodd"
                                                                            clip-rule="evenodd"
                                                                            d="M24 8h40v20h20v60H24V8zm10 30h40v4H34v-4zm40 8H34v4h40v-4zm-40 8h40v4H34v-4z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                                                            d="M22.137 64.105c7.828 5.781 18.916 5.127 26.005-1.963 7.81-7.81 7.81-20.474 0-28.284-7.81-7.81-20.474-7.81-28.284 0-7.09 7.09-7.744 18.177-1.964
                                                                     26.005l-14.3 14.3 4.243 4.243 14.3-14.3zM43.9 57.9c-5.467 5.468-14.331 5.468-19.799 0-5.467-5.467-5.467-14.331 0-19.799 5.468-5.467
                                                                      14.332-5.467 19.8 0 5.467 5.468 5.467 14.332 0 19.8z" fill="#AEB4BC"></path>
                                                                    </svg>
                                                                    <p>No symbol under this category</p>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="layertwo_2" role="tabpanel"
                                                                aria-labelledby="layertwo_2-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>


                                                            <div className="tab-pane fade" id="infrastructure_1" role="tabpanel"
                                                                aria-labelledby="infrastructure_1-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="DeFi_1" role="tabpanel"
                                                                aria-labelledby="DeFi_1-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="metaverse_1" role="tabpanel"
                                                                aria-labelledby="metaverse_1-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="payment_1" role="tabpanel"
                                                                aria-labelledby="payment_1-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="tab-pane fade" id="pow_1" role="tabpanel"
                                                                aria-labelledby="pow_1-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="storage_1" role="tabpanel"
                                                                aria-labelledby="storage_1-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="nft_1" role="tabpanel"
                                                                aria-labelledby="nft_1-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>


                                                        </div>

                                                    </div>
                                                    <div className="tab-pane fade" id="coin-m" role="tabpanel"
                                                        aria-labelledby="coin-m-tab">

                                                        <ul className="nav nav-tabs" id="myTab_four" role="tablist">
                                                            <li className="nav-item" role="presentation">
                                                                <button className="nav-link active" id="all_one-tab"
                                                                    data-bs-toggle="tab" data-bs-target="#allone" type="button"
                                                                    role="tab" aria-controls="allone"
                                                                    aria-selected="true">All</button>
                                                            </li>
                                                            <li className="nav-item" role="presentation">
                                                                <button className="nav-link" id="new_listingone-tab"
                                                                    data-bs-toggle="tab" data-bs-target="#new_listingone"
                                                                    type="button" role="tab" aria-controls="new_listingone"
                                                                    aria-selected="false">New Listing</button>
                                                            </li>
                                                            <li className="nav-item" role="presentation">
                                                                <button className="nav-link" id="usdcone-tab" data-bs-toggle="tab"
                                                                    data-bs-target="#usdcone" type="button" role="tab"
                                                                    aria-controls="usdcone" aria-selected="false">USDC</button>
                                                            </li>
                                                            <li className="nav-item" role="presentation">
                                                                <button className="nav-link" id="aione-tab" data-bs-toggle="tab"
                                                                    data-bs-target="#aione" type="button" role="tab"
                                                                    aria-controls="aione" aria-selected="false">AI</button>
                                                            </li>
                                                            <li className="nav-item" role="presentation">
                                                                <button className="nav-link" id="rwaone-tab" data-bs-toggle="tab"
                                                                    data-bs-target="#rwaone" type="button" role="tab"
                                                                    aria-controls="rwaone" aria-selected="false">RWA</button>
                                                            </li>
                                                            <li className="nav-item" role="presentation">
                                                                <button className="nav-link" id="layerone_i-tab"
                                                                    data-bs-toggle="tab" data-bs-target="#layerone_i"
                                                                    type="button" role="tab" aria-controls="layerone_i"
                                                                    aria-selected="false">Layer
                                                                    1</button>
                                                            </li>
                                                            <li className="nav-item" role="presentation">
                                                                <button className="nav-link" id="layertwo_i-tab"
                                                                    data-bs-toggle="tab" data-bs-target="#layertwo_i"
                                                                    type="button" role="tab" aria-controls="layertwo_i"
                                                                    aria-selected="false">Layer
                                                                    2</button>
                                                            </li>
                                                            <li className="nav-item dropdown" role="presentation">
                                                                <a className="nav-link dropdown-toggle" id="dropdownMenu"
                                                                    data-bs-toggle="dropdown" href="#" role="button">
                                                                    Gaming
                                                                </a>
                                                                <ul className="dropdown-menu">
                                                                    <li><a className="dropdown-item" data-bs-toggle="tab"
                                                                        href="#infrastructure_2">Infrastructure</a></li>
                                                                    <li><a className="dropdown-item" data-bs-toggle="tab"
                                                                        href="#DeFi_2">DeFi</a></li>
                                                                    <li><a className="dropdown-item" data-bs-toggle="tab"
                                                                        href="#metaverse_2">Metaverse</a></li>
                                                                    <li><a className="dropdown-item" data-bs-toggle="tab"
                                                                        href="#payment_2">Payment</a></li>
                                                                    <li><a className="dropdown-item" data-bs-toggle="tab"
                                                                        href="#pow_2">PoW</a></li>
                                                                    <li><a className="dropdown-item" data-bs-toggle="tab"
                                                                        href="#storage_2">Storage</a></li>
                                                                    <li><a className="dropdown-item" data-bs-toggle="tab"
                                                                        href="#nft_2">NFT</a></li>
                                                                </ul>
                                                            </li>
                                                        </ul>

                                                        <div className="tab-content" id="myTabContent">
                                                            <div className="tab-pane fade show active" id="allone" role="tabpanel"
                                                                aria-labelledby="allone-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <svg enable-background="new 0 0 500 500"
                                                                                                    height="500px" id="Layer_1"
                                                                                                    version="1.1"
                                                                                                    viewBox="0 0 500 500"
                                                                                                    width="500px"
                                                                                                    xmlspace="preserve"
                                                                                                >
                                                                                                    <path clip-rule="evenodd"
                                                                                                        d="M250,41.034c-8.091,0-14.808,5.448-16.902,12.901l-42.882,132.467 
                                                                                                 H49.392c-9.724,0-17.442,8.456-17.442,18.26c0,5.999,2.997,11.357,7.54,14.542c2.814,1.907,113.747,82.948,113.747,82.948 
                                                                                                  s-42.605,130.835-43.431,132.921c-0.63,1.907-1.083,4.001-1.083,6.175c0,9.813,7.897,17.718,17.622,17.718 
                                                                                                   c3.726,0,7.178-1.181,10.087-3.175L250,373.106c0,0,111.023,80.865,113.569,82.685c2.899,1.994,6.361,3.175,10.078,3.175 
                                                                                                    c9.725,0,17.63-7.994,17.63-17.718c0-2.174-0.45-4.268-1.092-6.175c-0.815-2.086-43.421-132.921-43.421-132.921 
                                                                                                     s110.924-81.041,113.744-82.948c4.543-3.185,7.542-8.543,7.542-14.63c0-9.717-7.542-18.172-17.267-18.172H309.961L266.892,53.935 
                                                                                                      C264.81,46.482,258.081,41.034,250,41.034z"
                                                                                                        fill="#010101"
                                                                                                        fill-rule="evenodd" />
                                                                                                </svg>
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <svg enable-background="new 0 0 500 500"
                                                                                                    height="500px" id="Layer_1"
                                                                                                    version="1.1"
                                                                                                    viewBox="0 0 500 500"
                                                                                                    width="500px"
                                                                                                    xmlspace="preserve"
                                                                                                >
                                                                                                    <path clip-rule="evenodd"
                                                                                                        d="M250,41.034c-8.091,0-14.808,5.448-16.902,12.901l-42.882,132.467 
                                                                                                 H49.392c-9.724,0-17.442,8.456-17.442,18.26c0,5.999,2.997,11.357,7.54,14.542c2.814,1.907,113.747,82.948,113.747,82.948 
                                                                                                  s-42.605,130.835-43.431,132.921c-0.63,1.907-1.083,4.001-1.083,6.175c0,9.813,7.897,17.718,17.622,17.718 
                                                                                                   c3.726,0,7.178-1.181,10.087-3.175L250,373.106c0,0,111.023,80.865,113.569,82.685c2.899,1.994,6.361,3.175,10.078,3.175 
                                                                                                    c9.725,0,17.63-7.994,17.63-17.718c0-2.174-0.45-4.268-1.092-6.175c-0.815-2.086-43.421-132.921-43.421-132.921 
                                                                                                     s110.924-81.041,113.744-82.948c4.543-3.185,7.542-8.543,7.542-14.63c0-9.717-7.542-18.172-17.267-18.172H309.961L266.892,53.935 
                                                                                                      C264.81,46.482,258.081,41.034,250,41.034z"
                                                                                                        fill="#010101"
                                                                                                        fill-rule="evenodd" />
                                                                                                </svg>
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <svg enable-background="new 0 0 500 500"
                                                                                                    height="500px" id="Layer_1"
                                                                                                    version="1.1"
                                                                                                    viewBox="0 0 500 500"
                                                                                                    width="500px"
                                                                                                    xmlspace="preserve"
                                                                                                >
                                                                                                    <path clip-rule="evenodd"
                                                                                                        d="M250,41.034c-8.091,0-14.808,5.448-16.902,12.901l-42.882,132.467 
                                                                                                 H49.392c-9.724,0-17.442,8.456-17.442,18.26c0,5.999,2.997,11.357,7.54,14.542c2.814,1.907,113.747,82.948,113.747,82.948 
                                                                                                  s-42.605,130.835-43.431,132.921c-0.63,1.907-1.083,4.001-1.083,6.175c0,9.813,7.897,17.718,17.622,17.718 
                                                                                                   c3.726,0,7.178-1.181,10.087-3.175L250,373.106c0,0,111.023,80.865,113.569,82.685c2.899,1.994,6.361,3.175,10.078,3.175 
                                                                                                    c9.725,0,17.63-7.994,17.63-17.718c0-2.174-0.45-4.268-1.092-6.175c-0.815-2.086-43.421-132.921-43.421-132.921 
                                                                                                     s110.924-81.041,113.744-82.948c4.543-3.185,7.542-8.543,7.542-14.63c0-9.717-7.542-18.172-17.267-18.172H309.961L266.892,53.935 
                                                                                                      C264.81,46.482,258.081,41.034,250,41.034z"
                                                                                                        fill="#010101"
                                                                                                        fill-rule="evenodd" />
                                                                                                </svg>
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <svg enable-background="new 0 0 500 500"
                                                                                                    height="500px" id="Layer_1"
                                                                                                    version="1.1"
                                                                                                    viewBox="0 0 500 500"
                                                                                                    width="500px"
                                                                                                    xmlspace="preserve"
                                                                                                >
                                                                                                    <path clip-rule="evenodd"
                                                                                                        d="M250,41.034c-8.091,0-14.808,5.448-16.902,12.901l-42.882,132.467 
                                                                                                 H49.392c-9.724,0-17.442,8.456-17.442,18.26c0,5.999,2.997,11.357,7.54,14.542c2.814,1.907,113.747,82.948,113.747,82.948 
                                                                                                  s-42.605,130.835-43.431,132.921c-0.63,1.907-1.083,4.001-1.083,6.175c0,9.813,7.897,17.718,17.622,17.718 
                                                                                                   c3.726,0,7.178-1.181,10.087-3.175L250,373.106c0,0,111.023,80.865,113.569,82.685c2.899,1.994,6.361,3.175,10.078,3.175 
                                                                                                    c9.725,0,17.63-7.994,17.63-17.718c0-2.174-0.45-4.268-1.092-6.175c-0.815-2.086-43.421-132.921-43.421-132.921 
                                                                                                     s110.924-81.041,113.744-82.948c4.543-3.185,7.542-8.543,7.542-14.63c0-9.717-7.542-18.172-17.267-18.172H309.961L266.892,53.935 
                                                                                                      C264.81,46.482,258.081,41.034,250,41.034z"
                                                                                                        fill="#010101"
                                                                                                        fill-rule="evenodd" />
                                                                                                </svg>
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <svg enable-background="new 0 0 500 500"
                                                                                                    height="500px" id="Layer_1"
                                                                                                    version="1.1"
                                                                                                    viewBox="0 0 500 500"
                                                                                                    width="500px"
                                                                                                    xmlspace="preserve"
                                                                                                >
                                                                                                    <path clip-rule="evenodd"
                                                                                                        d="M250,41.034c-8.091,0-14.808,5.448-16.902,12.901l-42.882,132.467 
                                                                                                 H49.392c-9.724,0-17.442,8.456-17.442,18.26c0,5.999,2.997,11.357,7.54,14.542c2.814,1.907,113.747,82.948,113.747,82.948 
                                                                                                  s-42.605,130.835-43.431,132.921c-0.63,1.907-1.083,4.001-1.083,6.175c0,9.813,7.897,17.718,17.622,17.718 
                                                                                                   c3.726,0,7.178-1.181,10.087-3.175L250,373.106c0,0,111.023,80.865,113.569,82.685c2.899,1.994,6.361,3.175,10.078,3.175 
                                                                                                    c9.725,0,17.63-7.994,17.63-17.718c0-2.174-0.45-4.268-1.092-6.175c-0.815-2.086-43.421-132.921-43.421-132.921 
                                                                                                     s110.924-81.041,113.744-82.948c4.543-3.185,7.542-8.543,7.542-14.63c0-9.717-7.542-18.172-17.267-18.172H309.961L266.892,53.935 
                                                                                                      C264.81,46.482,258.081,41.034,250,41.034z"
                                                                                                        fill="#010101"
                                                                                                        fill-rule="evenodd" />
                                                                                                </svg>
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <svg enable-background="new 0 0 500 500"
                                                                                                    height="500px" id="Layer_1"
                                                                                                    version="1.1"
                                                                                                    viewBox="0 0 500 500"
                                                                                                    width="500px"
                                                                                                    xmlspace="preserve"
                                                                                                >
                                                                                                    <path clip-rule="evenodd"
                                                                                                        d="M250,41.034c-8.091,0-14.808,5.448-16.902,12.901l-42.882,132.467 
                                                                                                 H49.392c-9.724,0-17.442,8.456-17.442,18.26c0,5.999,2.997,11.357,7.54,14.542c2.814,1.907,113.747,82.948,113.747,82.948 
                                                                                                  s-42.605,130.835-43.431,132.921c-0.63,1.907-1.083,4.001-1.083,6.175c0,9.813,7.897,17.718,17.622,17.718 
                                                                                                   c3.726,0,7.178-1.181,10.087-3.175L250,373.106c0,0,111.023,80.865,113.569,82.685c2.899,1.994,6.361,3.175,10.078,3.175 
                                                                                                    c9.725,0,17.63-7.994,17.63-17.718c0-2.174-0.45-4.268-1.092-6.175c-0.815-2.086-43.421-132.921-43.421-132.921 
                                                                                                     s110.924-81.041,113.744-82.948c4.543-3.185,7.542-8.543,7.542-14.63c0-9.717-7.542-18.172-17.267-18.172H309.961L266.892,53.935 
                                                                                                      C264.81,46.482,258.081,41.034,250,41.034z"
                                                                                                        fill="#010101"
                                                                                                        fill-rule="evenodd" />
                                                                                                </svg>
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <svg enable-background="new 0 0 500 500"
                                                                                                    height="500px" id="Layer_1"
                                                                                                    version="1.1"
                                                                                                    viewBox="0 0 500 500"
                                                                                                    width="500px"
                                                                                                    xmlspace="preserve"
                                                                                                >
                                                                                                    <path clip-rule="evenodd"
                                                                                                        d="M250,41.034c-8.091,0-14.808,5.448-16.902,12.901l-42.882,132.467 
                                                                                                 H49.392c-9.724,0-17.442,8.456-17.442,18.26c0,5.999,2.997,11.357,7.54,14.542c2.814,1.907,113.747,82.948,113.747,82.948 
                                                                                                  s-42.605,130.835-43.431,132.921c-0.63,1.907-1.083,4.001-1.083,6.175c0,9.813,7.897,17.718,17.622,17.718 
                                                                                                   c3.726,0,7.178-1.181,10.087-3.175L250,373.106c0,0,111.023,80.865,113.569,82.685c2.899,1.994,6.361,3.175,10.078,3.175 
                                                                                                    c9.725,0,17.63-7.994,17.63-17.718c0-2.174-0.45-4.268-1.092-6.175c-0.815-2.086-43.421-132.921-43.421-132.921 
                                                                                                     s110.924-81.041,113.744-82.948c4.543-3.185,7.542-8.543,7.542-14.63c0-9.717-7.542-18.172-17.267-18.172H309.961L266.892,53.935 
                                                                                                      C264.81,46.482,258.081,41.034,250,41.034z"
                                                                                                        fill="#010101"
                                                                                                        fill-rule="evenodd" />
                                                                                                </svg>
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="new_listingone" role="tabpanel"
                                                                aria-labelledby="new_listingone-tab">
                                                                <div className="no_data_found">
                                                                    <svg className="bn-svg text-[96px]" viewBox="0 0 96 96"
                                                                        xmlns="http://www.w3.org/2000/svg">
                                                                        <path opacity="0.5" d="M84 28H64V8l20 20z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path opacity="0.2" fill-rule="evenodd"
                                                                            clip-rule="evenodd"
                                                                            d="M24 8h40v20h20v60H24V8zm10 30h40v4H34v-4zm40 8H34v4h40v-4zm-40 8h40v4H34v-4z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                                                            d="M22.137 64.105c7.828 5.781 18.916 5.127 26.005-1.963 7.81-7.81 7.81-20.474 0-28.284-7.81-7.81-20.474-7.81-28.284 0-7.09 7.09-7.744 18.177-1.964
                                                                     26.005l-14.3 14.3 4.243 4.243 14.3-14.3zM43.9 57.9c-5.467 5.468-14.331 5.468-19.799 0-5.467-5.467-5.467-14.331 0-19.799 5.468-5.467
                                                                      14.332-5.467 19.8 0 5.467 5.468 5.467 14.332 0 19.8z" fill="#AEB4BC"></path>
                                                                    </svg>
                                                                    <p>No symbol under this category</p>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="usdcone" role="tabpanel"
                                                                aria-labelledby="usdcone-tab">
                                                                <div className="no_data_found">
                                                                    <svg className="bn-svg text-[96px]" viewBox="0 0 96 96"
                                                                        xmlns="http://www.w3.org/2000/svg">
                                                                        <path opacity="0.5" d="M84 28H64V8l20 20z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path opacity="0.2" fill-rule="evenodd"
                                                                            clip-rule="evenodd"
                                                                            d="M24 8h40v20h20v60H24V8zm10 30h40v4H34v-4zm40 8H34v4h40v-4zm-40 8h40v4H34v-4z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                                                            d="M22.137 64.105c7.828 5.781 18.916 5.127 26.005-1.963 7.81-7.81 7.81-20.474 0-28.284-7.81-7.81-20.474-7.81-28.284 0-7.09 7.09-7.744 18.177-1.964
                                                                     26.005l-14.3 14.3 4.243 4.243 14.3-14.3zM43.9 57.9c-5.467 5.468-14.331 5.468-19.799 0-5.467-5.467-5.467-14.331 0-19.799 5.468-5.467
                                                                      14.332-5.467 19.8 0 5.467 5.468 5.467 14.332 0 19.8z" fill="#AEB4BC"></path>
                                                                    </svg>
                                                                    <p>No symbol under this category</p>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="aione" role="tabpanel"
                                                                aria-labelledby="aione-tab">
                                                                <div className="no_data_found">
                                                                    <svg className="bn-svg text-[96px]" viewBox="0 0 96 96"
                                                                        xmlns="http://www.w3.org/2000/svg">
                                                                        <path opacity="0.5" d="M84 28H64V8l20 20z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path opacity="0.2" fill-rule="evenodd"
                                                                            clip-rule="evenodd"
                                                                            d="M24 8h40v20h20v60H24V8zm10 30h40v4H34v-4zm40 8H34v4h40v-4zm-40 8h40v4H34v-4z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                                                            d="M22.137 64.105c7.828 5.781 18.916 5.127 26.005-1.963 7.81-7.81 7.81-20.474 0-28.284-7.81-7.81-20.474-7.81-28.284 0-7.09 7.09-7.744 18.177-1.964
                                                                     26.005l-14.3 14.3 4.243 4.243 14.3-14.3zM43.9 57.9c-5.467 5.468-14.331 5.468-19.799 0-5.467-5.467-5.467-14.331 0-19.799 5.468-5.467
                                                                      14.332-5.467 19.8 0 5.467 5.468 5.467 14.332 0 19.8z" fill="#AEB4BC"></path>
                                                                    </svg>
                                                                    <p>No symbol under this category</p>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="rwaone" role="tabpanel"
                                                                aria-labelledby="rwaone-tab">
                                                                <div className="no_data_found">
                                                                    <svg className="bn-svg text-[96px]" viewBox="0 0 96 96"
                                                                        xmlns="http://www.w3.org/2000/svg">
                                                                        <path opacity="0.5" d="M84 28H64V8l20 20z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path opacity="0.2" fill-rule="evenodd"
                                                                            clip-rule="evenodd"
                                                                            d="M24 8h40v20h20v60H24V8zm10 30h40v4H34v-4zm40 8H34v4h40v-4zm-40 8h40v4H34v-4z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                                                            d="M22.137 64.105c7.828 5.781 18.916 5.127 26.005-1.963 7.81-7.81 7.81-20.474 0-28.284-7.81-7.81-20.474-7.81-28.284 0-7.09 7.09-7.744 18.177-1.964
                                                                     26.005l-14.3 14.3 4.243 4.243 14.3-14.3zM43.9 57.9c-5.467 5.468-14.331 5.468-19.799 0-5.467-5.467-5.467-14.331 0-19.799 5.468-5.467
                                                                      14.332-5.467 19.8 0 5.467 5.468 5.467 14.332 0 19.8z" fill="#AEB4BC"></path>
                                                                    </svg>
                                                                    <p>No symbol under this category</p>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="layerone_i" role="tabpanel"
                                                                aria-labelledby="layerone_i-tab">
                                                                <div className="no_data_found">
                                                                    <svg className="bn-svg text-[96px]" viewBox="0 0 96 96"
                                                                        xmlns="http://www.w3.org/2000/svg">
                                                                        <path opacity="0.5" d="M84 28H64V8l20 20z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path opacity="0.2" fill-rule="evenodd"
                                                                            clip-rule="evenodd"
                                                                            d="M24 8h40v20h20v60H24V8zm10 30h40v4H34v-4zm40 8H34v4h40v-4zm-40 8h40v4H34v-4z"
                                                                            fill="#AEB4BC"></path>
                                                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                                                            d="M22.137 64.105c7.828 5.781 18.916 5.127 26.005-1.963 7.81-7.81 7.81-20.474 0-28.284-7.81-7.81-20.474-7.81-28.284 0-7.09 7.09-7.744 18.177-1.964
                                                                     26.005l-14.3 14.3 4.243 4.243 14.3-14.3zM43.9 57.9c-5.467 5.468-14.331 5.468-19.799 0-5.467-5.467-5.467-14.331 0-19.799 5.468-5.467
                                                                      14.332-5.467 19.8 0 5.467 5.468 5.467 14.332 0 19.8z" fill="#AEB4BC"></path>
                                                                    </svg>
                                                                    <p>No symbol under this category</p>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="layertwo_i" role="tabpanel"
                                                                aria-labelledby="layertwo_i-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="infrastructure_2" role="tabpanel"
                                                                aria-labelledby="infrastructure_2-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="DeFi_2" role="tabpanel"
                                                                aria-labelledby="DeFi_2-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="metaverse_2" role="tabpanel"
                                                                aria-labelledby="metaverse_2-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="payment_2" role="tabpanel"
                                                                aria-labelledby="payment_2-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="tab-pane fade" id="pow_2" role="tabpanel"
                                                                aria-labelledby="pow_2-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="storage_2" role="tabpanel"
                                                                aria-labelledby="storage_2-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="tab-pane fade" id="nft_2" role="tabpanel"
                                                                aria-labelledby="nft_2-tab">
                                                                <div className="currency_data_list">
                                                                    <div className="table-responsive">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Symbols/Vol</th>
                                                                                    <th>Last Price</th>
                                                                                    <th>24h Chg</th>
                                                                                    <th>Funding Rate</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <div className="cnt_first_t">
                                                                                            <div className="icon_currency">
                                                                                                <img src="/images/futures_img/bitcoin_icon.png"
                                                                                                    alt="currency" />
                                                                                            </div>
                                                                                            <div className="cnt">
                                                                                                <h6>ETHUSDT <span>Perp</span>
                                                                                                </h6>
                                                                                                <p>Vol 29.27B</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>3,681.47</td>
                                                                                    <td className="danger">-2.31%</td>
                                                                                    <td>0.0000%</td>
                                                                                </tr>
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
                            </div>


                            <div className="price_top_right">
                                19,338.14
                                <span>+967.34 (3.56%)</span>
                            </div>
                        </div>

                        <div className="market_price_list_top">
                            <ul>
                                <li>
                                    <span>Mark Price</span>
                                    <div className="price_tag">19,338.14</div>
                                </li>
                                <li>
                                    <span>Index Price</span>
                                    <div className="price_tag">19,338.14</div>
                                </li>
                                <li>
                                    <span>24h Volume</span>
                                    <div className="price_tag">187 M BTC</div>
                                </li>
                                <li>
                                    <span>24h Turnover</span>
                                    <div className="price_tag">187 M USDT</div>
                                </li>
                                <li>
                                    <span>Open Interest</span>
                                    <div className="price_tag">107,013 M lot</div>
                                </li>
                                <li>
                                    <span>Open Value</span>
                                    <div className="price_tag">187 M BTC</div>
                                </li>
                                <li>
                                    <span>Funding Rate/Funding Settlement</span>
                                    <div className="price_tag"><span className="yellow">0.0021%</span> / 03:22:31</div>
                                </li>
                                <li>
                                    <span>Projected Funding Rate</span>
                                    <div className="price_tag">0.0021%</div>
                                </li>
                            </ul>
                        </div>

                    </div>

                    <div className="top_future_right_s">
                        <ul>
                            <li><img src="/images/futures_img/classic_icon.svg" alt="Classic Version" />Classic Version</li>
                            <li><img src="/images/futures_img/network_icon.svg" alt="network" /></li>
                            <li><img src="/images/futures_img/news_email_icon.svg" alt="News" />News</li>
                            <li><img src="/images/futures_img/tradetop_icon.svg" alt="Trade Information" />Trade Information</li>
                            <li><img src="/images/futures_img/novice_guide.svg" alt="guide" /></li>
                            <li><img src="/images/futures_img/novice_guide2.svg" alt="guide" /></li>
                            <li><img src="/images/futures_img/setting_icon.svg" alt="setting" /></li>
                        </ul>
                    </div>
                </div>

                <div className="dashboard_mid_s">
                    <div className="dashboard_summary_lft">
                        <img src="/images/futures_img/dashboard_summry_left.svg" alt="dashboard" />
                    </div>
                    <div className="order_trade_s">

                        <div className="order_book_info">
                            <div className="top_hd_s">
                                <h2>Order Book</h2>
                                <div className="toggle_dotted">
                                    <img src="/images/futures_img/dotted_toggle.svg" alt="toggle" />
                                </div>

                                <div className="orderbook_lightbox">
                                    <h6>Orderbook Preference</h6>
                                    <form>
                                        <div className="d-flex gap-3">
                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox" id="tp-sl" />
                                                <label className="form-check-label" for="tp-sl">TP/SL</label>
                                            </div>

                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox" id="tp-sl_2" />
                                                <label className="form-check-label" for="tp-sl_2">TP/SL</label>
                                            </div>

                                        </div>
                                    </form>
                                </div>

                            </div>

                            <div className="order_top_table_grid">
                                <ul className="togglebtn">
                                    <li><img src="/images/futures_img/grid_toggle.svg" alt="toggle" /></li>
                                    <li><img src="/images/futures_img/grid_toggle2.svg" alt="toggle" /></li>
                                    <li><img src="/images/futures_img/grid_toggle3.svg" alt="toggle" /></li>
                                </ul>
                                <div className="order_right_toggle">
                                    <ul>
                                        <li>0.1 <img src="/images/futures_img/arrowright_dotted.svg" /></li>
                                        <li><img src="/images/futures_img/vertical_icon.svg" /></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="table_info_data">
                                <div className="table-responsive">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Price(USDT)</th>
                                                <th>Size(BTC)</th>
                                                <th>Sum(BTC)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="danger">18796.9</td>
                                                <td>0.11106193</td>
                                                <td>12.12946018</td>
                                            </tr>
                                            <tr>
                                                <td className="danger">18796.9</td>
                                                <td>0.11106193</td>
                                                <td>12.12946018</td>
                                            </tr>
                                            <tr>
                                                <td className="danger">18796.9</td>
                                                <td>0.11106193</td>
                                                <td>12.12946018</td>
                                            </tr>
                                            <tr>
                                                <td className="danger">18796.9</td>
                                                <td>0.11106193</td>
                                                <td>12.12946018</td>
                                            </tr>
                                            <tr>
                                                <td className="danger">18796.9</td>
                                                <td>0.11106193</td>
                                                <td>12.12946018</td>
                                            </tr>

                                            <tr className="totaltb">
                                                <td className="danger">18,794.1</td>
                                                <td></td>
                                                <td>
                                                    <div className="subtotal">
                                                        <div><span>M</span>18,794.1</div>
                                                        <div><span>IN</span>18,794.1</div>
                                                    </div>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="sucess">18796.9</td>
                                                <td>0.11106193</td>
                                                <td>12.12946018</td>
                                            </tr>
                                            <tr>
                                                <td className="sucess">18796.9</td>
                                                <td>0.11106193</td>
                                                <td>12.12946018</td>
                                            </tr>
                                            <tr>
                                                <td className="sucess">18796.9</td>
                                                <td>0.11106193</td>
                                                <td>12.12946018</td>
                                            </tr>
                                            <tr>
                                                <td className="sucess">18796.9</td>
                                                <td>0.11106193</td>
                                                <td>12.12946018</td>
                                            </tr>
                                            <tr>
                                                <td className="sucess">18796.9</td>
                                                <td>0.11106193</td>
                                                <td>12.12946018</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="trade_movers_tb">
                                <ul className="nav nav-tabs" id="myTab" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <button className="nav-link active" id="trades-tab" data-bs-toggle="tab"
                                            data-bs-target="#trades" type="button" role="tab" aria-controls="trades"
                                            aria-selected="true">Trades</button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button className="nav-link" id="top-movers-tab" data-bs-toggle="tab"
                                            data-bs-target="#top-movers" type="button" role="tab" aria-controls="top-movers"
                                            aria-selected="false">Top Movers</button>
                                    </li>
                                </ul>

                                <div className="tab-content" id="myTabContent">
                                    <div className="tab-pane fade show active" id="trades" role="tabpanel"
                                        aria-labelledby="trades-tab">
                                        <div className="table_info_data">
                                            <div className="table-responsive">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>Price(USDT)</th>
                                                            <th>Amount(BTC)</th>
                                                            <th>Time</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td className="danger">18796.9</td>
                                                            <td>0.11106193</td>
                                                            <td>12.12946018</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="danger">18796.9</td>
                                                            <td>0.11106193</td>
                                                            <td>12.12946018</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="sucess">18796.9</td>
                                                            <td>0.11106193</td>
                                                            <td>12.12946018</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="danger">18796.9</td>
                                                            <td>0.11106193</td>
                                                            <td>12.12946018</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="sucess">18796.9</td>
                                                            <td>0.11106193</td>
                                                            <td>12.12946018</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="sucess">18796.9</td>
                                                            <td>0.11106193</td>
                                                            <td>12.12946018</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="danger">18796.9</td>
                                                            <td>0.11106193</td>
                                                            <td>12.12946018</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="sucess">18796.9</td>
                                                            <td>0.11106193</td>
                                                            <td>12.12946018</td>
                                                        </tr>



                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tab-pane fade" id="top-movers" role="tabpanel" aria-labelledby="top-movers-tab">

                                        <div className="table_info_data">
                                            <div className="table-responsive">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>Price(USDT)</th>
                                                            <th>Amount(BTC)</th>
                                                            <th>Time</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td className="danger">18796.9</td>
                                                            <td>0.11106193</td>
                                                            <td>12.12946018</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="danger">18796.9</td>
                                                            <td>0.11106193</td>
                                                            <td>12.12946018</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="sucess">18796.9</td>
                                                            <td>0.11106193</td>
                                                            <td>12.12946018</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="danger">18796.9</td>
                                                            <td>0.11106193</td>
                                                            <td>12.12946018</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="sucess">18796.9</td>
                                                            <td>0.11106193</td>
                                                            <td>12.12946018</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="sucess">18796.9</td>
                                                            <td>0.11106193</td>
                                                            <td>12.12946018</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="danger">18796.9</td>
                                                            <td>0.11106193</td>
                                                            <td>12.12946018</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="sucess">18796.9</td>
                                                            <td>0.11106193</td>
                                                            <td>12.12946018</td>
                                                        </tr>

                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>
                    <div className="relative_select_right">
                        <div className="top_cross_dashboard">
                            <ul>
                                <li><a href="#">Cross</a></li>
                                <li><a href="#">20x</a></li>
                            </ul>
                            <div className="copy_icon">
                                <img src="/images/futures_img/copy_vector.svg" alt="copy icon" />
                            </div>
                        </div>

                        <div className="spot_future_">
                            <ul>
                                <li><a href="#">Spot</a></li>
                                <li><a href="#">Cross <span>5x <img src="/images/futures_img/arrowright_dotted.svg" /></span></a></li>
                                <li><a href="#">Grid</a></li>
                                <li className="active"><a href="#">Futures</a></li>
                            </ul>
                        </div>
                        <div className="leverage_bl">
                            <div>
                                <div className="rage_txt">
                                    <img src="/images/futures_img/irage_icon.svg" alt="leverage" /> Leverage
                                </div>
                                <div className="range_price">20x <img src="/images/futures_img/arrowright_dotted.svg" /></div>
                            </div>

                            <div className="plustext">
                                +/=
                            </div>
                        </div>

                        <div className="market_spot_form">
                            <ul className="nav nav-tabs" id="myTab2" role="tablist">
                                {/* <!-- Normal Tabs --> */}
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link active" id="limit-tab" data-bs-toggle="tab" data-bs-target="#limit"
                                        type="button" role="tab" aria-controls="limit" aria-selected="true">Limit</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="market-tab" data-bs-toggle="tab" data-bs-target="#market"
                                        type="button" role="tab" aria-controls="market" aria-selected="false">Market</button>
                                </li>

                                {/* <!-- Dropdown Tab --> */}
                                <li className="nav-item dropdown" role="presentation">
                                    {/* <!-- Give an ID to dropdown toggle so we can update it --> */}
                                    <a className="nav-link dropdown-toggle" id="dropdownMenu" data-bs-toggle="dropdown" href="#"
                                        role="button">
                                        Stop Limit
                                    </a>
                                    <ul className="dropdown-menu">
                                        <li><a className="dropdown-item" data-bs-toggle="tab" href="#stop-market">Stop Market</a>
                                        </li>
                                        <li><a className="dropdown-item" data-bs-toggle="tab" href="#post-only">Post Only</a></li>
                                        <li><a className="dropdown-item" data-bs-toggle="tab" href="#twap">TWAP</a></li>
                                        <li><a className="dropdown-item" data-bs-toggle="tab" href="#scaled-order">Scaled Order</a>
                                        </li>
                                        <li><a className="dropdown-item" data-bs-toggle="tab" href="#trailing-stop">Trailing
                                            Stop</a></li>
                                    </ul>
                                </li>
                            </ul>

                            {/* <!-- Tab Content --> */}
                            <div className="tab-content pt-1" id="myTabContent2">
                                <div className="tab-pane fade show active" id="limit" role="tabpanel">

                                    <form className="price_info">
                                        <div className="price_inputbl">
                                            <label>Price</label>
                                            <div className="price_select_option">
                                                <input className="inputtype" type="text" placeholder="29197" />
                                                <select>
                                                    <option>USDT</option>
                                                    <option>BTC</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <label>Amount <span className="btctoggle">(BTC) <img
                                                src="/images/futures_img/arrowright_dotted.svg" /></span></label>
                                            <div className="price_select_option">
                                                <input className="inputtype" type="text" placeholder="0.000" />
                                                <select>
                                                    <option>BTC</option>
                                                    <option>USDT</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <ul>
                                                <li>0%</li>
                                                <li>25%</li>
                                                <li>50%</li>
                                                <li>75%</li>
                                                <li>100%</li>
                                            </ul>
                                        </div>
                                        <div className="price_inputbl">
                                            <div className="avail_total_usd">
                                                <label>Avail.</label>
                                                <div className="usd_price">0 USDT <img src="/images/futures_img/usd_icon_refersh.svg" /></div>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <div className="tpsl_reduce d-flex gap-3 align-items-center">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" id="tp-sl" />
                                                    <label className="form-check-label" for="tp-sl">TP/SL</label>
                                                </div>
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" id="reduce-only" />
                                                    <label className="form-check-label" for="reduce-only">Reduce only</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <div className="buysell_btn d-flex gap-2 align-items-center">
                                                <button className="buybtn">Buy/Long</button>
                                                <button className="sellbtn">Sell/Short</button>
                                            </div>
                                        </div>
                                        <div className="price_inputbl  mt-2">
                                            <div className="d-flex justify-content-between costbtc_total">
                                                <div className="d-flex align-items-center">
                                                    <h5>Cost <span>- BTC</span></h5>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <h5>Cost <span>- BTC</span></h5>
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-between costbtc_total">
                                                <div className="d-flex align-items-center">
                                                    <h5>Max long <span> 0.1230 BTC</span></h5>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <h5>Max short <span> 0.0845 BTC</span></h5>
                                                </div>
                                            </div>
                                        </div>
                                    </form>

                                </div>
                                <div className="tab-pane fade" id="market" role="tabpanel">
                                    <form className="price_info">
                                        <div className="price_inputbl">
                                            <label>Price</label>
                                            <div className="price_select_option">
                                                <input className="inputtype" type="text" placeholder="29197" />
                                                <select>
                                                    <option>USDT</option>
                                                    <option>BTC</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <label>Amount <span className="btctoggle">(BTC) <img
                                                src="/images/futures_img/arrowright_dotted.svg" /></span></label>
                                            <div className="price_select_option">
                                                <input className="inputtype" type="text" placeholder="0.000" />
                                                <select>
                                                    <option>BTC</option>
                                                    <option>USDT</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <ul>
                                                <li>0%</li>
                                                <li>25%</li>
                                                <li>50%</li>
                                                <li>75%</li>
                                                <li>100%</li>
                                            </ul>
                                        </div>
                                        <div className="price_inputbl">
                                            <div className="avail_total_usd">
                                                <label>Avail.</label>
                                                <div className="usd_price">0 USDT <img src="/images/futures_img/usd_icon_refersh.svg" /></div>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <div className="tpsl_reduce d-flex gap-3 align-items-center">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" id="tp-sl" />
                                                    <label className="form-check-label" for="tp-sl">TP/SL</label>
                                                </div>
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" id="reduce-only" />
                                                    <label className="form-check-label" for="reduce-only">Reduce only</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <div className="buysell_btn d-flex gap-2 align-items-center">
                                                <button className="buybtn">Buy/Long</button>
                                                <button className="sellbtn">Sell/Short</button>
                                            </div>
                                        </div>
                                        {/* <!-- <div className="price_inputbl  mt-2">
                                            <div className="d-flex justify-content-between costbtc_total">
                                                <div className="d-flex align-items-center">
                                                    <h5>Cost <span>- BTC</span></h5>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <h5>Cost <span>- BTC</span></h5>
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-between costbtc_total">
                                                <div className="d-flex align-items-center">
                                                    <h5>Max long <span> 0.1230 BTC</span></h5>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <h5>Max short <span> 0.0845 BTC</span></h5>
                                                </div>
                                            </div>
                                        </div> --> */}
                                    </form>

                                </div>
                                <div className="tab-pane fade" id="stop-market" role="tabpanel">

                                    <form className="price_info">
                                        <div className="price_inputbl">
                                            <label>Price</label>
                                            <div className="price_select_option">
                                                <input className="inputtype" type="text" placeholder="29197" />
                                                <select>
                                                    <option>USDT</option>
                                                    <option>BTC</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <label>Price 2</label>
                                            <div className="price_select_option">
                                                <input className="inputtype" type="text" placeholder="29197" />
                                                <select>
                                                    <option>USDT</option>
                                                    <option>BTC</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <label>Amount <span className="btctoggle">(BTC) <img
                                                src="/images/futures_img/arrowright_dotted.svg" /></span></label>
                                            <div className="price_select_option">
                                                <input className="inputtype" type="text" placeholder="0.000" />
                                                <select>
                                                    <option>BTC</option>
                                                    <option>USDT</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <ul>
                                                <li>0%</li>
                                                <li>25%</li>
                                                <li>50%</li>
                                                <li>75%</li>
                                                <li>100%</li>
                                            </ul>
                                        </div>
                                        <div className="price_inputbl">
                                            <div className="avail_total_usd">
                                                <label>Avail.</label>
                                                <div className="usd_price">0 USDT <img src="/images/futures_img/usd_icon_refersh.svg" /></div>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <div className="tpsl_reduce d-flex gap-3 align-items-center">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" id="tp-sl" />
                                                    <label className="form-check-label" for="tp-sl">TP/SL</label>
                                                </div>
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" id="reduce-only" />
                                                    <label className="form-check-label" for="reduce-only">Reduce only</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <div className="buysell_btn d-flex gap-2 align-items-center">
                                                <button className="buybtn">Buy/Long</button>
                                                <button className="sellbtn">Sell/Short</button>
                                            </div>
                                        </div>
                                        <div className="price_inputbl  mt-2">
                                            <div className="d-flex justify-content-between costbtc_total">
                                                <div className="d-flex align-items-center">
                                                    <h5>Cost <span>- BTC</span></h5>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <h5>Cost <span>- BTC</span></h5>
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-between costbtc_total">
                                                <div className="d-flex align-items-center">
                                                    <h5>Max long <span> 0.1230 BTC</span></h5>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <h5>Max short <span> 0.0845 BTC</span></h5>
                                                </div>
                                            </div>
                                        </div>
                                    </form>

                                </div>
                                <div className="tab-pane fade" id="post-only" role="tabpanel">

                                    <form className="price_info">
                                        <div className="price_inputbl">
                                            <label>Price</label>
                                            <div className="price_select_option">
                                                <input className="inputtype" type="text" placeholder="29197" />
                                                <select>
                                                    <option>USDT</option>
                                                    <option>BTC</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <label>Price 2</label>
                                            <div className="price_select_option">
                                                <input className="inputtype" type="text" placeholder="29197" />
                                                <select>
                                                    <option>USDT</option>
                                                    <option>BTC</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <label>Amount <span className="btctoggle">(BTC) <img
                                                src="/images/futures_img/arrowright_dotted.svg" /></span></label>
                                            <div className="price_select_option">
                                                <input className="inputtype" type="text" placeholder="0.000" />
                                                <select>
                                                    <option>BTC</option>
                                                    <option>USDT</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <ul>
                                                <li>0%</li>
                                                <li>25%</li>
                                                <li>50%</li>
                                                <li>75%</li>
                                                <li>100%</li>
                                            </ul>
                                        </div>
                                        <div className="price_inputbl">
                                            <div className="avail_total_usd">
                                                <label>Avail.</label>
                                                <div className="usd_price">0 USDT <img src="/images/futures_img/usd_icon_refersh.svg" /></div>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <div className="tpsl_reduce d-flex gap-3 align-items-center">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" id="tp-sl" />
                                                    <label className="form-check-label" for="tp-sl">TP/SL</label>
                                                </div>
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" id="reduce-only" />
                                                    <label className="form-check-label" for="reduce-only">Reduce only</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <div className="buysell_btn d-flex gap-2 align-items-center">
                                                <button className="buybtn">Buy/Long</button>
                                                <button className="sellbtn">Sell/Short</button>
                                            </div>
                                        </div>
                                        <div className="price_inputbl  mt-2">
                                            <div className="d-flex justify-content-between costbtc_total">
                                                <div className="d-flex align-items-center">
                                                    <h5>Cost <span>- BTC</span></h5>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <h5>Cost <span>- BTC</span></h5>
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-between costbtc_total">
                                                <div className="d-flex align-items-center">
                                                    <h5>Max long <span> 0.1230 BTC</span></h5>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <h5>Max short <span> 0.0845 BTC</span></h5>
                                                </div>
                                            </div>
                                        </div>
                                    </form>

                                </div>
                                <div className="tab-pane fade" id="twap" role="tabpanel">
                                    <form className="price_info">
                                        <div className="price_inputbl">
                                            <label>Price</label>
                                            <div className="price_select_option">
                                                <input className="inputtype" type="text" placeholder="29197" />
                                                <select>
                                                    <option>USDT</option>
                                                    <option>BTC</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <label>Price 2</label>
                                            <div className="price_select_option">
                                                <input className="inputtype" type="text" placeholder="29197" />
                                                <select>
                                                    <option>USDT</option>
                                                    <option>BTC</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <label>Amount <span className="btctoggle">(BTC) <img
                                                src="/images/futures_img/arrowright_dotted.svg" /></span></label>
                                            <div className="price_select_option">
                                                <input className="inputtype" type="text" placeholder="0.000" />
                                                <select>
                                                    <option>BTC</option>
                                                    <option>USDT</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <ul>
                                                <li>0%</li>
                                                <li>25%</li>
                                                <li>50%</li>
                                                <li>75%</li>
                                                <li>100%</li>
                                            </ul>
                                        </div>
                                        <div className="price_inputbl">
                                            <div className="avail_total_usd">
                                                <label>Avail.</label>
                                                <div className="usd_price">0 USDT <img src="/images/futures_img/usd_icon_refersh.svg" /></div>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <div className="tpsl_reduce d-flex gap-3 align-items-center">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" id="tp-sl" />
                                                    <label className="form-check-label" for="tp-sl">TP/SL</label>
                                                </div>
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" id="reduce-only" />
                                                    <label className="form-check-label" for="reduce-only">Reduce only</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <div className="buysell_btn d-flex gap-2 align-items-center">
                                                <button className="buybtn">Buy/Long</button>
                                                <button className="sellbtn">Sell/Short</button>
                                            </div>
                                        </div>
                                        <div className="price_inputbl  mt-2">
                                            <div className="d-flex justify-content-between costbtc_total">
                                                <div className="d-flex align-items-center">
                                                    <h5>Cost <span>- BTC</span></h5>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <h5>Cost <span>- BTC</span></h5>
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-between costbtc_total">
                                                <div className="d-flex align-items-center">
                                                    <h5>Max long <span> 0.1230 BTC</span></h5>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <h5>Max short <span> 0.0845 BTC</span></h5>
                                                </div>
                                            </div>
                                        </div>
                                    </form>

                                </div>
                                <div className="tab-pane fade" id="scaled-order" role="tabpanel">
                                    <form className="price_info">
                                        <div className="price_inputbl">
                                            <label>Price</label>
                                            <div className="price_select_option">
                                                <input className="inputtype" type="text" placeholder="29197" />
                                                <select>
                                                    <option>USDT</option>
                                                    <option>BTC</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <label>Price 2</label>
                                            <div className="price_select_option">
                                                <input className="inputtype" type="text" placeholder="29197" />
                                                <select>
                                                    <option>USDT</option>
                                                    <option>BTC</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <label>Amount <span className="btctoggle">(BTC) <img
                                                src="/images/futures_img/arrowright_dotted.svg" /></span></label>
                                            <div className="price_select_option">
                                                <input className="inputtype" type="text" placeholder="0.000" />
                                                <select>
                                                    <option>BTC</option>
                                                    <option>USDT</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <ul>
                                                <li>0%</li>
                                                <li>25%</li>
                                                <li>50%</li>
                                                <li>75%</li>
                                                <li>100%</li>
                                            </ul>
                                        </div>
                                        <div className="price_inputbl">
                                            <div className="avail_total_usd">
                                                <label>Avail.</label>
                                                <div className="usd_price">0 USDT <img src="/images/futures_img/usd_icon_refersh.svg" /></div>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <div className="tpsl_reduce d-flex gap-3 align-items-center">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" id="tp-sl" />
                                                    <label className="form-check-label" for="tp-sl">TP/SL</label>
                                                </div>
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" id="reduce-only" />
                                                    <label className="form-check-label" for="reduce-only">Reduce only</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <div className="buysell_btn d-flex gap-2 align-items-center">
                                                <button className="buybtn">Buy/Long</button>
                                                <button className="sellbtn">Sell/Short</button>
                                            </div>
                                        </div>
                                        <div className="price_inputbl  mt-2">
                                            <div className="d-flex justify-content-between costbtc_total">
                                                <div className="d-flex align-items-center">
                                                    <h5>Cost <span>- BTC</span></h5>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <h5>Cost <span>- BTC</span></h5>
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-between costbtc_total">
                                                <div className="d-flex align-items-center">
                                                    <h5>Max long <span> 0.1230 BTC</span></h5>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <h5>Max short <span> 0.0845 BTC</span></h5>
                                                </div>
                                            </div>
                                        </div>
                                    </form>

                                </div>
                                <div className="tab-pane fade" id="trailing-stop" role="tabpanel">
                                    <form className="price_info">
                                        <div className="price_inputbl">
                                            <label>Price</label>
                                            <div className="price_select_option">
                                                <input className="inputtype" type="text" placeholder="29197" />
                                                <select>
                                                    <option>USDT</option>
                                                    <option>BTC</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <label>Price 2</label>
                                            <div className="price_select_option">
                                                <input className="inputtype" type="text" placeholder="29197" />
                                                <select>
                                                    <option>USDT</option>
                                                    <option>BTC</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <label>Amount <span className="btctoggle">(BTC) <img
                                                src="/images/futures_img/arrowright_dotted.svg" /></span></label>
                                            <div className="price_select_option">
                                                <input className="inputtype" type="text" placeholder="0.000" />
                                                <select>
                                                    <option>BTC</option>
                                                    <option>USDT</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <ul>
                                                <li>0%</li>
                                                <li>25%</li>
                                                <li>50%</li>
                                                <li>75%</li>
                                                <li>100%</li>
                                            </ul>
                                        </div>
                                        <div className="price_inputbl">
                                            <div className="avail_total_usd">
                                                <label>Avail.</label>
                                                <div className="usd_price">0 USDT <img src="/images/futures_img/usd_icon_refersh.svg" /></div>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <div className="tpsl_reduce d-flex gap-3 align-items-center">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" id="tp-sl" />
                                                    <label className="form-check-label" for="tp-sl">TP/SL</label>
                                                </div>
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" id="reduce-only" />
                                                    <label className="form-check-label" for="reduce-only">Reduce only</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="price_inputbl">
                                            <div className="buysell_btn d-flex gap-2 align-items-center">
                                                <button className="buybtn">Buy/Long</button>
                                                <button className="sellbtn">Sell/Short</button>
                                            </div>
                                        </div>
                                        <div className="price_inputbl  mt-2">
                                            <div className="d-flex justify-content-between costbtc_total">
                                                <div className="d-flex align-items-center">
                                                    <h5>Cost <span>- BTC</span></h5>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <h5>Cost <span>- BTC</span></h5>
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-between costbtc_total">
                                                <div className="d-flex align-items-center">
                                                    <h5>Max long <span> 0.1230 BTC</span></h5>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <h5>Max short <span> 0.0845 BTC</span></h5>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="trade_account_summary_assets">
                    <div className="trade_summary_table_lft">
                        <ul className="nav nav-tabs" id="myTab2" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button className="nav-link active" id="positions-tab" data-bs-toggle="tab"
                                    data-bs-target="#positions" type="button" role="tab" aria-controls="positions"
                                    aria-selected="true">Positions(0)</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-link" id="open-tab" data-bs-toggle="tab" data-bs-target="#open" type="button"
                                    role="tab" aria-controls="open" aria-selected="false">Open Orders(0)</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-link" id="order_hist-tab" data-bs-toggle="tab" data-bs-target="#order_hist"
                                    type="button" role="tab" aria-controls="order_hist" aria-selected="false">Order
                                    History</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-link" id="history-tab" data-bs-toggle="tab" data-bs-target="#history"
                                    type="button" role="tab" aria-controls="history" aria-selected="false">Trade
                                    History</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-link" id="transaction-tab" data-bs-toggle="tab" data-bs-target="#transaction"
                                    type="button" role="tab" aria-controls="transaction" aria-selected="false">Transaction
                                    History</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-link" id="position_his-tab" data-bs-toggle="tab"
                                    data-bs-target="#position_his" type="button" role="tab" aria-controls="position_his"
                                    aria-selected="false">Position History</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-link" id="bots-tab" data-bs-toggle="tab" data-bs-target="#bots" type="button"
                                    role="tab" aria-controls="bots" aria-selected="false">Bots</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-link" id="assets-tab" data-bs-toggle="tab" data-bs-target="#assets"
                                    type="button" role="tab" aria-controls="assets" aria-selected="false">Assets</button>
                            </li>
                        </ul>
                        <div className="tab-content pt-1" id="myTabContent2">
                            <div className="tab-pane fade show active" id="positions" role="tabpanel">
                                <h4>Open Futures Account to trade</h4>
                            </div>
                            <div className="tab-pane fade" id="open" role="tabpanel">
                                <h4>Open Futures Account to trade</h4>
                            </div>
                            <div className="tab-pane fade" id="order_hist" role="tabpanel">
                                <h4>Open Futures Account to trade</h4>
                            </div>
                            <div className="tab-pane fade" id="history" role="tabpanel">
                                <h4>Open Futures Account to trade</h4>
                            </div>
                            <div className="tab-pane fade" id="transaction" role="tabpanel">
                                <h4>cvvcxvxcvxcvvx 5</h4>
                            </div>
                            <div className="tab-pane fade" id="position_his" role="tabpanel">
                                <h4>Open Futures Account to trade</h4>
                            </div>
                            <div className="tab-pane fade" id="bots" role="tabpanel">
                                <h4>Open Futures Account to trade</h4>
                            </div>
                            <div className="tab-pane fade" id="assets" role="tabpanel">
                                <h4>Open Futures Account to trade</h4>
                            </div>
                        </div>
                    </div>
                    <div className="assets_right">
                        <h2>Assets</h2>
                        <div className="asset_total_value costbtc_total">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h5>USDT-M</h5>
                                </div>
                                <div><span><img src="/images/futures_img/password_hide.svg" alt="hide" /></span></div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h6>Total Assets</h6>
                                </div>
                                <div><span>123,456,789.12 USDT</span></div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h6>Available</h6>
                                </div>
                                <div><span>123,456,789.12 USDT</span></div>
                            </div>
                            <hr />
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h5>USDT-M</h5>
                                </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h6>Margin</h6>
                                </div>
                                <div><span>123,456,789.12 USDT</span></div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h6>Debt Rate</h6>
                                </div>
                                <div><span className="green"><img src="/images/futures_img/range_low_icon.svg" /> 12% Low Risk</span></div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h6>Unrealized PNL</h6>
                                </div>
                                <div><span className="danger">-89.12 USDT</span></div>
                            </div>


                            <div className="d-flex align-items-center justify-content-between buy_transferbtn">
                                <button>Buy Crypto</button>
                                <button>Transfer</button>
                            </div>



                        </div>

                    </div>

                </div>

                {showPopup && (
                    <div style={styles.overlay}>
                        <div className="popup_modal" style={styles.popup}>
                            <img src="/images/Futures_cs.svg" alt="Coming Soon" style={styles.image} />
                        </div>

                    </div>
                )}
            </div>


        </>
    )
}

export default CoinFutures