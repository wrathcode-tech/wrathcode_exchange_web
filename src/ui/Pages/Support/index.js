import React, { useState, useEffect, useRef, useContext } from "react";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import AuthService from "../../../api/services/AuthService";
import { alertErrorMessage, alertSuccessMessage } from "../../../customComponents/CustomAlertMessage";
import { ProfileContext } from "../../../context/ProfileProvider";
import copy from "copy-to-clipboard";

const SupportPage = () => {

    const messagesEndRef = useRef(null)
    const { userDetails } = useContext(ProfileContext);

    const [subject, setSubject] = useState("");
    const [message, setmessage] = useState("");
    const [myfile, setMyfile] = useState("");
    const [email, setEmail] = useState(userDetails?.emailId);
    const [issueList, setIssueList] = useState([{ emailId: 'parul@appinop.com', subject: 'Testing Subject', status: 'Active', seen: 1 }]);
    const [messageQuery, setMessageQuery] = useState([]);
    const [ticketId, setTIcketId] = useState([]);
    const [id, setID] = useState('');
    const [messagerply, setMessageRply] = useState('');
    const [orderId, setOrderId] = useState('')
    const [isShow, setIsShow] = useState(2);
    const [isRotating, setRotating] = useState(false);
    const [status, setStatus] = useState('');

    const handleInputChange = (event) => {
        switch (event.target.name) {
            case "subject":
                setSubject(event.target.value);
                break;
            case "orderId":
                setOrderId(event.target.value);
                break;
            case "message":
                setmessage(event.target.value);
                break;
            case "messagerply":
                setMessageRply(event.target.value);
                break;
            default:
        }
    }

    const resetInputChange = () => {
        setSubject("");
        setOrderId("");
        setmessage("");
        setMyfile();
        // setEmail("");
    }

    const handleChangeImage = async (event) => {
        event.preventDefault();
        const file = event.target.files[0];
        if (file) {
            const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (allowedTypes.includes(file.type) && file.size <= maxSize) {
                setMyfile(file);
                alertSuccessMessage(file?.name)
            } else {
                if (!allowedTypes.includes(file.type)) {
                    alertErrorMessage("Only PNG, JPEG, and JPG file types are allowed.");
                } else {
                    alertErrorMessage("Max image size is 2MB.");
                }
            }
        }
    }

    const handleSupport = async (email, subject, message, orderId, myfile) => {
        try {
            var formData = new FormData();
            formData.append('emailId', email);
            formData.append('subject', subject);
            formData.append('description', message);
            formData.append('order_id', orderId);
            formData.append('issue-image', myfile);
            LoaderHelper.loaderStatus(true);
            const result = await AuthService.submitTicket(formData)
            if (result?.success) {
                alertSuccessMessage(result.message);
                resetInputChange();
                getIssueList();
            } else {
                alertErrorMessage(result.message);
            }
        } finally { LoaderHelper.loaderStatus(false); }
    }

    useEffect(() => {
        getIssueList();
    }, [])


    const getIssueList = async (id) => {
        LoaderHelper.loaderStatus(true);
        setMessageQuery([])
        await AuthService.getUserTickets().then(async result => {
            if (result?.success) {
                try {
                    LoaderHelper.loaderStatus(false);
                    setIssueList(result?.data?.reverse());
                    if (id) {
                        let filteredData = result?.data?.filter((item) => item?._id === id);
                        let tickets = filteredData?.map((item) => item?.ticket);
                        let status = filteredData?.map((item) => item?.status);
                        setMessageQuery(tickets[0]);
                        setStatus(status[0])
                    }
                    setRotating(false);
                } catch (error) {
                    LoaderHelper.loaderStatus(false);
                    alertErrorMessage(error);
                }
            } else {
                setRotating(false);
                LoaderHelper.loaderStatus(false);
                alertErrorMessage(result?.message);
            }
        });
    };



    const handleHidettMain = (row) => {
        setIsShow(1);
        setTIcketId(row?.ticketId);
        setID(row?._id);
        getIssueList(row?._id)
        setStatus(row?.status)
    };


    const handleMessageQuery = async (messagerply, id) => {
        LoaderHelper.loaderStatus(true);
        await AuthService.replyTicket(messagerply, id).then(async result => {
            if (result?.success) {
                try {
                    LoaderHelper.loaderStatus(false);
                    setMessageRply("");
                    getIssueList(id);
                } catch (error) {
                    LoaderHelper.loaderStatus(false);
                    alertErrorMessage(error);
                }
            } else {
                LoaderHelper.loaderStatus(false);
                alertErrorMessage(result.msg);
            }
        });
    }

    useEffect(() => {
        scrollToBottom()
    }, [messageQuery]);


    const scrollToBottom = () => {
        messagesEndRef?.current?.scrollIntoView(false)
    }



    return (
        <>

            <div className="dashboard_right">
                <div className="supportsection">
                    <h4 className="mb-1">
                        Help/Support
                    </h4>
                    <div className="supportinquery">

                        <form className="profile_form">
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="emailinput">
                                        <label>Email ID</label>
                                        <div className="d-flex">
                                            <input type="email" placeholder="" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="emailinput">
                                        <label>Subject</label>
                                        <div className="d-flex">
                                            <input type="text" placeholder="" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="emailinput">
                                        <label>Order ID</label>
                                        <div className="d-flex">
                                            <input type="text" placeholder="" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="emailinput">
                                        <label>Supporting documents (Attach)</label>
                                        <div className="d-flex">
                                            <input type="file" placeholder="" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-12">
                                    <div className="emailinput">
                                        <label>Description</label>
                                        <div className="d-flex">
                                            <textarea></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-sm-12">
                                <button className="submit">Submit</button>
</div>
                            </div>

                        </form>

                    </div>
                    <div className={`tt_main issuelist_data ${isShow === 1 && "d-none"}`}>
                        <h4>Issue List</h4>
                        <div className="inngerbox cng-pass overflow_unset">
                            {/* <div className={`cursor-pointer refresh ${isRotating ? 'rotating' : ''}`} onClick={() => { getIssueList(); setRotating(true); }}><i className="ri-refresh-line "></i></div> */}
                            <div className='table-responsive'>
                                <table className="table table_home ">
                                    <thead>
                                        <tr>
                                            <th>Sr No.</th>
                                            <th>Ticket ID</th>
                                            <th>Subject</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {issueList?.length > 0 ? issueList.map((item, index) =>
                                            <tr key={index} className={` ${(item?.seen === 0 && item?.status === 'Open') ? " font-weight-bold issue_text" : "issue_text"}`} >
                                                <td >{index + 1}</td>
                                                <td>{item?.ticketId} <span className="btn btn-link p-0" onClick={() => { copy(item?.ticketId); alertSuccessMessage("Ticket ID copied..!!") }}>< i className="ri-file-copy-line"></i>
                                                </span></td>
                                                <td > {item?.subject}</td>
                                                <td >{item?.status} <small>{(item?.seen === 0 && item?.status === 'Open') && <i className="ri-circle-fill" style={{ color: 'green' }}></i>}</small></td>
                                                <td > <button type="button" className="btn btn-xs  btn-success" data-bs-toggle="modal" data-bs-target="#security_verification" ><span>View</span></button></td>
                                            </tr>
                                        ) : <tr rowSpan="5">
                                            <td colSpan="12">
                                                <p style={{ textAlign: "center" }} className="no-data justify-content-center h-100 d-flex align-items-center">
                                                    <div className="favouriteData">
                                                        <div className="no_data_s">
                                                            <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="" /><p>No Data Available</p>
                                                        </div>
                                                    </div>
                                                </p>
                                            </td>
                                        </tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>


                        {/* <div className="d-flex-between mb-3 custom_dlflex">
                        <ul className="nav nav-pills mb-2 overflowx_scroll funds_tab  market_tabs">
                            <li className="nav-item">
                                <a className="nav-link active" data-bs-toggle="tab" href="#profile" role="tab" >
                                    <i className="ri-file-list-2-fill me-2 ri-xl"></i> Issue List
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link " data-bs-toggle="tab" href="#home1" role="tab">
                                    <i className="ri-ticket-fill me-2 ri-xl"></i>Submit Ticket
                                </a>
                            </li>
                        </ul>

                    </div> */}
                        {/* <div className="tab-content text-left card">
                        <div className="tab-pane card-body " id="home1" role="tabpanel">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-lg-12 col-md-12 col-12 mb-3">
                                        <label className="\mb-1" >Email Id*</label>
                                        <input className="form-control" type="email" name="email" value={email} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-lg-12 col-md-12 col-12 mb-3">
                                        <label className=" mb-1" >Subject*</label>
                                        <input className="form-control" type="text" name="subject" value={subject} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-lg-12 col-md-12 col-12 mb-3">
                                        <label className=" mb-1" >Order Id</label>
                                        <input className="form-control" type="text" name="orderId" value={orderId} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-lg-12 col-md-12 col-12 mb-3">
                                        <label className=" mb-1" >Description*</label>
                                        <textarea className="form-control" rows="6" placeholder="" name="message" value={message} onChange={handleInputChange}></textarea>
                                    </div>
                                    <div className="col-lg-12 col-md-12 col-12 mb-3 ">
                                        <label className="mb-1" >   <i className="ri-upload-cloud-2-line me-2"></i> Supporting documents (Attach) </label>
                                        <input className="form-control" type="file" onChange={handleChangeImage} />
                                    </div>
                                    <div className="col-lg-12 col-md-12 col-12 mb-3 d-flex ">
                                        <button className="btn custom-btn btn-block supportbtn" type="button" onClick={() => handleSupport(email, subject, message, orderId, myfile)} disabled={!email || !message || !subject}>SUBMIT</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="tab-pane active card-body " id="profile" role="tabpanel">
                        
                        </div>
                    </div> */}
                    </div>
                    {/* <div className={`tt_chat ${isShow === 2 && "d-none"}`}>
                    <div className="tt_header mb-4 d-flex justify-content-between" >
                        <div>
                            <span style={{ cursor: "pointer" }} onClick={() => { setIsShow(2); getIssueList() }}>
                                <i className="ri-arrow-left-line mx-2 p-2" ></i></span> {ticketId} <span className="btn btn-link p-0" onClick={() => { copy(ticketId); alertSuccessMessage("Ticket ID copied..!!") }}>< i className="ri-file-copy-line"></i>
                            </span></div>
                        <div className={`cursor-pointer refresh ${isRotating ? 'rotating' : ''}`} title="Refresh Messages" onClick={() => { getIssueList(id); setRotating(true); }}><i className="ri-refresh-line "></i></div>
                    </div>
                    <div className="inngerbox cng-pass overflow_unset" >
                        <div className="right">

                            {messageQuery?.length <= 0 ? (
                                <div className="issue_text text-center mt-5">No message found</div>
                            ) : (
                                <div className="middle">
                                    <div className="tumbler">
                                        <div className="messages" id="message">
                                            {messageQuery.map((item, index) => (
                                                <div ref={messagesEndRef} key={index}>
                                                    {item?.replyBy === 0 ? (
                                                        // Support Team Message
                                                        <div className="clip sent mb-1 mt-2">
                                                            <div
                                                                className="text text-start px-3 support_team_message"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: `<strong>Support Team:</strong> ${item?.query.replace(
                                                                        /\n/g,
                                                                        "<br>"
                                                                    )}`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    ) : (
                                                        // User Message
                                                        <div className="clip received mb-1 d-flex justify-content-end mt-2">
                                                            <div
                                                                className="text text-end px-3 self_message"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: `<strong>You:</strong> ${item?.query.replace(
                                                                        /\n/g,
                                                                        "<br>"
                                                                    )}`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="row mt-4 d-flex justify-content-center">
                                <div className=" col-6 mt-5 ">
                                    {status === 'Open' ?
                                        <div className=" field-otp-box" >
                                            <input className="form-control" type="text" id="message" cols="30" rows="1" placeholder="Message..." name="messagerply" value={messagerply} onChange={handleInputChange} />

                                            <button type="button" className="btn btn-xs  custom-btn " onClick={() => handleMessageQuery(messagerply, id)} disabled={!messagerply} ><span>Send</span></button>
                                        </div>
                                        :
                                        <div className=" field-otp-box" >
                                            <input disabled className="form-control" type="text" id="message" cols="30" rows="1" value="This ticket has been resolved" name="messagerply" />
                                            <button type="button" className="btn btn-xs  custom-btn " disabled><span>Closed</span></button>
                                        </div>}
                                </div>
                            </div>

                        </div>
                    </div>
                </div> */}
                </div>
            </div>

            <div className="modal fade search_form chatmessages"
                id="security_verification"
                tabIndex="-1"
                aria-labelledby="securityVerificationLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        />
                        <div className="chat-container">
                            <div className="chat-header">
                                <h3>Help/Support</h3>
                                <div className="ticket">← TICK:67RTEAV</div>
                            </div>
                            <div className="chat-body">
                                <div className="message left">
                                    <div className="avatar">T</div>
                                    <div className="bubble">
                                        Lorem Ipsum is simply dummy text of the printing and
                                        typesetting industry. Lorem Ipsum has been the industry's
                                        standard.
                                    </div>
                                </div>
                                <div className="message left">
                                    <div className="avatar">T</div>
                                    <div className="bubble">
                                        Lorem Ipsum is simply dummy text of the printing and
                                        typesetting industry. Lorem Ipsum has been the industry's
                                        standard.
                                    </div>
                                </div>
                                <div className="message right">
                                    <div className="bubble">
                                        Lorem Ipsum is simply dummy text of the printing and
                                        typesetting industry.
                                    </div>
                                    <div className="avatar">H</div>
                                </div>
                                <div className="message right">
                                    <div className="bubble">
                                        Lorem Ipsum is simply dummy text of the printing and
                                        typesetting industry.
                                    </div>
                                    <div className="avatar">H</div>
                                </div>

                            </div>
                            <div className="chat-footer">
                                <input
                                    type="text"
                                    placeholder="Write your message here..."
                                />
                                <div className="icon-btn">+</div>
                                <div className="icon-btn send-btn">➤</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>

    );
}

export default SupportPage;