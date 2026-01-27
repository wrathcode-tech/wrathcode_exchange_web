import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import AuthService from '../../../api/services/AuthService'
import { ApiConfig } from '../../../api/apiConfig/apiConfig'
import { alertErrorMessage, alertSuccessMessage } from '../../../customComponents/CustomAlertMessage'
import { useP2PChat } from './hooks/useP2PChat'
import P2pLayout from './P2pLayout'
import './p2p.css'

// Common emoji list
const EMOJI_LIST = [
    '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
    '😉', '😍', '🥰', '😘', '😋', '😎', '🤔', '🤨', '😐', '😑',
    '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫',
    '😴', '🤤', '😛', '😜', '😝', '🤑', '🤗', '🤭', '🤫', '🤥',
    '👍', '👎', '👌', '✌️', '🤞', '🤝', '👏', '🙌', '👋', '🤚',
    '✅', '❌', '❓', '❗', '💯', '💰', '💵', '💸', '🏦', '💳'
]

const P2pOrderDetails = () => {
    const { adId } = useParams()
    const [orderDetails, setOrderDetails] = useState(null)
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, expired: false })
    const [loading, setLoading] = useState(true)
    const [showNotice, setShowNotice] = useState(true)
    const [step1Expanded, setStep1Expanded] = useState(true)
    
    // Cancel popup states
    const [showCancelPopup, setShowCancelPopup] = useState(false)
    const [cancelReason, setCancelReason] = useState('')
    const [customReason, setCustomReason] = useState('')
    const [cancelLoading, setCancelLoading] = useState(false)

    // Payment confirmation popup states (for buyer)
    const [showPaymentConfirmPopup, setShowPaymentConfirmPopup] = useState(false)
    const [paymentProofFile, setPaymentProofFile] = useState(null)
    const [paymentProofPreview, setPaymentProofPreview] = useState(null)
    const [markingPayment, setMarkingPayment] = useState(false)
    const paymentProofRef = useRef(null)

    // Release crypto popup states (for seller)
    const [showReleasePopup, setShowReleasePopup] = useState(false)
    const [releaseConfirmed, setReleaseConfirmed] = useState(false)
    const [releasingCrypto, setReleasingCrypto] = useState(false)

    // Appeal/Dispute popup states
    const [showAppealPopup, setShowAppealPopup] = useState(false)
    const [appealReason, setAppealReason] = useState('')
    const [appealLoading, setAppealLoading] = useState(false)

    // Welcome popup states
    const [showWelcomePopup, setShowWelcomePopup] = useState(false)
    const [welcomeTab, setWelcomeTab] = useState('howToPay')

    // Time warning popup states
    const [showBuyerTimeWarningPopup, setShowBuyerTimeWarningPopup] = useState(false)
    const [showSellerPaidPopup, setShowSellerPaidPopup] = useState(false)
    const [timeWarningShown, setTimeWarningShown] = useState(false)
    const [sellerPaidPopupShown, setSellerPaidPopupShown] = useState(false)

    // Predefined cancel reasons
    const CANCEL_REASONS = [
        "I don't want to trade anymore",
        "Seller is not responding",
        "Seller is asking for extra fees",
        "Payment method not available",
        "Price has changed significantly",
        "Found a better offer",
        "Made a mistake in the order",
        "Other"
    ]
    
    // Chat UI states
    const [chatMessage, setChatMessage] = useState('')
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const fileInputRef = useRef(null)
    const emojiPickerRef = useRef(null)
    const messagesEndRef = useRef(null)
    const messagesContainerRef = useRef(null)
    
    // Mobile tab state
    const [mobileTab, setMobileTab] = useState('details')

    // Get current user ID from storage
    const currentUserId = localStorage.getItem('userId') || localStorage.getItem('userId')

    // Fetch order details function
    const fetchOrderDetails = useCallback(async () => {
        try {
            setLoading(true)
            const response = await AuthService.getP2pOrderDetails(adId)
            if (response?.success) {
                setOrderDetails(response?.data)
            } else {
                alertErrorMessage(response?.message || "Failed to fetch order details")
            }
        } catch (error) {
            console.error("Error fetching order details:", error)
            alertErrorMessage(error?.response?.data?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }, [adId])

    // Callback when order status changes via socket
    const handleOrderStatusChange = useCallback((action, metadata) => {
        // Show notification based on action
        const notifications = {
            'PAYMENT_MARKED': 'Buyer has marked the payment as completed!',
            'CRYPTO_RELEASED': 'Crypto has been released! Transaction complete.',
            'ORDER_CANCELLED': 'Order has been cancelled.',
            'DISPUTE_OPENED': 'A dispute has been opened for this order.',
            'DISPUTE_RESOLVED': 'The dispute has been resolved.',
            'ORDER_EXPIRED': 'Order has expired due to payment timeout.'
        }
        
        if (notifications[action]) {
            if (['CRYPTO_RELEASED', 'DISPUTE_RESOLVED'].includes(action)) {
                alertSuccessMessage(notifications[action])
            } else if (['ORDER_CANCELLED', 'ORDER_EXPIRED'].includes(action)) {
                alertErrorMessage(notifications[action])
            } else {
                alertSuccessMessage(notifications[action])
            }
        }
        
        // Refresh order details
        fetchOrderDetails()
    }, [fetchOrderDetails])

    // Use P2P Chat hook with status change callback
    const {
        messages: chatMessages,
        isConnected,
        counterpartyTyping,
        counterpartyOnline,
        loading: chatLoading,
        error: chatError,
        hasMore,
        sending,
        uploading,
        sendMessage,
        uploadImage,
        sendTyping,
        markAsRead,
        loadMore
    } = useP2PChat(adId, currentUserId, handleOrderStatusChange)

    // Determine user role based on buyer/seller IDs
    const getUserRole = () => {
        if (!orderDetails || !currentUserId) return null
        if (orderDetails.buyer?.id === currentUserId) return 'BUYER'
        if (orderDetails.seller?.id === currentUserId) return 'SELLER'
        return null
    }

    const userRole = getUserRole()

    // Alias for backward compatibility in handlers
    const getOrderDetails = fetchOrderDetails

    useEffect(() => {
        if (adId) {
            fetchOrderDetails()
        }
    }, [adId, fetchOrderDetails])

    // Close cancel popup if status is no longer cancellable
    useEffect(() => {
        const cancellableStatuses = ['PENDING_PAYMENT', 'PAID']
        if (orderDetails?.status && !cancellableStatuses.includes(orderDetails.status)) {
            setShowCancelPopup(false)
            setCancelReason('')
            setCustomReason('')
        }
    }, [orderDetails?.status])

    // Show welcome popup on first visit (only for buyer)
    useEffect(() => {
        const hasSeenWelcome = localStorage.getItem('p2p_welcome_seen')
        if (!hasSeenWelcome && userRole === 'BUYER' && orderDetails?.status === 'PENDING_PAYMENT') {
            setShowWelcomePopup(true)
        }
    }, [userRole, orderDetails?.status])

    const handleCloseWelcomePopup = () => {
        localStorage.setItem('p2p_welcome_seen', 'true')
        setShowWelcomePopup(false)
    }

    // Countdown timer
    useEffect(() => {
        if (!orderDetails?.expiresAt) return

        const calculateTimeLeft = () => {
            const now = new Date().getTime()
            const expiresAt = new Date(orderDetails.expiresAt).getTime()
            const difference = expiresAt - now

            if (difference <= 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true })
                return
            }

            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((difference % (1000 * 60)) / 1000)
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

            setTimeLeft({ hours, minutes, seconds, expired: false })
        }

        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 1000)

        return () => clearInterval(timer)
    }, [orderDetails?.expiresAt])

    // Calculate total seconds remaining
    const totalSecondsRemaining = timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds

    // Show buyer warning popup when 2 minutes or less remaining
    useEffect(() => {
        if (
            userRole === 'BUYER' &&
            orderDetails?.status === 'PENDING_PAYMENT' &&
            totalSecondsRemaining > 0 &&
            totalSecondsRemaining <= 120 &&
            !timeWarningShown &&
            !timeLeft.expired
        ) {
            setShowBuyerTimeWarningPopup(true)
            setTimeWarningShown(true)
        }
    }, [totalSecondsRemaining, userRole, orderDetails?.status, timeWarningShown, timeLeft.expired])

    // Show seller popup when status is PAID
    useEffect(() => {
        if (
            userRole === 'SELLER' &&
            orderDetails?.status === 'PAID' &&
            !sellerPaidPopupShown
        ) {
            setShowSellerPaidPopup(true)
            setSellerPaidPopupShown(true)
        }
    }, [userRole, orderDetails?.status, sellerPaidPopupShown])

    // Reset popup flags when order status changes
    useEffect(() => {
        if (orderDetails?.status !== 'PENDING_PAYMENT') {
            setTimeWarningShown(false)
        }
        if (orderDetails?.status !== 'PAID') {
            setSellerPaidPopupShown(false)
        }
    }, [orderDetails?.status])

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        alertSuccessMessage("Copied to clipboard!")
    }

    const formatTimer = (num) => {
        return num.toString().padStart(2, '0')
    }

    // Handle cancel order - only buyer can cancel for PENDING_PAYMENT and PAID statuses
    const handleCancelOrder = async () => {
        // Safety check - only buyer can cancel
        if (userRole !== 'BUYER') {
            alertErrorMessage('Only buyer can cancel the order')
            setShowCancelPopup(false)
            return
        }

        // Safety check - only allow cancel for PENDING_PAYMENT or PAID status
        const allowedStatuses = ['PENDING_PAYMENT', 'PAID']
        if (!allowedStatuses.includes(orderDetails?.status)) {
            alertErrorMessage('Order cannot be cancelled at this stage')
            setShowCancelPopup(false)
            return
        }

        const reason = cancelReason === 'Other' ? customReason : cancelReason
        
        if (!reason.trim()) {
            alertErrorMessage('Please select or enter a reason for cancellation')
            return
        }

        try {
            setCancelLoading(true)
            const response = await AuthService.cancelP2pOrder(adId, reason)
            if (response?.success) {
                // alertSuccessMessage('Order cancelled successfully')
                setShowCancelPopup(false)
                setCancelReason('')
                setCustomReason('')
                getOrderDetails() // Refresh order details
            } else {
                alertErrorMessage(response?.message || 'Failed to cancel order')
            }
        } catch (error) {
            console.error('Cancel order error:', error)
            alertErrorMessage(error?.response?.data?.message || 'Failed to cancel order')
        } finally {
            setCancelLoading(false)
        }
    }

    // Handle payment proof file selection
    const handlePaymentProofSelect = (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
            alertErrorMessage('Please select a valid image file')
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            alertErrorMessage('File size should be less than 10MB')
            return
        }

        setPaymentProofFile(file)
        const reader = new FileReader()
        reader.onloadend = () => setPaymentProofPreview(reader.result)
        reader.readAsDataURL(file)
    }

    // Handle mark payment completed (buyer)
    const handleMarkPaymentCompleted = async () => {
        // Require payment proof
        if (!paymentProofFile) {
            alertErrorMessage('Please upload a payment screenshot as proof')
            return
        }

        try {
            setMarkingPayment(true)
            const response = await AuthService.markPaymentCompleted(adId, paymentProofFile)
            if (response?.success) {
                alertSuccessMessage('Payment marked as completed! Seller has been notified.')
                setShowPaymentConfirmPopup(false)
                setPaymentProofFile(null)
                setPaymentProofPreview(null)
                getOrderDetails() // Refresh order details
            } else {
                alertErrorMessage(response?.message || 'Failed to mark payment')
            }
        } catch (error) {
            console.error('Mark payment error:', error)
            alertErrorMessage(error?.response?.data?.message || 'Failed to mark payment')
        } finally {
            setMarkingPayment(false)
        }
    }

    // Handle release crypto (seller)
    const handleReleaseCrypto = async () => {
        if (!releaseConfirmed) {
            alertErrorMessage('Please confirm that you have received the payment')
            return
        }

        try {
            setReleasingCrypto(true)
            const response = await AuthService.releaseCrypto(adId)
            if (response?.success) {
                alertSuccessMessage('Crypto released successfully! Transaction complete.')
                setShowReleasePopup(false)
                setReleaseConfirmed(false)
                getOrderDetails() // Refresh order details
            } else {
                alertErrorMessage(response?.message || 'Failed to release crypto')
            }
        } catch (error) {
            console.error('Release crypto error:', error)
            alertErrorMessage(error?.response?.data?.message || 'Failed to release crypto')
        } finally {
            setReleasingCrypto(false)
        }
    }

    // Handle raise appeal/dispute
    const handleRaiseAppeal = async () => {
        if (!appealReason.trim() || appealReason.trim().length < 10) {
            alertErrorMessage('Please provide a detailed reason (at least 10 characters)')
            return
        }

        try {
            setAppealLoading(true)
            // Call appropriate API based on user role
            let response
            if (userRole === 'BUYER') {
                response = await AuthService.buyerRaiseDispute(adId, appealReason.trim())
            } else {
                response = await AuthService.sellerRaiseDispute(adId, appealReason.trim())
            }
            
            if (response?.success) {
                alertSuccessMessage('Appeal submitted successfully! Our support team will review your case.')
                setShowAppealPopup(false)
                setAppealReason('')
                getOrderDetails() // Refresh order details
            } else {
                alertErrorMessage(response?.message || 'Failed to submit appeal')
            }
        } catch (error) {
            console.error('Raise appeal error:', error)
            alertErrorMessage(error?.response?.data?.message || 'Failed to submit appeal')
        } finally {
            setAppealLoading(false)
        }
    }

    // Handle emoji selection
    const handleEmojiClick = (emoji) => {
        setChatMessage(prev => prev + emoji)
        setShowEmojiPicker(false)
    }

    // Handle image selection
    const handleImageSelect = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
            alertErrorMessage('Please select a valid image file (jpg, png, gif, webp)')
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            alertErrorMessage("Image size should be less than 10MB")
            return
        }

        setSelectedImage(file)
        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result)
        }
        reader.readAsDataURL(file)
    }

    const removeSelectedImage = () => {
        setSelectedImage(null)
        setImagePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSendMessage = async () => {
        if (selectedImage) {
            try {
                await uploadImage(selectedImage)
                removeSelectedImage()
            } catch (err) {
                alertErrorMessage(err?.message || 'Failed to upload image')
            }
        }

        if (chatMessage.trim()) {
            try {
                await sendMessage(chatMessage.trim())
                setChatMessage('')
            } catch (err) {
                alertErrorMessage(err?.message || 'Failed to send message')
            }
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const handleInputChange = (e) => {
        setChatMessage(e.target.value)
        sendTyping(true)
    }

    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            scrollToBottom()
        }, 100)
        return () => clearTimeout(timer)
    }, [chatMessages, scrollToBottom])

    useEffect(() => {
        if (mobileTab === 'chat') {
            setTimeout(scrollToBottom, 200)
        }
    }, [mobileTab, scrollToBottom])

    // Mark messages as read when:
    // 1. User connects to chat (desktop always visible)
    // 2. User switches to chat tab (mobile)
    useEffect(() => {
        if (isConnected) {
            // On desktop, always mark as read since chat is always visible
            // On mobile, only mark as read when on chat tab
            const isMobile = window.innerWidth <= 768
            if (!isMobile || mobileTab === 'chat') {
                markAsRead()
            }
        }
    }, [isConnected, mobileTab, markAsRead])

    const handleChatScroll = (e) => {
        if (e.target.scrollTop === 0 && hasMore && !chatLoading) {
            loadMore()
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const formatChatTime = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const getMessageStatusIcon = (status) => {
        switch (status) {
            case 'SENDING':
            case 'UPLOADING':
                return <i className="ri-time-line msg-status sending"></i>
            case 'SENT':
                return <i className="ri-check-line msg-status sent"></i>
            case 'DELIVERED':
                return <i className="ri-check-double-line msg-status delivered"></i>
            case 'READ':
                return <i className="ri-check-double-line msg-status read"></i>
            default:
                return null
        }
    }

    // Get progress step status
    const getStepStatus = (step) => {
        const status = orderDetails?.status
        if (step === 1) return 'completed'
        if (step === 2) {
            if (['PAID', 'RELEASED', 'COMPLETED'].includes(status)) return 'completed'
            if (status === 'PENDING_PAYMENT') return 'active'
            return 'pending'
        }
        if (step === 3) {
            if (['RELEASED', 'COMPLETED'].includes(status)) return 'completed'
            if (status === 'PAID') return 'active'
            return 'pending'
        }
        return 'pending'
    }

    if (loading) {
        return (
            <P2pLayout title="Order Details">
                <div className="binance-order-container">
                    <div className="binance-loading">
                        <div className="spinner-border" role="status" />
                        <p>Loading order details...</p>
                    </div>
                </div>
            </P2pLayout>
        )
    }

    const counterpartyUser = userRole === 'BUYER' ? orderDetails?.seller : orderDetails?.buyer

    return (
        <P2pLayout title="Order Details">
            <div className="binance-order-container">
                {/* Order Completed Banner */}
                {['RELEASED', 'COMPLETED'].includes(orderDetails?.status) && (
                    <div className="order-status-banner success">
                        <div className="banner-icon">
                            <i className="ri-checkbox-circle-fill"></i>
                        </div>
                        <div className="banner-content">
                            <h3>Order Completed Successfully!</h3>
                            <p>
                                {userRole === 'BUYER' 
                                    ? `You have successfully received ${orderDetails?.cryptoAmount} ${orderDetails?.adSummary?.qouteCurrency}.`
                                    : `You have successfully sold ${orderDetails?.cryptoAmount} ${orderDetails?.adSummary?.qouteCurrency} and received ₹${orderDetails?.fiatAmount?.toLocaleString()}.`
                                }
                            </p>
                        </div>
                    </div>
                )}

                {/* Order Cancelled Banner */}
                {orderDetails?.status === 'CANCELLED' && (
                    <div className="order-status-banner cancelled">
                        <div className="banner-icon">
                            <i className="ri-close-circle-fill"></i>
                        </div>
                        <div className="banner-content">
                            <h3>Order Cancelled</h3>
                            <p>This order has been cancelled. No funds have been exchanged.</p>
                        </div>
                    </div>
                )}

                {/* Order Disputed Banner */}
                {orderDetails?.status === 'DISPUTE' && (
                    <div className="order-status-banner disputed">
                        <div className="banner-icon">
                            <i className="ri-error-warning-fill"></i>
                        </div>
                        <div className="banner-content">
                            <h3>Order Under Dispute</h3>
                            <p>This order is currently under review. Our support team will resolve this shortly.</p>
                        </div>
                    </div>
                )}

                {/* Mobile Tabs */}
                <div className="binance-mobile-tabs">
                    <button 
                        className={`binance-tab ${mobileTab === 'details' ? 'active' : ''}`}
                        onClick={() => setMobileTab('details')}
                    >
                        <i className="ri-file-list-3-line"></i>
                        Order Details
                    </button>
                    <button 
                        className={`binance-tab ${mobileTab === 'chat' ? 'active' : ''}`}
                        onClick={() => setMobileTab('chat')}
                    >
                        <i className="ri-chat-3-line"></i>
                        Chat
                    </button>
                </div>

                <div className="binance-order-layout">
                    {/* Left Side - Order Details */}
                    <div className={`binance-order-details ${mobileTab !== 'details' ? 'mobile-hidden' : ''}`}>
                        {/* Header with Timer */}
                        <div className="binance-order-header">
                            <div className="header-left">
                                <h1 className="binance-order-title">
                                    {userRole === 'SELLER' ? 'Verify Payment' : `${userRole === 'BUYER' ? 'Buy' : 'Sell'} ${orderDetails?.adSummary?.qouteCurrency}`}
                                </h1>
                                <div className="binance-order-number">
                                    <span>Order Id</span>
                                    <span 
                                        className="order-id"
                                        onClick={() => copyToClipboard(orderDetails?.orderId)}
                                    >
                                        {orderDetails?.orderId}
                                        <i className="ri-file-copy-line"></i>
                                    </span>
                                </div>
                            </div>
                            
                            {/* Timer in top right */}
                            {orderDetails?.status === 'PENDING_PAYMENT' && (
                                <div className={`binance-timer ${timeLeft.expired ? 'expired' : ''}`}>
                                    {timeLeft.expired ? (
                                        <span className="timer-expired">
                                            <i className="ri-time-line"></i>
                                            Time Expired
                                        </span>
                                    ) : (
                                        <>
                                            <span className="timer-label">Expires in</span>
                                            <span className="timer-value">
                                                {formatTimer(timeLeft.hours)}:{formatTimer(timeLeft.minutes)}:{formatTimer(timeLeft.seconds)}
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Progress Steps */}
                        <div className="binance-progress-steps">
                            {/* Step 1: Order Created - Collapsible */}
                            <div className={`binance-step ${getStepStatus(1)} collapsible`}>
                                <div className="step-indicator">
                                    <div className="step-icon">
                                        <i className="ri-check-line"></i>
                                    </div>
                                    <div className="step-line"></div>
                                </div>
                                <div className="step-content">
                                    <div 
                                        className="step-header-clickable"
                                        onClick={() => setStep1Expanded(!step1Expanded)}
                                    >
                                        <h4>Order Created</h4>
                                        <i className={`ri-arrow-${step1Expanded ? 'up' : 'down'}-s-line`}></i>
                                    </div>
                                    
                                    {/* Collapsible Order Details */}
                                    {step1Expanded && (
                                        <div className="step-dropdown-content">
                                            <div className="order-info-grid">
                                                <div className="order-info-row">
                                                    <span className="info-label">Amount</span>
                                                    <span className="info-value ">
                                                        {orderDetails?.fiatAmount?.toLocaleString()} {orderDetails?.adSummary?.fiatCurrency}
                                                    </span>
                                                </div>
                                                <div className="order-info-row">
                                                    <span className="info-label">Price</span>
                                                    <span className="info-value">
                                                        {orderDetails?.price?.toLocaleString()} {orderDetails?.adSummary?.fiatCurrency}
                                                    </span>
                                                </div>
                                                <div className="order-info-row">
                                                    <span className="info-label">Quantity</span>
                                                    <span className="info-value">
                                                        {orderDetails?.cryptoAmount} {orderDetails?.adSummary?.qouteCurrency}
                                                    </span>
                                                </div>
                                                <div className="order-info-row">
                                                    <span className="info-label">Order Id</span>
                                                    <span 
                                                        className="info-value copyable"
                                                        onClick={() => copyToClipboard(orderDetails?.orderId)}
                                                    >
                                                        {orderDetails?.orderId?.slice(0, 16)}...
                                                        <i className="ri-file-copy-line"></i>
                                                    </span>
                                                </div>
                                                <div className="order-info-row">
                                                    <span className="info-label">Created At</span>
                                                    <span className="info-value">
                                                        {new Date(orderDetails?.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Step 2: Payment */}
                            <div className={`binance-step ${getStepStatus(2)}`}>
                                <div className="step-indicator">
                                    <div className="step-icon">
                                        {getStepStatus(2) === 'completed' ? (
                                            <i className="ri-check-line"></i>
                                        ) : (
                                            <span>2</span>
                                        )}
                                    </div>
                                    <div className="step-line"></div>
                                </div>
                                <div className="step-content">
                                    <h4>
                                        {userRole === 'SELLER' 
                                            ? `Confirm payment from buyer: ${orderDetails?.buyer?.userName || 'Buyer'}`
                                            : 'Transfer payment to seller'
                                        }
                                    </h4>
                                    <p className="step-desc">
                                        {userRole === 'SELLER'
                                            ? 'Log in to your payment account below and confirm that you have received the payment.'
                                            : 'Transfer the payment to the seller using the payment details below.'
                                        }
                                    </p>

                                    {/* Payment Details Card */}
                                    {orderDetails?.paymentDetail?.map((payment, idx) => (
                                        <div key={idx} className="binance-payment-card">
                                            <div className="payment-card-header">
                                                <span className="payment-type">{payment.type || payment.name}</span>
                                                {payment.qrCode && (
                                                    <div 
                                                        className="payment-qr"
                                                        onClick={() => window.open(`${ApiConfig.baseImage}${payment.qrCode}`, '_blank')}
                                                    >
                                                        <img src={`${ApiConfig.baseImage}${payment.qrCode}`} alt="QR" />
                                                        <span>Scan QR</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="payment-details-grid">
                                                <div className="payment-row highlight">
                                                    <span className="label">{userRole === 'BUYER' ? 'You Pay' : 'You Receive'}</span>
                                                    <span className={`value amount `}>
                                                        ₹ {orderDetails?.fiatAmount?.toLocaleString()}
                                                        <i className="ri-file-copy-line" onClick={() => copyToClipboard(orderDetails?.fiatAmount?.toString())}></i>
                                                    </span>
                                                </div>
                                                {/* <div className="payment-row ">
                                                    <span className="label">{userRole === 'BUYER' ? 'Name' : 'Name'}</span>
                                                    <span className={`value amount `}>
                                                         {orderDetails?.sellerName}
                                                        <i className="ri-file-copy-line" onClick={() => copyToClipboard(orderDetails?.sellerName)}></i>
                                                    </span>
                                                </div> */}

                                                <div  className="payment-row">
                                                            <span className="label">Name</span>
                                                            <span 
                                                                className="value"
                                                                onClick={() => copyToClipboard(orderDetails?.sellerName)}
                                                            >
                                                                {orderDetails?.sellerName}
                                                                <i className="ri-file-copy-line"></i>
                                                            </span>
                                                        </div>

                                                {Object.entries(payment).map(([key, value]) => {
                                                    if (['_id', 'templateId', 'type', 'name', 'qrCode', '__v'].includes(key)) return null
                                                    if (!value) return null
                                                    
                                                    const label = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()
                                                    return (
                                                        <div key={key} className="payment-row">
                                                            <span className="label">{label.charAt(0).toUpperCase() + label.slice(1)}</span>
                                                            <span 
                                                                className="value"
                                                                onClick={() => copyToClipboard(value)}
                                                            >
                                                                {value}
                                                                <i className="ri-file-copy-line"></i>
                                                            </span>
                                                        </div>
                                                    )
                                                })}

                                                {/* <div className="payment-row buyer-info">
                                                    <span className="label">{userRole === 'SELLER' ? "Buyer's name" : "Seller's name"}</span>
                                                    <span className="value name">
                                                        {userRole === 'SELLER' ? orderDetails?.buyer?.userName : orderDetails?.seller?.userName}
                                                    </span>
                                                </div> */}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Step 3: Confirm */}
                            <div className={`binance-step ${getStepStatus(3)}`}>
                                <div className="step-indicator">
                                    <div className="step-icon">
                                        {getStepStatus(3) === 'completed' ? (
                                            <i className="ri-check-line"></i>
                                        ) : (
                                            <span>3</span>
                                        )}
                                    </div>
                                </div>
                                <div className="step-content">
                                    <h4>
                                        {userRole === 'SELLER' 
                                            ? 'Confirm payment is received.'
                                            : 'Wait for seller to release crypto.'
                                        }
                                    </h4>
                                    <p className="step-desc">
                                        {userRole === 'SELLER'
                                            ? 'Once you have confirmed that the payment has been credited to your account, click the button below to release the crypto.'
                                            : 'After you\'ve made the payment, click "I\'ve Transferred" to notify the seller.'
                                        }
                                    </p>

                                    {/* Action Buttons */}
                                    {orderDetails?.status === 'PENDING_PAYMENT' && !timeLeft.expired && (
                                        <div className="binance-action-buttons">
                                            {userRole === 'BUYER' ? (
                                                <>
                                                    <button 
                                                        className="binance-btn primary"
                                                        onClick={() => setShowPaymentConfirmPopup(true)}
                                                    >
                                                        Transferred, Notify Seller
                                                    </button>
                                                    <button 
                                                        className="binance-btn secondary"
                                                        onClick={() => setShowCancelPopup(true)}
                                                    >
                                                        Cancel Order
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button 
                                                        className="binance-btn primary"
                                                        disabled
                                                    >
                                                        <i className="ri-time-line"></i> Waiting for Buyer to Transfer
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Buttons for PAID status - Seller can release crypto */}
                                    {orderDetails?.status === 'PAID' && userRole === 'SELLER' && (
                                        <div className="binance-action-buttons">
                                            <button 
                                                className="binance-btn primary"
                                                onClick={() => setShowReleasePopup(true)}
                                            >
                                                Payment Received - Release Crypto
                                            </button>
                                            <button 
                                                className={`binance-btn appeal ${!timeLeft.expired ? 'disabled' : ''}`}
                                                onClick={() => timeLeft.expired && setShowAppealPopup(true)}
                                                disabled={!timeLeft.expired}
                                            >
                                                {!timeLeft.expired ? (
                                                    <>
                                                        <i className="ri-shield-check-line"></i>
                                                        Appeal ({formatTimer(timeLeft.hours)}:{formatTimer(timeLeft.minutes)}:{formatTimer(timeLeft.seconds)})
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="ri-shield-check-line"></i>
                                                        Appeal
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {/* Action Buttons for PAID status - Buyer waiting for release */}
                                    {orderDetails?.status === 'PAID' && userRole === 'BUYER' && (
                                        <div className="binance-action-buttons">
                                            <button 
                                                className="binance-btn primary"
                                                disabled
                                            >
                                                <i className="ri-time-line"></i> Waiting for Seller to Release
                                            </button>
                                            <button 
                                                className="binance-btn secondary"
                                                onClick={() => setShowCancelPopup(true)}
                                            >
                                                Cancel Order
                                            </button>
                                            <button 
                                                className={`binance-btn appeal ${!timeLeft.expired ? 'disabled' : ''}`}
                                                onClick={() => timeLeft.expired && setShowAppealPopup(true)}
                                                disabled={!timeLeft.expired}
                                            >
                                                {!timeLeft.expired ? (
                                                    <>
                                                        <i className="ri-shield-check-line"></i>
                                                        Appeal ({formatTimer(timeLeft.hours)}:{formatTimer(timeLeft.minutes)}:{formatTimer(timeLeft.seconds)})
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="ri-shield-check-line"></i>
                                                        Appeal
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {timeLeft.expired && orderDetails?.status === 'PENDING_PAYMENT' && (
                                        <div className="binance-expired-notice">
                                            <i className="ri-error-warning-line"></i>
                                            <span>Order has expired due to payment timeout.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Chat */}
                    <div className={`binance-chat-section ${mobileTab !== 'chat' ? 'mobile-hidden' : ''}`}>
                        <div className="binance-chat-card">
                            {/* Chat Header */}
                            <div className="binance-chat-header">
                                <div className="chat-user-info">
                                    <div className="chat-avatar">
                                        {counterpartyUser?.profilePicture ? (
                                            <img 
                                                src={`${ApiConfig.baseImage}${counterpartyUser.profilePicture}`} 
                                                alt=""
                                            />
                                        ) : (
                                            <span>{(counterpartyUser?.userName || 'U').charAt(0).toUpperCase()}</span>
                                        )}
                                        <span className={`status-dot ${counterpartyOnline ? 'online' : ''}`}></span>
                                    </div>
                                    <div className="chat-user-details">
                                        <div className="chat-username">
                                            <span>{counterpartyUser?.userName || 'User'}</span>
                                            <i className="ri-verified-badge-fill verified"></i>
                                        </div>
                                        <div className="chat-user-meta">
                                            <span className={`online-status ${counterpartyOnline ? 'online' : ''}`}>
                                                <i className="ri-checkbox-blank-circle-fill"></i>
                                                {counterpartyOnline ? 'Online now' : 'Last seen recently'}
                                            </span>
                                            <span className="divider">|</span>
                                            <span className="user-role">{userRole === 'BUYER' ? 'Seller' : 'Buyer'}</span>
                                        </div>
                                    </div>
                                </div>
                               
                            </div>

                            {/* Warning Notice */}
                            {showNotice && (
                                <div className="binance-chat-notice">
                                    <i className="ri-error-warning-line"></i>
                                    <p>
                                        Please do not make any payment for a P2P order that has been cancelled. 
                                        If you have received the payment and release the asset, make sure to log into your account 
                                        and confirm that you have received the payment before releasing the asset to avoid loss.
                                    </p>
                                    <button className="notice-close" onClick={() => setShowNotice(false)}>
                                        <i className="ri-close-line"></i>
                                    </button>
                                </div>
                            )}

                            {/* Chat Messages */}
                            <div 
                                className="binance-chat-messages"
                                ref={messagesContainerRef}
                                onScroll={handleChatScroll}
                            >
                                {hasMore && (
                                    <button 
                                        className="load-more-btn"
                                        onClick={loadMore}
                                        disabled={chatLoading}
                                    >
                                        {chatLoading ? 'Loading...' : 'Load older messages'}
                                    </button>
                                )}

                                {chatMessages.length === 0 && !chatLoading ? (
                                    <div className="chat-empty">
                                        <i className="ri-chat-3-line"></i>
                                        <p>No messages yet</p>
                                    </div>
                                ) : (
                                    chatMessages.map((msg) => {
                                        if (msg.messageType === 'SYSTEM') {
                                            return (
                                                <div key={msg._id} className="chat-message system">
                                                    <div className="system-bubble">
                                                        <p>{msg.message}</p>
                                                    </div>
                                                </div>
                                            )
                                        }

                                        const isOwn = msg.isOwn || msg.senderId === currentUserId
                                        return (
                                            <div key={msg._id} className={`chat-message ${isOwn ? 'sent' : 'received'}`}>
                                                <div className="message-bubble">
                                                    {msg.messageType === 'IMAGE' && msg.imageUrl && (
                                                        <div className="message-image">
                                                            <img 
                                                                src={msg.imageUrl.startsWith('blob:') ? msg.imageUrl : `${ApiConfig.baseImage}${msg.imageUrl}`}
                                                                alt="Shared"
                                                                onClick={() => !msg.imageUrl.startsWith('blob:') && window.open(`${ApiConfig.baseImage}${msg.imageUrl}`, '_blank')}
                                                            />
                                                            {msg.status === 'UPLOADING' && (
                                                                <div className="image-uploading">
                                                                    <i className="ri-loader-4-line spinning"></i>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {msg.message && <p>{msg.message}</p>}
                                                    <div className="message-meta">
                                                        <span className="message-time">{formatChatTime(msg.createdAt)}</span>
                                                        {isOwn && getMessageStatusIcon(msg.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}

                                {counterpartyTyping && (
                                    <div className="chat-message received">
                                        <div className="typing-bubble">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Error */}
                            {chatError && (
                                <div className="chat-error">
                                    <i className="ri-error-warning-line"></i>
                                    <span>{chatError}</span>
                                </div>
                            )}

                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="image-preview">
                                    <img src={imagePreview} alt="Preview" />
                                    <button onClick={removeSelectedImage} disabled={uploading}>
                                        <i className="ri-close-line"></i>
                                    </button>
                                </div>
                            )}

                            {/* Chat Input */}
                            <div className="binance-chat-input">
                                <button 
                                    className="input-action"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={!isConnected || uploading}
                                >
                                    {uploading ? (
                                        <i className="ri-loader-4-line spinning"></i>
                                    ) : (
                                        <i className="ri-add-circle-line"></i>
                                    )}
                                </button>
                                <input 
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    style={{ display: 'none' }}
                                    onChange={handleImageSelect}
                                />
                                
                                <input 
                                    type="text"
                                    placeholder={isConnected ? "Enter message here" : "Connecting..."}
                                    value={chatMessage}
                                    onChange={handleInputChange}
                                    onKeyPress={handleKeyPress}
                                    disabled={!isConnected}
                                />

                                <div className="input-actions-right">
                                    <div className="emoji-container" ref={emojiPickerRef}>
                                        <button 
                                            className="input-action"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            disabled={!isConnected}
                                        >
                                            <i className="ri-emotion-line"></i>
                                        </button>
                                        
                                        {showEmojiPicker && (
                                            <div className="emoji-picker">
                                                {EMOJI_LIST.map((emoji, idx) => (
                                                    <button key={idx} onClick={() => handleEmojiClick(emoji)}>
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        className={`send-btn ${(chatMessage.trim() || selectedImage) && isConnected ? 'active' : ''}`}
                                        onClick={handleSendMessage}
                                        disabled={(!chatMessage.trim() && !selectedImage) || !isConnected || sending || uploading}
                                    >
                                        {sending ? (
                                            <i className="ri-loader-4-line spinning"></i>
                                        ) : (
                                            <i className="ri-send-plane-2-fill"></i>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cancel Order Popup - For PENDING_PAYMENT and PAID status */}
                {showCancelPopup && ['PENDING_PAYMENT', 'PAID'].includes(orderDetails?.status) && (
                    <div className="binance-modal-overlay" onClick={() => setShowCancelPopup(false)}>
                        <div className="binance-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="binance-modal-header">
                                <h3>Cancel Order</h3>
                                <button 
                                    className="modal-close-btn"
                                    onClick={() => setShowCancelPopup(false)}
                                >
                                    <i className="ri-close-line"></i>
                                </button>
                            </div>
                            
                            <div className="binance-modal-body">
                                <div className="cancel-warning">
                                    <i className="ri-error-warning-line"></i>
                                    <div>
                                        <p>Are you sure you want to cancel this order?</p>
                                        <span>Please note that frequent cancellations may affect your trading privileges.</span>
                                    </div>
                                </div>

                                <div className="cancel-reasons">
                                    <label className="reason-label">Select a reason for cancellation:</label>
                                    
                                    {CANCEL_REASONS.map((reason, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`reason-option ${cancelReason === reason ? 'selected' : ''}`}
                                            onClick={() => setCancelReason(reason)}
                                        >
                                            <div className="reason-radio">
                                                {cancelReason === reason && <i className="ri-check-line"></i>}
                                            </div>
                                            <span>{reason}</span>
                                        </div>
                                    ))}

                                    {/* Custom reason input */}
                                    {cancelReason === 'Other' && (
                                        <div className="custom-reason-input">
                                            <textarea
                                                placeholder="Please describe your reason..."
                                                value={customReason}
                                                onChange={(e) => setCustomReason(e.target.value)}
                                                rows={3}
                                                maxLength={500}
                                            />
                                            <span className="char-count">{customReason.length}/500</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="binance-modal-footer">
                                <button 
                                    className="binance-btn secondary"
                                    onClick={() => {
                                        setShowCancelPopup(false)
                                        setCancelReason('')
                                        setCustomReason('')
                                    }}
                                >
                                    Go Back
                                </button>
                                <button 
                                    className="binance-btn danger"
                                    onClick={handleCancelOrder}
                                    disabled={!cancelReason || (cancelReason === 'Other' && !customReason.trim()) || cancelLoading}
                                >
                                    {cancelLoading ? (
                                        <><i className="ri-loader-4-line spinning"></i> Cancelling...</>
                                    ) : (
                                        'Confirm Cancel'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Confirmation Popup (Buyer) */}
                {showPaymentConfirmPopup && (
                    <div className="binance-modal-overlay" onClick={() => setShowPaymentConfirmPopup(false)}>
                        <div className="binance-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="binance-modal-header">
                                <h3>Confirm Payment Transfer</h3>
                                <button 
                                    className="modal-close-btn"
                                    onClick={() => setShowPaymentConfirmPopup(false)}
                                >
                                    <i className="ri-close-line"></i>
                                </button>
                            </div>
                            
                            <div className="binance-modal-body">
                                <div className="confirm-checklist">
                                    <div className="checklist-item">
                                        <i className="ri-checkbox-circle-fill success"></i>
                                        <span>I have transferred <strong>₹{orderDetails?.fiatAmount?.toLocaleString()}</strong> to the seller's account.</span>
                                    </div>
                                    <div className="checklist-item">
                                        <i className="ri-checkbox-circle-fill success"></i>
                                        <span>I transferred from my own account matching my verified name.</span>
                                    </div>
                                    <div className="checklist-item">
                                        <i className="ri-checkbox-circle-fill success"></i>
                                        <span>I understand that clicking "Confirm" will notify the seller.</span>
                                    </div>
                                </div>

                                <div className="payment-proof-section">
                                    <label>Upload Payment Proof <span className="required">*</span></label>
                                    <p className="proof-desc">Upload a screenshot of your payment confirmation. This is required to proceed.</p>
                                    
                                    <div 
                                        className="proof-upload-area"
                                        onClick={() => paymentProofRef.current?.click()}
                                    >
                                        {paymentProofPreview ? (
                                            <div className="proof-preview">
                                                <img src={paymentProofPreview} alt="Payment proof" />
                                                <button 
                                                    className="remove-proof"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setPaymentProofFile(null)
                                                        setPaymentProofPreview(null)
                                                    }}
                                                >
                                                    <i className="ri-close-line"></i>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="upload-placeholder">
                                                <i className="ri-upload-cloud-2-line"></i>
                                                <span>Click to upload screenshot</span>
                                            </div>
                                        )}
                                    </div>
                                    <input 
                                        type="file"
                                        ref={paymentProofRef}
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                        style={{ display: 'none' }}
                                        onChange={handlePaymentProofSelect}
                                    />
                                </div>

                                <div className="modal-warning">
                                    <i className="ri-error-warning-line"></i>
                                    <p>Only click "Confirm" after you have successfully transferred the payment. False confirmations may result in account restrictions.</p>
                                </div>
                            </div>

                            <div className="binance-modal-footer">
                                <button 
                                    className="binance-btn secondary"
                                    onClick={() => {
                                        setShowPaymentConfirmPopup(false)
                                        setPaymentProofFile(null)
                                        setPaymentProofPreview(null)
                                    }}
                                >
                                    Go Back
                                </button>
                                <button 
                                    className="binance-btn primary"
                                    onClick={handleMarkPaymentCompleted}
                                    disabled={!paymentProofFile || markingPayment}
                                >
                                    {markingPayment ? (
                                        <><i className="ri-loader-4-line spinning"></i> Confirming...</>
                                    ) : (
                                        'Transferred, Notify Seller'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Release Crypto Popup (Seller) */}
                {showReleasePopup && (
                    <div className="binance-modal-overlay" onClick={() => setShowReleasePopup(false)}>
                        <div className="binance-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="binance-modal-header">
                                <h3>Receive payment in your account?</h3>
                                <button 
                                    className="modal-close-btn"
                                    onClick={() => setShowReleasePopup(false)}
                                >
                                    <i className="ri-close-line"></i>
                                </button>
                            </div>
                            
                            <div className="binance-modal-body">
                                <div className="confirm-checklist">
                                    <div className="checklist-item">
                                        <i className="ri-checkbox-circle-fill success"></i>
                                        <span>Log in to your receiving account to verify that the payment has been credited to your account.</span>
                                    </div>
                                    <div className="checklist-item">
                                        <i className="ri-checkbox-circle-fill success"></i>
                                        <span>Verify the buyer's real name.</span>
                                    </div>
                                    <div className="checklist-item">
                                        <i className="ri-checkbox-circle-fill success"></i>
                                        <span>Check the box below, then click "Confirm Release" to proceed with the crypto release.</span>
                                    </div>
                                </div>

                                <div className="release-warning">
                                    <i className="ri-error-warning-line"></i>
                                    <div>
                                        <p>If you release the crypto without checking your payment, you may lose your assets!</p>
                                        <span>To avoid loss of assets due to bank chargeback, DO NOT accept payments from an unassociated third-party account.</span>
                                    </div>
                                </div>

                                <div className="release-confirm-checkbox">
                                    <label 
                                        className={`checkbox-container ${releaseConfirmed ? 'checked' : ''}`}
                                        onClick={() => setReleaseConfirmed(!releaseConfirmed)}
                                    >
                                        <div className="checkbox-box">
                                            {releaseConfirmed && <i className="ri-check-line"></i>}
                                        </div>
                                        <span>
                                            I have verified that I received <strong>₹{orderDetails?.fiatAmount?.toLocaleString()}</strong> in my account from the buyer - <strong>{orderDetails?.buyer?.userName}</strong>.
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="binance-modal-footer">
                                <button 
                                    className="binance-btn primary full-width"
                                    onClick={handleReleaseCrypto}
                                    disabled={!releaseConfirmed || releasingCrypto}
                                >
                                    {releasingCrypto ? (
                                        <><i className="ri-loader-4-line spinning"></i> Releasing...</>
                                    ) : (
                                        'Confirm Release'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Appeal/Dispute Popup */}
                {showAppealPopup && (
                    <div className="binance-modal-overlay" onClick={() => setShowAppealPopup(false)}>
                        <div className="binance-modal appeal-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="binance-modal-header">
                                <h3>
                                    <i className="ri-shield-check-line"></i>
                                    File an Appeal
                                </h3>
                                <button 
                                    className="modal-close-btn"
                                    onClick={() => setShowAppealPopup(false)}
                                >
                                    <i className="ri-close-line"></i>
                                </button>
                            </div>
                            
                            <div className="binance-modal-body">
                                <div className="appeal-info">
                                    <i className="ri-information-line"></i>
                                    <p>
                                        Filing an appeal will escalate this order to our support team for review. 
                                        Please provide detailed information about your issue.
                                    </p>
                                </div>

                                <div className="appeal-form">
                                    <label>Describe your issue in detail:</label>
                                    <textarea
                                        className="appeal-textarea"
                                        placeholder="Please explain your issue clearly. Include any relevant details such as:
• What went wrong?
• What have you tried to resolve it?
• Any evidence you can provide (screenshots sent in chat)"
                                        value={appealReason}
                                        onChange={(e) => setAppealReason(e.target.value)}
                                        rows={6}
                                        maxLength={1000}
                                    />
                                    <div className="char-count">
                                        {appealReason.length}/1000 characters (minimum 10)
                                    </div>
                                </div>

                                <div className="appeal-warning">
                                    <i className="ri-error-warning-line"></i>
                                    <div>
                                        <p>Please note:</p>
                                        <ul>
                                            <li>Provide honest and accurate information</li>
                                            <li>Upload any proof/screenshots in the chat</li>
                                            <li>Our team will review and respond within 24 hours</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="binance-modal-footer">
                                <button 
                                    className="binance-btn secondary"
                                    onClick={() => setShowAppealPopup(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="binance-btn appeal-submit"
                                    onClick={handleRaiseAppeal}
                                    disabled={appealReason.trim().length < 10 || appealLoading}
                                >
                                    {appealLoading ? (
                                        <><i className="ri-loader-4-line spinning"></i> Submitting...</>
                                    ) : (
                                        <>
                                            <i className="ri-shield-check-line"></i>
                                            Submit Appeal
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Welcome P2P Popup */}
                {showWelcomePopup && (
                    <div className="binance-modal-overlay" onClick={handleCloseWelcomePopup}>
                        <div className="binance-modal welcome-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="binance-modal-header">
                                <h3>
                                    <i className="ri-p2p-fill"></i>
                                    Welcome to P2P!
                                </h3>
                                <button 
                                    className="modal-close-btn"
                                    onClick={handleCloseWelcomePopup}
                                >
                                    <i className="ri-close-line"></i>
                                </button>
                            </div>
                            
                            <div className="binance-modal-body">
                                {/* Tabs */}
                                <div className="welcome-tabs">
                                    <button 
                                        className={`welcome-tab ${welcomeTab === 'howToPay' ? 'active' : ''}`}
                                        onClick={() => setWelcomeTab('howToPay')}
                                    >
                                        How to Pay
                                    </button>
                                    <button 
                                        className={`welcome-tab ${welcomeTab === 'thingsToNote' ? 'active' : ''}`}
                                        onClick={() => setWelcomeTab('thingsToNote')}
                                    >
                                        Things to Note
                                    </button>
                                </div>

                                {/* How to Pay Content */}
                                {welcomeTab === 'howToPay' && (
                                    <div className="welcome-content">
                                        <div className="welcome-step">
                                            <span className="step-number">1</span>
                                            <div className="step-info">
                                                <h6>Make Your Payment</h6>
                                                <p>Open your payment app and complete the payment to the seller's account using the provided details.</p>
                                            </div>
                                        </div>
                                        <div className="welcome-step">
                                            <span className="step-number">2</span>
                                            <div className="step-info">
                                                <h6>Save Your Payment Proof</h6>
                                                <p>Take a clear screenshot or save the receipt of your payment. You'll need this as proof for the next step.</p>
                                            </div>
                                        </div>
                                        <div className="welcome-step">
                                            <span className="step-number">3</span>
                                            <div className="step-info">
                                                <h6>Confirm & Upload Proof</h6>
                                                <p>Come back here, tap "Transferred, Notify Seller", and upload your payment proof to confirm your transfer.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Things to Note Content */}
                                {welcomeTab === 'thingsToNote' && (
                                    <div className="welcome-content">
                                        <div className="welcome-note">
                                            <span className="note-icon">
                                                <i className="ri-shield-user-line"></i>
                                            </span>
                                            <div className="note-info">
                                                <h6>Your Account, Your Safety</h6>
                                                <p>Always use a payment account in your own verified name. Using another person's account may result in order cancellation and account suspension.</p>
                                            </div>
                                        </div>
                                        <div className="welcome-note">
                                            <span className="note-icon">
                                                <i className="ri-spam-2-line"></i>
                                            </span>
                                            <div className="note-info">
                                                <h6>Avoid Suspicious Words</h6>
                                                <p>Skip crypto terms like "BTC" or "USDT" in your transfer remarks to prevent your payment platform from blocking your funds.</p>
                                            </div>
                                        </div>
                                        <div className="welcome-note">
                                            <span className="note-icon">
                                                <i className="ri-checkbox-circle-line"></i>
                                            </span>
                                            <div className="note-info">
                                                <h6>Don't Forget to Confirm Payment</h6>
                                                <p>Right after paying, click the "Transferred, Notify Seller" button to prevent your order from being canceled.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="binance-modal-footer">
                                <button 
                                    className="binance-btn primary full-width"
                                    onClick={handleCloseWelcomePopup}
                                >
                                    Got it
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Buyer Time Warning Popup - Show when 2 minutes or less remaining */}
                {showBuyerTimeWarningPopup && (
                    <div className="binance-modal-overlay" onClick={() => setShowBuyerTimeWarningPopup(false)}>
                        <div className="binance-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="binance-modal-header">
                                <h3>
                                    <i className="ri-time-line" style={{ color: '#f59e0b' }}></i>
                                    Time Running Out!
                                </h3>
                                <button 
                                    className="modal-close-btn"
                                    onClick={() => setShowBuyerTimeWarningPopup(false)}
                                >
                                    <i className="ri-close-line"></i>
                                </button>
                            </div>
                            
                            <div className="binance-modal-body">
                                <div className="time-warning-content">
                                    <div className="warning-icon-large">
                                        <i className="ri-time-line"></i>
                                    </div>
                                    <h4>Only {formatTimer(timeLeft.minutes)}:{formatTimer(timeLeft.seconds)} remaining!</h4>
                                    <p>
                                        Your order will expire soon. Please complete your payment and update the status immediately 
                                        to avoid order cancellation.
                                    </p>
                                    <div className="time-warning-actions">
                                        <div className="warning-action-item">
                                            <i className="ri-checkbox-circle-line"></i>
                                            <span>Complete your payment transfer</span>
                                        </div>
                                        <div className="warning-action-item">
                                            <i className="ri-checkbox-circle-line"></i>
                                            <span>Click "Transferred, Notify Seller" button</span>
                                        </div>
                                        <div className="warning-action-item">
                                            <i className="ri-checkbox-circle-line"></i>
                                            <span>Upload payment proof</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="binance-modal-footer">
                                <button 
                                    className="binance-btn secondary"
                                    onClick={() => setShowBuyerTimeWarningPopup(false)}
                                >
                                    I'll do it later
                                </button>
                                <button 
                                    className="binance-btn primary"
                                    onClick={() => {
                                        setShowBuyerTimeWarningPopup(false)
                                        setShowPaymentConfirmPopup(true)
                                    }}
                                >
                                    Update Status Now
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Seller Paid Status Popup */}
                {showSellerPaidPopup && (
                    <div className="binance-modal-overlay" onClick={() => setShowSellerPaidPopup(false)}>
                        <div className="binance-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="binance-modal-header">
                                <h3>
                                    <i className="ri-checkbox-circle-fill" style={{ color: '#22c55e' }}></i>
                                    Payment Received!
                                </h3>
                                <button 
                                    className="modal-close-btn"
                                    onClick={() => setShowSellerPaidPopup(false)}
                                >
                                    <i className="ri-close-line"></i>
                                </button>
                            </div>
                            
                            <div className="binance-modal-body">
                                <div className="payment-received-content">
                                    <div className="success-icon-large">
                                        <i className="ri-checkbox-circle-fill"></i>
                                    </div>
                                    <h4>Buyer has marked payment as completed</h4>
                                    <p>
                                        The buyer has confirmed that they have transferred 
                                        <strong> ₹{orderDetails?.fiatAmount?.toLocaleString()}</strong> to your account.
                                    </p>
                                    <div className="payment-received-info">
                                        <div className="info-card">
                                            <span className="info-label">Amount Received</span>
                                            <span className="info-value">₹{orderDetails?.fiatAmount?.toLocaleString()}</span>
                                        </div>
                                        <div className="info-card">
                                            <span className="info-label">From Buyer</span>
                                            <span className="info-value">{orderDetails?.buyer?.userName || 'Buyer'}</span>
                                        </div>
                                    </div>
                                    <div className="payment-received-warning">
                                        <i className="ri-error-warning-line"></i>
                                        <p>
                                            <strong>Important:</strong> Please verify in your payment account that you have actually 
                                            received the payment before releasing the crypto. Releasing without verification may result in asset loss.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="binance-modal-footer">
                                <button 
                                    className="binance-btn secondary"
                                    onClick={() => setShowSellerPaidPopup(false)}
                                >
                                    Verify Later
                                </button>
                                <button 
                                    className="binance-btn primary"
                                    onClick={() => {
                                        setShowSellerPaidPopup(false)
                                        setShowReleasePopup(true)
                                    }}
                                >
                                    Verify & Release Crypto
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </P2pLayout>
    )
}

export default P2pOrderDetails
