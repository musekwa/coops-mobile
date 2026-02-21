
import { View, Text } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'

type StockItemProps = {
    icon: string
    label: string
    value: number
    color: string
}

export default function StockItem({ icon, label, value, color }: StockItemProps) {
  return (
    <View className="flex-row items-center mb-2">
    <MaterialCommunityIcons name={icon as any} size={24} color={color} />
    <Text className="ml-2 text-sm text-gray-600 dark:text-gray-400">{label}:</Text>
    <Text className="ml-auto text-base font-semibold" style={{ color }}>
        {Intl.NumberFormat('pt-BR', { style: 'decimal', maximumFractionDigits: 2 }).format(value)} kg
    </Text>
</View>
  )
}