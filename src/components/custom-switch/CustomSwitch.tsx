import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

type CustomSwitchProps = {
    value: boolean;
    onValueChange: (value: boolean) => void;
    activeColor?: string;
    inactiveColor?: string;
    activeTextColor?: string;
    inactiveTextColor?: string;
    activeText?: string;
    inactiveText?: string;
    };

export default function CustomSwitch({ 
  value, 
  onValueChange, 
  activeColor = '#008000', 
  inactiveColor = '#008000',
  activeTextColor = '#FFFFFF',
  inactiveTextColor = '#FFFFFF',
    activeText,
    inactiveText,

}: CustomSwitchProps) {
  const switchAnimation = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(switchAnimation, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, switchAnimation]);

  const backgroundColorInterpolation = switchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  const translateXInterpolation = switchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
    >
      <Animated.View style={[
        styles.switchTrack,
        { backgroundColor: backgroundColorInterpolation }
      ]}>
        <Animated.View style={[
          styles.switchThumb,
          { transform: [{ translateX: translateXInterpolation }] }
        ]} />
      </Animated.View>
      <View style={styles.labelContainer}>
        <Text style={[
          styles.label, 
          { color: value ? inactiveTextColor : activeTextColor }
        ]}>
          {inactiveText}
        </Text>
        <Text style={[
          styles.label, 
          { color: value ? activeTextColor : inactiveTextColor }
        ]}>
          {activeText}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchTrack: {
    width: 200,
    height: 40,
    borderRadius: 20,
    padding: 3,
  },
  switchThumb: {
    width: 94,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  labelContainer: {
    flexDirection: 'row',
    position: 'absolute',
    justifyContent: 'space-between',
    width: 180,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

