import * as types from '../types';

export function disableMenuItem() {
    return {
        type: types.DISABLE_MENU_ITEM,
        payload: true
    }
}

export function enableMenuItem() {
    return {
        type: types.ENABLE_MENU_ITEM,
        payload: false
    }
}

export function setLoginValue(values) {
    return {
        type: types.SET_LOGIN_VALUE,
        payload: values
    }
}

export function resetLoginValue() {
    return {
        type: types.RESET_LOGIN_VALUE,
        payload: null
    }
}