import _ from 'lodash';

export function modObj(refObj, location, value) {
    let split = location.split(".");
    let nextLoc = split[0];
    let result = {};
    if (split.length > 1 && typeof refObj[nextLoc] === "object") {
        result = recursiveModifyObjLocation(refObj[nextLoc], split.slice(1, split.length).join("."), value)
        if (result === null) return null;
        return _.merge({ ...refObj }, {
            [nextLoc]: result
        });
    } else if (split.length === 1) {
        result = {
            [nextLoc]: value
        };
        return _.merge({ ...refObj }, result);
    }
    return null;
}

function recursiveModifyObjLocation(refObj, location, value) {
    let split = location.split(".");
    let nextLoc = split[0];
    let result = {};
    if (split.length > 1 && typeof refObj[nextLoc] === "object") {
        result = recursiveModifyObjLocation(refObj[nextLoc], split.slice(1, split.length).join("."), value)
        return _.merge({ ...refObj[nextLoc] }, result)
    } else if (split.length === 1) {
        return ({
            [nextLoc]: value
        });
    }
    return null;
}

export function setCookie(params) {
    var name = params.name,
        value = params.value,
        expireDays = params.days,
        expireHours = params.hours,
        expireMinutes = params.minutes,
        expireSeconds = params.seconds;

    var expireDate = new Date();
    if (expireDays) expireDate.setDate(expireDate.getDate() + expireDays);
    if (expireHours) expireDate.setHours(expireDate.getHours() + expireHours);
    if (expireMinutes) expireDate.setMinutes(expireDate.getMinutes() + expireMinutes);
    if (expireSeconds) expireDate.setSeconds(expireDate.getSeconds() + expireSeconds);

    document.cookie = name + "=" + escape(value) +
        ";domain=" + window.location.hostname +
        ";path=/" +
        ";expires=" + expireDate.toUTCString();
}

export function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    //expire auto delete
    return "";
}

export function deleteCookie(name) {
    setCookie({ name: name, value: "", seconds: 1 });
}

export function clearAllCookie() {
    document.cookie.split(";").forEach(function (c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
}

export function storeItem(name, value) {
    localStorage.setItem(name, value);
}

export function retrieveItem(name) {
    return localStorage.getItem(name);
}

export function deleteItem(name) {
    localStorage.removeItem(name);
}

export function clearStorage() {
    localStorage.clear();
}