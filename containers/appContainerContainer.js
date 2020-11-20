import { connect } from 'react-redux'
import AppContainer from '../components/AppContainer'

import { types as globalTypes, actions as globalActions } from '../redux/global'
import { createErrorMessageSelector } from '../redux/errors'
import { getActiveDomain } from '../redux/domains'
import { createLoadingSelector } from '../redux/loading'

const initializeUserErrorSelector = createErrorMessageSelector([globalTypes.INITIALIZE_USER])
const initializeUserLoading = createLoadingSelector([globalTypes.INITIALIZE_USER])

const mapStateToProps = (state) => {
    return {
        theme: state.theme,
        homeScreenMode: state.global.homeScreenMode,
        initializeUserLoading: initializeUserLoading(state),
        initializeUserErrorSelector: initializeUserErrorSelector(state),
        activeDomain: getActiveDomain(state),
        user: state.user.user,
        initialized: state.global.initialized,
        // fromDeepLink: state.global.fromDeepLink,
    }
}

const mapDispatchToProps = (dispatch) => ({
    initializeUser: () => dispatch(globalActions.initializeUser()),
    setInitialized: (payload) => dispatch(globalActions.setInitialized(payload)),
    // initializeDeepLinkUser: (params) => dispatch(globalActions.initializeDeepLinkUser(params)),
    // setDeepLinkArticle: (payload) => dispatch(globalActions.setDeepLinkArticle(payload)),
    // setFromDeepLink: (payload) => dispatch(globalActions.setFromDeepLink(payload)),
})

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer)
