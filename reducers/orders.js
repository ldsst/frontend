import {
  SET_LIVRO_ORDENS,
  FETCH_ALL_ORDERS_SUCCESS,
  FETCH_TICKER_SUCCESS,
  FETCH_TRADES_SUCCESS,
  CHANGE_CURRENT_PAIR,
  FETCH_AVAILABLE_PAIRS_SUCCESS,
  SET_LIVRO_ORDENS_ACUMULADO,
  UPDATE_BOX_TRADE,
  FETCH_ORDER_LIMITS_SUCCESS,
} from '../actions/actionTypes';

export const initialData = {
  livroOrdens: {},
  livroOrdensAcumulado: {},
  minhasOrdens: [],
  orderLimits: {},
  ticker: {},
  trades: {},
  currentPair: 'BTC/BRL',
  currencySymbol: '',
  pairs: [],
  updateMyOrders: false,
  boxTradeUpated: {
    update: false,
    values: {},
  },
};

const orderReducer = (state = initialData, { type, data }) => {
  switch (type) {
    case SET_LIVRO_ORDENS:
      return {
        ...state,
        livroOrdens: {
          ...state.livroOrdens,
          ...data,
        },
      };
    case SET_LIVRO_ORDENS_ACUMULADO:
      return {
        ...state,
        livroOrdensAcumulado: {
          ...state.livroOrdensAcumulado,
          ...data,
        },
      };
    case FETCH_ALL_ORDERS_SUCCESS: {
      return {
        ...state,
        minhasOrdens: data,
      };
    }
    case 'UPDATE_MY_ORDERS': {
      return {
        ...state,
        minhasOrdens: [...state.minhasOrdens].filter(
          item => item.identificator !== data
        ),
        updateMyOrders: true,
      };
    }
    case 'SHOULD_UPDATE_MY_ORDERS': {
      return {
        ...state,
        updateMyOrders: data,
      };
    }
    case FETCH_TICKER_SUCCESS: {
      return {
        ...state,
        ticker: {
          ...state.ticker,
          ...data,
        },
      };
    }
    case FETCH_TRADES_SUCCESS: {
      return {
        ...state,
        trades: {
          ...state.trades,
          ...data,
        },
      };
    }
    case CHANGE_CURRENT_PAIR: {
      return {
        ...state,
        currentPair: data,
      };
    }
    case FETCH_AVAILABLE_PAIRS_SUCCESS:
      return {
        ...state,
        pairs: data,
      };
    case UPDATE_BOX_TRADE:
      return {
        ...state,
        boxTradeUpated: {
          update: data.update,
          values: data.values,
        },
      };
    case FETCH_ORDER_LIMITS_SUCCESS:
      return {
        ...state,
        orderLimits: data,
      };
    case 'CHANGE_CURRENT_SYMBOL': {
      return {
        ...state,
        currencySymbol: data,
      };
    }
    default:
      return state;
  }
};

export default orderReducer;
