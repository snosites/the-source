import React, { useEffect, useLayoutEffect, useState, useRef } from 'react'
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    Image,
    ActivityIndicator,
    FlatList,
} from 'react-native'
import Moment from 'moment'
import Color from 'color'

import LottieView from 'lottie-react-native'
import { Card, Button } from 'react-native-paper'

const StaffScreen = (props) => {
    const { route, navigation, activeDomain, global, profiles, theme, fetchProfiles } = props
    const [activeYears, setActiveYears] = useState([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [doneLoading, setDoneLoading] = useState(false)

    const animationRef = useRef(null)
    const flatListRef = useRef(null)

    let yearsParam = route.params && route.params.activeYears ? route.params.activeYears : []
    let customDisplay =
        route.params && route.params.customDisplay ? route.params.customDisplay : null
    let staffDisplay = route.params && route.params.staffDisplay ? route.params.staffDisplay : null

    useEffect(() => {
        if (route.params.title) {
            navigation.setOptions({
                title: route.params.title,
            })
        }
    }, [navigation, route.params?.title])

    useEffect(() => {
        _playAnimation()

        let years = []
        if (yearsParam && !Array.isArray(yearsParam)) {
            Object.keys(yearsParam).map((objKey) => {
                years.push(yearsParam[objKey])
            })
        } else {
            years = yearsParam
        }
        let sortedYears = years.sort()
        let indexNum

        if (customDisplay) {
            indexNum = sortedYears.indexOf(staffDisplay)
        } else {
            const thisYear = Moment().year()
            const nextYear = Moment().add(1, 'y').format('YYYY')
            const thisMonth = Moment().month()
            if (thisMonth >= Number(staffDisplay - 1)) {
                indexNum = years.findIndex((year) => {
                    return year.includes(thisYear && nextYear)
                })
            } else {
                indexNum = years.findIndex((year) => {
                    return year.includes(thisYear)
                })
            }
        }

        setActiveYears(sortedYears)
        setSelectedIndex(indexNum)

        // needed for ref of flatlist to be available in did mount
        // setTimeout(() => {
        //     this._scrollToIndex(indexNum);
        // }, 500)
        setTimeout(() => {
            setDoneLoading(true)
        }, 2000)
        _getProfiles(years[indexNum])
    }, [])

    const _playAnimation = () => {
        if (animationRef && animationRef.current) {
            animationRef.current.reset()
            animationRef.current.play()
        }
    }

    const _getProfiles = (year) => {
        fetchProfiles(activeDomain.url, year)
    }

    const _scrollToIndex = (index) => {
        if (flatListRef && flatListRef.cuurent) {
            flatListRef.current.scrollToIndex({ animated: true, index: index, viewPosition: 0.5 })
        }
    }

    const _handleProfileClick = (profile) => {
        console.log('profile', profile)
        if (profile.customFields?.terms) {
            navigation.push('ProfileModal', {
                profileId: profile.customFields.terms[0].term_id,
                profileName: profile.post_title,
            })
        } else {
            navigation.push('ProfileModal', {
                profileId: null,
                profileName: profile.post_title,
            })
        }
    }

    const _renderItem = ({ item, index }) => {
        let accentColor = Color(theme.colors.accent)
        let isDark = accentColor.isDark()
        return (
            <Card
                key={index}
                style={
                    selectedIndex === index
                        ? [
                              styles.yearContainer,
                              {
                                  color: theme.colors.text,
                              },
                          ]
                        : styles.yearContainer
                }
                onPress={() => {
                    setSelectedIndex(index)
                    _scrollToIndex(index)
                    _getProfiles(activeYears[index])
                }}
            >
                <Card.Content>
                    <Text
                        style={
                            selectedIndex === index
                                ? { fontSize: 18, color: theme.colors.accent, fontWeight: 'bold' }
                                : { fontSize: 18, color: theme.colors.text }
                        }
                    >
                        {item}
                    </Text>
                </Card.Content>
            </Card>
        )
    }

    if (!doneLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={styles.animationContainer}>
                    <LottieView
                        ref={animationRef}
                        style={{
                            width: 300,
                            height: 300,
                        }}
                        loop={true}
                        speed={0.8}
                        autoPlay={true}
                        source={require('../assets/lottiefiles/simple-loader-dots')}
                    />
                </View>
            </View>
        )
    }
    return (
        <View style={{ flex: 1 }}>
            <View>
                <FlatList
                    data={activeYears}
                    extraData={selectedIndex}
                    ref={flatListRef}
                    initialScrollIndex={selectedIndex}
                    keyExtractor={(item) => item}
                    horizontal={true}
                    renderItem={_renderItem}
                    getItemLayout={(data, index) => ({
                        length: 155,
                        offset: 155 * index,
                        index,
                    })}
                />
            </View>
            {profiles.isLoaded ? (
                <ScrollView style={{ flex: 1 }}>
                    <Text
                        style={{
                            fontSize: 30,
                            textAlign: 'center',
                            paddingTop: 20,
                            paddingBottom: 10,
                        }}
                    >
                        Staff Profiles
                    </Text>
                    <View>
                        {profiles.items.map((profile) => {
                            return (
                                <View
                                    key={profile.ID}
                                    style={{
                                        padding: 10,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Image
                                        source={
                                            profile.featuredImage
                                                ? { uri: profile.featuredImage }
                                                : require('../assets/images/anon.png')
                                        }
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 25,
                                        }}
                                    />
                                    <View style={{ flex: 1, marginLeft: 20 }}>
                                        <Text
                                            style={{
                                                fontSize: 25,
                                                paddingTop: 10,
                                                color: theme.colors.text,
                                            }}
                                            numberOfLines={2}
                                            ellipsizeMode='tail'
                                        >
                                            {profile.post_title}
                                        </Text>
                                        <Text style={{ fontSize: 18, color: theme.colors.gray }}>
                                            {profile.post_excerpt}
                                        </Text>
                                    </View>

                                    <Button
                                        mode='contained'
                                        color={theme.colors.accent}
                                        style={{ borderRadius: 4, margin: 5 }}
                                        onPress={() => _handleProfileClick(profile)}
                                    >
                                        View
                                    </Button>
                                </View>
                            )
                        })}
                    </View>
                </ScrollView>
            ) : (
                <View style={{ justifyContent: 'center', paddingTop: 20 }}>
                    <ActivityIndicator />
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    yearContainer: {
        width: 155,
        margin: 5,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    animationContainer: {
        width: 300,
        height: 300,
        alignItems: 'center',
    },
})

export default StaffScreen
