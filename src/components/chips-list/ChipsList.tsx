import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from 'src/constants';

type ChipListProps = {
    items: string[];
    onSelectionChange?: (selectedItems: string[]) => void;
    };

export default function ChipsList ({ items, onSelectionChange}: ChipListProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleItem = (item: string) => {
    const newSelectedItems = selectedItems.includes(item)
      ? selectedItems.filter(i => i !== item)
      : [...selectedItems, item];
    
    setSelectedItems(newSelectedItems);
    if (onSelectionChange) {
      onSelectionChange(newSelectedItems);
    }
  };

  return (
    <ScrollView  showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        {items.map((item, index) => (
          <TouchableOpacity
          className="flex flex-row space-x-1 items-center bg-gray-300"
          activeOpacity={0.8}
            key={index}
            style={[
              styles.chip,
              selectedItems.includes(item) && styles.selectedChip
            ]}
            onPress={() => toggleItem(item)}
          >
            <Text style={[
              styles.chipText,
              selectedItems.includes(item) && styles.selectedChipText
            ]}>
              {item}
            </Text>
            {
                selectedItems.includes(item) ? (
                    <Ionicons name="checkmark"  size={15} color={colors.white} />
                ) : (
                    <Ionicons name="close"  size={15} color={colors.gray800} />
                )
            }
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

type SingleChipSelectProps = {
    items: string[];
    onSelectionChange?: (selectedItem: string) => void;
    filteringOptions: string[];

    };

export const SingleChipSelect = ({ items, onSelectionChange, filteringOptions}: SingleChipSelectProps) => {

  
  
    return (
      <ScrollView  showsHorizontalScrollIndicator={false}>
        <View style={styles.container}>
          {items.map((item, index) => (
            <TouchableOpacity
            className="flex flex-row space-x-1 items-center bg-gray-300"
            activeOpacity={0.8}
              key={index}
              style={[
                styles.chip,
                filteringOptions.includes(item) && styles.selectedChip
              ]}
              onPress={() => {
                if (onSelectionChange) {
                    onSelectionChange(item);
                }
              }}
            >
              <Text style={[
                styles.chipText,
                filteringOptions.includes(item) && styles.selectedChipText
              ]}>
                {item}
              </Text>
              {
                  filteringOptions.includes(item) ? (
                      <Ionicons name="checkmark"  size={15} color={colors.white} />
                  ) : (
                      <Ionicons name="close"  size={15} color={colors.gray800} />
                  )
              }
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );

}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
  },
  chip: {
    // backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 10,
    marginRight: 20,
    marginTop: 8,
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: '#008000',
  },
  chipText: {
    fontSize: 13,
  },
  selectedChipText: {
    color: 'white',
  },
});
