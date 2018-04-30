import { combineReducers } from 'redux';
import test_reducer from './test_reducer';
import page_reduer from './page_reducer'

const rootReducer = combineReducers({
    test: test_reducer,
    page: page_reduer
});

export default rootReducer;