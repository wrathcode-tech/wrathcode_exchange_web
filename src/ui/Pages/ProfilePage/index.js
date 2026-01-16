import React, { useContext, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ProfileContext } from "../../../context/ProfileProvider";
import { Helmet } from "react-helmet-async";

const ProfilePage = (props) => {

  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    if (path.includes("/user_profile/dashboard")) setCurrentPage("Dashboard");
    else if (path.includes("asset_overview")) setCurrentPage("Overview");
    else if (path.includes("spot_orders")) setCurrentPage("Spot Order");
    else if (path.includes("transaction_history")) setCurrentPage("Transaction History");
    else if (path.includes("open_orders")) setCurrentPage("Open Order");
    else if (path.includes("swap_history")) setCurrentPage("Swap History");
    else if (path.includes("profile_setting")) setCurrentPage("Settings");
    else if (path.includes("kyc")) setCurrentPage("kyc");
    else if (path.includes("bank")) setCurrentPage("Bank Details");
    else if (path.includes("currency_preference")) setCurrentPage("Currency Preference");
    else if (path.includes("support")) setCurrentPage("Support");
    else if (path.includes("two_factor_autentication")) setCurrentPage("Two Factor Authentication");
    else if (path.includes("password_security")) setCurrentPage("Reset Password");
    else if (path.includes("arbitrage_bot") || path.includes("arbitrage_dashboard")) setCurrentPage("Arbitrage Bot");
    else if (path.includes("wallet_transfer_History")) setCurrentPage("Wallet Transfer History");
    else if (path.includes("swap")) setCurrentPage("Quick Swap");
    else if (path.includes("notification")) setCurrentPage("Notification");
    else if (path.includes("activity_logs")) setCurrentPage("Activity logs");
    else if (path.includes("earning_plan_history")) setCurrentPage("Earning Plan History");
    else if (path.includes("bonus_history")) setCurrentPage("Bonus History");
  }, [location.pathname]);


  const { currentPage, setCurrentPage } = useContext(ProfileContext)

  const [isActive, setIsActive] = useState(false);

  const navigate = useNavigate();

  const toggleContent = (page) => {
    setIsActive(!isActive);
    if (page) {

      setCurrentPage(page)
    }
  };

  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const logOut = () => {
    sessionStorage.clear();
    navigate("/");
    window.location.reload()
  }

  return (
    <>
      <Helmet>
        <title> Wrathcode | The world class new generation crypto asset exchange</title>
      </Helmet>
      <div className="mobile_view" id="toggleBtn" onClick={() => toggleContent()} >{currentPage}<span>
        <i className="ri-arrow-down-s-line"></i></span></div>


      <div className="dashboard">


        <div id="content" className={isActive ? "active flex-shrink-0 leftside_menu" : "flex-shrink-0 leftside_menu"} >

          <ul className="list-unstyled ps-0 navi_sidebar">
            <li onClick={() => toggleContent("Dashboard")} className={`${currentPage === "Dashboard" && "active"} mb-1`}>
              <Link to="dashboard">
                <img className='darkicon' src="/images/dasboard_home.svg" alt="home" />
                <img className='lighticon' src="/images/dasboard_home_light.svg" alt="home" /> <div className="dashboard_menu_hd"> Dashboard
                  {/* <p>View your balances, latest features, and market overview at a glance. </p> */}
                </div>

              </Link>
            </li>

            <li className="mb-1">
              <button
                className="btn btn-toggle collapsed"
                onClick={() => toggleSection("assets")}
              >
                <img className='darkicon' src="/images/dashboard_assets.svg" alt="assets" />
                <img className='lighticon' src="/images/dashboard_assets_light.svg" alt="assets" />
                <div className={`dashboard_menu_hd ${currentPage === "Overview" && "active_ul"}`}>
                  Assets
                  {/* <p>Manage your crypto holdings, track values, and monitor your asset portfolio.</p> */}
                </div>
                <span>
                  <i className="ri-arrow-down-s-line"></i>
                </span>
              </button>
              <div className={`collapse ${openSection === "assets" ? "show" : ""}`}>
                <ul className="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                  <li onClick={() => toggleContent("Overview")} className={`${(currentPage === "Overview") && "active"} `}>
                    <Link to="asset_overview" className="rounded">
                      Overview
                    </Link>
                  </li>
                </ul>
              </div>
            </li>

            <li className="mb-1">
              <button
                className="btn btn-toggle collapsed "
                onClick={() => toggleSection("orders")}
              >
                <img className='darkicon' src="/images/dashboard_order.svg" alt="orders" />
                <img className='lighticon' src="/images/dashboard_order_light.svg" alt="orders" />
                <div className={`dashboard_menu_hd ${(currentPage === "Spot Order" || currentPage === "Open Order" || currentPage === "Transaction History" || currentPage === "Swap History" || currentPage === "Earning Plan History") && "active_ul"}`}>
                  Orders
                  {/* <p>Check your transaction history and spot orders.</p> */}
                  </div>
                <span>
                  <i className="ri-arrow-down-s-line"></i>
                </span>
              </button>
              <div className={`collapse ${openSection === "orders" ? "show" : ""}`}>
                <ul className="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                  <li onClick={() => toggleContent("Spot Order")} className={`${(currentPage === "Spot Order") && "active"} `}>
                    <Link to="spot_orders" className="rounded">
                      Spot Order
                    </Link>
                  </li>
                  <li onClick={() => toggleContent("Open Order")} className={`${(currentPage === "Open Order") && "active"} `}>
                    <Link to="open_orders" className="rounded">
                      Open Order
                    </Link>
                  </li>
                  <li onClick={() => toggleContent("Transaction History")} className={`${(currentPage === "Transaction History") && "active"} `}>
                    <Link to="transaction_history" className="rounded">
                      Transaction History
                    </Link>
                  </li>

                  <li onClick={() => toggleContent("Swap History")} className={`${(currentPage === "Swap History") && "active"} `}>
                    <Link to="swap_history" className="rounded">
                      Swap History
                    </Link>
                  </li>

                  <li onClick={() => toggleContent("Wallet Transfer History")} className={`${(currentPage === "Wallet Transfer History") && "active"} `}>
                    <Link to="wallet_transfer_History" className="rounded">
                      Internal Wallet Transfer
                    </Link>
                  </li>
                  <li onClick={() => toggleContent("Earning Plan History")} className={`${(currentPage === "Earning Plan History") && "active"} `}>
                    <Link to="earning_plan_history" className="rounded">
                      Earning History
                    </Link>
                  </li>
                  <li onClick={() => toggleContent("Bonus History")} className={`${(currentPage === "Bonus History") && "active"} `}>
                    <Link to="bonus_history" className="rounded">
                      Bonus History
                    </Link>
                  </li>
                  {/* <li onClick={() => toggleContent("Launchpad Transactions")} className={`${(currentPage === "Launchpad Transactions") && "active"} `}>
                    <Link to="launchpad_transactions" className="rounded">
                      Launchpad Transactions
                    </Link>
                  </li> */}
                </ul>
              </div>
            </li>

            <li className="mb-1">
              <button
                className="btn btn-toggle collapsed"
                onClick={() => toggleSection("profile")}
              >
                <img className='darkicon' src="/images/dashboard_profile.svg" alt="profile" />
                <img className='lighticon' src="/images/dashboard_profile_light.svg" alt="profile" />
                <div className={`dashboard_menu_hd ${(currentPage === "Settings" || currentPage === "kyc" || currentPage === "Currency Preference" || currentPage === "Support") && "active_ul"}`}>
                  Profile
                  {/* <p>Update your personal info, manage account details and portofilio currency.</p> */}
                </div>
                <span>
                  <i className="ri-arrow-down-s-line"></i>
                </span>
              </button>
              <div className={`collapse ${openSection === "profile" ? "show" : ""}`}>
                <ul className="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                  <li onClick={() => toggleContent("Settings")} className={`${(currentPage === "Settings") && "active"} `}>
                    <Link to="profile_setting" className="rounded">
                      Settings
                    </Link>
                  </li>
                  {/* <li onClick={() => toggleContent("Verification")} className={`${(currentPage === "Verification") && "active"} `}>
                    <Link to="verification" className="rounded">
                      Verification
                    </Link>
                  </li> */}
                  <li onClick={() => toggleContent("kyc")}
                    className={`${(currentPage === "kyc") && "active"} `}>
                    <Link to="kyc" className="rounded">
                      Kyc Verification
                    </Link>
                  </li>
                  {/* <li onClick={() => toggleContent("Bank Details")} className={`${(currentPage === "Bank Details") && "active"} `}>
                    <Link to="bank" className="rounded">
                      Bank Details
                    </Link>
                  </li> */}
                  {/* <li onClick={() => toggleContent("Currency Preference")} className={`${(currentPage === "Currency Preference") && "active"} `}>
                    <Link to="currency_preference" className="rounded">
                      Currency Preference
                    </Link>
                  </li> */}
                  <li onClick={() => toggleContent("Support")} className={`${(currentPage === "Support") && "active"} `}>
                    <Link to="support" className="rounded">
                      Support
                    </Link>
                  </li>

                </ul>
              </div>
            </li>
            <li onClick={() => toggleContent("Earning")} className={`${currentPage === "Earning" && "active"} mb-1`}>
              <Link to="/earning">
                <img className='darkicon' src="/images/earning_icon3.svg" alt="Earning" width={26} />
                <div className="dashboard_menu_hd">
                  Earning
                  {/* <p>Monitor earnings from staking, referrals, and trading activities.</p> */}
                </div>
              </Link>
            </li>
            {/* <li onClick={() => toggleContent("giveaway")} className={`${currentPage === "giveaway" && "active"} mb-1`}>
              <Link to="giveaway">
                <img className='darkicon' src="/images/earning_icon3.svg" alt="giveaway" width={26} />
                <div className="dashboard_menu_hd">
                  Giveaways
                 
                </div>
              </Link>
            </li> */}

            {/* <li
              onClick={() => toggleContent("launchpadTransactions")}
              className={`${currentPage === "launchpadTransactions" && "active"} mb-1`}>
              <Link to="/launchpadTransactions">
                <img
                  className="darkicon"
                  src="/images/earning_icon3.svg"
                  alt="Earning"
                  width={26}
                />
                <div className="dashboard_menu_hd">
                  Launchpad Transactions
                  <p>Track all your token purchase and investment transactions in one place.</p>
                </div>
              </Link>
            </li> */}

            <li className="mb-1">
              <button
                className="btn btn-toggle collapsed"
                onClick={() => toggleSection("security")}
              >
                <img className='darkicon' src="/images/dashboard_security.svg" alt="security" />
                <img className='lighticon' src="/images/dashboard_security_light.svg" alt="security" />
                <div className={`dashboard_menu_hd ${(currentPage === "Two Factor Authentication" || currentPage === "Reset Password") && "active_ul"}`}>
                  Security
                  {/* <p>Manage two-factor authentication, passwords, and other security settings.</p> */}
                </div>
                <span>
                  <i className="ri-arrow-down-s-line"></i>
                </span>
              </button>
              <div className={`collapse ${openSection === "security" ? "show" : ""}`}>
                <ul className="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                  <li onClick={() => toggleContent("Two Factor Authentication")} className={`${(currentPage === "Two Factor Authentication") && "active"} `}>
                    <Link to="two_factor_autentication" className="rounded">
                      Two Factor Authentication
                    </Link>
                  </li>
                  {/* <li onClick={() => toggleContent("Reset Password")} className={`${(currentPage === "Reset Password") && "active"} `}>
                    <Link to="password_security" className="rounded">
                      Reset Password
                    </Link>
                  </li> */}
                </ul>
              </div>
            </li>
            {/* <li onClick={() => toggleContent("Arbitrage Bot")} className={`${currentPage === "Arbitrage Bot" && "active"} mb-1`}>
              <Link to="arbitrage_bot">
                <img className='darkicon' src="/images/dashboard_arbitrage.svg" alt="arbitrage" />
                <img className='lighticon' src="/images/dashboard_arbitrage_light.svg" alt="arbitrage bot" />
                <div className="dashboard_menu_hd">
                  Arbitrage BOT
                  <p>Enable automated trading to take advantage of price gaps across markets.</p>
                </div>

              </Link>
            </li> */}

            <li onClick={() => toggleContent("Quick Swap")} className={`${currentPage === "Quick Swap" && "active"} mb-1`}>
              <Link to="swap">
                <img className='darkicon' src="/images/quick-swap.svg" alt="quick swap" width={20} height={20} />
                <img className='lighticon' src="/images/dashboard_swap_light.svg" alt="quick swap" width={20} height={20} />
                <div className="dashboard_menu_hd">
                  Quick Swap

                  {/* <p>Instantly swap your cryptocurrencies with real-time conversion rates.</p> */}
                </div>

              </Link>
            </li>

            <li onClick={() => toggleContent("Notification")} className={`${currentPage === "Notification" && "active"} mb-1`}>
              <Link to="notification">
                <img className='darkicon' src="/images/dashboard_notification.svg" alt="notification" />
                <img className='lighticon' src="/images/dashboard_notification_light.svg" alt="security" />
                <div className="dashboard_menu_hd">
                  Notification
                  {/* <p>Stay updated with alerts, trade notifications, system updates, and news.</p> */}
                </div>
              </Link>
            </li>

            <li onClick={() => toggleContent("Activity logs")} className={`${currentPage === "Activity logs" && "active"} mb-1`}>
              <Link to="activity_logs">
                <img className='darkicon' src="/images/dashboard_logs.svg" alt="activity" />
                <img className='lighticon' src="/images/dashboard_activity_light.svg" alt="activity logs" />
                <div className="dashboard_menu_hd">
                  Activity logs

                  {/* <p>Review your login history, device access logs, and recent account activity.</p> */}
                </div>
              </Link>
            </li>
          </ul>
          <div className="logout_btn" onClick={logOut}>
            <Link to="#/">Logout<i className="ri-logout-circle-r-line"></i></Link>
          </div>
        </div>
        <Outlet />
      </div>
    </>
  )
}

export default ProfilePage
