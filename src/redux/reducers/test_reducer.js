import * as types from '../types';

const initialState = {
    'String': ''
}

export default (state = initialState, action) => {
    switch (action.type) {
        case types.TEST_ACTION:
            return {
                ...state,
                'String': action.payload
            }
        default:
            return {
                ...state
            }
    }
}