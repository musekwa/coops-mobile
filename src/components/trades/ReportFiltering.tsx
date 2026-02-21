import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Checkbox } from 'react-native-paper'
import SubmitButton from '../buttons/SubmitButton'
import { convertHTMLToURI } from 'src/helpers/pdf'
import { warehouseReportHTML } from 'src/helpers/html/warehouseReportHTML'
import ErrorAlert from '../dialogs/ErrorAlert'
import { useQueryMany, useUserDetails } from 'src/hooks/queries'
import { TransactionForReportType, WarehouseWithAddressAndOwnerAndContact } from 'src/features/trades/data/types'
import {
	CashewWarehouseTransactionRecord,
	OrganizationTransactionRecord,
	TABLES,
} from 'src/library/powersync/schemas/AppSchema'
import { queryMany } from 'src/library/powersync/sql-statements'
import { powersync } from 'src/library/powersync/system'
import { WarehouseDetailsType } from 'src/types'
import { getDistrictById } from 'src/library/sqlite/selects'
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import ConfirmOrCancelButtons from '../buttons/ConfirmOrCancelButtons'

const transactionTypes = [
	{ id: 'BOUGHT', label: 'Comprado' },
	{ id: 'SOLD', label: 'Vendido' },
	{ id: 'TRANSFERRED_IN', label: 'Recebido' },
	{ id: 'TRANSFERRED_OUT', label: 'Transferido' },
	{ id: 'EXPORTED', label: 'Exportado' },
	{ id: 'PROCESSED', label: 'Processado' },
	{ id: 'LOST', label: 'Desperdiçado' },
	{ id: 'AGGREGATED', label: 'Agregado' },
]

interface ReportFilteringProps {
	hint: string
	onGenerateReport: () => void
	pdfUri: string
	setPdfUri: (uri: string) => void
	storeDetails: {
		id: string
		description: string
		is_active: string
		owner_id: string
		address_id: string
		warehouse_type: string
	} | null
	transactions: TransactionForReportType[]
}

