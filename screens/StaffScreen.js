import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    Image,
    ActivityIndicator,
    FlatList,
    TouchableOpacity
} from 'react-native';
import Moment from 'moment';
import { connect } from 'react-redux';
import { fetchProfiles } from '../redux/actions/actions';

import { NavigationEvents } from 'react-navigation';
import { Haptic, DangerZone } from 'expo';

const { Lottie } = DangerZone;
import { Divider, Colors as PaperColors, Card, Button } from 'react-native-paper';
import Colors from '../constants/Colors'
import { Ionicons } from '@expo/vector-icons';
import HeaderButtons, { HeaderButton, Item } from 'react-navigation-header-buttons';


// header icon native look component
const IoniconsHeaderButton = passMeFurther => (
    <HeaderButton {...passMeFurther} IconComponent={Ionicons} iconSize={30} color={Colors.tintColor} />
);

class StaffScreen extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const logo = navigation.getParam('headerLogo', null)
        return {
            title: navigation.getParam('menuTitle', 'Staff'),
            headerRight: (
                <HeaderButtons HeaderButtonComponent={IoniconsHeaderButton}>
                    <Item title="menu" iconName="ios-menu" onPress={() => navigation.openDrawer()} />
                </HeaderButtons>
            ),
            headerLeft: (
                logo &&
                <Image
                    source={{ uri: logo }}
                    style={{ width: 60, height: 30, borderRadius: 7, marginLeft: 10 }}
                    resizeMode='cover'
                />
            ),
        };
    };

    state = {
        activeYears: [],
        selectedIndex: 0,
        doneLoading: false
    }

    componentDidMount() {
        const { menus, navigation } = this.props;
        // if (this.animation) {
        //     this._playAnimation();
        // }
        navigation.setParams({
            headerLogo: menus.headerSmall
        })
        let years = navigation.getParam('activeYears', null);
        let sortedYears = years.sort();
        let indexNum = sortedYears.length - 2;
        this.setState({
            activeYears: sortedYears,
            selectedIndex: indexNum
        })
        if (this.animation) {
            this._playAnimation();
        }
        // needed for ref of flatlist to be available in did mount
        // setTimeout(() => {
        //     this._scrollToIndex(indexNum);
        // }, 500)
        setTimeout(() => {
            this.setState({
                doneLoading: true
            })
        }, 2000)
        this._getProfiles();
    }

    render() {

        const { navigation, profiles } = this.props;
        const { activeYears, selectedIndex, doneLoading } = this.state;
        console.log('testing', doneLoading, profiles.isLoaded);
        // console.log('active years', activeYears);
        if (!doneLoading || !profiles.isLoaded) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={styles.animationContainer}>
                        <Lottie
                            ref={animation => {
                                this.animation = animation;
                            }}
                            style={{
                                width: 300,
                                height: 300,
                            }}
                            loop={true}
                            speed={1}
                            autoPlay={true}
                            source={require('../assets/lottiefiles/profile-loader')}
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
                        extraData={this.state.selectedIndex}
                        ref={(ref) => { this.flatListRef = ref; }}
                        initialScrollIndex={selectedIndex}
                        keyExtractor={item => item}
                        horizontal={true}
                        renderItem={this._renderItem}
                        getItemLayout={(data, index) => (
                            { length: 135, offset: 135 * index, index }
                        )}
                    />
                </View>

                <ScrollView style={{ flex: 1 }}>
                    <NavigationEvents
                    // onWillFocus={payload => this._loadProfile(payload)}
                    />
                    <Text style={{ fontSize: 30, textAlign: 'center', paddingTop: 20, paddingBottom: 10 }}>
                        Staff Profiles
                        </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {profiles.items.map(profile => {
                            const temp = profile.schoolYears.filter(schoolyear => {
                                return schoolyear === activeYears[selectedIndex]
                            })
                            if (temp.length > 0) {
                                return (
                                    <View key={profile.ID} style={{ padding: 20, alignItems: 'center', width: 175 }}>
                                        {profile.featuredImage ?
                                            <Image
                                                source={{ uri: profile.featuredImage }}
                                                style={{
                                                    width: 150,
                                                    height: 150,
                                                    borderRadius: 75
                                                }}
                                            />
                                            :
                                            <Image
                                                source={{ uri: require('../assets/images/anon.png') }}
                                                style={{
                                                    width: 150,
                                                    height: 150,
                                                    borderRadius: 75
                                                }}
                                            />
                                        }
                                        <Text style={{ textAlign: 'center', fontSize: 25, paddingTop: 10 }}
                                            numberOfLines={2} ellipsizeMode='tail'
                                        >{profile.customFields.name[0]}</Text>
                                        <Text style={{ fontSize: 18, color: 'grey' }}>{profile.customFields.staffposition[0]}</Text>
                                        <Button 
                                            mode="contained"
                                            color='#0277bd' 
                                            style={{borderRadius: 4,
                                            margin: 5}}
                                            onPress={() => this._handleProfileClick(profile.customFields.name[0])}>
                                            View
                                        </Button>
                                    </View>
                                )
                            }

                        })}
                    </View>
                </ScrollView>
            </View>
        );
    }

    _getProfiles = () => {
        const { activeDomain, dispatch } = this.props;
        const url = activeDomain.url;
        dispatch(fetchProfiles(url));
    }

    _scrollToIndex = (index) => {
        this.flatListRef.scrollToIndex({ animated: true, index: index, viewPosition: 0.5 });
    }

    _handleProfileClick = (name) => {
        const { navigation } = this.props;
        navigation.navigate('Profile', {
            writerName: name
        })
    }

    _renderItem = ({ item, index }) => {
        const { selectedIndex } = this.state;
        return (
            <Card
                key={index}
                style={selectedIndex === index ? [styles.yearContainer, styles.selectedYear] : styles.yearContainer}
                onPress={() => {
                    this.setState({
                        selectedIndex: index
                    })
                    this._scrollToIndex(index)
                }}
            >
                <Card.Content>
                    <Text style={selectedIndex === index ? [styles.year, styles.selectedYear] : styles.year}>{item}</Text>
                </Card.Content>
            </Card>

        )
    }

    _playAnimation = () => {
        this.animation.reset();
        this.animation.play();
    };

}



const styles = StyleSheet.create({
    yearContainer: {
        width: 125,
        margin: 5,
        borderRadius: 5,
        justifyContent: 'center'
    },
    year: {
        // padding: 5,
        color: '#757575',
        fontSize: 18
    },
    selectedYear: {
        backgroundColor: '#0277bd',
        color: 'white'
    },
    animationContainer: {
        width: 300,
        height: 300,
        alignItems: 'center',
    },
});

const mapStateToProps = (state) => {
    return {
        activeDomain: state.activeDomain,
        menus: state.menus,
        profiles: state.profiles
    }
}

export default connect(mapStateToProps)(StaffScreen);