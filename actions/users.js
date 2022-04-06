import { get, post } from '../utils/agent';
import { userService } from '../utils/endpoint';
import {
  FETCH_USER_PROFILE_SUCCESS,
  FETCH_MY_BALANCE,
  FETCH_DEPOSITS_SUCCESS,
  UPDATE_USER_PREFERENCE,
  FETCH_USER_EXTRACT_SUCCESS,
  FETCH_VERIFICATIONS_SUCCESS,
  FETCH_LOGIN_HISTORY_SUCCESS,
  FETCH_SELFIE_TOKEN_SUCCESS,
  HAS_USER_LOGOUT,
  FETCH_LIMIT_SUCCESS,
  IS_LIMIT_FETCHING,
} from './actionTypes';
import { toast } from 'react-toastify';
import Router from 'next/router';
import has from 'lodash/has';

export const fetchUserProfile = () => async dispatch => {
  try {
    const response = await get(`${userService}/me`);
    dispatch(fetchUserProfileSuccess(response.user));
  } catch (err) {}
};

export const fetchAppConfig = () => async dispatch => {
  try {
    const response = await get(`${userService}/app-config`);
    dispatch(fetchAppConfigSuccess(response.data));
  } catch (err) {
    console.log(err);
  }
};

export const fetchMyBalance = () => async dispatch => {
  try {
    const response = await get(`${userService}/my-balance`);
    dispatch(fetchMyBalanceSuccess(response.data));
  } catch (err) {
    console.log(err);
  }
};

export const resetPassword = data => async dispatch => {
  try {
    const response = await post(`${userService}/reset-password`, data);
    return response;
  } catch (err) {
    return err.response.data;
  }
};

export const recoveryPassword = data => async () => {
  try {
    const response = await post(`${userService}/forgot-password-reset`, data);
    return response;
  } catch (err) {
    return err.response.data;
  }
};

export const loginUser = data => async dispatch => {
  try {
    const response = await post(`${userService}/login`, { ...data });
    localStorage.setItem('auth_token', response.auth.token);
    window.location = '/';
    return { success: true };
  } catch (err) {
    if (has(err, 'response.data.message')) {
      return { success: false, message: err.response.data.message };
    }
    return { success: false };
  }
};

export const signupUser = data => async dispatch => {
  try {
    const response = await post(`${userService}/signup`, { ...data });
    toast.success(response.message, {
      position: toast.POSITION.TOP_RIGHT,
    });

    return { success: true };
  } catch (err) {
    if (has(err, 'response.data.message')) {
      return { success: false, message: err.response.data.message };
    }
    return { success: false };
  }
};

export const verifyToken = data => {
  async dispatch => {
    return true;
  };
};

export const forgotPasswordUser = data => async dispatch => {
  try {
    const response = await post(`${userService}/forgot-password`, { ...data });

    return { success: true };
  } catch (err) {
    return { success: false };
  }
};

export const validate2Fa = auth2fa => async dispatch => {
  try {
    const response = await post(`${userService}/validate-2fa`, { auth2fa });
    return response;
  } catch (err) {
    return err.response.data;
  }
};

export const generate2Fa = password => async dispatch => {
  try {
    const response = await post(`${userService}/generate-2fa`, { password });
    return response;
  } catch (err) {
    return err.response.data;
  }
};

export const fetchLoginHistory = () => async dispatch => {
  try {
    const response = await get(`${userService}/login-history`);
    dispatch(fetchLoginHistorySuccess(response.data));
  } catch (err) {
    console.log(err);
  }
};

export const fetchMyDeposits = () => async dispatch => {
  try {
    // dispatch({ type: 'START_LOADING_DEPOSIT' });
    const response = await get(`${userService}/deposits`);
    dispatch(fetchMyDepositsSuccess(response.data));
  } catch (err) {
    console.log(err);
  }
};

export const changePreferences = data => async dispatch => {
  dispatch(updateUserPreference(data));
  try {
    await post(`${userService}/change-preferences`, data);
    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false };
  }
};

export const resetAccountVerification = () => async dispatch => {
  try {
    await post(`${userService}/reset-verification`);
    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false };
  }
};

export const verificationPersonal = data => async dispatch => {
  try {
    const response = await post(`${userService}/verification-personal`, {
      phone: data,
    });
    return { success: true, message: response.message };
  } catch (err) {
    return { success: false, message: err.response.data.message };
  }
};

