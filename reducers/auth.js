import { CHANGE_LOGIN_STATUS } from '../actions/actionTypes';

export const initialData = {
    isLogged: true,
};

const bankReducer = (state = initialData, { type, data }) => {
    switch (type) {
        case CHANGE_LOGIN_STATUS:
            return {
                ...state, isLogged: data
            }
        default:
            return state;
    }
}

export default bankReducer;