import { get, post, put, del } from '../utils/agent';
import { bankService } from '../utils/endpoint';

import {
  FETCH_BANK_ACCOUNTS_SUCCESS,
  FETCH_LOCAL_BANKS_SUCCESS,
} from './actionTypes';

export const fetchAllBankAccounts = () => async (dispatch, getState) => {
  const url = `${bankService}/bank-accounts`;
  try {
    const response = await get(url);
    dispatch(fetchBankAccountsSuccess(response.data));
  } catch (err) {
    dispatch(fetchBankAccountsSuccess([]));
  }
};

export const fetchLocalBanks = () => async (dispatch, getState) => {
  const url = `${bankService}/`;
  try {
    const response = await get(url);
    dispatch(fetchLocalBanksSuccess(response.data));
  } catch (err) {
    console.log('err fetching bancks', err);
  }
};

export const createAccount = data => async (dispatch, getState) => {
  const url = `${bankService}`;
  try {
    const response = await post(url, data);
    return { success: true, message: response.message };
  } catch (err) {
    console.log(err);
    return { success: false, message: err.response.data.message };
  }
};

export const updateAccount = (id, data) => async (dispatch, getState) => {
  const url = `${bankService}/${id}`;
  try {
    const response = await put(url, data);
    return { success: true, message: response.message };
  } catch (err) {
    return { success: false, message: err.response.data.message };
  }
};

export const deleteAccount = id => async (dispatch, getState) => {
  const url = `${bankService}/${id}`;
  try {
    const response = await del(url);
    return { success: true, message: response.message };
  } catch (err) {
    console.log(err);
    return { success: false, message: err.response.data.message };
  }
};

const fetchBankAccountsSuccess = data => ({
  type: FETCH_BANK_ACCOUNTS_SUCCESS,
  data,
});
const fetchLocalBanksSuccess = data => ({
  type: FETCH_LOCAL_BANKS_SUCCESS,
  data,
});
