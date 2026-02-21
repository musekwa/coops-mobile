import { View, Text } from 'react-native'
import React from 'react'
import { StyleSheet } from 'react-native'
import LottieView from 'lottie-react-native'

type LottiesViewProps = {
    animationViewStyle: any,
    animationStyle: any,
    source: any,
    autoPlay: boolean,
    speed: number,
    loop: boolean,
}

export default function LottiesView({
    animationViewStyle,
    animationStyle,
    source,
    autoPlay,
    speed,
    loop,
}: LottiesViewProps) {
  return (
    <View style={{...animationViewStyle}}>
        <LottieView
            source={source}
            autoPlay={autoPlay}
            speed={speed}
            loop={loop}
            style={{...styles.animationStyle, ...animationViewStyle}}
        />
    </View>
  )
}

const styles = StyleSheet.create({
    animationStyle: {
        width: 4,
        height: 3,
    },
    })
