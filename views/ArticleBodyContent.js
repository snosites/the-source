import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    WebView,
    ImageBackground,
    Dimensions,
    Platform,
    ActivityIndicator
} from 'react-native';

import Moment from 'moment';
import HTML from 'react-native-render-html';
import { WebBrowser, Haptic } from 'expo';

import TouchableItem from '../constants/TouchableItem';
import Slideshow from './Slideshow';

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

const MEDIASIZE = viewportHeight * 0.32;
const MEDIAWIDTH = viewportWidth * 0.90;


export default class ArticleBodyContent extends React.Component {
    
    render() {
        const { theme, article } = this.props;

        return (
            <View key={article.id}>
                <View style={styles.featuredMediaContainer}>
                    {this._renderFeaturedMedia(article)}
                </View>
                <View style={{ paddingHorizontal: 20, alignItems: 'center' }}>
                    <HTML
                        html={article.title.rendered}
                        baseFontStyle={{ fontSize: 30 }}
                        customWrapper={(text) => {
                            return (
                                <Text>{text}</Text>
                            )
                        }}
                        tagsStyles={{
                            rawtext: {
                                fontSize: 30,
                                fontWeight: 'bold',
                                textAlign: 'center',
                                paddingVertical: 10,
                                color: theme.dark ? 'white' : 'black'
                            }
                        }}
                    />
                    {article.custom_fields.sno_deck && article.custom_fields.sno_deck[0] ?
                        <HTML
                            html={article.custom_fields.sno_deck[0]}
                            baseFontStyle={{ fontSize: 22 }}
                            customWrapper={(text) => {
                                return (
                                    <Text>{text}</Text>
                                )
                            }}
                            tagsStyles={{
                                rawtext: {
                                    fontSize: 22,
                                    textAlign: 'center',
                                    paddingVertical: 10,
                                    color: theme.dark ? 'white' : 'black'
                                }
                            }}
                        />
                        :
                        null
                    }
                </View>
                <TouchableItem onPress={() => this._handleProfilePress(article)}>
                    <Text style={{
                        fontSize: 17,
                        textAlign: 'center',
                        paddingTop: 20,
                        color: theme.colors.accent
                    }}>
                        {this._getArticleAuthor(article)}
                    </Text>
                </TouchableItem>
                <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 10 }}>
                    {this._renderDate(article.date)}
                </View>
                <View style={styles.articleContents}>
                    <HTML
                        html={article.content.rendered}
                        imagesMaxWidth={Dimensions.get('window').width}
                        ignoredStyles={['height', 'width', 'display']}
                        textSelectable={true}
                        onLinkPress={(e, href) => this._viewLink(href)}
                        tagsStyles={{
                            p: {
                                fontSize: 18,
                                marginBottom: 15
                            },
                            img: {
                                height: MEDIASIZE,
                                width: MEDIAWIDTH,
                                borderRadius: 8
                            }
                        }}
                        classesStyles={{
                            'pullquote': { backgroundColor: '#eeeeee', borderRadius: 8, padding: 10, marginBottom: 15 },
                            'largequote': { fontSize: 21 },
                            'pullquotetext': { textAlign: 'left', fontSize: 21 },
                            'quotespeaker': { textAlign: 'left', fontSize: 14 },
                            'photowrap': {
                                display: 'none'
                            }
                        }}
                    />
                </View>
            </View>
        )
    }

    _renderFeaturedMedia = article => {
        const { theme, handleCaptionClick } = this.props;
        if (article.slideshow) {
            return (
                <Slideshow accentColor={theme.colors.accent} images={article.slideshow} />
            )
        }

        else if (article.custom_fields.video) {
            const source = article.custom_fields.video[0];
            if (source.includes('iframe')) {

                let regex = /<iframe.*?src="(.*?)"/;
                var src = regex.exec(source)[1];

                // console.log('reg ex', src)
                return (
                    <WebView
                        scalesPageToFit={true}
                        automaticallyAdjustContentInsets={false}
                        scrollEnabled={false}
                        bounces={false}
                        originWhitelist={["*"]}
                        allowsInlineMediaPlayback={true}
                        javaScriptEnabled
                        startInLoadingState={true}
                        renderLoading={() => (<View 
                            style={{
                                flex: 1,
                                height: MEDIASIZE,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <ActivityIndicator />
                        </View>)}
                        renderError={() => (<View
                            style={{
                                flex: 1,
                                height: MEDIASIZE,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Text style={{textAlign: 'center'}}>Sorry, the video failed to load</Text>
                        </View>)}
                        style={{ flex: 1, height: MEDIASIZE }}
                        source={{ uri: src }}
                    />
                )
            }
            let embedString = source.replace('watch?v=', 'embed/');

            return <WebView
                scalesPageToFit={true}
                automaticallyAdjustContentInsets={false}
                scrollEnabled={false}
                bounces={false}
                originWhitelist={["*"]}
                allowsInlineMediaPlayback={true}
                javaScriptEnabled
                startInLoadingState={true}
                renderLoading={() => (<View
                    style={{
                        flex: 1,
                        height: MEDIASIZE,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <ActivityIndicator />
                </View>)}
                renderError={() => (<View
                    style={{
                        flex: 1,
                        height: MEDIASIZE,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Text style={{ textAlign: 'center' }}>Sorry, the video failed to load</Text>
                </View>)}
                style={{ flex: 1, height: MEDIASIZE }}
                source={{ uri: embedString }}
            />
        }

        else if (article.featuredImage) {
            return (
                <ImageBackground
                    source={{ uri: article.featuredImage.uri }}
                    style={styles.featuredImage}
                >
                    <View style={styles.imageInfoContainer}>
                        <View style={styles.imageInfo}>
                            {article.featuredImage.caption ?
                                <HTML
                                    html={article.featuredImage.caption}
                                    baseFontStyle={{ fontSize: 12 }}
                                    customWrapper={(text) => {
                                        return (
                                            <Text ellipsizeMode='tail' numberOfLines={this.props.expandCaption ? null : 2} onPress={handleCaptionClick}>{text}</Text>
                                        )
                                    }}
                                    tagsStyles={{
                                        rawtext: {
                                            fontSize: 12,
                                            color: 'white'
                                        }
                                    }}
                                />
                                :
                                null
                            }
                            {article.featuredImage.photographer ?
                                <Text style={{ color: '#bdbdbd' }}>
                                    {article.featuredImage.photographer[0]}
                                </Text>
                                :
                                null
                            }
                        </View>
                    </View>
                </ImageBackground>
            )
        } else {
            return;
        }
    }

    _handleProfilePress = async article => {
        const { navigation } = this.props;
        if (Platform.OS === 'ios') {
            Haptic.selection();
        }
        const writerName = article.custom_fields.writer && article.custom_fields.writer[0];
        navigation.navigate('Profile', {
            writerName
        })
    }

    _getArticleAuthor = article => {
        if (article.custom_fields.writer) {
            if (article.custom_fields.jobtitle) {
                return `${article.custom_fields.writer} | ${article.custom_fields.jobtitle}`
            }
            else {
                return article.custom_fields.writer
            }
        }
        else {
            return ''
        }
    }

    _renderDate = date => {
        let dateNow = Moment();
        let subDate = Moment(date).subtract(7, 'days');
        console.log('moment date', subDate, dateNow)
        if (Moment().isAfter(Moment(date).add(7, 'days'))) {
            return (
                <Text style={{
                    fontSize: 15,
                    color: '#9e9e9e'
                }}
                >
                    {Moment(date).format('MMM D YYYY')}
                </Text>
            )
        } else {
            return (
                <Text style={{
                    fontSize: 15,
                    color: '#9e9e9e'
                }}
                >
                    {String(Moment(date).fromNow())}
                </Text>
            )
        }
    }

    _viewLink = async (href) => {
        let result = await WebBrowser.openBrowserAsync(href);
    }

}

const styles = StyleSheet.create({
    featuredMediaContainer: {
        flex: 1,
    },
    articleContents: {
        padding: 20,
    },
    featuredImage: {
        height: MEDIASIZE,
        resizeMode: 'cover'
    },
    imageInfoContainer: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    imageInfo: {
        backgroundColor: 'rgba(0,0,0,0.55)',
        padding: 10,
    },
})