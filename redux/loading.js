export default loading = (state = {}, action) => {
    const { type } = action
    const matches = /(.*)_(REQUEST|SUCCESS|ERROR)/.exec(type)

    // not a *_REQUEST / *_SUCCESS /  *_FAILURE actions, so we ignore them
    if (!matches) return state
    const [, requestName, requestState] = matches
    return {
        ...state,
        // Store whether a request is happening at the moment or not
        // e.g. will be true when receiving GET_TODOS_REQUEST
        //      and false when receiving GET_TODOS_SUCCESS / GET_TODOS_FAILURE
        [requestName]: requestState === 'REQUEST'
    }
}

//selectors
export const createLoadingSelector = actions => state =>
    actions.some(action => state.loading[action])
