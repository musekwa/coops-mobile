import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { useColorScheme } from 'nativewind';

const { width: screenWidth } = Dimensions.get('window');
const LinearShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

export default function TabTransition() {
  const isDarkMode = useColorScheme().colorScheme === 'dark';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const shimmerColors = isDarkMode 
    ? ['rgba(220, 220, 220, 0.05)', 'rgba(220, 220, 220, 0.15)', 'rgba(220, 220, 220, 0.05)']
    : ['rgba(0, 0, 0, 0.03)', 'rgba(0, 0, 0, 0.08)', 'rgba(0, 0, 0, 0.03)'];

  useEffect(() => {
    // Fade in and slide up animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const renderHeaderSection = () => (
    <View className="px-4 py-6">
      {/* Main header with icon and title */}
      <View className="flex-row items-center mb-6">
        {/* @ts-expect-error - react-native-reanimated Animated.View type definitions don't include children */}
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
          }}
        >
          <View className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-green-600 items-center justify-center">
            <View className="w-6 h-6 rounded-full bg-white" />
          </View>
        </Animated.View>
        <View className="ml-4 flex-1">
          <LinearShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={{
              width: screenWidth * 0.4,
              height: 24,
              borderRadius: 6,
              marginBottom: 8,
            }}
          />
          <LinearShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={{
              width: screenWidth * 0.6,
              height: 16,
              borderRadius: 4,
            }}
          />
        </View>
      </View>

      {/* Search/Filter bar */}
      <LinearShimmerPlaceholder
        shimmerColors={shimmerColors}
        style={{
          width: '100%',
          height: 48,
          borderRadius: 24,
        }}
      />
    </View>
  );

  const renderStatsSection = () => (
    <View className="px-4 mb-6">
      <View className="flex-row justify-between space-x-3">
        {[1, 2, 3].map((_, index) => (
          <View key={index} className="flex-1">
            <LinearShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={{
                width: '100%',
                height: 80,
                borderRadius: 12,
              }}
            />
          </View>
        ))}
      </View>
    </View>
  );

  const renderContentSection = () => (
    <View className="px-4 flex-1">
      {/* Section header */}
      <View className="mb-4">
        <LinearShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={{
            width: screenWidth * 0.3,
            height: 20,
            borderRadius: 4,
            marginBottom: 8,
          }}
        />
      </View>

      {/* Content items - flexible layout */}
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={index} className="mb-4">
          <View className="flex-row items-center space-x-3">
            {/* Avatar/Icon */}
            <LinearShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
              }}
            />
            {/* Content */}
            <View className="flex-1">
              <LinearShimmerPlaceholder
                shimmerColors={shimmerColors}
                style={{
                  width: '80%',
                  height: 18,
                  borderRadius: 4,
                  marginBottom: 6,
                }}
              />
              <LinearShimmerPlaceholder
                shimmerColors={shimmerColors}
                style={{
                  width: '60%',
                  height: 14,
                  borderRadius: 4,
                  marginBottom: 4,
                }}
              />
              <LinearShimmerPlaceholder
                shimmerColors={shimmerColors}
                style={{
                  width: '40%',
                  height: 12,
                  borderRadius: 4,
                }}
              />
            </View>
            {/* Action button */}
            <LinearShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={{
                width: 60,
                height: 32,
                borderRadius: 16,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );

  const renderBottomSection = () => (
    <View className="px-4 py-6">
      {/* Pagination or action buttons */}
      <View className="flex-row justify-center space-x-4">
        {[1, 2, 3].map((_, index) => (
          <LinearShimmerPlaceholder
            key={index}
            shimmerColors={shimmerColors}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
            }}
          />
        ))}
      </View>
    </View>
  );

  return (
    <>
      {/* @ts-expect-error - react-native-reanimated Animated.View type definitions don't include children */}
      <Animated.View 
        className="flex-1 bg-white dark:bg-black w-[100%] pt-24"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
      {/* {renderHeaderSection()} */}
      {renderStatsSection()}
      {renderContentSection()}
      {/* {renderBottomSection()} */}
    </Animated.View>
    </>
  );
}