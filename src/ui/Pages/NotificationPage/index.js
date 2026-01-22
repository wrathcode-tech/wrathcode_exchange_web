import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import AuthService from "../../../api/services/AuthService";
import { alertErrorMessage, alertSuccessMessage } from "../../../customComponents/CustomAlertMessage";
import { Helmet } from "react-helmet-async";
import DashboardHeader from "../../../customComponents/DashboardHeader";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import { ProfileContext } from "../../../context/ProfileProvider";

const NotificationPage = (props) => {
  const { setRefreshNotification, refreshNotification } = useContext(ProfileContext)

  const [notifications, setNotifications] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);

  useEffect(() => {
    handleNotifications();
  }, [])


  const handleNotifications = async () => {
    const result = await AuthService.notifications()
    if (result.success) {
      try {
        setNotifications(result?.data);
        setUnseenCount(result?.counts?.unseen || 0)
      } catch (error) {
        alertErrorMessage(result?.message)
      }
    }
    else {
      alertErrorMessage(result.message)
    }
  }
  const handleMarkAll = async () => {
    const result = await AuthService.markasAllRead()
    if (result.success) {
      try {
        setRefreshNotification(!refreshNotification)
        alertSuccessMessage(result?.message)
        handleNotifications();
      } catch (error) {
        alertErrorMessage(result?.message)
      }
    }
    else {
      alertErrorMessage(result.message)
    }
  }

  const handleMarkRead = async (notificationId) => {
    LoaderHelper.loaderStatus(true);
    try {
      const result = await AuthService.markasRead(notificationId);
      LoaderHelper.loaderStatus(false);
      if (result?.success) {
        setRefreshNotification(!refreshNotification)
        handleNotifications();
        alertSuccessMessage("Notification marked as read")
      } else {
        alertErrorMessage("Something went wrong while fetching notifications.");
      }
    } catch (err) {
      LoaderHelper.loaderStatus(false);
      alertErrorMessage("Error loading notifications.");
    }
  };



  return (
    <>
      <Helmet>
        <title> Wrathcode Trade | The world class new generation crypto asset exchange</title>
      </Helmet>
      {/* <section className="">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 mx-auto">
            <div className="upload-formate mb-6 d-flex justify-content-center align-items-center">
                <div>
                    <h3 className="mb-1 text-center">
                         Notifications
                    </h3>
                    <p className="formate mb-0 text-center">
                        Your latest updates and notifications list.
                    </p>
                </div>
            </div>
              <div className="card twofa_card mt-4">
                <div className="card-body" >
                  <div className="card-body_inner" >
                    <div className="notifications__list">
                      {notifications?.length > 0 ? (
                        notifications?.map((value, index) => (
                          <div className="notifications__item" key={index}>
                            <div className="notifications__details">
                              <div className="notifications__line">
                                <div className="notifications__subtitle">{value?.title}</div>
                                <div className="notifications__date">
                                  {moment(value?.createdAt).format(
                                    "MMMM Do YYYY, h:mm:ss A"
                                  )}
                                </div>
                              </div>
                              <div className="notifications__content"> {value?.message}  </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-5 py-5 text-center" >
                          <p className="mb-0 text-center" >No Notifications Available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      <div className="dashboard_right">
        <DashboardHeader props={props} />
        <div className="dashboard_listing_section Overview_mid">
          <div className="kyc_approval_s activity_logs">
            <div className="cnt">
              <div className="row">

                <div className="col-sm-9">
                  <h3>Notifications</h3>
                  <p>Find your notifications setting and choose your settings</p>
                </div>
                {unseenCount > 0 &&
                  <div className="col-sm-3">
                    <button
                      onClick={handleMarkAll}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#f3bb2b",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      Mark all as read
                    </button>
                  </div>
                }
              </div>
              {notifications?.length > 0 ? (

                <div className="notification_table">
                  <h4>Today</h4>
                  <table>
                    <tbody>
                      {notifications.map((item) => (
                        <tr key={item._id}>
                          <td className={item?.isSeen == false ? "tb_background" : ""}>
                            <h4>{item?.title}</h4>

                            <div className="cnt_p"><p>{item?.message}</p>
                              {item?.isSeen === false && <a className="markbtn" href="#/" onClick={() => handleMarkRead(item._id)}>Mark as Read</a>}
                            </div>
                            <br />
                            <div className="cnt_p"><p>
                              {moment(item?.createdAt).fromNow()
                              }
                            </p>
                            </div>
                            {/* Show "Learn more" only if link is present */}
                            <div className="learn_more">
                              {item?.link && (
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: "12px",
                                    color: "#9863ce",
                                    textDecoration: "underline",
                                    display: "inline-block",
                                    marginTop: "5px",
                                  }}
                                >
                                  Learn more →
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                      }

                    </tbody>
                  </table>

                </div>
              ) : (
               
                <div className=' d-flex justify-content-center'>
                  <div className="no_data_outer">
                  <div className="table-responsive">
                    <div className="no_data_vector">
                      <img src="/images/no_data_vector.svg" alt="no-data" />
                    </div>
                  </div>
                </div>
                </div>)}

            </div>
          </div>



          {/* 
          <div className="dashboard_right_side profileslider">

            <div className="slider dashboard_slider">
              <Slider {...bannerSettings}>
                <div className="banner_img_add">

                  <div className="cnt_slider_f">
                    <h6>Cvtrade Lending Protocol</h6>
                    <p>Borrow Low, Earn High</p>
                  </div>

                  <div className="cv_trade_img">
                    <img src="/images/cvtrade_bitcoin.svg" alt="bitcoin" />
                  </div>

                </div>
                <div className="banner_img_add">

                  <div className="cnt_slider_f">
                    <h6>Cvtrade Lending Protocol</h6>
                    <p>Borrow Low, Earn High</p>
                  </div>

                  <div className="cv_trade_img">
                    <img src="/images/cvtrade_bitcoin.svg" alt="bitcoin" />
                  </div>

                </div>

                <div className="banner_img_add">

                  <div className="cnt_slider_f">
                    <h6>Cvtrade Lending Protocol</h6>
                    <p>Borrow Low, Earn High</p>
                  </div>

                  <div className="cv_trade_img">
                    <img src="/images/cvtrade_bitcoin.svg" alt="bitcoin" />
                  </div>

                </div>

                <div className="banner_img_add">

                  <div className="cnt_slider_f">
                    <h6>Cvtrade Lending Protocol</h6>
                    <p>Borrow Low, Earn High</p>
                  </div>

                  <div className="cv_trade_img">
                    <img src="/images/cvtrade_bitcoin.svg" alt="bitcoin" />
                  </div>

                </div>

                <div className="banner_img_add">

                  <div className="cnt_slider_f">
                    <h6>Cvtrade Lending Protocol</h6>
                    <p>Borrow Low, Earn High</p>
                  </div>

                  <div className="cv_trade_img">
                    <img src="/images/cvtrade_bitcoin.svg" alt="bitcoin" />
                  </div>

                </div>
              </Slider>
            </div>

          </div> */}



        </div>

      </div>

    </>
  );
};

export default NotificationPage;
