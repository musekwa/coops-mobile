import React, { useState, useEffect, useRef } from 'react'
import { View, Text } from 'react-native'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDateRangeStore } from 'src/store/trades'
import TransactionStartDate from './TransactionStartDate'
import TransactionEndDate from './TransactionEndDate'

const DateRangeSchema = z.object({
	startDate: z.date(),
	endDate: z.date(),
})
// .refine(
// 	(data: any) => {
// 		if (data.startDate >= data.endDate) {
// 			return false
// 		}
// 		return true
// 	},
// 	{
// 		message: 'A data de início deve ser pelo menos um dia antes da data de fim.',
// 		path: ['startDate'],
// 	},
// )

type DateRangeData = z.infer<typeof DateRangeSchema>

interface DateRangeSelectorProps {
	customErrors: Record<string, string>
	setCustomErrors: (customErrors: Record<string, string>) => void
	lastTransactionEndDate: Date | null
}

export default function DateRangeSelector({
	customErrors,
	setCustomErrors,
	lastTransactionEndDate,
}: DateRangeSelectorProps) {
	const [dateRangeError, setDateRangeError] = useState<string | null>(null)
	const { startDate: storeStartDate, endDate: storeEndDate } = useDateRangeStore()
	const customErrorsRef = useRef(customErrors)
	const lastErrorMessageRef = useRef<string | null>(null)

	// Keep ref in sync with prop
	useEffect(() => {
		customErrorsRef.current = customErrors
	}, [customErrors])

	const { control, getValues, setValue, watch, clearErrors } = useForm<DateRangeData>({
		defaultValues: {
			startDate: new Date(),
			endDate: new Date(),
		},
		resolver: zodResolver(DateRangeSchema),
	})

	const startDateValue = watch('startDate')

	// Validate dates and show errors
	useEffect(() => {
		if (!storeStartDate || !storeEndDate) return

		let hasError = false
		let errorMessage = ''

		// Check if lastTransactionEndDate is today - no new transactions allowed
		if (lastTransactionEndDate) {
			const today = new Date()
			today.setHours(0, 0, 0, 0)
			const lastDate = new Date(lastTransactionEndDate.getTime())
			lastDate.setHours(0, 0, 0, 0)

			if (lastDate.getTime() === today.getTime()) {
				hasError = true
				errorMessage =
					'Não é possível registar transacções quando a data da última monitoria é hoje. Aguarde até amanhã.'
			}
		}

		// Check if startDate is less than lastTransactionEndDate
		if (!hasError && lastTransactionEndDate && storeStartDate < lastTransactionEndDate) {
			hasError = true
			errorMessage = 'A data de início deve ser posterior ou igual à data da última monitoria.'
		}

		// Check if endDate is less than lastTransactionEndDate
		if (!hasError && lastTransactionEndDate && storeEndDate < lastTransactionEndDate) {
			hasError = true
			errorMessage = 'A data de fim deve ser posterior ou igual à data da última monitoria.'
		}

		// Check if startDate is greater than or equal to endDate
		if (!hasError && storeStartDate >= storeEndDate) {
			hasError = true
			errorMessage = 'A data de início deve ser pelo menos um dia antes da data de fim.'
		}

		// Only update state if error message changed
		if (errorMessage !== lastErrorMessageRef.current) {
			lastErrorMessageRef.current = errorMessage

			// Check if this is the "last transaction is today" error
			let isTodayError = false
			if (lastTransactionEndDate && errorMessage.includes('data da última monitoria é hoje')) {
				const today = new Date()
				today.setHours(0, 0, 0, 0)
				const lastDate = new Date(lastTransactionEndDate.getTime())
				lastDate.setHours(0, 0, 0, 0)
				isTodayError = lastDate.getTime() === today.getTime()
			}

			if (hasError) {
				if (isTodayError) {
					// Use customErrors.dateMismatch only, clear dateRangeError
					setDateRangeError(null)
					if (customErrorsRef.current.dateMismatch !== errorMessage) {
						setCustomErrors({ ...customErrorsRef.current, dateMismatch: errorMessage })
					}
				} else {
					// Use dateRangeError, clear dateMismatch
					setDateRangeError(errorMessage)
					if (customErrorsRef.current.dateMismatch) {
						setCustomErrors({ ...customErrorsRef.current, dateMismatch: '' })
					}
				}
			} else {
				// Clear both when no error
				setDateRangeError(null)
				if (customErrorsRef.current.dateMismatch) {
					setCustomErrors({ ...customErrorsRef.current, dateMismatch: '' })
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [storeStartDate, storeEndDate, lastTransactionEndDate])

	return (
		<View className="flex flex-col space-y-6 pb-3">
			<View className="flex flex-col dark:text-gray-400">
				{lastTransactionEndDate ? (
					<Text className="text-gray-600 dark:text-gray-400 text-[12px] italic text-center mx-4">
						Registar transacções ocorridas desde{' '}
						<Text className="font-bold text-[#008000]">
							{new Date(lastTransactionEndDate.getTime() + 86400000).toLocaleDateString('pt-BR')}
						</Text>
					</Text>
				) : (
					<Text className="text-gray-600 dark:text-gray-400 text-[12px] italic text-center mx-4">
						Registar transacções
					</Text>
				)}
			</View>

			<TransactionStartDate
				control={control}
				lastTransactionEndDate={lastTransactionEndDate}
				setValue={setValue}
				getValues={getValues}
			/>

			<TransactionEndDate
				control={control}
				lastTransactionEndDate={lastTransactionEndDate}
				startDate={startDateValue}
				setValue={setValue}
				getValues={getValues}
				setCustomErrors={setCustomErrors}
				customErrors={customErrors}
				clearErrors={clearErrors}
			/>

			<View className="mt-2">
				{dateRangeError && (
					<View className="bg-red-100 p-2 rounded-md">
						<Text className="text-red-500 text-[12px] text-center">{dateRangeError}</Text>
					</View>
				)}
				{customErrors.dateMismatch && (
					<View className="bg-red-100 p-2 rounded-md">
						<Text className="text-red-500 text-[12px] text-center">{customErrors.dateMismatch}</Text>
					</View>
				)}
			</View>
		</View>
	)
}
