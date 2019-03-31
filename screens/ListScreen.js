import React from 'react';
import {
    Platform,
    AsyncStorage,
    View,
    ScrollView,
    Text,
    Image,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import Moment from 'moment';
import Colors from '../constants/Colors'
import TouchableItem from '../constants/TouchableItem';

import { EvilIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

import HeaderButtons, { HeaderButton, Item } from 'react-navigation-header-buttons';

import { Card, ListItem, Button, Icon } from 'react-native-elements'

// header icon native look component
const IoniconsHeaderButton = passMeFurther => (
    <HeaderButton {...passMeFurther} IconComponent={Ionicons} iconSize={30} color="blue" />
);

export default class ListScreen extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.getParam('menuTitle', 'Stories'),
            headerRight: (
                <HeaderButtons HeaderButtonComponent={IoniconsHeaderButton}>
                    <Item title="search" iconName="ios-menu" onPress={() => navigation.openDrawer()} />
                </HeaderButtons>
            ),
        };
    };


    render() {
        const { navigation } = this.props;
        let stories = navigation.getParam('content', 'loading')
        console.log('stories', stories)
        console.log('render in params', navigation.state)
        if (stories === 'loading') {
            return (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ActivityIndicator color='blue' />
                </View>
            )
        }
        return (
            <ScrollView style={{ flex: 1, marginVertical: 5 }}>
                {stories.map(story => {
                    console.log('story title', story.title.rendered)
                    return (
                        <TouchableOpacity
                            key={story.id}
                            onPress={this._handleArticlePress(story)}
                        >
                            <View style={styles.storyContainer}>
                                <Image source={{ uri: story.featuredImage }} style={styles.featuredImage} />
                                <View style={styles.storyInfo}>
                                    <Text ellipsizeMode='tail' numberOfLines={2} style={styles.title}>{story.title.rendered}</Text>
                                    <View style={styles.extraInfo}>
                                        <Text style={styles.date}>{Moment(story.modified).fromNow()}</Text>
                                        <View style={styles.socialIconsContainer}>

                                            <EvilIcons onPress={() => {
                                                alert('share')
                                            }} style={styles.socialIcon} name='share-google' size={28} color={Colors.tintColor} />
                                            <EvilIcons style={styles.socialIcon} name='star' size={28} color={Colors.tintColor} />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </ScrollView>
        );
    }

    _fetchCategoryStories = async () => {
        console.log('in fetchcatstories', this.props.navigation.getParam('categoryId'))
        try {
            const userDomain = await AsyncStorage.getItem('userDomain');
            const response = await fetch(`${userDomain}/wp-json/wp/v2/posts?categories=${this.props.navigation.getParam('categoryId')}`)
            const stories = await response.json();
            console.log('results', stories)
        }
        catch (error) {
            console.log('error saving users org', error)
        }
    }

    _handleArticlePress = article => async () => {
        const { navigation } = this.props;
        navigation.push('FullArticle', {
            articleId: article.id,
            article
        })
    }
}

const styles = StyleSheet.create({
    storyContainer: {
        flexDirection: 'row',
        flex: 1,
        marginHorizontal: 20,
        marginVertical: 15,
    },
    featuredImage: {
        width: 125,
        height: 90,
        borderRadius: 15
    },
    storyInfo: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'space-between'
    },
    extraInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flex: 1,
    },
    socialIconsContainer: {
        flexDirection: 'row',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    date: {
        fontSize: 15,
        color: 'grey'
    },
    socialIcon: {
        paddingHorizontal: 5
    }
});