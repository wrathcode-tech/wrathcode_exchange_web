import React, { useEffect, useState } from "react";
import AuthService from "../../../api/services/AuthService";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import { alertErrorMessage } from "../../../customComponents/CustomAlertMessage";
import { Link } from "react-router-dom";
import moment from "moment";



const RefrealList = () => {


    const [refferalList, setRefferalList] = useState([]);


    useEffect(() => {
        handleReferalList();
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



    return (

        <section className="pb-5 mt-3 mt-md-5">
            <div className="container">
                <div className="tab-content custom-tab-content p-0">
                    <div className="tab-pane fade show container active form-field-wrapper table_scroll p-0 switch_btn  border-dashed border-gray-300 bg-lighten card-rounded" id="funds">
                        <div className="table-responsive">
                            <table className="table wallet_table">
                                <thead>
                                    <tr>
                                        <th>Sr No.</th>
                                        <th>Email</th>
                                        <th>Mobile Number</th>
                                        <th>Referral Bonus</th>
                                        <th>Date & Time</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {refferalList?.length > 0 ? (
                                        refferalList?.map((item, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item?.email || '-----'}</td>
                                                <td>{item?.mobile || '-----'}</td>
                                                <td>5000 SHIB</td>
                                                <td>
                                                    <div className="c_view justify-content-start" >
                                                        <span>{moment(item?.date).format("DD/MM/YYYY")}
                                                            <small>{moment(item?.date).format("hh:mm A")}</small>
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr rowSpan="5">
                                            <td colSpan="12">
                                                <p className="text-center" style={{ textAlign: "center" }}>
                                                    <div className="favouriteData">
                                                        <img src="/images/no-data.svg" className="img-fluid" width="96" height="96" alt="" />
                                                        <p>No Data Available</p>
                                                    </div>
                                                </p>
                                            </td>
                                        </tr>
                                    )}

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}


export default RefrealList