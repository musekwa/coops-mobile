import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { cn } from 'src/utils/tailwind'
import { colors } from 'src/constants'
import { ActivityIndicator } from 'react-native'

interface SubmitButtonProps {
	onPress: ()=>void;
	title: string;
	isSubmitting?: boolean;
	disabled?: boolean
}

export default function SubmitButton({ onPress, title, isSubmitting = false, disabled = false }: SubmitButtonProps) {
	return (
		<TouchableOpacity
			activeOpacity={0.7}
			disabled={disabled}
			onPress={onPress}
			className={cn('bg-[#008000] disabled:bg-gray-300', {
				'opacity-60': (disabled || isSubmitting),
			})}
			style={{
				flexDirection: 'row',
				// backgroundColor: COLORS.main,
				width: '100%',
				height: 50,
				justifyContent: 'center',
				alignItems: 'center',
				borderRadius: 8,
				gap: 10
			}}
		>
			{isSubmitting && <ActivityIndicator color={colors.white} />}
			<Text
				style={{
					fontSize: 14,
					// fontFamily: 'RobotoCondensed-Thin',
					color: colors.white,
				}}
			>
				{title}
			</Text>
		</TouchableOpacity>
	)
}