export default function ReportFiltering({
	hint,
	onGenerateReport,
	pdfUri,
	setPdfUri,
	storeDetails,
	transactions,
}: ReportFilteringProps) {
	const { userDetails } = useUserDetails()

	// Helper function to compare only dates (ignoring time)
	const isDateAfterToday = (date: Date): boolean => {
		const currentDate = new Date()
		const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
		const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
		return dateOnly > currentDateOnly
	}

	// Set intelligent default dates based on transaction data
	const getDefaultDates = () => {
		if (transactions.length === 0) {
			// Fallback to last 30 days if no transactions
			const fallbackStart = new Date()
			fallbackStart.setDate(fallbackStart.getDate() - 30)
			return { startDate: fallbackStart, endDate: new Date() }
		}

		// Find the earliest and latest dates from transactions
		let earliestDate = new Date()
		let latestDate = new Date(0) // Start from epoch

		transactions.forEach((transaction) => {
			if (transaction.start_date) {
				const startDate = new Date(transaction.start_date)
				if (!isNaN(startDate.getTime()) && startDate < earliestDate) {
					earliestDate = startDate
				}
			}
			if (transaction.end_date) {
				const endDate = new Date(transaction.end_date)
				if (!isNaN(endDate.getTime()) && endDate > latestDate) {
					latestDate = endDate
				}
			}
		})

		// If we found valid dates, use them; otherwise fallback
		if (earliestDate !== new Date() && latestDate !== new Date(0)) {
			// Set start date to beginning of the earliest transaction date
			const startDate = new Date(earliestDate)
			startDate.setHours(0, 0, 0, 0)

			// Set end date to end of the latest transaction date, but clamp to current date
			const endDate = new Date(latestDate)
			endDate.setHours(23, 59, 59, 999)

			// Ensure end date doesn't exceed current date (compare only dates, not time)
			if (isDateAfterToday(endDate)) {
				// Set to end of current day instead of exact current time
				const currentDate = new Date()
				endDate.setFullYear(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
				endDate.setHours(23, 59, 59, 999)
			}

			return { startDate, endDate }
		}

		// Fallback to last 30 days
		const fallbackStart = new Date()
		fallbackStart.setDate(fallbackStart.getDate() - 30)
		return { startDate: fallbackStart, endDate: new Date() }
	}

	const defaultDates = getDefaultDates()
	const [startDate, setStartDate] = useState(defaultDates.startDate)
	const [endDate, setEndDate] = useState(defaultDates.endDate)

	const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
	const [errorMessage, setErrorMessage] = useState('')
	const [errorAlert, setErrorAlert] = useState(false)
	const [dateErrors, setDateErrors] = useState<{ startDate?: string; endDate?: string }>({})
	const [isGeneratingReport, setIsGeneratingReport] = useState(false)

	const toggleTransaction = (id: string) => {
		setSelectedTransactions((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))

		// Clear any existing error messages when user makes changes
		if (errorAlert) {
			setErrorAlert(false)
			setErrorMessage('')
		}
		// Also clear the loading state if it was active
		if (isGeneratingReport) {
			setIsGeneratingReport(false)
		}
	}

	// Date validation functions - allow future start dates but limit end date to current date
	const validateStartDate = (date: Date): string | undefined => {
		// Allow future dates since transactions can be scheduled for the future
		return undefined
	}

	const validateEndDate = (date: Date, startDateValue: Date): string | undefined => {
		if (isDateAfterToday(date)) {
			return 'A data de fim não pode ser posterior à data atual'
		}
		if (date <= startDateValue) {
			return 'A data de fim deve ser posterior à data de início'
		}
		return undefined
	}

	const handleStartDateChange = (date: Date) => {
		setStartDate(date)
		const error = validateStartDate(date)
		setDateErrors((prev) => ({ ...prev, startDate: error }))

		// Also validate end date when start date changes
		if (endDate <= date) {
			const endDateError = validateEndDate(endDate, date)
			setDateErrors((prev) => ({ ...prev, endDate: endDateError }))
		} else {
			// Clear end date error if it's now valid
			setDateErrors((prev) => ({ ...prev, endDate: undefined }))
		}

		// Clear any existing error messages when user makes changes
		if (errorAlert) {
			setErrorAlert(false)
			setErrorMessage('')
		}
		// Also clear the loading state if it was active
		if (isGeneratingReport) {
			setIsGeneratingReport(false)
		}
	}

	const handleEndDateChange = (date: Date) => {
		setEndDate(date)
		const error = validateEndDate(date, startDate)
		setDateErrors((prev) => ({ ...prev, endDate: error }))

		// Clear start date error if it's now valid
		const startDateError = validateStartDate(startDate)
		if (!startDateError) {
			setDateErrors((prev) => ({ ...prev, startDate: undefined }))
		}

		// Clear any existing error messages when user makes changes
		if (errorAlert) {
			setErrorAlert(false)
			setErrorMessage('')
		}
		// Also clear the loading state if it was active
		if (isGeneratingReport) {
			setIsGeneratingReport(false)
		}
	}

	// Validate dates on component mount and set default transaction types
	useEffect(() => {
		// Only validate on mount, let handlers manage subsequent validation
		const startDateError = validateStartDate(startDate)
		const endDateError = validateEndDate(endDate, startDate)
		setDateErrors({ startDate: startDateError, endDate: endDateError })

		// Auto-select all transaction types if none are selected
		if (selectedTransactions.length === 0) {
			setSelectedTransactions(transactionTypes.map((t) => t.id))
		}
	}, []) // Empty dependency array - only run on mount

	const generateReport = async () => {
		setIsGeneratingReport(true)
		// Validate dates before proceeding
		const startDateError = validateStartDate(startDate)
		const endDateError = validateEndDate(endDate, startDate)

		if (startDateError || endDateError) {
			setDateErrors({ startDate: startDateError, endDate: endDateError })
			setErrorMessage('Por favor, corrija os erros de data antes de gerar o relatório')
			setErrorAlert(true)
			setIsGeneratingReport(false)
			return
		}

		// Check if at least one transaction type is selected
		if (selectedTransactions.length === 0) {
			setErrorMessage('Por favor, seleccione pelo menos um tipo de transação')
			setErrorAlert(true)
			setIsGeneratingReport(false)
			return
		}

		// Clear any existing date errors since validation passed
		setDateErrors({})

		const userDistrict = await getDistrictById(userDetails?.district_id || '')

		const filteredTransactions = transactions.filter((transaction) => {
			// Parse transaction dates more carefully
			let transactionStartDate: Date | null = null
			let transactionEndDate: Date | null = null

			try {
				if (transaction.start_date) {
					transactionStartDate = new Date(transaction.start_date)
					// Check if the date is valid
					if (isNaN(transactionStartDate.getTime())) {
						console.warn(`Invalid start_date for transaction ${transaction.id}:`, transaction.start_date)
						transactionStartDate = null
					}
				}

				if (transaction.end_date) {
					transactionEndDate = new Date(transaction.end_date)
					// Check if the date is valid
					if (isNaN(transactionEndDate.getTime())) {
						console.warn(`Invalid end_date for transaction ${transaction.id}:`, transaction.end_date)
						transactionEndDate = null
					}
				}
			} catch (error) {
				console.error(`Error parsing dates for transaction ${transaction.id}:`, error)
			}

			// Strict date range checking - transaction must fall within the selected range
			let isWithinDateRange = false

			if (transactionStartDate && transactionEndDate) {
				// Both dates exist: transaction must be completely within the selected range
				// OR have significant overlap with the selected range
				const transactionStartsInRange = transactionStartDate >= startDate && transactionStartDate <= endDate
				const transactionEndsInRange = transactionEndDate >= startDate && transactionEndDate <= endDate
				const transactionSpansRange = transactionStartDate <= startDate && transactionEndDate >= endDate

				isWithinDateRange = transactionStartsInRange || transactionEndsInRange || transactionSpansRange
			} else if (transactionStartDate) {
				// Only start date exists: it must fall within the selected range
				isWithinDateRange = transactionStartDate >= startDate && transactionStartDate <= endDate
			} else if (transactionEndDate) {
				// Only end date exists: it must fall within the selected range
				isWithinDateRange = transactionEndDate >= startDate && transactionEndDate <= endDate
			} else {
				// No dates exist: exclude this transaction
				isWithinDateRange = false
			}

			const matchesTransactionType = selectedTransactions.includes(transaction.transaction_type || '')

			return isWithinDateRange && matchesTransactionType
		})


		if (filteredTransactions.length === 0) {
			setErrorMessage('Não há transacções para o período e opções selecionadas')
			setErrorAlert(true)
			setIsGeneratingReport(false)
			return
		}
		const html = warehouseReportHTML(
			filteredTransactions as TransactionForReportType[],
			storeDetails,
			startDate,
			endDate,
			{
				name: userDetails?.full_name || '',
				role: userDetails?.user_role || '',
				district: userDistrict || '',
			},
		)
		const uri = await convertHTMLToURI(html)
		setPdfUri(uri)

		// action after generating the report
		onGenerateReport()
		setIsGeneratingReport(false)
	}

	return (
		<View className="flex-1 py-2 space-y-6">
			<Text className="text-gray-600 dark:text-gray-400 text-[14px] font-bold text-center">{`Relatório de Transacções de ${hint}`}</Text>
			<View className="space-y-2">
				<Text className="text-gray-600 dark:text-gray-400 text-[13px]">Período:</Text>
				<Text className="text-gray-500 dark:text-gray-500 text-[11px] italic">
					* A data de fim não pode ser posterior à data atual
				</Text>
				<Text className="text-gray-500 dark:text-gray-500 text-[11px]">
					Período selecionado: {startDate.toLocaleDateString('pt-BR')} a {endDate.toLocaleDateString('pt-BR')}
				</Text>
				<View className="flex flex-row justify-between space-x-2">
					<View className="flex-1">
						<TouchableOpacity
							onPress={() => {
								DateTimePickerAndroid.open({
									value: startDate,
									onChange: (event: any, selectedDate?: Date) => {
										if (selectedDate) {
											handleStartDateChange(selectedDate)
										}
									},
									mode: 'date',
									locale: 'pt-BR',
								})
							}}
							className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800"
						>
							<Text className="text-gray-700 dark:text-gray-300 text-center">
								{startDate.toLocaleDateString('pt-BR')}
							</Text>
						</TouchableOpacity>
						{dateErrors.startDate && <Text className="text-xs text-red-500 mt-1">{dateErrors.startDate}</Text>}
					</View>
					<View className="flex-1">
						<TouchableOpacity
							onPress={() => {
								DateTimePickerAndroid.open({
									value: endDate,
									onChange: (event: any, selectedDate?: Date) => {
										if (selectedDate) {
											handleEndDateChange(selectedDate)
										}
									},
									mode: 'date',
									locale: 'pt-BR',
									maximumDate: new Date(), // Prevent selecting future dates
								})
							}}
							className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800"
						>
							<Text className="text-gray-700 dark:text-gray-300 text-center">
								{endDate.toLocaleDateString('pt-BR')}
							</Text>
						</TouchableOpacity>
						{dateErrors.endDate && <Text className="text-xs text-red-500 mt-1">{dateErrors.endDate}</Text>}
					</View>
				</View>
			</View>
			<View className="space-y-2">
				<Text className="text-gray-600 dark:text-gray-400 text-[12px] italic">
					Seleccione as transacções que deseja incluir no relatório
				</Text>
				<View className="flex-row flex-wrap">
					{transactionTypes.map((type) => (
						<TouchableOpacity
							key={type.id}
							onPress={() => toggleTransaction(type.id)}
							className="w-1/2 flex-row items-center mb-2"
						>
							<Checkbox
								status={selectedTransactions.includes(type.id) ? 'checked' : 'unchecked'}
								onPress={() => toggleTransaction(type.id)}
							/>
							<Text className="ml-2 text-gray-600 dark:text-gray-400 text-[13px]">{type.label}</Text>
						</TouchableOpacity>
					))}
				</View>
			</View>
			<View className="">
				<ConfirmOrCancelButtons
					onCancel={() => {
						setSelectedTransactions([])
						setStartDate(defaultDates.startDate)
						setEndDate(defaultDates.endDate)
						setDateErrors({})
					}}
					isLoading={isGeneratingReport}
					onConfirm={generateReport}
					confirmText="Gerar Relatório"
					cancelText="Cancelar"
					onConfirmDisabled={
						!!dateErrors.startDate || !!dateErrors.endDate || selectedTransactions.length === 0 || isGeneratingReport
					}
				/>
			</View>
			<ErrorAlert
				title=""
				visible={errorAlert}
				setVisible={setErrorAlert}
				message={errorMessage}
				setMessage={setErrorMessage}
			/>
		</View>
	)
}
