import * as types from '../types';

const initialState = {
    'isDisabledMenuItem': true,
    'sid': '',
    'password': '',
    'token': '',
    'userInfo': {
        'Fname': '',
        'Lname': '',
        'Mname': ''
    }
}

export default (state = initialState, action) => {
    const { payload } = action;

    switch (action.type) {
        case types.DISABLE_MENU_ITEM:
        case types.ENABLE_MENU_ITEM:
            return {
                ...state,
                'isDisabledMenuItem': payload
            }
        case types.SET_LOGIN_VALUE:
            return {
                ...state,
                sid: payload.SID,
                password: payload.password,
                token: payload.token,
                userInfo: {
                    ...state.userInfo,
                    Fname: payload.Fname,
                    Lname: payload.Lname,
                    Mname: payload.Mname
                }
            }
        case types.RESET_LOGIN_VALUE:
            return {
                ...state,
                sid: '',
                password: '',
                token: '',
                userInfo: {
                    ...state.userInfo,
                    Fname: '',
                    Lname: '',
                    Mname: ''
                }
            }
        default:
            return {
                ...state
            }
    }
}