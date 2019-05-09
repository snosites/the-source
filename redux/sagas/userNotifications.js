import { put, call, takeLatest, all, select } from 'redux-saga/effects';
import { normalize, schema } from 'normalizr';
import { requestMenus, saveTokenId, setNotifications } from '../actions/actions';

import { Permissions, Notifications, Constants } from 'expo';
const { manifest } = Constants;
// const api = (typeof manifest.packagerOpts === `object`) && manifest.packagerOpts.dev
//     ? manifest.debuggerHost.split(`:`).shift().concat(`:8000`)
//     : `api.example.com`;

const api = 'mobileapi.snosites.net';

const GET_TOKENS_ENDPOINT = `http://${api}/api/tokens`;
const PUSH_ENDPOINT = `http://${api}/api/token/add`;
const ADD_NOTIFICATION_ENDPOINT = `http://${api}/api/subscribe`;
const ADD_ALL_NOTIFICATIONS_ENDPOINT = `http://${api}/api/subscribe/all`;
const REMOVE_NOTIFICATION_ENDPOINT = `http://${api}/api/unsubscribe`;
const FETCH_NOTIFICATIONS_ENDPOINT = `http://${api}/api/notifications`;

function* fetchNotifications(action) {
    // const activeDomain = yield select(getActiveDomain);
    const { tokenId, domain } = action.payload;
    const response = yield call(fetch, `${FETCH_NOTIFICATIONS_ENDPOINT}/${String(tokenId)}`);
    const notifications = yield response.json();
    yield put(setNotifications(notifications, domain))
}

function* addNotification(action) {
    const { tokenId, categoryId, domain } = action.payload;
    yield call(fetch, ADD_NOTIFICATION_ENDPOINT, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tokenId,
            categoryId
        }),
    });
    yield call(fetchNotifications, {
        payload: {
            tokenId,
            domain
        }
    });
}

export function* addAllNotifications(action) {
    const { tokenId, categoryIds } = action.payload;
    console.log('in add all', tokenId, categoryIds)
    yield call(fetch, ADD_ALL_NOTIFICATIONS_ENDPOINT, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tokenId,
            categoryIds
        }),
    });
}

function* removeNotification(action) {
    const { tokenId, categoryId, domain } = action.payload;
    yield call(fetch, REMOVE_NOTIFICATION_ENDPOINT, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tokenId,
            categoryId
        }),
    });
    yield call(fetchNotifications, {
        payload: {
            tokenId,
            domain
        }
    });
}

export function* checkNotificationSettings() {
    const { status: existingStatus } = yield call(Permissions.getAsync, Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = yield call(Permissions.askAsync, Permissions.NOTIFICATIONS);
        finalStatus = status;
    }
    // Stop here if the user did not grant permissions -- save token as undefined
    if (finalStatus !== 'granted') {
        console.log('notification status is not granted')
        yield put(saveTokenId(0));
        return;
    }
    // Get the token that uniquely identifies this device
    let token = yield call(Notifications.getExpoPushTokenAsync);
    let response = yield call(fetch, `${GET_TOKENS_ENDPOINT}/${token}`);
    let tokenResponse = yield response.json();
    let tokenId;
    // if there is already a token saved in DB update it in redux
    if (tokenResponse[0]) {
        tokenId = tokenResponse[0].id;
        yield put(saveTokenId(tokenResponse[0].id));
        // if not save it in DB and then save in redux
    } else {
        tokenId = yield call(savePushNotifications, token);
    }
    return tokenId;
    
}

function* savePushNotifications(token) {
    // POST the token to backend server
    let response = yield call(fetch, PUSH_ENDPOINT, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token
        }),
    });
    let tokenId = yield response.json();
    yield put(saveTokenId(Number(tokenId.id)))
    return tokenId;
}

function* notificationsSaga() {
    yield takeLatest('ADD_NOTIFICATION', addNotification);
    yield takeLatest('ADD_ALL_NOTIFICATIONS', addAllNotifications);
    yield takeLatest('REMOVE_NOTIFICATION', removeNotification);
    yield takeLatest('FETCH_NOTIFICATIONS', fetchNotifications);
    yield takeLatest('CHECK_NOTIFICATION_SETTINGS', checkNotificationSettings)
}

export default notificationsSaga;