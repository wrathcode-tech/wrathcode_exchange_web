import React, { useEffect, useState, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../../api/services/AuthService";
import { ApiConfig } from "../../api/apiConfig/apiConfig";
import { ProfileContext } from "../../context/ProfileProvider";

const UserHeader = () => {
  const { themeUpdated, setThemeUpdated } = useContext(ProfileContext)

  const [searchPair, setSearchPair] = useState("");
  const [pairs, setPairs] = useState([]);
  const [allData, setAllData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const getPairs = async () => {
    const result = await AuthService.getPairs();
    if (result?.success) {
      setPairs(result?.data);
      setAllData(result?.data);
    }
  };



  useEffect(() => {
    getPairs();
  }, []);

  useEffect(() => {
    if (searchPair) {
      const filteredPair = allData?.filter((item) =>
        item?.base_currency?.toLowerCase()?.includes(searchPair?.toLowerCase())
      );
      setPairs(filteredPair);
    } else {
      setPairs(allData);
    }
  }, [searchPair]);

  // 👇 outside click closes dropdown and mobile nav
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const toggleNavbar = () => setIsOpen(!isOpen);
  const toggleDropdown = (key) =>
    setOpenDropdown(openDropdown === key ? null : key);

  const nextPage = (data) => {
    sessionStorage.setItem("RecentPair", JSON.stringify(data));
    navigate(`/trade/${data?.base_currency}_${data?.quote_currency}`);
    window.location.reload();
  };

  const loginPage = () => navigate(`/login`);
  const signupPage = () => navigate(`/signup`);

  return (
    <header className="sticky-top">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-2 logo_s">
            <div className="logo">
              <Link to="/">
                <img className='lightlogo' src="/images/logo_light.svg" alt="logo" />
              </Link>
            </div>
          </div>

          <div className="col-lg-7 navigation_s">
            <div className="navigation" ref={dropdownRef}>
              <nav className="navbar navbar-expand-lg">
                <button className="navbar-toggler" type="button" onClick={toggleNavbar}>
                  <span className="navbar-toggler-icon">
                    <img src="/images/toggle_icon.svg" alt="toggle" />
                  </span>
                </button>

                <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`} id="mainNavbar">
                  <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                      <Link className="nav-link" to="/" onClick={toggleNavbar}>
                        Home
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/market" onClick={toggleNavbar}>
                        Market
                      </Link>
                    </li>

                    <li className="nav-item dropdown">
                      <span
                        className="nav-link dropdown-toggle"
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleDropdown("trade")}
                      >
                        Trade
                      </span>
                      <ul className={`dropdown-menu ${openDropdown === "trade" ? "show" : ""}`}>
                        <li>
                          <a className="dropdown-item" href="/trade/Header" onClick={toggleNavbar}>
                            Spot Trading
                          </a>
                        </li>

                        {/* <li>
                            <a className="dropdown-item" href="/user_profile/arbitrage_bot" onClick={toggleNavbar}>
                              Arbitrage Trading Bot
                            </a>
                          </li> */}
                      </ul>
                    </li>

                    <li className="nav-item dropdown">
                      <span
                        className="nav-link dropdown-toggle"
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleDropdown("futures")}
                      >
                        Futures
                      </span>
                      <ul className={`dropdown-menu ${openDropdown === "futures" ? "show" : ""}`}>
                        <li>
                          <a className="dropdown-item" href="/usd_futures/header" onClick={toggleNavbar}>
                            USDⓈ-M Futures
                          </a>
                        </li>
                        {/* <li>
                          <a className="dropdown-item" href="/coin_futures" onClick={toggleNavbar}>
                            COIN-M Futures
                          </a>
                        </li> */}
                        {/* <li>
                          <Link className="dropdown-item" to="/OptionHome" onClick={toggleNavbar}>
                            Options Home
                          </Link>
                        </li> */}
                        <li>
                          <a className="dropdown-item" href="/options/contract" onClick={toggleNavbar}>
                            Classic Options
                          </a>
                        </li>
                      </ul>
                    </li>

  <li className="nav-item dropdown">
                      <span
                        className="nav-link dropdown-toggle"
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleDropdown("earning")}
                      >
                          Earning
                      </span>
                      <ul className={`dropdown-menu ${openDropdown === "earning" ? "show" : ""}`}>
                        <li>
                          <a className="dropdown-item" href="/earning" onClick={toggleNavbar}>
                             Earning
                          </a>
                        </li>

                        <li>
                            <a className="dropdown-item" href="/refer_earn" onClick={toggleNavbar}>
                               Refer & Earn
                            </a>
                          </li>
                      </ul>
                    </li>
                    
                    {/* <li className="nav-item">
                      <Link className="nav-link" to="/earning" onClick={toggleNavbar}>
                        Earning
                      </Link>
                    </li> */}

                    <li className="nav-item">
                      <Link className="nav-link" to="/user_profile/swap" onClick={toggleNavbar}>
                        Quick Swap
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/launchpad" onClick={toggleNavbar}>
                        Launchpad<i class="ri-rocket-fill" style={{color:"#f3bb2c"}}></i>
                      </Link>
                    </li>

                    {/* <li className="nav-item">
                      <Link className="nav-link" to="/refer_earn" onClick={toggleNavbar}>
                        Refer & Earn
                      </Link>
                    </li> */}

                    <li className="nav-item mememenu">
                      <Link className="nav-link" to="/meme" onClick={toggleNavbar}>
                        Meme+
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link" to="/blogs" onClick={toggleNavbar}>
                        Blogs & News
                      </Link>
                    </li>

                    {/* <li className="nav-item dropdown">
                      <span
                        className="nav-link dropdown-toggle"
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleDropdown("calculator")}
                      >
                        Calculator
                      </span>
                      <ul className={`dropdown-menu ${openDropdown === "calculator" ? "show" : ""}`}>
                        <li>
                          <a className="dropdown-item" href="/earning_calculator" onClick={toggleNavbar}>
                            Earning Calculator
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="/crypto_calculator" onClick={toggleNavbar}>
                            Crypto Calculator
                          </a>
                        </li>
                      </ul>
                    </li> */}
                  </ul>
                </div>
              </nav>
            </div>
          </div>

          <div className="col-lg-3">
            <div className="header_right">
              <div className="button_outer">
                <a className="search_icon" href="#" data-bs-toggle="modal" data-bs-target="#exampleModal">
                  <i className="ri-search-line"></i>
                </a>
                <button className="login_btn sign_btn" onClick={loginPage}>
                  <Link to="/login">Log In</Link>
                </button>
                <button className="login_btn" onClick={signupPage}>
                  <Link to="/signup">Sign Up</Link>
                </button>
                {/* <div className="themecolor_icon" onClick={() => (setThemeUpdated(!themeUpdated))}>
                  <i class="ri-moon-line dark-text"></i>
                  <i class="ri-sun-line light-text"></i>
                </div> */}
              </div>
            </div>
          </div>

          {/* Modal Search */}
          <div className="modal fade search_form" id="exampleModal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-body">
                  <form>
                    <input
                      type="search"
                      placeholder="Search here..."
                      value={searchPair}
                      onChange={(e) => setSearchPair(e.target.value)}
                    />
                  </form>
                  <div className="hot_trading_t">
                    <h3>Hot Trading Pairs</h3>
                    <div className="table-responsive">
                      <table>
                        <tbody>
                          {pairs?.map((item) => (
                            <tr key={item?._id}>
                              <td onClick={() => nextPage(item)}>
                                <div className="td_first">
                                  <div className="icon">
                                    <img
                                      src={ApiConfig?.baseImage + item?.icon_path}
                                      alt="icon"
                                      width="40px"
                                    />
                                  </div>
                                  <div className="price_heading">
                                    {item?.base_currency} / {item?.quote_currency}
                                    <br />
                                    <span>{item?.base_currency_fullname}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="right_t price_tb">
                                {item?.buy_price}
                                <span className={item?.change_percentage > 0 ? "green" : "red"}>
                                  {item?.change_percentage}%
                                </span>
                              </td>
                            </tr>
                          ))}
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
    </header>
  );
};

export default UserHeader;

