import React from 'react'
import { View, Text, Image, StyleSheet, Platform } from 'react-native'
import Color from 'color'
import { connect } from 'react-redux'
import * as Device from 'expo-device'

import HTML from 'react-native-render-html'
import LottieView from 'lottie-react-native'

import Colors from '../constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import { Snackbar, Button } from 'react-native-paper'

import { actions as savedArticleActions } from '../redux/savedArticles'
import { actions as articlesActions } from '../redux/articles'

import { getActiveDomain } from '../redux/domains'

import { SafeAreaView } from 'react-navigation'

import ArticleListContent from '../views/ArticleListContent'
import TabletArticleListContent from '../views/TabletArticleListContent'

import HeaderButtons, { HeaderButton, Item } from 'react-navigation-header-buttons'

// header icon native look component
const IoniconsHeaderButton = (passMeFurther) => (
    <HeaderButton
        {...passMeFurther}
        IconComponent={Ionicons}
        iconSize={30}
        color={Colors.tintColor}
    />
)

//header title -- work on later
const CustomHeaderTitle = ({ children, style }) => {
    return (
        <HTML
            html={children}
            customWrapper={(text) => {
                return (
                    <Text ellipsizeMode='tail' numberOfLines={1} style={[...style, styles.title]}>
                        {text}
                    </Text>
                )
            }}
            baseFontStyle={styles.title}
        />
    )
}

class HomeScreen extends React.Component {
    static navigationOptions = ({ navigation, screenProps }) => {
        const { theme } = screenProps
        const logo = navigation.getParam('headerLogo', null)
        // const headerName = navigation.getParam('menuTitle', 'Stories')
        let primaryColor = Color(theme.colors.primary)
        let isDark = primaryColor.isDark()
        return {
            title: 'Home',
            headerTitle: CustomHeaderTitle,
            headerRight: (
                <HeaderButtons HeaderButtonComponent={IoniconsHeaderButton}>
                    <Item
                        title='menu'
                        iconName='ios-menu'
                        buttonStyle={{ color: isDark ? 'white' : 'black' }}
                        onPress={() => navigation.openDrawer()}
                    />
                </HeaderButtons>
            ),
            headerLeft: logo && (
                <Image
                    source={{ uri: logo }}
                    style={{ width: 60, height: 35, borderRadius: 7, marginLeft: 10 }}
                    resizeMode='contain'
                />
            ),
            headerBackTitle: null,
        }
    }

    state = {
        snackbarSavedVisible: false,
        snackbarRemovedVisible: false,
        isTablet: false,
    }

    componentDidMount() {
        const { navigation, global } = this.props
        if (this.animation) {
            this._playAnimation()
        }
        navigation.setParams({
            headerLogo: global.headerSmall,
        })
        this.getDeviceTypeComponent()
    }

    componentDidUpdate() {
        if (this.animation) {
            this._playAnimation()
        }
        const { navigation } = this.props
        if (navigation.state.params && navigation.state.params.scrollToTop) {
            if (this.flatListRef) {
                // scroll list to top
                this._scrollToTop()
            }
            navigation.setParams({ scrollToTop: false })
        }
    }

    async getDeviceTypeComponent() {
        const deviceType = await Device.getDeviceTypeAsync()

        if (Device.DeviceType[deviceType] === 'TABLET') {
            this.setState({ isTablet: true })
        } else {
            this.setState({ isTablet: false })
        }
    }

