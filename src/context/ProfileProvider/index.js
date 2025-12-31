import React, { useEffect, createContext, useState } from 'react';
import AuthService from '../../api/services/AuthService';
import LoaderHelper from '../../customComponents/Loading/LoaderHelper';
import { alertErrorMessage } from '../../customComponents/CustomAlertMessage';
export const ProfileContext = createContext();

export function ProfileProvider(props) {
  const [userDetails, setUserDetails] = useState({});
  const [loginDetails, setLoginDetails] = useState([]);
  const [newStoredTheme, setNewStoredTheme] = useState('');
  const [lastLogin, setLastLogin] = useState("");
  const [currentPage, setCurrentPage] = useState("Dashboard");
  const [themeUpdated, setThemeUpdated] = useState(true);
  const [refreshModal, setRefreshModal] = useState(true);
  const [refreshNotification, setRefreshNotification] = useState(false);

  const [modalStatus, setModalStatus] = useState({ deposit: true, withdrawal: true, referral: true, kyc: true, isDepositClosed: true, isWithdrawalClosed: true, isReferralClosed: true, isKycClosed: true });

  const updateModelHideStatus = (value) => {
    sessionStorage.setItem(value, true);
    setRefreshModal(!refreshModal)
  }

  useEffect(() => {
    const depositModalStatus = sessionStorage.getItem("depositModalStatus") || false;
    const withdrawalModalStatus = sessionStorage.getItem("withdrawalModalStatus") || false;
    const referralModalStatus = sessionStorage.getItem("referralModalStatus") || false;
    const kycModalStatus = sessionStorage.getItem("kycModalStatus") || false;

    setModalStatus({ deposit: userDetails?.depositStatus, withdrawal: userDetails?.WithdrawalStatus, referral: userDetails?.referralStatus, kyc: userDetails?.kycVerified === 2 || userDetails?.kycVerified === 1, isDepositClosed: depositModalStatus, isWithdrawalClosed: withdrawalModalStatus, isReferralClosed: referralModalStatus, isKycClosed: kycModalStatus })

  }, [userDetails, refreshModal]);



  const [activeTab, setActiveTab] = useState("");
  const token = sessionStorage.getItem('token');


  const handleUserDetails = async () => {
    LoaderHelper.loaderStatus(true);
    await AuthService.getDetails().then(async (result) => {
      if (result?.success) {
        LoaderHelper.loaderStatus(false);
        try {
          setUserDetails(result?.data);
        } catch (error) {
          alertErrorMessage(error);
        }
      } else {
        LoaderHelper.loaderStatus(false);
        alertErrorMessage(result?.message);
      }
    });
  };

  function generateSocketUniqueId(length = 15) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let uniqueId = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      uniqueId += characters.charAt(randomIndex);
    }
    sessionStorage.setItem("socketId", uniqueId)
  }
  function generateFutureSocketUniqueId(length = 15) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let uniqueId = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      uniqueId += characters.charAt(randomIndex);
    }
    sessionStorage.setItem("socketIdFuture", uniqueId)
  }


  const activityLogs = async (skip) => {
    LoaderHelper.loaderStatus(true)
    await AuthService.getActivityLogs(0, 1).then(async result => {
      LoaderHelper.loaderStatus(false)
      if (result?.success) {
        setLastLogin(result?.data[0]?.createdAt)
      }
    });
  };


  useEffect(() => {
    if (token) {
      handleUserDetails();
      activityLogs();
    }
    generateSocketUniqueId()
    generateFutureSocketUniqueId()
  }, [token]);




  const handleTheme = () => {
    const htmlTag = document.documentElement;
    const currentTheme = htmlTag.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    sessionStorage.setItem('theme', newTheme);
    htmlTag.setAttribute('data-theme', newTheme);
    setNewStoredTheme(newTheme);
  };

  React.useEffect(() => {
    const storedTheme = sessionStorage.getItem('theme');
    const htmlTag = document.documentElement;
    if (storedTheme) {
      htmlTag.setAttribute('data-theme', storedTheme);
    } else {
      const defaultTheme = 'dark';
      htmlTag.setAttribute('data-theme', defaultTheme);
      sessionStorage.setItem('CurrentTheme', defaultTheme);
    }
  }, []);


  return (
    <>

      <ProfileContext.Provider value={{ refreshNotification, setRefreshNotification, modalStatus, updateModelHideStatus, currentPage, setCurrentPage, lastLogin, userDetails, setUserDetails, handleUserDetails, setLoginDetails, loginDetails, handleTheme, newStoredTheme, activeTab, setActiveTab, themeUpdated, setThemeUpdated }}>
        {props.children}
      </ProfileContext.Provider>
    </>
  );
}
