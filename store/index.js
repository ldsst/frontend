import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunk from 'redux-thunk'
import rootReducer from "../reducers";

export const configureStore = () => {
    return createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)));
}

/*
    import { applyWorker } from 'redux-worker';

    const worker = typeof window !== 'undefined' ? require('../reducers/reducerWorker') : null;

    const enhancerWithWorker = compose(
        composeWithDevTools(applyMiddleware(thunk)),
        applyWorker(worker)
    );
*/