import { FETCH_BANK_ACCOUNTS_SUCCESS, FETCH_LOCAL_BANKS_SUCCESS } from '../actions/actionTypes';

export const initialData = {
    bankAccounts: [],
    localBanks: [],
};

const bankReducer = (state = initialData, { type, data }) => {
    switch (type) {
        case FETCH_BANK_ACCOUNTS_SUCCESS:
            return {
                ...state, bankAccounts: data
            }
        case FETCH_LOCAL_BANKS_SUCCESS:
            return {
                ...state, localBanks: data
            }
        default:
            return state;
    }
}

export default bankReducer;