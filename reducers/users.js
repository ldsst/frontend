import {
  FETCH_USER_PROFILE_SUCCESS,
  FETCH_DEPOSIT_ADDRESS_SUCCESS,
  FETCH_MY_BALANCE,
  FETCH_DEPOSITS_SUCCESS,
  FETCH_USER_EXTRACT_SUCCESS,
  UPDATE_USER_PREFERENCE,
  FETCH_VERIFICATIONS_SUCCESS,
  FETCH_LOGIN_HISTORY_SUCCESS,
  FETCH_SELFIE_TOKEN_SUCCESS,
  HAS_USER_LOGOUT,
  FETCH_LIMIT_SUCCESS,
  IS_LIMIT_FETCHING,
} from '../actions/actionTypes';

export const initialData = {
  userProfile: {},
  depositAddress: [],
  myBalance: {
    balance: [],
  },
  userExtract: {},
  myDeposits: [],
  accountVerifications: {},
  loginHistory: [],
  selfieToken: '',
  hasUserLogout: false,
  isFetchingLimit: true,
  isFetchingDeposit: false,
  isChatVisible: false,
  isSiteLoaded: false,
  userLimit: {},
  appConfig: {},
};

const userReducer = (state = initialData, { type, data }) => {
  switch (type) {
    case FETCH_USER_PROFILE_SUCCESS:
      return {
        ...state,
        userProfile: data,
      };
    case 'FETCH_APP_CONFIG':
      return {
        ...state,
        appConfig: data,
      };
    case 'SET_SITE_LOAD':
      return {
        ...state,
        isSiteLoaded: data,
      };
    case FETCH_DEPOSIT_ADDRESS_SUCCESS:
      return {
        ...state,
        depositAddress: data,
      };
    case FETCH_MY_BALANCE:
      return {
        ...state,
        myBalance: data,
      };
    case FETCH_DEPOSITS_SUCCESS:
      return {
        ...state,
        myDeposits: data,
        isFetchingDeposit: false,
      };
    case UPDATE_USER_PREFERENCE: {
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          email_orders: data.email_orders,
          email_access: data.email_access,
        },
      };
    }
    case FETCH_USER_EXTRACT_SUCCESS: {
      return {
        ...state,
        userExtract: data,
      };
    }
    case FETCH_VERIFICATIONS_SUCCESS: {
      return {
        ...state,
        accountVerifications: data,
      };
    }
    case FETCH_LOGIN_HISTORY_SUCCESS:
      return { ...state, loginHistory: data };
    case FETCH_SELFIE_TOKEN_SUCCESS:
      return { ...state, selfieToken: data };
    case HAS_USER_LOGOUT:
      return { ...state, hasUserLogout: data };
    case FETCH_LIMIT_SUCCESS:
      return { ...state, userLimit: data, isFetchingLimit: false };
    case IS_LIMIT_FETCHING:
      return { ...state, isFetchingLimit: data };
    case 'START_LOADING_DEPOSIT':
      return { ...state, isFetchingDeposit: true };
    case 'CHAT_VISIBILITY':
      return { ...state, isChatVisible: data };
    default:
      return state;
  }
};

export default userReducer;
