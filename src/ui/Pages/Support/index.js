import React, { useState, useEffect, useRef, useContext } from "react";
import LoaderHelper from "../../../customComponents/Loading/LoaderHelper";
import AuthService from "../../../api/services/AuthService";
import { alertErrorMessage, alertSuccessMessage } from "../../../customComponents/CustomAlertMessage";
import { ProfileContext } from "../../../context/ProfileProvider";
import copy from "copy-to-clipboard";

const SupportPage = () => {
    const messagesEndRef = useRef(null);
    const { userDetails } = useContext(ProfileContext);

    // Form states
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [myfile, setMyfile] = useState("");
    const [email, setEmail] = useState("");
    const [orderId, setOrderId] = useState("");

    // Issue list states
    const [issueList, setIssueList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Chat modal states
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [messageQuery, setMessageQuery] = useState([]);
    const [messagerply, setMessageRply] = useState("");
    const [ticketStatus, setTicketStatus] = useState("");

    // Set email from user details
    useEffect(() => {
        if (userDetails?.emailId) {
            setEmail(userDetails.emailId);
        }
    }, [userDetails]);

    // Fetch issue list on mount
    useEffect(() => {
        getIssueList();
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messageQuery]);

    const scrollToBottom = () => {
        messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Handle file upload
    const handleChangeImage = async (event) => {
        event.preventDefault();
        const file = event.target.files[0];
        if (file) {
            const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (allowedTypes.includes(file.type) && file.size <= maxSize) {
                setMyfile(file);
                alertSuccessMessage("File selected: " + file?.name);
            } else {
                if (!allowedTypes.includes(file.type)) {
                    alertErrorMessage("Only PNG, JPEG, and JPG file types are allowed.");
                } else {
                    alertErrorMessage("Max file size is 5MB.");
                }
                event.target.value = "";
            }
        }
    };

    // Reset form
    const resetForm = () => {
        setSubject("");
        setOrderId("");
        setMessage("");
        setMyfile("");
    };

    // Submit new ticket
    const handleSupport = async (e) => {
        e?.preventDefault();

        if (!email) {
            alertErrorMessage("Email is required");
            return;
        }
        if (!subject) {
            alertErrorMessage("Subject is required");
            return;
        }
        if (!message) {
            alertErrorMessage("Description is required");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('emailId', email);
            formData.append('subject', subject);
            formData.append('description', message);
            formData.append('order_id', orderId);
            if (myfile) {
                formData.append('issue-image', myfile);
            }

            LoaderHelper.loaderStatus(true);
            const result = await AuthService.submitTicket(formData);

            if (result?.success) {
                alertSuccessMessage(result?.message || "Ticket submitted successfully");
                resetForm();
                getIssueList();
            } else {
                alertErrorMessage(result?.message || "Failed to submit ticket");
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error("Error in handleSupport:", error);
            }
            alertErrorMessage(error?.message || "Something went wrong");
        } finally {
            LoaderHelper.loaderStatus(false);
        }
    };

    // Get issue list
    const getIssueList = async () => {
        try {
            setIsLoading(true);
            LoaderHelper.loaderStatus(true);
            const result = await AuthService.getUserTickets();

            if (result?.success) {
                setIssueList(result?.data?.reverse() || []);
            } else {
                if (process.env.NODE_ENV === 'development') {
                    console.error("Failed to get tickets:", result?.message);
                }
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error("Error in getIssueList:", error);
            }
        } finally {
            setIsLoading(false);
            LoaderHelper.loaderStatus(false);
        }
    };

    // View ticket details
    const handleViewTicket = (ticket) => {
        setSelectedTicket(ticket);
        setMessageQuery(ticket?.ticket || []);
        setTicketStatus(ticket?.status || "Open");
        setMessageRply("");

        // Open modal
        const modalElement = document.getElementById('chatModal');
        if (modalElement) {
            const modal = new window.bootstrap.Modal(modalElement);
            modal.show();
        }
    };

    // Reply to ticket
    const handleMessageQuery = async () => {
        if (!messagerply?.trim()) {
            alertErrorMessage("Please enter a message");
            return;
        }

        try {
            LoaderHelper.loaderStatus(true);
            const result = await AuthService.replyTicket(messagerply, selectedTicket?._id);

            if (result?.success) {
                setMessageRply("");
                // Refresh ticket messages
                const updatedResult = await AuthService.getUserTickets();
                if (updatedResult?.success) {
                    const updatedTicket = updatedResult?.data?.find(t => t._id === selectedTicket?._id);
                    if (updatedTicket) {
                        setMessageQuery(updatedTicket?.ticket || []);
                        setTicketStatus(updatedTicket?.status || "Open");
                    }
                    setIssueList(updatedResult?.data?.reverse() || []);
                }
                alertSuccessMessage("Message sent successfully");
            } else {
                alertErrorMessage(result?.message || "Failed to send message");
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error("Error in handleMessageQuery:", error);
            }
            alertErrorMessage(error?.message || "Something went wrong");
        } finally {
            LoaderHelper.loaderStatus(false);
        }
    };

    // Copy ticket ID
    const handleCopyTicketId = (ticketId) => {
        copy(ticketId);
        alertSuccessMessage("Ticket ID copied!");
    };

    // Filter issues based on search
    const filteredIssues = issueList.filter(item =>
        item?.ticketId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get status badge class
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'open':
                return 'badge bg-success';
            case 'closed':
                return 'badge bg-secondary';
            case 'pending':
                return 'badge bg-warning';
            default:
                return 'badge bg-info';
        }
    };

    return (
        <>
            <div className="dashboard_right">
                <div className="supportsection">
                    <h4 className="mb-1">Help/Support</h4>

                    {/* Submit Ticket Form */}
                    <div className="supportinquery">
                        <form className="profile_form" onSubmit={handleSupport}>
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="emailinput">
                                        <label>Email ID <span className="text-danger">*</span></label>
                                        <div className="d-flex">
                                            <input
                                                type="email"
                                                placeholder="Enter your email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={!!userDetails?.emailId}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="emailinput">
                                        <label>Subject <span className="text-danger">*</span></label>
                                        <div className="d-flex">
                                            <input
                                                type="text"
                                                placeholder="Enter subject"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="emailinput">
                                        <label>Order ID (Optional)</label>
                                        <div className="d-flex">
                                            <input
                                                type="text"
                                                placeholder="Enter order ID if applicable"
                                                value={orderId}
                                                onChange={(e) => setOrderId(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="emailinput">
                                        <label>Supporting Documents (Optional)</label>
                                        <div className="d-flex">
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/jpg"
                                                onChange={handleChangeImage}
                                            />
                                        </div>
                                        {myfile && (
                                            <small className="text-success">
                                                Selected: {myfile?.name}
                                            </small>
                                        )}
                                    </div>
                                </div>
                                <div className="col-sm-12">
                                    <div className="emailinput">
                                        <label>Description <span className="text-danger">*</span></label>
                                        <div className="d-flex">
                                            <textarea
                                                placeholder="Describe your issue in detail..."
                                                rows={4}
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-12">
                                    <button
                                        className="submit"
                                        type="submit"
                                        disabled={!email || !subject || !message}
                                    >
                                        Submit Ticket
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Issue List */}
                    <div className="tt_main issuelist_data">
                        <div className="coin_view_top">
                            <h4>My Tickets</h4>
                            <div className="searchBar custom-tabs">
                                <i className="ri-search-2-line"></i>
                                <input
                                    type="search"
                                    className="custom_search"
                                    placeholder="Search tickets..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary ms-2"
                                    onClick={getIssueList}
                                    disabled={isLoading}
                                    style={{ minWidth: '80px' }}
                                >
                                    <i className={`ri-refresh-line ${isLoading ? 'rotating' : ''}`}></i> Refresh
                                </button>
                            </div>
                        </div>

                        <div className="inngerbox cng-pass overflow_unset">
                            <div className="table-responsive">
                                <table className="table table_home">
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
                                        {filteredIssues?.length > 0 ? (
                                            filteredIssues.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    className={`${item?.seen === 0 && item?.status === 'Open' ? 'font-weight-bold issue_text' : 'issue_text'}`}
                                                >
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        {item?.ticketId}
                                                        <span
                                                            className="btn btn-link p-0 ms-1"
                                                            onClick={() => handleCopyTicketId(item?.ticketId)}
                                                            title="Copy Ticket ID"
                                                        >
                                                            <i className="ri-file-copy-line"></i>
                                                        </span>
                                                    </td>
                                                    <td>{item?.subject}</td>
                                                    <td>
                                                        <span className={getStatusBadge(item?.status)}>
                                                            {item?.status}
                                                        </span>
                                                        {item?.seen === 0 && item?.status === 'Open' && (
                                                            <i className="ri-circle-fill ms-1" style={{ color: 'green', fontSize: '8px' }} title="New reply"></i>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="btn btn-xs btn-success"
                                                            onClick={() => handleViewTicket(item)}
                                                        >
                                                            <span>View</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5">
                                                    <div className="favouriteData text-center py-5">
                                                        <div className="no_data_s">
                                                            <img src="/images/no_data_vector.svg" className="img-fluid" width="96" height="96" alt="No data" />
                                                            <p>{isLoading ? 'Loading...' : 'No tickets found'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Modal */}
            <div
                className="modal fade search_form chatmessages"
                id="chatModal"
                tabIndex="-1"
                aria-labelledby="chatModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered modal-lg">
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
                                <div className="ticket">
                                    ← {selectedTicket?.ticketId || 'Ticket'}
                                    <span
                                        className="btn btn-link p-0 ms-2"
                                        onClick={() => handleCopyTicketId(selectedTicket?.ticketId)}
                                        style={{ color: 'inherit' }}
                                    >
                                        <i className="ri-file-copy-line"></i>
                                    </span>
                                    <span className={`ms-2 ${getStatusBadge(ticketStatus)}`} style={{ fontSize: '12px' }}>
                                        {ticketStatus}
                                    </span>
                                </div>
                            </div>

                            <div className="chat-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {messageQuery?.length > 0 ? (
                                    messageQuery.map((item, index) => (
                                        <div key={index}>
                                            {item?.replyBy === 0 ? (
                                                // Support Team Message
                                                <div className="message left">
                                                    <div className="avatar" style={{ backgroundColor: '#4CAF50' }}>S</div>
                                                    <div className="bubble">
                                                        <small style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Support Team</small>
                                                        <div dangerouslySetInnerHTML={{ __html: item?.query?.replace(/\n/g, "<br>") }} />
                                                    </div>
                                                </div>
                                            ) : (
                                                // User Message
                                                <div className="message right">
                                                    <div className="bubble">
                                                        <small style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>You</small>
                                                        <div dangerouslySetInnerHTML={{ __html: item?.query?.replace(/\n/g, "<br>") }} />
                                                    </div>
                                                    <div className="avatar" style={{ backgroundColor: '#2196F3' }}>U</div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-5 text-muted">
                                        <p>No messages yet</p>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="chat-footer">
                                {ticketStatus?.toLowerCase() === 'open' ? (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Write your message here..."
                                            value={messagerply}
                                            onChange={(e) => setMessageRply(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && messagerply?.trim()) {
                                                    handleMessageQuery();
                                                }
                                            }}
                                        />
                                        <div
                                            className="icon-btn send-btn"
                                            onClick={handleMessageQuery}
                                            style={{ cursor: messagerply?.trim() ? 'pointer' : 'not-allowed', opacity: messagerply?.trim() ? 1 : 0.5 }}
                                        >
                                            ➤
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center w-100 py-2 text-muted">
                                        <i className="ri-lock-line me-2"></i>
                                        This ticket has been closed
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .rotating {
                    animation: rotate 1s linear infinite;
                }
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .chat-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                .chat-header {
                    padding: 15px 20px;
                    border-bottom: 1px solid #eee;
                }
                .chat-header h3 {
                    margin: 0 0 5px 0;
                }
                .chat-header .ticket {
                    font-size: 14px;
                    color: #666;
                }
                .chat-body {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                }
                .message {
                    display: flex;
                    margin-bottom: 15px;
                    align-items: flex-start;
                }
                .message.left {
                    justify-content: flex-start;
                }
                .message.right {
                    justify-content: flex-end;
                }
                .message .avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    flex-shrink: 0;
                }
                .message.left .avatar {
                    margin-right: 10px;
                }
                .message.right .avatar {
                    margin-left: 10px;
                }
                .message .bubble {
                    max-width: 70%;
                    padding: 12px 15px;
                    border-radius: 15px;
                    word-wrap: break-word;
                }
                .message.left .bubble {
                    background: #f0f0f0;
                    border-bottom-left-radius: 5px;
                }
                .message.right .bubble {
                    background: #007bff;
                    color: white;
                    border-bottom-right-radius: 5px;
                }
                .chat-footer {
                    display: flex;
                    padding: 15px 20px;
                    border-top: 1px solid #eee;
                    align-items: center;
                    gap: 10px;
                }
                .chat-footer input {
                    flex: 1;
                    padding: 10px 15px;
                    border: 1px solid #ddd;
                    border-radius: 25px;
                    outline: none;
                }
                .chat-footer .icon-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }
                .chat-footer .send-btn {
                    background: #007bff;
                    color: white;
                }
            `}</style>
        </>
    );
};

export default SupportPage;
