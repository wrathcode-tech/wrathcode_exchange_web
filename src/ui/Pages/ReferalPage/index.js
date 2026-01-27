import React, { useContext, useEffect, useState, useRef } from "react";
import AuthService from "../../../api/services/AuthService";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import { Helmet } from "react-helmet-async";
import { deployedUrl } from "../../../api/apiConfig/apiConfig";
import { alertErrorMessage } from "../../../customComponents/CustomAlertMessage";
import { Link } from "react-router-dom";
import { ProfileContext } from "../../../context/ProfileProvider";

const ReferalPage = () => {


  const [refferlsData, setRefferalData] = useState({ user_code: "" });
  const [isCopied, setIsCopied] = useState(false);
  const token = localStorage.getItem("token")

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
  console.log("🚀 ~ ReferalPage ~ refferalList:", refferalList)


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
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderContainerRef = useRef(null);
  const [slideOffset, setSlideOffset] = useState(0);

  const referralEvents = [
    {
      title: "Earn 60 USDT！",
      description: "Invite Friends to Join Exchange",
      image: "/images/earngift_vector.png"
    },
    {
      title: "Invite to Earn 500 USDT",
      description: "Win rewards with friends",
      image: "/images/usdtearn_vector.png"
    },
    {
      title: "Earn 60 USDT！",
      description: "Invite Friends to Join Exchange",
      image: "/images/earngift_vector.png"
    }
  ];

  const totalSlides = Math.ceil(referralEvents.length / 2);

  useEffect(() => {
    const calculateSlideOffset = () => {
      if (sliderContainerRef.current) {
        const containerWidth = sliderContainerRef.current.offsetWidth;
        // Card width is (100% - 24px) / 2, gap is 24px
        // Slide distance = card width + gap = (containerWidth - 24) / 2 + 24
        const slideDistance = (containerWidth - 24) / 2 + 24;
        setSlideOffset((slideDistance / containerWidth) * 100);
      }
    };

    calculateSlideOffset();
    window.addEventListener('resize', calculateSlideOffset);
    return () => window.removeEventListener('resize', calculateSlideOffset);
  }, []);

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

   
      <div className="refrefer_earn_outer">

        <section className="pb-5 mt-3 ">
          <div className="container">
            <div className="card twofa_card">
              <div className="card-body" >
                <div className="row gx-5">
                  <div className="col-lg-6">
                    <div className="ref_col" >
                      {/* <div className="ref_cards mb-0" >
                    <p className="mb-0" >Total Referral Comission</p>
                    <h3 className="mb-0" >10,000 SHIB</h3>
                  </div> */}
                      <div className="card-header ref_header  ">
                        <h2 className="ref_title" >Exciting Referral Reward
                        </h2>
                        <h4>Earn 1 USDT for every friend you invite!</h4>
                        <h6>Invite a friend to Wrathcode and Earn 0.5 USDT on Referral Sign Up and 0.5 USDT after completing their KYC.</h6>
                      </div>
                      <div className="card-body_inner referral_code_s">
                        <div className="mt-0">
                        <ul>
                                    <li><div><i class="ri-link-m"></i> Referral link: </div><span>https://gatbits.com/refer_earn <a href="#" onClick={() => copyToClipboard('https://gatbits.com/refer_earn')}><i class="ri-checkbox-multiple-blank-line"></i></a></span></li>
                                    <li><div><i class="ri-user-line"></i>Referral code: </div><span>https://gatbits.com/refer_earn <a href="#" onClick={() => copyToClipboard('https://gatbits.com/refer_earn')}><i class="ri-checkbox-multiple-blank-line"></i></a></span></li>
                                  </ul>
                          {/* <div className="referrals__title">Invite friends & Earn <span className="text-gradient text-underline" >5000</span> SHIBA INU Free  </div> */}
                              <div className="field">
                                {token ?
                                  <>
                                  
                                    {/* <div className="field__label">Referral code</div> */}
                                    <div className="field__wrap  field-otp-box">

                                      <input className="field__input form-control" type="text" name="referral-code" defaultValue={refferlsData?.user_code} readOnly />
                                      <button type="button" className="btn btn-xs custom-btn" onClick={() => copyToClipboard(refferlsData?.user_code)}><span> {isCopied ? 'Copied!' : 'Copy'} </span></button>

                                    </div></>
                                  : <div className="trade_btn mt-0">
                                    <button><Link to={`/login`}>Login now <span> <img src="images/trade_arrow.svg" alt="trade arrow" /></span></Link></button></div>}
                              </div>
                          {/* <label>
                            <small>OR share via</small></label>
                          <div className="d-flex  joc_social_row mt-2">
                            <span className="joc_social cursor-pointer" title="Facebook" onClick={handleShareFacebook}>
                              <i className="ri-instagram-line"></i>
                            </span>
                            <span className="joc_social cursor-pointer" title="Facebook" onClick={handleShareFacebook}>
                              <i className="ri-facebook-line  ri-xl"></i>
                            </span>
                            <span className="joc_social cursor-pointer" title="Whatsapp" onClick={handleShareWhatsApp}>
                              <i className="ri-youtube-line"></i>
                            </span>
                            <span className="joc_social cursor-pointer" title="Twitter" onClick={handleShareTwitter}>
                              <i className="ri-twitter-line  ri-xl"></i>
                            </span>
                            <span className="joc_social cursor-pointer" title="Instagram" onClick={handleShareTelegram}>
                              <i className="ri-telegram-fill  ri-xl"></i>
                            </span>
                          </div> */}
                        </div>
                      </div>


                    </div>

                    
                  </div>
                  <div className="col-lg-6">
                {/* <div className="ref_img p-3" >
                  <img src="/images/referal.svg" className="img-fluid" alt="" />
                </div> */}
                <div className="refrefer_earn_vector">
                  <div className="slider_img">
                    <img src="/images/risingslider.png" className="img-fluid" alt="" />
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
          </section>

        </div>

<div className="how_to_refer_s">
  <div className="container">
    <h2>How to Refer and Earn Rewards</h2>

<ul>
  <li>
  <img src="/images/invite_icon.svg" className="img-fluid" alt="invite" />
    <h6>Invite Friends to Sign Up</h6>
    <p>Send your referral code and invite friends
    to sign up for a Exchange account</p>
  </li>
  <li>
  <img src="/images/invite_link.svg" className="img-fluid" alt="invite" />
    <h6>Automatic Linking</h6>
    <p>Once your referees complete sign-up,
their accounts will be automatically linked
to you</p>
  </li>
  <li>
  <img src="/images/rewards_icon.svg" className="img-fluid" alt="invite" />
    <h6>Friends Trade, You Earn
    Rewards</h6>
    <p>When your referees start trading, you will
automatically receive commission
rewards</p>
  </li>
</ul>

  </div>
</div>


<div className="how_to_refer_s">
  <div className="container">
    <h2>More Referral Events</h2>

    <div className="referral_events_slider_wrapper">
      <div className="referral_events_slider_container" ref={sliderContainerRef}>
        <div 
          className="referral_events_slider" 
          style={{ transform: `translateX(-${currentSlide * slideOffset}%)` }}
        >
          {referralEvents.map((event, index) => (
            <div key={index} className="referral_event_item">
              <div className="referral_event_item_content">
                <h6>{event.title}</h6>
                <p>{event.description}</p>
                <button className="btn btn-primary">Join Now</button>
              </div>
              <div className="referral_event_item_image">
                <img src={event.image} className="img-fluid" alt="referral_event" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="referral_events_pagination">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            className={`referral_events_dot ${currentSlide === index ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>

  </div>
</div>


      <div className="referral_recent_s">
        <div className="container">
          <div className="dashboard_recent_s">
            <div className="user_list_top">
              <div className="user_list_l earning_section_cate ">
                <h4>Referral History </h4>
              </div>
              {/* <div className="user_search">
                <form>
                  <input className='search' type="text" placeholder="Currency" />
                  <button className='searchbtn'>Search</button>
                </form>
              </div> */}
              <div className="user_search">
                <form className='searchinput' onSubmit={(e) => e.preventDefault()}>
                  <button type="submit"><i className="ri-search-line"></i></button>
                  <input
                    type="search"
                    placeholder="Search by name or UUID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </form>
              </div>
            </div>
            <div className="table-responsive">
              {filteredList?.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Full Name</th>
                      <th>UUID</th>
                      <th>KYC Status</th>
                      <th>Join Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList?.map((item, index) => (
                      <tr key={item?._id}>
                        <td>{index + 1}</td>
                        <td>{item?.firstName} {item?.lastName}</td>
                        <td>{item?.uuid}</td>
                        <td>{item?.kycVerified === 2 ? "Verified" : "Not Verified"}</td>
                        <td>{new Date(item?.createdAt).toLocaleDateString()}</td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className='no_data'>
                  <img src="/images/no_data_vector.svg" className="img-fluid" alt="no-found" />
             
                </div>
              )}

            </div>


          </div>

        </div>
      </div>

    </>
  );
};

export default ReferalPage;
