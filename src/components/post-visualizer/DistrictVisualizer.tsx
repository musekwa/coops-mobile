import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';

// Mock data for district positions (you should calculate or define these based on your needs)
const districtPositions = {
  Mogovolas: { x: 50, y: 100 },
  Angoche: { x: 200, y: 100 },
  // Add more districts with their positions
};

// Component to visualize districts and paths
export default function DistrictsVisualizer({ paths }){
  return (
    <View style={styles.container}>
      <Svg style={styles.svg}>
        {paths.map((path, index) => {
          // Draw lines for each path
          for (let i = 0; i < path.length - 1; i++) {
            const start = districtPositions[path[i]];
            const end = districtPositions[path[i + 1]];
            if (start && end) {
              return (
                <Line
                  key={index + '-' + i}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="black"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              );
            }
          }
        })}
      </Svg>
      {Object.entries(districtPositions).map(([district, position]) => (
        <View
          key={district}
          style={[styles.district, { left: position.x - 15, top: position.y - 15 }]}
        >
          <Text style={styles.districtText}>{district}</Text>
        </View>
      ))}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  svg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  district: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: 'skyblue',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  districtText: {
    fontSize: 8,
    color: 'white',
  },
});