    render() {
        const { navigation, theme, activeDomain, global } = this.props
        const { snackbarSavedVisible, snackbarRemovedVisible, isTablet } = this.state

        // if (!categoryId) {
        //     return (
        //         <SafeAreaView
        //             style={{
        //                 flex: 1,
        //                 marginTop: 20,
        //             }}
        //         >
        //             <LottieView
        //                 ref={(animation) => this._saveAnimationRef(animation)}
        //                 style={StyleSheet.absoluteFill}
        //                 speed={0.8}
        //                 loop={true}
        //                 autoPlay={true}
        //                 source={require('../assets/lottiefiles/multi-article-loading')}
        //             />
        //         </SafeAreaView>
        //     )
        // }
        // if (articlesByCategory.length === 0 && category.isFetching) {
        //     return (
        //         <SafeAreaView
        //             style={{
        //                 flex: 1,
        //                 marginTop: 20,
        //             }}
        //         >
        //             <LottieView
        //                 ref={(animation) => this._saveAnimationRef(animation)}
        //                 style={StyleSheet.absoluteFill}
        //                 speed={0.8}
        //                 loop={true}
        //                 autoPlay={true}
        //                 source={require('../assets/lottiefiles/multi-article-loading')}
        //             />
        //         </SafeAreaView>
        //     )
        // }
        // if (category.error) {
        //     return (
        //         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        //             <View
        //                 style={{
        //                     width: 150,
        //                     height: 150,
        //                     alignItems: 'center',
        //                 }}
        //             >
        //                 <LottieView
        //                     ref={(animation) => this._saveAnimationRef(animation)}
        //                     style={{
        //                         width: 150,
        //                         height: 150,
        //                     }}
        //                     loop={true}
        //                     autoPlay={true}
        //                     source={require('../assets/lottiefiles/broken-stick-error')}
        //                 />
        //             </View>
        //             <Text style={{ textAlign: 'center', fontSize: 17, padding: 30 }}>
        //                 Sorry, something went wrong. If you are the site owner, please submit a
        //                 support request.
        //             </Text>
        //             <Button
        //                 mode='contained'
        //                 theme={{
        //                     roundness: 7,
        //                     colors: {
        //                         primary: theme ? theme.colors.primary : '#2099CE',
        //                     },
        //                 }}
        //                 style={{ padding: 5 }}
        //                 onPress={this._handleRefresh}
        //             >
        //                 Reload
        //             </Button>
        //         </View>
        //     )
        // }

        return (
            <View style={{ flex: 1 }}>
                {isTablet ? (
                    <TabletArticleListContent
                        articleList={articlesByCategory}
                        isFetching={category.isFetching}
                        isRefreshing={category.didInvalidate || false}
                        loadMore={this._loadMore}
                        handleRefresh={this._handleRefresh}
                        saveRef={this._saveRef}
                        activeDomain={activeDomain}
                        theme={theme}
                        enableComments={global.enableComments}
                        navigation={navigation}
                        onIconPress={this._saveRemoveToggle}
                    />
                ) : (
                    <Text>Home Screen!</Text>
                )}
                <Snackbar
                    visible={snackbarSavedVisible}
                    style={styles.snackbar}
                    duration={3000}
                    onDismiss={() => this.setState({ snackbarSavedVisible: false })}
                    action={{
                        label: 'Dismiss',
                        onPress: () => {
                            this.setState({ snackbarSavedVisible: false })
                        },
                    }}
                >
                    Article Added To Saved List
                </Snackbar>
                <Snackbar
                    visible={snackbarRemovedVisible}
                    style={styles.snackbar}
                    duration={3000}
                    onDismiss={() => this.setState({ snackbarRemovedVisible: false })}
                    action={{
                        label: 'Dismiss',
                        onPress: () => {
                            this.setState({ snackbarRemovedVisible: false })
                        },
                    }}
                >
                    Article Removed From Saved List
                </Snackbar>
            </View>
        )
    }

    _scrollToTop = () => {
        this.flatListRef.scrollToOffset({ animated: true, offset: 0 })
    }

    _saveRef = (ref) => {
        this.flatListRef = ref
    }

    _saveAnimationRef = (ref) => {
        this.animation = ref
    }

    _saveRemoveToggle = (article) => {
        if (article.saved) {
            this._handleArticleRemove(article.id)
        } else {
            this._handleArticleSave(article)
        }
    }

    _handleArticleSave = (article) => {
        const { activeDomain, saveArticle } = this.props
        saveArticle(article, activeDomain.id)
        this.setState({
            snackbarSavedVisible: true,
        })
    }

    _handleArticleRemove = (articleId) => {
        const { activeDomain } = this.props
        this.props.removeSavedArticle(articleId, activeDomain.id)
        this.setState({
            snackbarRemovedVisible: true,
        })
    }

    _loadMore = () => {
        const { activeDomain, category, fetchMoreArticlesIfNeeded } = this.props
        fetchMoreArticlesIfNeeded({
            domain: activeDomain.url,
            category: category.categoryId,
        })
    }

    _handleRefresh = () => {
        const { activeDomain, category, invalidateArticles, fetchArticlesIfNeeded } = this.props
        invalidateArticles(category.categoryId)
        fetchArticlesIfNeeded({
            domain: activeDomain.url,
            category: category.categoryId,
        })
    }

    _playAnimation = () => {
        this.animation.reset()
        this.animation.play()
    }
}

const styles = StyleSheet.create({
    snackbar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    title: {
        ...Platform.select({
            ios: {
                fontSize: 17,
                fontWeight: '600',
            },
            android: {
                fontSize: 20,
                fontWeight: '500',
            },
            default: {
                fontSize: 18,
                fontWeight: '400',
            },
        }),
    },
})

const mapStateToProps = (state) => {
    const activeDomain = getActiveDomain(state)
    return {
        theme: state.theme,
        activeDomain,
        menus: state.global.menuItems,
        global: state.global,
    }
}

const mapDispatchToProps = (dispatch) => ({
    saveArticle: (article, domainId) =>
        dispatch(savedArticleActions.saveArticle(article, domainId)),
    removeSavedArticle: (articleId, domainId) =>
        dispatch(savedArticleActions.removeSavedArticle(articleId, domainId)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen)
