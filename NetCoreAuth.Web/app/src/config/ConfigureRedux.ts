import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../redux/RootReducer';

/** Life made easier by this: https://github.com/zalmoxisus/redux-devtools-extension#12-advanced-store-setup
 *
 * I believe that window.__REDUX_DEVTOOLS... is a function, so is compose.
 * The || is a default operator, sort of, and will pick compose if redux dev tools aren't installed
 */
export const composeEnhancers = (process.env.NODE_ENV === 'development' && window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

// Create store with devtools
function configureStore() {
    const enhancer = composeEnhancers(applyMiddleware(thunk));
    return createStore(rootReducer, enhancer);
}

// Pass an optional param to rehydrate state on app start
const store = configureStore();

// Export store singleton instance
export default store;
