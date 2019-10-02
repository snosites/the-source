import React from 'react';
import * as Icon from '@expo/vector-icons';

const TABICONDEFAULT = '#ccc';

export default class TabBarIcon extends React.Component {
    render() {
        const { color, horizontal } = this.props;
        return (
            <Icon.Ionicons
                name={this.props.name}
                size={26}
                style={{ marginBottom: -3 }}
                color={this.props.focused ? color : TABICONDEFAULT}
            />
        );
    }
}
