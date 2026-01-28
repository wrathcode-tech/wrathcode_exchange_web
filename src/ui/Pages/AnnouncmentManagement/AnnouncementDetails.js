import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AuthService from '../../../api/services/AuthService';
import LoaderHelper from '../../../customComponents/Loading/LoaderHelper';
import { alertErrorMessage } from '../../../customComponents/CustomAlertMessage';
import moment from 'moment';



function AnnouncementDetails() {
    const navigate = useNavigate();
    const { announce_title_id } = useParams()
    const [announcementDetails, setAnnouncementDetails] = useState({});
    const [relatedAnnouncement, setRelatedAnnouncement] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        handleAnnouncement(announce_title_id);
    }, [announce_title_id]);

    const handleAnnouncement = async (announce_title_id) => {
        LoaderHelper.loaderStatus(true);
        try {
            const result = await AuthService.announcementView(announce_title_id);
            LoaderHelper.loaderStatus(false);
            if (result?.success) {
                setAnnouncementDetails(result?.data?.getParticularAnnouncementdata);
                setRelatedAnnouncement(result?.data?.relatedAnnouncementListing?.reverse())
            } else {
                alertErrorMessage("Something went wrong while fetching announcement categories.");
            }
        } catch (err) {
            LoaderHelper.loaderStatus(false);
            alertErrorMessage("Error loading announcement categories.");
        }
    };


    return (
        <>
            <section className="announcement_section single_announcement">
                <div className="container">

                    <h1>
                        <img
                            src="/images/AnnouncementImg/back_btn.png"
                            alt="back btn"
                            style={{ cursor: "pointer", marginRight: "10px" }}
                            onClick={() => navigate(-1)} // 👈 this takes user back
                        />
                        {announcementDetails?.title || "----"}
                    </h1>

                    <span className="subtext">Published on {moment(announcementDetails.createdAt).format("DD-MM-YYYY")}</span>

                    <div className="row pt-5">
                        <div className="col-sm-8">
                            <div className="single_left_s">
                                <div
                                    className="block_cnt"
                                    dangerouslySetInnerHTML={{
                                        __html: ` ${announcementDetails?.description}`,
                                    }}
                                ></div>


                            </div>
                        </div>

                        <div className="col-sm-4">
                            <div className="rightsidebar">

                                <div className="articles_blog">
                                    <h3>Related Articles</h3>

                                    <ul>{relatedAnnouncement?.map((item, index) => {
                                        const formattedTitle = item?.title
                                            ?.trim()
                                            ?.replace(/\s+/g, "_")        // space -> underscore
                                            ?.slice(0, 50)                // limit to 50 chars
                                            ?.replace(/_+$/, "");         // remove trailing underscores

                                        return (
                                            <>
                                                <li>
                                                    <h5><Link to={`/announcement_details/${formattedTitle}/${item?._id}`}>{item?.title}</Link></h5>
                                                    <span className="subtext">Published on {moment(item?.createdAt).format("DD-MM-YYYY")}</span>
                                                </li>

                                            </>
                                        )
                                    })}


                                    </ul>

                                </div>


                            </div>
                        </div>

                    </div>

                </div>
            </section>

        </>
    )
}

export default AnnouncementDetails