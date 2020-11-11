import React from 'react'
import { TouchableOpacity, Image, Text } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import * as Icon from '@expo/vector-icons'

import HomeScreenContainer from '../containers/HomeScreenContainer'
import ListScreenContainer from '../containers/ListScreenContainer'
import ArticleNavigator from './ArticleNavigator'
import FullArticleScreen from '../screens/FullArticleScreen'
import SearchScreen from '../screens/SearchScreen'
import ProfileScreen from '../screens/ProfileScreen'
import CommentsScreen from '../screens/CommentsScreen'
import StaffScreen from '../screens/StaffScreen'
import DefaultPageScreen from '../screens/DefaultPageScreen'

import HomeScreen from '../screens/HomeScreen'
import TestScreen from '../screens/TestScreen'

import HTML from 'react-native-render-html'

const Stack = createStackNavigator()

const ArticleStack = (props) => {
    const { homeScreenMode, theme, activeCategory, headerLogo, navigation } = props

    console.log('header logo', headerLogo)
    const CustomHeaderTitle = ({ children }) => {
        return (
            <HTML
                html={children}
                customWrapper={(text) => {
                    return (
                        <Text
                            ellipsizeMode='tail'
                            numberOfLines={1}
                            style={{ fontSize: 20, color: theme.primaryIsDark ? '#fff' : '#000' }}
                        >
                            {text}
                        </Text>
                    )
                }}
                baseFontStyle={{ fontSize: 20 }}
            />
        )
    }
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.colors.primary,
                },
                headerTintColor: theme.primaryIsDark ? '#fff' : '#000',
                headerRight: (props) => {
                    return (
                        <TouchableOpacity
                            onPress={() => navigation.openDrawer()}
                            style={{ flex: 1, paddingHorizontal: 15 }}
                        >
                            <Icon.Ionicons
                                style={{
                                    justifyContent: 'center',
                                    alignItems: 'stretch',
                                }}
                                name={'ios-menu'}
                                size={35}
                                // style={{ marginBottom: -3 }}
                                color={theme.primaryIsDark ? '#fff' : '#000'}
                            />
                        </TouchableOpacity>
                    )
                },
                headerLeft: () => {
                    if (headerLogo) {
                        return (
                            <Image
                                source={{ uri: headerLogo }}
                                style={{ width: 60, height: 35, borderRadius: 7, marginLeft: 10 }}
                                resizeMode='contain'
                            />
                        )
                    }
                    return null
                },
                headerTitleAlign: 'center',
            }}
        >
            {homeScreenMode === 'categories' ? (
                <Stack.Screen
                    name='Home'
                    component={HomeScreenContainer}
                    options={{ title: 'Home', headerTitle: CustomHeaderTitle }}
                />
            ) : null}
            <Stack.Screen
                name='List'
                component={ListScreenContainer}
                options={{ title: activeCategory, headerTitle: CustomHeaderTitle }}
            />
            <Stack.Screen
                name='ArticleNavigator'
                component={ArticleNavigator}
                options={{
                    headerShown: false,
                }}
            />
        </Stack.Navigator>
    )
}

export default ArticleStack
