import { post } from '../utils/agent';
import { withdrawService } from '../utils/endpoint';
import has from 'lodash/has';

export const withdrawMoney = (data) =>
    async (dispatch, getState) => {
        const url = `${withdrawService}/withdraw-money`;
        try {
            await post(url, data);
            return { success: true };
        }
        catch (err) {
            let message = 'Erro interno';
            if (has(err, 'response.data.message')) {
                message = err.response.data.message;
            }

            return { success: false, message };
        }
    }

export const withdrawCryptoCurrency = (data) =>
    async (dispatch, getState) => {
        const url = `${withdrawService}/withdraw-cryptocurrency`;
        try {
            await post(url, data);
            return { success: true };
        }
        catch (err) {
            let message = 'Erro interno';
            if (has(err, 'response.data.message')) {
                message = err.response.data.message;
            }

            return { success: false, message };
        }
    }

