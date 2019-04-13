import { put, call, takeLatest } from 'redux-saga/effects';
import { normalize, schema } from 'normalizr';
import { requestMenus, receiveMenus, fetchArticlesIfNeeded } from '../actions/actions';

function* fetchMenus(action){
    const { domain } = action;
    try {
        yield put(requestMenus())
        const response = yield fetch(`${domain}/wp-json/custom/menus/mobile-app-menu`)
        const menus = yield response.json();
        const result = yield fetch(`${domain}/wp-json/custom/header_image`);
        const headerImage = yield result.json();
        console.log('header img', headerImage)
        yield put(receiveMenus({
            menus,
            header: headerImage.image
        }))
        yield put(fetchArticlesIfNeeded({
            domain,
            category: menus[0].object_id,
        }))
    }
    catch(err) {
        console.log('error fetching menus in saga', err)
    }
}

function* menuSaga() {
    yield takeLatest('FETCH_MENUS', fetchMenus);
}

export default menuSaga;