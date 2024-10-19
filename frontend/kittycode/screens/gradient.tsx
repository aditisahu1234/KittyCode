import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StatusBar, Text, View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';

export default function GradientText(props) {
    return (
        <MaskedView maskElement={ <Text style={[props.style, {backgroundColor: 'transparent'}]}>{props.text}</Text> }>
            <LinearGradient
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                locations={[0.4, 1]}
                colors={["#FC80D1", "#C6FE4E"]}
            >
                <Text style={[props.style, {opacity:0}]}>{props.text}</Text>
            </LinearGradient>
        </MaskedView>
    )
}