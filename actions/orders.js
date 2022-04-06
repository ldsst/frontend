import { get, post } from '../utils/agent';
import { ordersService } from '../utils/endpoint';
import has from 'lodash/has';
import {
  FETCH_ALL_ORDERS_SUCCESS,
  FETCH_TICKER_SUCCESS,
  FETCH_TRADES_SUCCESS,
  CHANGE_CURRENT_PAIR,
  FETCH_AVAILABLE_PAIRS_SUCCESS,
  UPDATE_BOX_TRADE,
  FETCH_ORDER_LIMITS_SUCCESS,
} from './actionTypes';

export const fetchAllOrders = () => async dispatch => {
  const url = `${ordersService}/my-orders`;
  try {
    const response = await get(url);
    dispatch(fetchAllOrdersSuccess(response.data));
  } catch (err) {
    console.log(err);
  }
};

export const fetchAvailablePairs = () => async dispatch => {
  const url = `${ordersService}/available-pairs`;
  try {
    const response = await get(url);
    dispatch(fetchAvailablePairsSuccess(response.data || []));
  } catch (err) {
    console.log(err);
  }
};

export const fetchOrderLimits = () => async dispatch => {
  const url = `${ordersService}/order-limits`;
  try {
    const response = await get(url);
    dispatch(fetchOrderLimitsSuccess(response.data));
  } catch (err) {
    console.log(err);
  }
};

export const sendDeposit = data => async dispatch => {
  const url = `${ordersService}/send-deposit`;
  try {
    await post(url, data);
    return { success: true };
  } catch (err) {
    const message = has(err, 'response.data.message')
      ? err.response.data.message
      : 'Erro Interno';
    return { success: false, message };
  }
};

export const updateDeposit = data => async () => {
  const url = `${ordersService}/update-deposit`;
  try {
    await post(url, data);
    return { success: true };
  } catch (err) {
    return { success: false, message: 'Erro Interno' };
  }
};

export const sendReceiptImg = (img, identificator) => async () => {
  const url = `${ordersService}/upload-deposit`;
  try {
    const formData = new FormData();
    formData.append('file', img);
    formData.append('identificator', identificator);
    const response = await post(url, formData);
    if (!response.success) {
      throw response.message;
    }
    return { success: true };
  } catch (err) {
    return { success: false, message: err };
  }
};

export const dispatchTicker = ticker => dispatch => {
  const data = {
    [ticker.pair]: {
      ...ticker,
    },
  };

  dispatch(fetchTickerSuccess(data));
};

export const dispatchTrades = data => dispatch => {
  dispatch(fetchTradesSuccess(data));
};

export const changeCurrentPair = pair => (dispatch, getState) => {
  const balance = getState().users.myBalance.balance;
  const currentCurrency = pair.replace('_', '/').toUpperCase();
  const currency =
    balance.length > 1
      ? balance.find(item => item.currency === currentCurrency.split('/')[0])
      : null;
  if (currency) {
    dispatch({
      type: 'CHANGE_CURRENT_SYMBOL',
      data: currency.currency_symbol,
    });
  }
  const data = pair.replace('_', '/').toUpperCase();
  localStorage.setItem('currentPair', data);
  dispatch({ type: CHANGE_CURRENT_PAIR, data });
};

export const updateBoxTrades = data => dispatch => {
  dispatch(updateBoxTrade(data));
};

const fetchAllOrdersSuccess = data => ({
  type: FETCH_ALL_ORDERS_SUCCESS,
  data,
});

const fetchTickerSuccess = data => ({ type: FETCH_TICKER_SUCCESS, data });

const fetchTradesSuccess = data => ({ type: FETCH_TRADES_SUCCESS, data });

const updateBoxTrade = data => ({ type: UPDATE_BOX_TRADE, data });

const fetchAvailablePairsSuccess = data => ({
  type: FETCH_AVAILABLE_PAIRS_SUCCESS,
  data,
});

const fetchOrderLimitsSuccess = data => ({
  type: FETCH_ORDER_LIMITS_SUCCESS,
  data,
});
