import React, { useContext, useEffect, useState, useRef } from "react";
import AuthService from "../../../api/services/AuthService";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import { Helmet } from "react-helmet-async";
import { deployedUrl } from "../../../api/apiConfig/apiConfig";
import { alertErrorMessage } from "../../../customComponents/CustomAlertMessage";
import { Link } from "react-router-dom";
import { ProfileContext } from "../../../context/ProfileProvider";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./ReferalPage.css";

const ReferalPage = () => {
  const [refferlsData, setRefferalData] = useState({ user_code: "" });
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const token = sessionStorage.getItem("token");
  const slider3DRef = useRef(null);
  const eventsSliderRef = useRef(null);
  const [current3DSlide, setCurrent3DSlide] = useState(0);

  const handleReffrals = async () => {
    LoaderHelper.loaderStatus(true);
    await AuthService.refferlsList().then(async (result) => {
      LoaderHelper.loaderStatus(false);
      if (result?.success) {
        setRefferalData(result?.data);
      }
    });
  };

  function copyToClipboard(copyText) {
    navigator.clipboard.writeText(`${deployedUrl}signup?reffcode=${copyText}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  function copyReferralLink() {
    const link = `${deployedUrl}signup?reffcode=${refferlsData?.user_code}`;
    navigator.clipboard.writeText(link);
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2000);
  }

  function handleShareFacebook() {
    const shareText = `Check out my code: ${refferlsData?.user_code}!`;
    const shareUrl = `https://Wrathcode.com/share?code=${encodeURIComponent(shareText)}`;
    const shareWindow = window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      '_blank'
    );
    if (!shareWindow) {
      alert('Please disable your popup blocker to share the page.');
    }
  }

  function handleShareWhatsApp() {
    const shareUrl = `https://Wrathcode.com/signup?reffcode=${refferlsData?.user_code}`;
    const message = encodeURIComponent(shareUrl);
    let shareLink;

    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      shareLink = `whatsapp://send?text=${message}`;
    } else {
      shareLink = `https://web.whatsapp.com/send?text=${message}`;
    }

    const shareWindow = window.open(shareLink, '_blank');
    if (!shareWindow) {
      alert('Please disable your popup blocker to share the page.');
    }
  }

  function handleShareTwitter() {
    const shareText = `Check out my code: ${refferlsData?.user_code}!`;
    const shareUrl = `https://Wrathcode.com/signup?reffcode=${refferlsData?.user_code}`;
    if (navigator.share) {
      navigator.share({
        title: document.title,
        text: shareText,
        url: shareUrl,
      });
    } else {
      const shareWindow = window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareText
        )}&url=${encodeURIComponent(shareUrl)}`,
        "_blank"
      );
      if (!shareWindow) {
        alert("Please disable your popup blocker to share the page.");
      }
    }
  }

  function handleShareTelegram() {
    const shareUrl = `https://Wrathcode.com/signup?reffcode=${refferlsData?.user_code}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`;
    window.open(telegramUrl, '_blank');
  }

  useEffect(() => {
    token && handleReffrals();
  }, []);

  const [refferalList, setRefferalList] = useState([]);

  useEffect(() => {
    token && handleReferalList();
  }, []);

  const handleReferalList = async () => {
    LoaderHelper.loaderStatus(true);
    await AuthService.getReferList().then(async (result) => {
      if (result?.success) {
        LoaderHelper.loaderStatus(false);
        setRefferalList(result?.data);
      } else {
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result?.message);
      }
    })
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredList, setFilteredList] = useState(refferalList || []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredList(refferalList);
    } else {
      const filtered = refferalList?.filter(item =>
        `${item.firstName} ${item.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.uuid?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredList(filtered);
    }
  }, [searchTerm, refferalList]);

  // 3D Slider Settings
  const settings3D = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    beforeChange: (current, next) => setCurrent3DSlide(next),
  };

  // Normal Events Slider Settings
  const eventsSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    prevArrow: <button className="slick-prev-custom"><i className="ri-arrow-left-s-line"></i></button>,
    nextArrow: <button className="slick-next-custom"><i className="ri-arrow-right-s-line"></i></button>,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  // 3D Feature Cards Data
  const featureCards = [
    {
      title: "High Commissions",
      icon: "ri-calculator-line",
    },
    {
      title: "Special Events",
      icon: "ri-gift-line",
    },
    {
      title: "Gift Privilege",
      icon: "ri-stack-line",
    }
  ];

  // Events Data
  const referralEvents = [
    {
      title: "Earn 60 USDT !",
      subtitle: "Invite Friends to Join Exchange",
      image: "/images/referral_event1.jpg"
    },
    {
      title: "Invite to Earn 500 USDT",
      subtitle: "Win rewards with friends",
      image: "/images/referral_event2.jpg"
    },
    {
      title: "Earn 100 USDT !",
      subtitle: "Refer 5 friends and get bonus",
      image: "/images/referral_event3.jpg"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Earn with Friends – Wrathcode Refer & Earn</title>
        <meta
          name="description"
          content="Turn your network into crypto earnings. Refer users to Wrathcode, and unlock trading credits and rewards when they complete KYC and deposit."
        />
        <meta
          name="keywords"
          content="crypto earn with friends, refer crypto Exchange, Wrathcode referral, invite earn crypto"
        />
      </Helmet>

      <div className="referral-page-wrapper">
        {/* Exciting Referral Reward Section */}
        <section className="referral-hero-section">
          <div className="container">
            <div className="referral-hero-content">
              <div className="referral-hero-left">
                <h1 className="referral-main-title">Exciting Referral Reward</h1>
                <h2 className="referral-subtitle">Earn 1 USDT for every friend you invite!</h2>
                <p className="referral-description">
                  Invite a friend to Exchange and Earn 0.5 USDT on Referral Sign Up and 0.5 USDT after completing their KYC.
                </p>
                
                <div className="referral-input-group">
                  <div className="referral-input-field">
                    <label>Referral link:</label>
                    <div className="referral-input-wrapper">
                      <input 
                        type="text" 
                        value={token ? `${deployedUrl}signup?reffcode=${refferlsData?.user_code || ''}` : 'https://gatbits.com/refer_earn'} 
                        readOnly 
                        className="referral-input"
                      />
                      <button 
                        type="button" 
                        className="referral-copy-btn"
                        onClick={copyReferralLink}
                      >
                        <i className="ri-file-copy-line"></i>
                        {isLinkCopied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="referral-input-field">
                    <label>Referral Code:</label>
                    <div className="referral-input-wrapper">
                      <input 
                        type="text" 
                        value={token ? refferlsData?.user_code || '' : '123456789'} 
                        readOnly 
                        className="referral-input"
                      />
                      <button 
                        type="button" 
                        className="referral-copy-btn"
                        onClick={() => copyToClipboard(refferlsData?.user_code)}
                      >
                        <i className="ri-file-copy-line"></i>
                        {isCopied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>

                {token ? (
                  <button className="referral-signup-btn">Sign Up Now</button>
                ) : (
                  <Link to="/login" className="referral-signup-btn">Sign Up Now</Link>
                )}
              </div>

              <div className="referral-hero-right">
                <div className="referral-3d-slider-wrapper">
                  <div className="referral-3d-robot-container">
                    <div className="referral-3d-robot">
                      <div className="robot-eyes">
                        <span className="eye left-eye"></span>
                        <span className="eye right-eye"></span>
                      </div>
                    </div>
                    <p className="robot-label">Rising</p>
                  </div>
                  
                  <div className="referral-3d-slider">
                    <Slider ref={slider3DRef} {...settings3D}>
                      {featureCards.map((card, index) => (
                        <div key={index} className={`referral-3d-card ${index === current3DSlide ? 'active' : ''}`}>
                          <div className="referral-3d-card-inner">
                            <i className={card.icon}></i>
                            <h3>{card.title}</h3>
                          </div>
                        </div>
                      ))}
                    </Slider>
                    
                    <button 
                      className="referral-3d-nav prev" 
                      onClick={() => slider3DRef.current?.slickPrev()}
                    >
                      <i className="ri-arrow-left-s-line"></i>
                    </button>
                    <button 
                      className="referral-3d-nav next" 
                      onClick={() => slider3DRef.current?.slickNext()}
                    >
                      <i className="ri-arrow-right-s-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Refer and Earn Rewards Section */}
        <section className="referral-how-section">
          <div className="container">
            <h2 className="referral-section-title">How to Refer and Earn Rewards</h2>
            <div className="referral-steps-grid">
              <div className="referral-step-card">
                <div className="referral-step-icon">
                  <i className="ri-user-add-line"></i>
                </div>
                <h3>Invite Friends to Sign Up</h3>
                <p>Invite your friends to sign up for an Exchange account.</p>
              </div>
              
              <div className="referral-step-card">
                <div className="referral-step-icon">
                  <i className="ri-links-line"></i>
                </div>
                <h3>Automatic Linking</h3>
                <p>Once your friends sign-up, their accounts will be automatically linked to you.</p>
              </div>
              
              <div className="referral-step-card">
                <div className="referral-step-icon">
                  <i className="ri-exchange-dollar-line"></i>
                </div>
                <h3>Friends Trade, You Earn Rewards</h3>
                <p>When your referees start trading, you will automatically receive commission rewards.</p>
              </div>
            </div>
            <div className="referral-event-details">
              <button className="referral-event-details-btn">Event Details</button>
            </div>
          </div>
        </section>

        {/* More Referral Events Section */}
        <section className="referral-events-section">
          <div className="container">
            <h2 className="referral-section-title">More Referral Events</h2>
            <div className="referral-events-slider-wrapper">
              <Slider ref={eventsSliderRef} {...eventsSliderSettings}>
                {referralEvents.map((event, index) => (
                  <div key={index} className="referral-event-card">
                    <div className="referral-event-card-content">
                      <h3>{event.title}</h3>
                      <p>{event.subtitle}</p>
                      <button className="referral-event-join-btn">Join Now</button>
                    </div>
                    <div className="referral-event-card-image">
                      <img src={event.image || "/images/referral_event_placeholder.jpg"} alt={event.title} />
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        </section>

        {/* Recent Transactions Section */}
        <section className="referral-recent-transactions">
          <div className="container">
            <div className="referral-transactions-header">
              <h2 className="referral-section-title-left">Recent Transactions</h2>
              <div className="referral-search-wrapper">
                <i className="ri-search-line"></i>
                <input
                  type="search"
                  placeholder="Search by name or UUID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="referral-search-input"
                />
              </div>
            </div>
            
            <div className="referral-table-wrapper">
              {filteredList?.length > 0 ? (
                <table className="referral-transactions-table">
                  <thead>
                    <tr>
                      <th>S. No.</th>
                      <th>Date</th>
                      <th>Swapping Currencies</th>
                      <th>Pay Amount</th>
                      <th>Get Amount</th>
                      <th>Swapping Fee</th>
                      <th>Conversion Rate</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList?.map((item, index) => (
                      <tr key={item?._id}>
                        <td>{index + 1}</td>
                        <td>{new Date(item?.createdAt).toLocaleDateString()}</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>
                          <span className={`referral-status ${item?.kycVerified === 2 ? 'verified' : 'not-verified'}`}>
                            {item?.kycVerified === 2 ? "Verified" : "Not Verified"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className='referral-no-data'>
                  <img src="/images/no_data_vector.svg" className="img-fluid" alt="no-found" />
                  <p>No referrals found.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ReferalPage;
