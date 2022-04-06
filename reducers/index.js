import { combineReducers } from 'redux';

import orders from './orders';
import users from './users';
import bank from './bank';
import auth from './auth';

let rootReducers = combineReducers({
    orders,
    users,
    bank,
    auth,
});

export default rootReducers;