export const verificationAddress = data => async dispatch => {
  try {
    const response = await post(`${userService}/verification-address`, {
      address: data.address,
      cep: data.cep,
    });
    return { success: true, message: response.message };
  } catch (err) {
    return { success: false, message: err.response.data.message };
  }
};

export const sendDocumentImg = (img, type, identificator) => async dispatch => {
  const url = `${userService}/upload-document`;
  try {
    const formData = new FormData();
    formData.append('file', img);
    formData.append('type', type);
    formData.append('identificator', identificator);
    const response = await post(url, formData);
    return response;
  } catch (err) {
    const message = has(err, 'response.data.message')
      ? err.response.data.message
      : 'Erro Interno';
    return { success: false, message };
  }
};

export const verificationDocument = type => async dispatch => {
  try {
    await post(`${userService}/verification-document`, { type });
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response.data.message };
  }
};

export const showSecret = data => async dispatch => {
  try {
    const response = await post(`${userService}/show-secret`, data);
    return { success: true, secret: response.data };
  } catch (err) {
    return { success: false, message: err.response.data.message };
  }
};

export const fetchUserExtract = data => async dispatch => {
  try {
    const response = await get(`${userService}/extract`);
    dispatch(fetchUserExtractSuccess(response.data));
    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false };
  }
};

export const fetchUserVerifications = () => async dispatch => {
  try {
    const response = await get(`${userService}/account-validates`);
    dispatch(fetchAcountVerifications(response.data));
    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false };
  }
};

export const fetchValidateTokenSelfie = () => async dispatch => {
  try {
    const response = await get(`${userService}/validate-token-selfie`);
    dispatch(fetchSelfieTokenSuccess(response.data.token));
  } catch (err) {
    dispatch(fetchSelfieTokenSuccess(''));
  }
};

export const fetchUserLimit = () => async dispatch => {
  try {
    dispatch({ type: IS_LIMIT_FETCHING, data: true });
    const response = await get(`${userService}/limit`);
    dispatch(fetchLimitSuccess(response.data));
  } catch (err) {
    return {};
  }
};

export const validateTokenRecoveryPassword = token => async () => {
  try {
    const response = await get(
      `${userService}/validate-token-password/${token}`
    );
    return response;
  } catch (err) {
    return {};
  }
};

export const checkBlockAccountToken = token => async () => {
  try {
    const response = await get(`${userService}/block-account-token/${token}`);
    return response;
  } catch (err) {
    return { success: false };
  }
};

export const logoutUser = () => dispatch => {
  localStorage.clear();
  Router.push('/login');
  dispatch(hasUserLogout(true));
};

export const blockAccount = token => async () => {
  try {
    const response = await post(`${userService}/block-account`, { token });
    return response;
  } catch (err) {
    return err.response.data;
  }
};

export const changeChatVisibility = data => ({
  type: 'CHAT_VISIBILITY',
  data,
});
const fetchUserProfileSuccess = data => ({
  type: FETCH_USER_PROFILE_SUCCESS,
  data,
});
const fetchSelfieTokenSuccess = data => ({
  type: FETCH_SELFIE_TOKEN_SUCCESS,
  data,
});
const fetchMyBalanceSuccess = data => ({ type: FETCH_MY_BALANCE, data });
const fetchAppConfigSuccess = data => ({ type: 'FETCH_APP_CONFIG', data });
export const fetchSiteLoadSuccess = data => ({ type: 'SET_SITE_LOAD', data });
const fetchMyDepositsSuccess = data => ({ type: FETCH_DEPOSITS_SUCCESS, data });
const fetchUserExtractSuccess = data => ({
  type: FETCH_USER_EXTRACT_SUCCESS,
  data,
});
const updateUserPreference = data => ({ type: UPDATE_USER_PREFERENCE, data });
const fetchAcountVerifications = data => ({
  type: FETCH_VERIFICATIONS_SUCCESS,
  data,
});
const fetchLoginHistorySuccess = data => ({
  type: FETCH_LOGIN_HISTORY_SUCCESS,
  data,
});
const fetchLimitSuccess = data => ({ type: FETCH_LIMIT_SUCCESS, data });

export const hasUserLogout = data => ({ type: HAS_USER_LOGOUT, data });
