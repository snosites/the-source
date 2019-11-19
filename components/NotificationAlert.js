import React, { useState, useEffect } from 'react'
import {
    Text,
    TouchableOpacity,
    Alert
} from 'react-native'
import { Notifications } from 'expo'
import * as Amplitude from 'expo-analytics-amplitude'

import * as WebBrowser from 'expo-web-browser'
import { connect } from 'react-redux'

import { actions as domainActions, getActiveDomain } from '../redux/domains'
import { actions as userActions } from '../redux/user'

import NavigationService from '../utils/NavigationService'

import { handleArticlePress } from '../utils/articlePress'
import { asyncFetchArticle } from '../utils/sagaHelpers'
import FadeInView from '../views/FadeInView'

import { Portal } from 'react-native-paper'
import Moment from 'moment'

import * as Sentry from 'sentry-expo'

import { getAmplitudeKey } from '../constants/config'

//set config based on version
const amplitudeKey = getAmplitudeKey()
Amplitude.initialize(amplitudeKey)

const NotificationAlert = props => {
    const { user, activeDomain, domains, setActiveDomain, setFromPush } = props

    const [notification, setNotification] = useState({})
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (user.push_token) {
            const notificationSubscription = Notifications.addListener(notification => {
                setNotification(notification)
                console.log('notification received...', notification)
            })
            return () => notificationSubscription.remove()
        }
    }, [user])

    useEffect(() => {
        // if app is open show custom notification
        if (notification.origin === 'received') {
            setVisible(true)
            setTimeout(() => {
                setVisible(false)
            }, 7000)
        } else if (notification.origin === 'selected') {
            handleNotificationPress()
        }
    }, [notification])

    const handleNotificationPress = async () => {
        try {
            // send analytics data
            Amplitude.logEventWithProperties('notification press', {
                domainId: notification.data.domain_id,
                storyId: notification.data.post_id
            })

            setVisible(false)

            if (notification.data.link) {
                await WebBrowser.openBrowserAsync(notification.data.link)
                return
            }
            // if the push is from active domain go to article
            if (notification.data.domain_id == activeDomain.id) {
                // get article
                const article = await asyncFetchArticle(activeDomain.url, notification.data.post_id)

                handleArticlePress(article, activeDomain)
            } else {
                // make sure domain origin is a saved domain
                let found = domains.find(domain => {
                    return domain.id == notification.data.domain_id
                })
                if (!found) {
                    // user doesnt have this domain saved so dont direct anywhere
                    throw new Error('no domain saved for this notification')
                }
                Alert.alert(
                    'Switch Active School?',
                    `Viewing this story will switch your active school to ${notification.data.site_name}.`,
                    [
                        {
                            text: 'Cancel',
                            onPress: () => {},
                            style: 'cancel'
                        },
                        {
                            text: 'Proceed',
                            onPress: () => {
                                _notificationSwitchDomain(found.url)
                            }
                        }
                    ],
                    { cancelable: false }
                )
            }
        } catch (err) {
            console.log('error in notification press', err)
            Sentry.captureException(err)
        }
    }

    const _notificationSwitchDomain = async domainUrl => {
        try {
                NavigationService.navigate('AuthLoading', {
                    switchingDomain: true
                })
                // get article
                const article = await asyncFetchArticle(domainUrl, notification.data.post_id)

                // sets key for app to look for on new domain load
                setFromPush(article)
                // change active domain
                setActiveDomain(Number(notification.data.domain_id))
                //navigate to auth loading to load initial domain data
                let nav = NavigationService
                nav.navigate('AuthLoading', {
                    switchingDomain: false
                })
            } catch (err) {
            console.log('error in notification switch domain', err)
            NavigationService.navigate('AuthLoading', {
                switchingDomain: false
            })
            Sentry.captureException(err)
        }
    }

    return (
        <Portal>
            <FadeInView
                visible={visible}
                style={{
                    position: 'absolute',
                    top: -100,
                    right: 10,
                    left: 10,
                    height: 75,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    backgroundColor: '#e0e0e0',
                    borderRadius: 7,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 6
                    },
                    shadowOpacity: 0.37,
                    shadowRadius: 7.49,

                    elevation: 12
                }}
            >
                <TouchableOpacity
                    style={{
                        flex: 1,
                        justifyContent: 'space-between'
                    }}
                    onPress={handleNotificationPress}
                >
                    <Text style={{ fontSize: 10, paddingLeft: 5, color: '#424242' }}>
                        {String(Moment().fromNow())}
                    </Text>
                    <Text
                        ellipsizeMode='tail'
                        numberOfLines={1}
                        style={{
                            fontSize: 14,
                            paddingHorizontal: 5
                        }}
                    >
                        {notification.data
                            ? `New ${notification.data.category_name} Story from ${notification.data.site_name}`
                            : null}
                    </Text>
                    <Text
                        ellipsizeMode='tail'
                        numberOfLines={1}
                        style={{ fontSize: 14, paddingLeft: 5, color: '#757575' }}
                    >
                        {notification.data ? notification.data.title : null}
                    </Text>
                </TouchableOpacity>
            </FadeInView>
        </Portal>
    )
}


const mapStateToProps = state => ({
    user: state.user.user,
    activeDomain: getActiveDomain(state),
    domains: state.domains
})

const mapDispatchToProps = dispatch => ({
    setActiveDomain: domainId => dispatch(domainActions.setActiveDomain(domainId)),
    setFromPush: payload => dispatch(userActions.setFromPush(payload))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NotificationAlert)
