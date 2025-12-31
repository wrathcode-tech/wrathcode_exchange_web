import axios from "axios";
import { alertErrorMessage } from "../../customComponents/CustomAlertMessage";

export const ApiCallPost = async (url, parameters, headers) => {
  try {
    const response = await axios.post(url, parameters, { headers: headers });
    return response?.data;
  } catch (error) {
    if (error?.response?.data?.message === "Token is expired") {
      tokenExpire();
      return;
    }
    return error?.response?.data;
  }
};

export const ApiCallGet = async (url, headers) => {
  try {
    const response = await axios.get(url, { headers: headers });   
    return response?.data;
  } catch (error) {
    if (error?.response?.data?.message === "Token is expired") {
      tokenExpire();
      return;
    }
    return error?.response?.data;
  }
};

export const ApiCallGetVerifyRegistration = async (url, headers) => {
  try {
    const response = await axios.get(url, { headers: headers });   
    return response?.data;
  } catch (error) {
    return error?.response?.data;
  }
};

export const ApiCallPut = async (url, parameters, headers) => {
  try {
    const response = await axios.put(url, parameters, { headers: headers });
    return response?.data;
  } catch (error) {
    if (error?.response?.data?.message === "Token is expired") {
      tokenExpire();
      return;
    }
    return error?.response?.data;
  }
};


export const ApiCallPatch = async (url, parameters, headers) => {
  try {
    const response = await axios.patch(url, parameters, { headers: headers });
    return response?.data;
  } catch (error) {
    if (error?.response?.data?.message === "Token is expired") {
      tokenExpire();
      return;
    }
    return error?.response?.data;
  }
};



const tokenExpire = () => {
  alertErrorMessage('Token is Expired Please Login Again');
  sessionStorage.clear();
  window.location.reload();
}