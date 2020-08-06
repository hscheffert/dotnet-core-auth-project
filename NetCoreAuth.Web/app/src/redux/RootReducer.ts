import { combineReducers } from 'redux';
import ReduxStoreModel from '../redux/ReduxModel';
import { UserReducer } from './UserReducer';

/** The combined reducer used in ConfigureRedux
 *
 * All new reducers should be added here and in the <ReduxStoreModel>
 */
const RootReducer = combineReducers<ReduxStoreModel>({
    User: UserReducer,
});

export default RootReducer;
