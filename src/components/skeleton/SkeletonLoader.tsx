import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const SkeletonLoader = ({ loading }: {loading: boolean}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      const animation = Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      );
      animation.start();
      return () => animation.stop();
    } else {
      Animated.timing(animatedValue).stop();
    }
  }, [loading, animatedValue]);

  const backgroundShimmer = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#F7F3F3', "#C0BCBE", '#B6B3B3'],
  });

  const getShimmerStyle = () => ({
    ...styles.shimmer,
    backgroundColor: backgroundShimmer,
  });

  return (
    <View style={[styles.container]} className="bg-white dark:bg-black">
      <Animated.View style={getShimmerStyle()}></Animated.View>
      <View style={styles.body}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Animated.View key={index} style={getShimmerStyle()}></Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 600,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  shimmer: {
    width: '90%',
    height: 50,
    marginBottom: 10,
    opacity: 0.6,
    borderRadius: 8,
  },
  body: {
    width: '100%',
    alignItems: 'center',
  },
});

export default SkeletonLoader;