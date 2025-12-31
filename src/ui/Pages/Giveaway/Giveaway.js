import React, { useEffect, useState } from 'react';
import { alertErrorMessage, alertSuccessMessage } from '../../../customComponents/CustomAlertMessage';
import AuthService from '../../../api/services/AuthService';
import LoaderHelper from '../../../customComponents/Loading/LoaderHelper';

function Giveaway(props) {

    const [giveawayList, setGiveawayList] = useState([]);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [tSize, setTSize] = useState('S');
    const [checkStatus, setCheckStatus] = useState({});

    console.log(checkStatus, "checkStatuscheckStatuscheckStatuscheckStatus");


    useEffect(() => {
        handleGiveawayList();
        handleCheckGiveaway();
    }, []);

    const handleGiveawayList = async () => {
        try {
            LoaderHelper.loaderStatus(true);
            const res = await AuthService.getGiveawayList();
            if (res?.success) {
                setGiveawayList(res.data);
            } else {
                // alertErrorMessage(res?.message || 'Unable to load giveaway list.');
            }
        } catch (error) {
            console.error(error);
            alertErrorMessage('Something went wrong while fetching giveaway list.');
        } finally {
            LoaderHelper.loaderStatus(false);
        }
    };

    const handleClaimSubmit = async (e) => {
        e.preventDefault();
        if (!deliveryAddress.trim()) {
            return alertErrorMessage('Please enter a valid delivery address.');
        }

        try {
            LoaderHelper.loaderStatus(true);
            const res = await AuthService.claimGiveaway(tSize, deliveryAddress);
            if (res?.success) {
                alertSuccessMessage(res?.message || 'Giveaway claimed successfully!');
                setGiveawayList(res.data);
                setDeliveryAddress('');
                setTSize('S');
                handleCheckGiveaway();

                window.location.reload()



            } else {
                alertErrorMessage(res?.message || 'Something went wrong.');
            }
        } catch (error) {
            console.error(error);
            alertErrorMessage(error.response?.data?.message || 'Something went wrong while claiming giveaway.');
        } finally {
            LoaderHelper.loaderStatus(false);
        }
    };

    const handleCheckGiveaway = async () => {
        try {
            LoaderHelper.loaderStatus(true);
            const res = await AuthService.checkGiveawayStatus();
            if (res?.success) {
                setCheckStatus(res.data);
            } else {
                // alertErrorMessage(res?.message || 'Unable to load giveaway list.');
            }
        } catch (error) {
            console.error(error);
            alertErrorMessage('Something went wrong while fetching giveaway list.');
        } finally {
            LoaderHelper.loaderStatus(false);
        }
    };

    const canClaim =
        props?.userDetails?.kycVerified === 2 &&
        checkStatus?.eligibilityKey === true &&
        checkStatus?.gitfClaimed === false;

    return (
        <>
            <div className="dashboard_right padding_0">
                {/* <div className="gaveaway_bg_vector">
                <img src="/images/giveaway_bg.png" alt="Giveaway background" />
            </div> */}

                {/* Steps section */}


                {/* Giveaway main content */}
                <div className="giveway_section">

                    <div className="giveaway_top_list">
                        <ul>
                            <li className="active">
                                <div className="cnt">Register<span></span></div>
                            </li>

                            <li className={props?.userDetails?.kycVerified === 2 ? "active" : ""}>
                                <div className="cnt">KYC<span></span></div>
                            </li>

                            <li className={checkStatus?.eligibilityKey === true ? "active" : ""}>
                                <div className="cnt">Deposit (10 USDT) <span></span></div>
                            </li>
                        </ul>
                    </div>

                    <div className="giveway_hero">
                        <div className="banner_cnt_s">
                            <h1>Wrathcode Giveaway – Join & Win a Premium T-Shirt!</h1>

                            <ul>
                                <li>
                                    <img src="/images/giveup_list_vector.svg" alt="Step" />
                                    <div className="cnt_list">
                                        <h2>Register</h2>
                                        <p>Sign up on Wrathcode and create your free account in seconds.</p>
                                    </div>
                                </li>
                                <li>
                                    <img src="/images/giveup_list_vector.svg" alt="Step" />
                                    <div className="cnt_list">
                                        <h2>Complete KYC</h2>
                                        <p>Verify your identity to unlock all features and become a trusted user.</p>
                                    </div>
                                </li>
                                <li>
                                    <img src="/images/giveup_list_vector.svg" alt="Step" />
                                    <div className="cnt_list">
                                        <h2>Deposit 10 USDT</h2>
                                        <p>Make your first deposit and activate your Wrathcode trading profile.</p>
                                    </div>
                                </li>
                            </ul>

                            {/* Claim Button */}
                            <button
                                type="button"
                                className="btn btn_claim"
                                data-bs-toggle="modal"
                                data-bs-target="#claimModal"
                                disabled={!canClaim}
                            >
                                Claim Now
                            </button>



                        </div>

                        <div className="banner_t_shirts">
                            <img src="/images/Wrathcode_t-shirts.svg" alt="T-shirt" />
                        </div>
                    </div>

                    {/* Middle Info Section */}
                    <div className="mid_cnt">
                        <p>Once you complete the 3 steps, you’ll instantly qualify to claim your FREE Limited-Edition Wrathcode T-Shirt!</p>
                        <p>This exclusive offer is available for a limited time only, so don’t miss your chance to show off your Wrathcode pride in style!</p>

                        <div className="progress_list">
                            <ul>

                                {giveawayList[0]?.status === "CANCELLED" ? (
                                    // ⛔ Cancelled case → Only cancelled item show
                                    <li className="active canceltab">
                                        <div className="cnt">
                                            <span>
                                                <img src="/images/reclaim_icon.svg" alt="Reclaim" />
                                            </span>
                                            <div> <span className='cancelled_txt'>Your Giveaway Cancelled —</span> <a href='/user_profile/support'>Contact Support <img src="/images/arrowdashboard.svg" class="m-1" width={26} alt="icon"></img></a></div>
                                        </div>
                                    </li>
                                ) : (
                                    // ✔ Normal flow (Not cancelled)
                                    <>
                                        <li
                                            className={
                                                ["PENDING", "DISPATCHED", "DELIVERED"].includes(
                                                    giveawayList[0]?.status
                                                )
                                                    ? "active"
                                                    : ""
                                            }
                                        >
                                            <div className="cnt">
                                                <span>
                                                    <img src="/images/progress_icon.svg" alt="Progress" />
                                                </span>
                                                In progress
                                            </div>
                                        </li>

                                        <li
                                            className={
                                                ["DISPATCHED", "DELIVERED"].includes(giveawayList[0]?.status)
                                                    ? "active"
                                                    : ""
                                            }
                                        >
                                            <div className="cnt">
                                                <span>
                                                    <img src="/images/dispatch_icon.svg" alt="Dispatch" />
                                                </span>
                                                Dispatch
                                            </div>
                                        </li>

                                        <li
                                            className={
                                                giveawayList[0]?.status === "DELIVERED" ? "active" : ""
                                            }
                                        >
                                            <div className="cnt">
                                                <span>
                                                    <img src="/images/delivered_icon.svg" alt="Delivered" />
                                                </span>
                                                Delivered
                                            </div>
                                        </li>
                                    </>
                                )}

                            </ul>
                        </div>





                    </div>
                </div>
            </div>


            {/* Modal */}
            <div
                className="modal fade search_form search_coin"
                id="claimModal"
                tabIndex="-1"
                aria-labelledby="claimModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content text-dark">
                        <div className="modal-header">
                            <h5 className="modal-title" id="claimModalLabel">Add Details</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>

                        <div className="modal-body">
                            <form onSubmit={handleClaimSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Delivery Address</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter your full address"
                                        value={deliveryAddress}
                                        onChange={(e) => setDeliveryAddress(e.target.value)}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">T-Shirt Size</label>
                                    <div className="selectoption">
                                        {/* ✅ Controlled select input */}
                                        <select
                                            className="form-select"
                                            value={tSize}
                                            onChange={(e) => setTSize(e.target.value)}
                                        >
                                            <option value="S">S</option>
                                            <option value="M">M</option>
                                            <option value="L">L</option>
                                            <option value="XL">XL</option>
                                            <option value="XXL">XXL</option>
                                            <option value="3XL">3XL</option>
                                            <option value="4XL">4XL</option>
                                            <option value="5XL">5XL</option>
                                        </select>
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-warning w-100">
                                    Submit
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}

export default Giveaway;
