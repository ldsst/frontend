import { createWorker } from 'redux-worker';
import rootReducers from './index';

let worker = createWorker();
worker.registerReducer(rootReducers);

export default worker;