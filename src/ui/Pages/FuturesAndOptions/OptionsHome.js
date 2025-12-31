import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './OptionHome.css';

// Reusable Market Summary Block
const MarketSummary = ({ title, data }) => (
  <div className="market_summary">
    <h4>{title}</h4>
    <div className="table-responsive">
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            {title.includes('24hr%') ? (
              <><th>24hr%</th><th>Last Price</th></>
            ) : title.includes('Volume') ? (
              <><th>Volume(USDT)</th><th>Last Price</th></>
            ) : (
              <><th>Open Interest (USDT)</th><th>Last Price</th></>
            )}
          </tr>
        </thead>
        <tbody>
          {Array(5).fill(null).map((_, i) => (
            <tr key={i}>
              <td>SOL-343443-232-C</td>
              {title.includes('24hr%') ? (
                <><td className="green">310.24%</td><td>1.5443</td></>
              ) : (
                <><td>876,310.24</td><td>0.1443</td></>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Slider Content for Each Tab
const MarketSlider = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    responsive: [
      {
        breakpoint: 1200,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 767,
        settings: { slidesToShow: 1, arrows: false }
      }
    ]
  };

  return (
    <Slider {...settings}>
      <MarketSummary title="Top Gainers" />
      <MarketSummary title="Top 5 24hr Trade Volume" />
      <MarketSummary title="Top 5 Open Interest" />
      <MarketSummary title="Top 5 24hr Trade Volume" />
      <MarketSummary title="Top 5 Open Interest" />
    </Slider>
  );
};

function OptionHome() {
  return (
    <>
      {/* Hero Section */}
      <div className="hero_section_option">
        <div className="container">
          <div className="row">
            <div className="col-sm-8">
              <div className="Options_cnt">
                <h1>Top Crypto<br /> Options Exchange</h1>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                <div className="options_btn">
                  <button>Hello <span>Rosaria Becher foVU!</span></button>
                  <button className="optionsbg">Open Options Account</button>
                </div>
                <ul>
                  <li><h4>24hr Trading Volume (USDT)<span>775,342,232.43</span></h4></li>
                  <li><h4>Open Interest (USDT)<span>5.775,342,232.43</span></h4></li>
                  <li><h4>Underlying Assets<span>6</span></h4></li>
                  <li><h4>No. of Contracts<span>200+</span></h4></li>
                </ul>
              </div>
              <div className="hero_img_mobile">
                <img src="/images/option_home_img/hero_img.svg" alt="hero img" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Highlights Section */}
      <div className="market_highlight_section">
        <div className="container">
          <h2 className="heading2">Market Highlights</h2>
          <div className="d-flex justify-content-between align-items-center mt-5">
            <div className="no_wrap_s">
              <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
                <li className="nav-item" role="presentation">
                  <button className="nav-link active" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="true">
                    <img src="/images/option_home_img/sol_currency_vector.svg" alt="sol" /> SOL<span>$167.353</span>
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button className="nav-link" id="pills-profile-tab" data-bs-toggle="pill" data-bs-target="#pills-profile" type="button" role="tab" aria-controls="pills-profile" aria-selected="false">
                    <img src="/images/option_home_img/sol_currency_vector.svg" alt="sol" /> BTC<span>$167.353</span>
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button className="nav-link" id="btc-profile-tab" data-bs-toggle="pill" data-bs-target="#btc-profile" type="button" role="tab" aria-controls="btc-profile" aria-selected="false">
                    <img src="/images/option_home_img/sol_currency_vector.svg" alt="sol" /> BTC<span>$167.353</span>
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button className="nav-link" id="btc-two-profile-tab" data-bs-toggle="pill" data-bs-target="#btc-two-profile" type="button" role="tab" aria-controls="btc-two-profile" aria-selected="false">
                    <img src="/images/option_home_img/sol_currency_vector.svg" alt="sol" /> BTC<span>$167.353</span>
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button className="nav-link" id="btc-three-profile-tab" data-bs-toggle="pill" data-bs-target="#btc-three-profile" type="button" role="tab" aria-controls="btc-three-profile" aria-selected="false">
                    <img src="/images/option_home_img/sol_currency_vector.svg" alt="sol" /> BTC<span>$167.353</span>
                  </button>
                </li>
              </ul>
            </div>
            <div className="tradenow_btn">
              <button>Trade Now</button>
            </div>
          </div>

          <div className="tab-content" id="pills-tabContent">
            <div className="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">
              <MarketSlider />
            </div>
            <div className="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
              <MarketSlider />
            </div>
            <div className="tab-pane fade" id="btc-profile" role="tabpanel" aria-labelledby="btc-profile-tab">
              <MarketSlider />
            </div>
            <div className="tab-pane fade" id="btc-two-profile" role="tabpanel" aria-labelledby="btc-two-profile-tab">
              <MarketSlider />
            </div>
            <div className="tab-pane fade" id="btc-three-profile" role="tabpanel" aria-labelledby="btc-three-profile-tab">
              <MarketSlider />
            </div>
          </div>
        </div>
      </div>

      {/* Rest of your sections — just fixing image paths and className */}
      <div className="option_highlight_section">
        <div className="container">
          <h2 className="heading2">Wrathcode Options Highlights</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <div className="row">
            {[
              { img: "options_market_vector.svg", alt: "Exchange", title: "Exchange" },
              { img: "options_market_vector2.svg", alt: "Super Fast KYC", title: "Super Fast KYC" },
              { img: "options_market_vector3.svg", alt: "High Performance", title: "High Performance" },
              { img: "options_market_vector4.png", alt: "Order Types", title: "Order Types" }
            ].map((item, i) => (
              <div className="col-sm-3" key={i}>
                <div className="software_trading_bl">
                  <div className="after_top_vector">
                    <img src="/images/option_home_img/highlight_hover.svg" alt="after" />
                  </div>
                  <img src={`/images/option_home_img/${item.img}`} alt={item.alt} />
                  <div className="software_trading_cnt">
                    <h6>{item.title}</h6>
                    <p>Empower your business to thrive with our tailored web design solutions.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="why_trade_option">
        <div className="container">
          <div className="row">
            <div className="col-sm-6">
              <div className="why_option_cnt">
                <h2 className="heading2">Why You Should Trade Wrathcode Options</h2>
                <p>Lorem ipsum dolor sit amet...</p>
                <div className="learn_btn">
                  <button>Learn <img src="/images/option_home_img/arrowbtn.svg" alt="learn more" /></button>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="why_trade_options">
                <img src="/images/option_home_img/why_trade_vector.svg" alt="why trade gatsbit" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Options vs Futures */}
      <div className="why_trade_option trade_strengths_bl">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <div className="why_option_cnt">
                <h2 className="heading2">Why Trade with Wrathcode Options<br />Strengths</h2>
                <ul className="nav nav-pills" id="pills-tab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button className="nav-link active" id="strengths-home-tab" data-bs-toggle="tab" data-bs-target="#strengths-home" type="button" role="tab" aria-controls="strengths-home" aria-selected="true">
                      Strengths
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="options-profile-tab" data-bs-toggle="tab" data-bs-target="#options-profile" type="button" role="tab" aria-controls="options-profile" aria-selected="false">
                      Options vs Futures
                    </button>
                  </li>
                </ul>
                <div className="tab-content" id="pills-tabContent">
                  <div className="tab-pane fade show active" id="strengths-home" role="tabpanel" aria-labelledby="strengths-home-tab">
                    <div className="row">
                      {[
                        { icon: "options_icon.svg", title: "Stablecoin Options" },
                        { icon: "options_icon2.svg", title: "Low Capital Requirement" },
                        { icon: "options_icon3.svg", title: "Competitive Fees" }
                      ].map((item, i) => (
                        <div className="col-sm-4" key={i}>
                          <div className="coin_options_bl">
                            <div className="coin_icon">
                              <img src={`/images/option_home_img/${item.icon}`} alt={item.title} />
                            </div>
                            <h3>{item.title}</h3>
                            <p>Gain access to a variety of digital assets...</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="tab-pane fade" id="options-profile" role="tabpanel" aria-labelledby="options-profile-tab">
                    <div className="futures_options_s">
                      <table>
                        <thead>
                          <tr>
                            <th></th>
                            <th>Wrathcode<h4>Futures</h4></th>
                            <th>Wrathcode<h4>Options</h4></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="first_tbl">Product Nature</td>
                            <td>Crypto Futures contracts involve the obligation...</td>
                            <td>Crypto Options provide traders with the right...</td>
                          </tr>
                          <tr>
                            <td className="first_tbl">Risk</td>
                            <td>Risk is high as open positions can be liquidated.</td>
                            <td>Options buyers risk is limited to the premium amount.</td>
                          </tr>
                          <tr>
                            <td className="first_tbl">Entry Cost</td>
                            <td>Cost-effective as only margin required...</td>
                            <td>Options contracts require premium payment.</td>
                          </tr>
                          <tr>
                            <td>Time Value</td>
                            <td>Futures contracts are resistant to time decay.</td>
                            <td>The time value of an Option will depreciate...</td>
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

      {/* Trade Anywhere */}
      <div className="why_trade_option trade_anywhere_s">
        <div className="container">
          <div className="row">
            <div className="col-sm-6">
              <div className="why_option_cnt">
                <h2 className="heading2">Trade. Anywhere.</h2>
                <p>Lorem ipsum dolor sit amet...</p>
                <div className="social_button">
                  {[
                    { img: "google_icon.svg", label: "Google Play", os: "GET IT ON" },
                    { img: "app_icon.svg", label: "App Store", os: "Download on the" },
                    { img: "app_icon.svg", label: "macOS", os: "Download for" },
                    { img: "window_icon.svg", label: "Windows", os: "Download for" },
                    { img: "linux_icon.svg", label: "Linux ded", os: "Download for" },
                    { img: "linux_icon.svg", label: "Linux rpm", os: "Download for" }
                  ].map((btn, i) => (
                    <div className="social_btn" key={i}>
                      <a href="#">
                        <img src={`/images/option_home_img/${btn.img}`} alt={btn.label} />
                        <div className="btn_cnt">
                          <span>{btn.os}</span>
                          {btn.label}
                        </div>
                        {i < 2 && (
                          <div className="qr_code">
                            <img src="/images/option_home_img/qur_code_icon.svg" alt="qrcode" />
                          </div>
                        )}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="why_trade_options">
                <img src="/images/option_home_img/trade_cta_vector.svg" alt="Trade. Anywhere" />
              </div>
            </div>
            <div className="col-sm-12 start_trading_options">
              <h2 className="heading2">Start Trading Crypto Options</h2>
              <div className="tradenow_btn">
                <button>Open Options Account</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OptionHome;