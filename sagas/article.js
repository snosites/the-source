import { all, put, call, takeLatest, select } from 'redux-saga/effects'
import { normalize, schema } from 'normalizr'

import { types as articleTypes, actions as articleActions } from '../redux/articles'
import domainApiService from '../api/domain'

import { asyncFetchFeaturedImage, asyncFetchComments } from '../utils/sagaHelpers'

import * as Sentry from 'sentry-expo'

const articleSchema = new schema.Entity('articles')
const articleListSchema = new schema.Array(articleSchema)

// function* addComment(action) {
//     const { domain, articleId, username, email, comment } = action.payload
//     let objToSend = {
//         author_email: email,
//         author_name: username,
//         content: comment,
//         post: articleId
//     }
//     try {
//         const response = yield call(fetch, `https://${domain}/wp-json/wp/v2/comments`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(objToSend)
//         })
//         if (response.status !== 201) {
//             yield put(setCommentPosted('error'))
//             throw new Error(response._bodyText)
//         } else {
//             yield put(setCommentPosted('posted'))
//         }
//     } catch (err) {
//         console.log('error adding comment in saga', err)
//         Sentry.captureException(err)
//     }
// }

function* fetchArticles(action) {
    const { domain, category, page } = action
    try {
        yield put(articleActions.requestArticles(category))
        const stories = yield call(domainApiService.fetchArticles, {
            domainUrl: domain,
            category,
            page
        })
        yield all(
            stories.map(story => {
                if (story._links['wp:featuredmedia']) {
                    return call(
                        asyncFetchFeaturedImage,
                        `${story._links['wp:featuredmedia'][0].href}`,
                        story
                    )
                } else {
                    return call(Promise.resolve)
                }
            })
        )
        yield all(
            stories.map(story => {
                return call(asyncFetchComments, domain, story)
            })
        )
        const normalizedData = normalize(stories, articleListSchema)
        yield put(articleActions.receiveArticles(category, normalizedData))
    } catch (err) {
        console.log('error fetching articles in saga', err, category)
        yield put(articleActions.fetchArticlesFailure(category, 'error in article saga'))
        Sentry.captureException(err)
    }
}

function shouldFetchArticles(articles) {
    // if category doesnt exist fetch
    if (!articles) {
        return true
    }
    // if already fetching dont fetch
    else if (articles.isFetching) {
        return false
    }
    // if didInvalidate is true then fetch
    else {
        return articles.didInvalidate
    }
}

function shouldFetchMoreArticles(articles) {
    // if page is not at max fetch more
    if (articles.page !== 'max') {
        return true
    } else {
        return false
    }
}

const getArticlesByCategory = state => state.articlesByCategory

function* fetchArticlesIfNeeded(action) {
    const { domain, category } = action.payload
    const articlesByCategory = yield select(getArticlesByCategory)
    const articles = articlesByCategory[category]
    if (shouldFetchArticles(articles)) {
        yield call(fetchArticles, {
            domain,
            category,
            page: 1
        })
    }
}

function* fetchMoreArticlesIfNeeded(action) {
    const { domain, category } = action.payload
    const articlesByCategory = yield select(getArticlesByCategory)
    const articles = articlesByCategory[category]
    if (shouldFetchMoreArticles(articles)) {
        yield call(fetchArticles, {
            domain,
            category,
            page: articles.page
        })
    }
}

function* articleSaga() {
    yield takeLatest(articleTypes.FETCH_ARTICLES_IF_NEEDED, fetchArticlesIfNeeded)
    yield takeLatest(articleTypes.FETCH_MORE_ARTICLES_IF_NEEDED, fetchMoreArticlesIfNeeded)
    // yield takeLatest('REFETCH_COMMENTS', refetchComments);
    // yield takeLatest(articleTypes.ADD_C'ADD_COMMENT', addComment)
}

export default articleSaga
