import React from 'react'
import { View, Text, ViewProps } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { cn } from 'src/utils/tailwind'

interface ErrorDisplayProps  {
    message: string
	size?: 'xs' | 'sm' | 'md' | 'lg' 
	showIcon?: boolean
	centered?: boolean
	className?: string
}

export default function ErrorDisplay({ 
  message, 
  size = 'xs', 
  showIcon = true,
  centered = true,
  className,
  ...props 
}: ErrorDisplayProps) {
  const sizeConfig = {
    xs: {
      text: 'text-xs',
      icon: 12,
      gap: 'gap-1'
    },
    sm: {
      text: 'text-xs',
      icon: 16,
      gap: 'gap-1'
    },
    md: {
      text: 'text-sm',
      icon: 20,
      gap: 'gap-2'
    },
    lg: {
      text: 'text-base',
      icon: 24,
      gap: 'gap-3'
    }
  }

  return (
    <View 
      className={cn(
        'flex flex-row items-center', 
        sizeConfig[size].gap,
        centered && 'justify-center',
        className
      )}
      {...props}
    >
      {showIcon && (
        <Ionicons 
          name="warning-outline" 
          size={sizeConfig[size].icon} 
          color={colors.red} 
        />
      )}
      <Text className={cn(
        'text-red-500',
        sizeConfig[size].text
      )}>
        {message}
      </Text>
    </View>
  )
}