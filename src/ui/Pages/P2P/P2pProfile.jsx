import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import P2pLayout from './P2pLayout'
import AuthService from '../../../api/services/AuthService'
import { ApiConfig } from '../../../api/apiConfig/apiConfig'
import { alertSuccessMessage, alertErrorMessage } from '../../../customComponents/CustomAlertMessage'
import LoaderHelper from '../../../customComponents/Loading/LoaderHelper'
import { ProfileContext } from '../../../context/ProfileProvider'

const P2pProfile = () => {
    const navigate = useNavigate();
    const { userDetails } = useContext(ProfileContext);
    
    // Check if KYC is completed (kycVerified === 2 means verified)
    const isKycCompleted = userDetails?.kycVerified === 2;
    const kycUpdateName = userDetails?.kycUpdateName || '';
    const [activeTab, setActiveTab] = useState('payment');
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [availablePaymentMethods, setAvailablePaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);

    // Profile data state
    const [profileData, setProfileData] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

    // Add payment method modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [addStep, setAddStep] = useState(1);
    const [selectedMethodType, setSelectedMethodType] = useState(null);
    const [selectedMethodId, setSelectedMethodId] = useState('');
    const [paymentInputs, setPaymentInputs] = useState([]);
    const [paymentFormData, setPaymentFormData] = useState({});

    // Delete modal state
    const [deleteModal, setDeleteModal] = useState({ show: false, method: null });

    // Loading state for form fields
    const [loadingFields, setLoadingFields] = useState(false);

    // Fetch profile and payment methods on mount
    useEffect(() => {
        fetchProfileData();
        fetchPaymentMethods();
        fetchAvailablePaymentMethods();
    }, []);

    const fetchProfileData = async () => {
        try {
            setProfileLoading(true);
            const result = await AuthService.getP2pProfile();
            if (result?.success) {
                setProfileData(result?.data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setProfileLoading(false);
        }
    };

    const fetchPaymentMethods = async () => {
        try {
            const result = await AuthService.getUserPaymentMethods();
            if (result?.success) {
                setPaymentMethods(result?.data || []);
            }
        } catch (error) {
            console.error('Error fetching payment methods:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailablePaymentMethods = async () => {
        try {
            const result = await AuthService.getAllPaymentMethods();
            if (result?.success) {
                setAvailablePaymentMethods(result?.data || []);
            }
        } catch (error) {
            console.error('Error fetching available payment methods:', error);
        }
    };

    // Get fields for selected payment method
    const getPaymentMethodFields = async (templateId) => {
        try {
            setLoadingFields(true);
            const result = await AuthService.getPaymentMethodFields(templateId);
            setLoadingFields(false);
            // API returns result.data as array directly (not result.data.fields)
            if (result?.success && result?.data?.length > 0) {
                setPaymentInputs(result.data);
            } else {
                alertErrorMessage('No fields available for this payment method');
                setPaymentInputs([]);
            }
        } catch (error) {
            setLoadingFields(false);
            console.error('Error fetching payment method fields:', error);
            alertErrorMessage('Failed to load payment method fields');
            setPaymentInputs([]);
        }
    };

    // Handle method type selection
    const handleSelectMethodType = (method) => {
        if (!isKycCompleted) {
            alertErrorMessage("Please complete KYC verification before adding a payment method.");
            return;
        }
        setSelectedMethodType(method);
        setSelectedMethodId(method._id);
        setPaymentFormData({ name: method.name });
        getPaymentMethodFields(method._id);
        setAddStep(2);
    };

    // Handle input change
    const handleInputChange = (field, value) => {
        setPaymentFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle file input
    const handleFileChange = (field, file) => {
        setPaymentFormData(prev => ({ ...prev, [field]: file }));
    };

    // Format label
    const formatLabel = (text) => {
        return text
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase())
            .trim();
    };

    // Submit payment method
    const handleSubmitPaymentMethod = async () => {
        // Check KYC before submitting
        if (!isKycCompleted) {
            alertErrorMessage("Please complete KYC verification before adding a payment method.");
            return;
        }

        // Validate required fields
        for (let item of paymentInputs) {
            if (item.type !== "files" && item.type !== "file") {
                if (!paymentFormData[item.field] || paymentFormData[item.field].toString().trim() === "") {
                    alertErrorMessage(`Please enter ${formatLabel(item.label || item.field)}`);
                    return;
                }
            }
        }

        try {
            LoaderHelper.loaderStatus(true);
            const formDataObj = new FormData();
            Object.entries(paymentFormData).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formDataObj.append(key, value);
                }
            });
            if (selectedMethodId) {
                formDataObj.append("templateId", selectedMethodId);
            }

            const result = await AuthService.addUserPaymentMethod(formDataObj);
            LoaderHelper.loaderStatus(false);

            if (result?.success) {
                alertSuccessMessage(result?.message || 'Payment method added successfully');
                fetchPaymentMethods();
                closeAddModal();
            } else {
                alertErrorMessage(result?.message || 'Failed to add payment method');
            }
        } catch (error) {
            LoaderHelper.loaderStatus(false);
            alertErrorMessage('Something went wrong');
        }
    };

    // Close add modal
    const closeAddModal = () => {
        setShowAddModal(false);
        setAddStep(1);
        setSelectedMethodType(null);
        setSelectedMethodId('');
        setPaymentInputs([]);
        setPaymentFormData({});
        setLoadingFields(false);
    };

    // Delete payment method
    const handleDeletePaymentMethod = async () => {
        if (!deleteModal.method) return;

        try {
            LoaderHelper.loaderStatus(true);
            const result = await AuthService.deleteUserPaymentMethod(deleteModal.method._id);
            LoaderHelper.loaderStatus(false);

            if (result?.success) {
                alertSuccessMessage(result?.message || 'Payment method deleted');
                setPaymentMethods(prev => prev.filter(m => m._id !== deleteModal.method._id));
                setDeleteModal({ show: false, method: null });
            } else {
                alertErrorMessage(result?.message || 'Failed to delete payment method');
            }
        } catch (error) {
            LoaderHelper.loaderStatus(false);
            alertErrorMessage('Something went wrong');
        }
    };

    return (
        <P2pLayout title="User Profile">
            <div className="p2p-dashboard-container">
                {/* Profile Header */}
                <div className="p2p-profile-header">
                    <div className="p2p-profile-header-inner mobileview">
                        {/* User Info */}
                        <div className="p2p-profile-user">
                            <div className="p2p-profile-avatar">
                                {profileData?.profilePicture ? (
                                    <img
                                        src={`${ApiConfig.baseImage}${profileData.profilePicture}`}
                                        alt="Profile"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                    />
                                ) : null}
                                <span style={{ display: profileData?.profilePicture ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                                    {profileData?.username?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                                <div className="p2p-profile-online-dot"></div>
                            </div>
                            <div>
                                <div className="p2p-profile-name-row">
                                    <h3 className="p2p-profile-name">
                                        {profileLoading ? '...' : (profileData?.username || 'User')}
                                        {profileData?.kycVerified === 2 && (
                                            <span className="p2p-profile-verified-badge" title="KYC Verified">
                                                <i className="ri-verified-badge-fill"></i>
                                            </span>
                                        )}
                                    </h3>
                                    {profileData?.isOwnProfile && (
                                        <button
                                            className="p2p-profile-edit-btn"
                                            onClick={() => navigate('/user_profile/profile_setting')}
                                        >
                                            <i className="ri-edit-line"></i>
                                        </button>
                                    )}
                                </div>
                                {/* <div className="p2p-profile-badges">
                                   
                                    <span className="p2p-profile-badge verified">
                                        <i className="ri-check-line"></i> KYC
                                    </span>
                                </div> */}
                            </div>
                        </div>

                        {/* Rating & Reviews */}
                        {/* {profileData?.stats && (
                            <div className="p2p-profile-funding">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="ri-star-fill" style={{ color: '#fbbf24', fontSize: '20px' }}></i>
                                    <span style={{ color: '#e5e5e5', fontSize: '18px', fontWeight: '600' }}>
                                        {profileData.stats.averageRating?.toFixed(1) || '0.0'}
                                    </span>
                                    <span style={{ color: '#6b7280', fontSize: '13px' }}>
                                        ({profileData.stats.totalReviews || 0} reviews)
                                    </span>
                                </div>
                            </div>
                        )} */}
                    </div>
                </div>

                {/* Stats */}
                <div className="p2p-myads-stats-grid">
                    {[
                        { label: 'Total Trades', value: profileData?.stats?.totalTrades || 0 },
                        { label: 'Completion Rate', value: `${profileData?.stats?.completionRate?.toFixed(1) || 0}%` },
                        { label: 'Positive Feedback', value: `${profileData?.stats?.positiveFeedback?.toFixed(1) || 0}%` },
                        { label: 'Total Ads', value: profileData?.ads?.totalAds || 0 },
                        { label: 'Active Ads', value: profileData?.ads?.activeAds || 0 },
                        { label: 'Buy / Sell Ads', value: `${profileData?.ads?.buyAds || 0} / ${profileData?.ads?.sellAds || 0}` }
                    ].map((stat, idx) => (
                        <div key={idx} className="p2p-myads-stat-card">
                            <div className="p2p-myads-stat-card-label">{stat.label}</div>
                            <div className="p2p-myads-stat-card-value">{profileLoading ? '...' : stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}

                <h4 className='p2p-profile-tab'>
                    <i className={"ri-bank-card-line"}></i> P2P Payment Methods

                </h4>

                {/* <div className="p2p-profile-tabs ">
                    <div className="p2p-profile-tabs-inner">
                        {[
                            { id: 'payment', label: 'P2P Payment Methods', icon: 'ri-bank-card-line' },
                            // { id: 'feedback', label: 'Feedback (0)', icon: 'ri-star-line' },
                            // { id: 'blocked', label: 'Blocked Users', icon: 'ri-user-forbid-line' },
                            // { id: 'follows', label: 'Follows', icon: 'ri-user-follow-line' },
                            // { id: 'restrictions', label: 'Restrictions', icon: 'ri-shield-line' },
                            // { id: 'notification', label: 'Notification', icon: 'ri-notification-line' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                className={`p2p-profile-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <i className={tab.icon}></i>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div> */}

                {/* Payment Methods Section */}
                {activeTab === 'payment' && (
                    <>
                        <div className="p2p-profile-section-header">
                            <p className="p2p-profile-section-desc">
                                Add your payment methods for P2P trading. You can add up to 20 payment methods.
                            </p>
                            <div className='rightalien'>
                                <button
                                    className="p2p-myads-action-btn"
                                    onClick={() => {
                                        if (!isKycCompleted) {
                                            alertErrorMessage("Please complete KYC verification before adding a payment method.");
                                            return;
                                        }
                                        setShowAddModal(true);
                                    }}
                                    style={{ padding: '10px 20px' }}
                                >
                                    <i className="ri-add-line"></i> Add Payment Method
                                </button>
                            </div>
                        </div>

                        {/* Payment Methods Grid */}
                        {loading ? (
                            <div className="p2p-loading-container">
                                <div className="spinner-border text-primary" role="status" />
                            </div>
                        ) : paymentMethods.length > 0 ? (
                            <div className="p2p-payment-methods-grid">
                                {paymentMethods.map(method => {
                                    const excludeKeys = ['_id', 'templateId', 'type', 'name', 'qrCode', 'userId', 'createdAt', 'updatedAt', '__v'];
                                    const displayFields = Object.entries(method).filter(
                                        ([key, value]) => !excludeKeys.includes(key) && value && value !== ''
                                    );

                                    return (
                                        <div key={method._id} className="p2p-payment-method-card">
                                            <div className="p2p-payment-method-header mobileview">
                                                <h4 className="p2p-payment-method-title">
                                                    {method.name || method.type}
                                                    {method.type && method.type !== method.name && (
                                                        <span className="p2p-payment-method-type-badge">{method.type}</span>
                                                    )}
                                                </h4>
                                                <div className="p2p-payment-method-actions">
                                                    <button
                                                        className="p2p-payment-method-btn delete"
                                                        onClick={() => setDeleteModal({ show: true, method })}
                                                    >
                                                        <i className="ri-delete-bin-line"></i>
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p2p-payment-method-body">
                                                {displayFields.map(([key, value]) => (
                                                    <div key={key} className="p2p-payment-method-field">
                                                        <span className="p2p-payment-method-label">{(key)}</span>
                                                        <span className="p2p-payment-method-value">{value}</span>
                                                    </div>
                                                ))}
                                                {method.qrCode && (
                                                    <div className="p2p-payment-method-qr">
                                                        <img
                                                            src={`${ApiConfig.baseImage}${method.qrCode}`}
                                                            alt="QR Code"
                                                            onError={(e) => e.target.style.display = 'none'}
                                                        />
                                                        <span>QR Code</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p2p-empty-state-card">
                                <i className="ri-bank-card-line"></i>
                                <p>No payment methods added yet</p>
                                <button
                                    className="p2p-myads-action-btn"
                                    onClick={() => {
                                        if (!isKycCompleted) {
                                            alertErrorMessage("Please complete KYC verification before adding a payment method.");
                                            return;
                                        }
                                        setShowAddModal(true);
                                    }}
                                >
                                    <i className="ri-add-line"></i> Add your first payment method
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Other Tabs Placeholder */}
                {activeTab !== 'payment' && (
                    <div className="p2p-empty-state-card">
                        <i className="ri-folder-line"></i>
                        <p>No data available</p>
                    </div>
                )}
            </div>

            {/* Add Payment Method Modal */}
            {showAddModal && (
                <div className="p2p-modal-overlay" onClick={closeAddModal}>
                    <div className="p2p-add-payment-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="p2p-add-payment-modal-header">
                            <h3 className="p2p-add-payment-modal-title">
                                {addStep === 1 ? 'Select Payment Method' : `Add ${selectedMethodType?.name || 'Payment Method'}`}
                            </h3>
                            <button className="p2p-modal-close-btn" onClick={closeAddModal}>
                                <i className="ri-close-line"></i>
                            </button>
                        </div>

                        <div className="p2p-add-payment-modal-body">
                            {addStep === 1 ? (
                                // Step 1: Select payment method type
                                <div className="p2p-payment-type-list">
                                    {availablePaymentMethods.map(method => (
                                        <div
                                            key={method._id}
                                            className="p2p-payment-type-item"
                                            onClick={() => handleSelectMethodType(method)}
                                        >
                                            <span className="p2p-payment-type-name">{method.name}</span>
                                            <i className="ri-arrow-right-s-line"></i>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // Step 2: Fill in details
                                <div className="p2p-payment-form">
                                    {!isKycCompleted && (
                                        <div className="alert alert-warning mb-4" role="alert" style={{ 
                                            background: 'rgba(245, 158, 11, 0.1)', 
                                            border: '1px solid rgba(245, 158, 11, 0.3)',
                                            borderRadius: '10px',
                                            padding: '12px 16px',
                                            marginBottom: '20px',
                                            color: '#d4a574'
                                        }}>
                                            <strong>KYC Verification Required:</strong> Please complete your KYC verification before adding a payment method.
                                        </div>
                                    )}
                                    {kycUpdateName && (
                                        <div className="p2p-payment-form-group">
                                            <label className="p2p-payment-form-label">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                className="p2p-payment-form-input"
                                                value={kycUpdateName}
                                                disabled
                                                style={{ 
                                                    backgroundColor: '#1a1a2e', 
                                                    cursor: 'not-allowed', 
                                                    opacity: 0.6 
                                                }}
                                            />
                                            <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                                This name is taken from your KYC verification
                                            </small>
                                        </div>
                                    )}
                                    {loadingFields ? (
                                        <div className="p2p-loading-container">
                                            <div className="spinner-border text-primary" role="status" />
                                            <p style={{ color: '#6b7280', marginTop: '12px', fontSize: '13px' }}>Loading fields...</p>
                                        </div>
                                    ) : paymentInputs.length > 0 ? (
                                        paymentInputs.map((input, idx) => {
                                            // Pre-fill name fields with kycUpdateName if KYC is completed
                                            const isNameField = false
                                            const defaultValue = isNameField && isKycCompleted && kycUpdateName && !paymentFormData[input.field] 
                                                                ? kycUpdateName 
                                                                : paymentFormData[input.field] || '';

                                            return (
                                                <div key={idx} className="p2p-payment-form-group">
                                                    <label className="p2p-payment-form-label">
                                                        {(input.label || input.field)}
                                                        {input.type !== 'file' && input.type !== 'files' && (
                                                            <span className="p2p-required">*</span>
                                                        )}
                                                    </label>
                                                    {input.type === 'file' || input.type === 'files' ? (
                                                        <div className="p2p-payment-file-input">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => handleFileChange(input.field, e.target.files[0])}
                                                                id={`file-${idx}`}
                                                                disabled={!isKycCompleted}
                                                            />
                                                            <label htmlFor={`file-${idx}`} className="p2p-payment-file-label" style={{ 
                                                                opacity: !isKycCompleted ? 0.6 : 1,
                                                                cursor: !isKycCompleted ? 'not-allowed' : 'pointer'
                                                            }}>
                                                                <i className="ri-upload-cloud-line"></i>
                                                                {paymentFormData[input.field]?.name || 'Upload QR Code (Optional)'}
                                                            </label>
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type={input.type || 'text'}
                                                            className="p2p-payment-form-input"
                                                            placeholder={isNameField && isKycCompleted && kycUpdateName ? kycUpdateName : `${(input.label || input.field)}`}
                                                            value={defaultValue}
                                                            onChange={(e) => handleInputChange(input.field, e.target.value)}
                                                            disabled={!isKycCompleted}
                                                            style={{ 
                                                                opacity: !isKycCompleted ? 0.6 : 1,
                                                                cursor: !isKycCompleted ? 'not-allowed' : 'text'
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p2p-empty-state-card" style={{ padding: '24px' }}>
                                            <i className="ri-error-warning-line"></i>
                                            <p>No fields available for this payment method</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p2p-add-payment-modal-footer">
                            {addStep === 2 && (
                                <button
                                    className="p2p-modal-btn secondary"
                                    onClick={() => setAddStep(1)}
                                >
                                    <i className="ri-arrow-left-line"></i> Back
                                </button>
                            )}
                            {addStep === 2 && (
                                <button
                                    className="p2p-modal-btn primary"
                                    onClick={handleSubmitPaymentMethod}
                                    disabled={!isKycCompleted}
                                    style={{ 
                                        opacity: !isKycCompleted ? 0.6 : 1,
                                        cursor: !isKycCompleted ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <i className="ri-check-line"></i> Confirm
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="p2p-modal-overlay" onClick={() => setDeleteModal({ show: false, method: null })}>
                    <div className="p2p-delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="p2p-delete-modal-icon">
                            <i className="ri-delete-bin-line"></i>
                        </div>
                        <h3 className="p2p-delete-modal-title">Delete Payment Method?</h3>
                        <p className="p2p-delete-modal-desc">
                            Are you sure you want to delete "{deleteModal.method?.name}"? This action cannot be undone.
                        </p>
                        <div className="p2p-delete-modal-actions">
                            <button
                                className="p2p-modal-btn secondary"
                                onClick={() => setDeleteModal({ show: false, method: null })}
                            >
                                Cancel
                            </button>
                            <button
                                className="p2p-modal-btn danger"
                                onClick={handleDeletePaymentMethod}
                            >
                                <i className="ri-delete-bin-line"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </P2pLayout>
    )
}

export default P2pProfile
