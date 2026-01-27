import React, { useState, useEffect } from "react";

import moment from "moment";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import AuthService from "../../../api/services/AuthService";
import { alertErrorMessage } from "../../../customComponents/CustomAlertMessage";

const ActivitylogPage = (props) => {

    const [activity, setActivity] = useState("");
    const [updatedactivity, setupdatedactivity] = useState()
    const [activityLength, setactivityLength] = useState()
    const [updatedLength, setupdatedLength] = useState(5);


    const [skip, setSkip] = useState(0);
    const limit = 10;


    const bannerSettings = {
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 2000
    };

    useEffect(() => {
        activityLogs(skip);
    }, []);

    const activityLogs = async (skip) => {
        LoaderHelper.loaderStatus(true)
        await AuthService.getActivityLogs(skip, limit).then(async result => {
            LoaderHelper.loaderStatus(false)
            if (result?.success) {
                setSkip(skip)
                setactivityLength(result?.total_count || 0);
                setActivity(result?.data)
            } else {
                alertErrorMessage(result?.message);
            }
        });
    };

    const handlePaginationWalletHistory = (action) => {
        if (action === 'prev') {
            if (skip - limit >= 0) {
                activityLogs(skip - limit);
            }
        } else if (action === 'next') {
            if (skip + limit < activityLength) {
                activityLogs(skip + limit);
            }
        } else if (action === 'first') {
            activityLogs(0);
        } else if (action === 'last') {
            const lastPageSkip = Math.floor(activityLength);
            if (activityLength > 10) {
                const data = lastPageSkip - 10
                activityLogs(data);
            }
        }
    };

    useEffect(() => {
        if (updatedLength > 5) {
            const mql = window.matchMedia('(max-width: 768px)');
            if (mql?.matches) {
                window.scrollTo({
                    top: document.documentElement.scrollHeight - 1900,
                    left: 0,
                    behavior: "smooth"
                })
            } else {
                window.scrollTo({
                    top: document.documentElement.scrollHeight - 1300,
                    left: 0,
                    behavior: "smooth"
                })
            }

        }
    }, [updatedactivity]);



    return (
        // <div className="tab-pane" id="ActivityPill" role="tabpanel" aria-labelledby="Activity-pill">
        //     <div className="card twofa_card">
        //         <div className="card-body" >
        //             <div className="card-header mb-md-4" >
        //                 <h3> Activity Logs</h3>
        //                 <p className="mb-0 text-muted" >  Your Activity Logs display for all Activity </p>
        //             </div>
        //             {Object.keys(activity).length === 0 ?
        //                 <div className="favouriteData">
        //                     <img src="/images/no-data.svg" className="img-fluid" width="96" height="96" alt="" />
        //                     <br />
        //                     <p className="mt-3 mb-4" > No Data Found. </p>
        //                 </div>
        //                 :
        //                 <>
        //                     <div className="card-card-body_inner pt-3" >
        //                         <div className="sessions__table" >
        //                             <div className="activity-wrapper">
        //                                 <div className="custom-history">
        //                                     {updatedactivity.length > 0 ?
        //                                         updatedactivity.map(item =>
        //                                             <div className="single-item-history d-flex-center">
        //                                                 <div className="content">
        //                                                     <span className="text-muted" >Status: &nbsp;</span><b>{item?.Activity}</b>
        //                                                     <p className="mb-0" > <samll className="text-muted" >IP:&nbsp; {item?.IP} </samll> </p>
        //                                                 </div>
        //                                                 <small className="date align-self-start text-muted">



        //                                                     {moment(item?.date).format('MMMM Do YYYY, h:mm:ss a')}
        //                                                 </small>
        //                                             </div>
        //                                         ) : null
        //                                     }
        //                                 </div>
        //                             </div>
        //                         </div>
        //                     </div>
        //                     <div className="add_pls  d-flex justify-content-center">
        //                         {updatedLength >= activityLength ? '' :
        //                             <button className="btn btn-sm  btn-link text-decoration-none text-muted text-center" type="button"
        //                                 onClick={() => {
        //                                     setupdatedLength(updatedLength + 5);
        //                                 }}
        //                             > <i className="ri-restart-line me-2 "></i> Load more </button>}
        //                     </div>
        //                 </>
        //             }
        //         </div>
        //     </div>
        // </div>



        <div className="dashboard_right">





            <div className="dashboard_listing_section Overview_mid">


                <div className="kyc_approval_s activity_logs">

                    <div className="cnt">
                        <h3>Activity Logs</h3>
                        <p>Your Activity Logs display for all Activity</p>

                        <div className="dashboard_summary">

                            <table>
                                <tbody>
                                    {activity?.length > 0 ? activity?.map((item) => {
                                        return (
                                            <tr>
                                                <td><div className="price_heading">Status: <strong>{item?.Activity}</strong></div>
                                                    <div className="price_heading">IP:<span> {item?.IP}</span></div>
                                                </td>
                                                <td className="right_t"> {moment(item?.date).format('MMMM Do YYYY, h:mm:ss a')}</td>
                                            </tr>

                                        )
                                    }) : <tr rowSpan="5">
                                        <td colSpan="12">
                                            <div className="no_data_outer">
                                                <div className="no_data_vector">
                                                    <img src="/images/Group 1171275449 (1).svg" alt="no-data" />

                                                </div>

                                                <p>No Data Available</p>

                                            </div>

                                        </td>
                                    </tr>}




                                </tbody>


                            </table>
                            {activity?.length > 0 ?
                                < div className="hVPalX gap-2" >
                                    <span className="" >{skip + 1}-{Math.min(skip + limit, activityLength)} of {activityLength}</span>
                                    <div className="sc-eAKtBH gVtWSU">
                                        <button type="button" aria-label="First Page" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationWalletHistory('first')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                                                <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"></path>
                                                <path fill="none" d="M24 24H0V0h24v24z"></path>
                                            </svg>
                                        </button>
                                        <button type="button" aria-label="Next Page" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationWalletHistory('prev')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
                                                <path d="M0 0h24v24H0z" fill="none"></path>
                                            </svg>
                                        </button>

                                        <button type="button" aria-label="Next Page" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationWalletHistory('next')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                                                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
                                                <path d="M0 0h24v24H0z" fill="none"></path>
                                            </svg>
                                        </button>
                                        <button type="button" className="sc-gjLLEI kuPCgf" onClick={() => handlePaginationWalletHistory('last')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                                                <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"></path>
                                                <path fill="none" d="M0 0h24v24H0V0z"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                :
                                ""
                            }
                        </div>






                    </div>


                </div>





            </div>

        </div>

    );
}

export default ActivitylogPage;