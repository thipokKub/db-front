import * as types from '../types';

export function testMessage(msg) {
    return (dispatch) => {
        new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(msg)
            }, 500);
        }).then((data) => {
            return dispatch({
                type: types.TEST_ACTION,
                payload: data
            })
        })
    }
}