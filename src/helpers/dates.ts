import {
	differenceInYears,
	differenceInMonths,
	differenceInDays,
	differenceInHours,
	differenceInMinutes,
	differenceInSeconds,
} from 'date-fns'
import { getFlattenedOrganizationTransactions } from './helpersToTrades'

export const getIntlDate = (date: Date) => {
	return Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

// Helper function to check if visit is overdue (more than 14 days)
export const isVisitOverdue = (lastVisitDate: Date | undefined) => {
	if (!lastVisitDate) return true
	const daysSinceLastVisit = Math.floor((new Date().getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24))
	return daysSinceLastVisit > 14
}

export const getLastVisitDateAtWarehouse = (transactions: any[]) => {
	return transactions.length > 0 ? transactions[transactions.length - 1].createdAt : undefined
}

export const getLastVisitDateAtOrg = (orgTransactions: any[], orgId: string) => {
	const orgTransactionsByOrg = orgTransactions.filter((transaction) => transaction.organizationId === orgId)
	const flattenedTransactions = getFlattenedOrganizationTransactions(orgTransactionsByOrg)
	if (flattenedTransactions.length === 0) return undefined
	const lastVisitedAt = flattenedTransactions.reduce((latest: any | undefined, transaction: any) => {
		if (!latest || transaction.createdAt > latest.createdAt) {
			return transaction
		}
		return latest
	}, undefined)
	if (!lastVisitedAt) return undefined
	return lastVisitedAt.createdAt
}

export const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export const getLastSixMonths = () => {
	const currentDate = new Date()
	const currentMonth = currentDate.getMonth()
	const currentYear = currentDate.getFullYear()

	return Array(6)
		.fill(0)
		.map((_, i) => {
			const date = new Date(currentYear, currentMonth - i, 1)
			return {
				name: monthNames[date.getMonth()],
				index: date.getMonth(),
				year: date.getFullYear(),
			}
		})
		.reverse()
}

// Returns an object with the days, months, and years arrays for the last 10 days (including current day)
export function getLast10DaysInfo() {
	const today = new Date()

	// Calculate the last 10 days (including current day)
	const days: number[] = []
	const months: number[] = []
	const years: number[] = []

	for (let i = 9; i >= 0; i--) {
		// Calculate the target date by subtracting i days from today
		const targetDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)

		const targetYear = targetDate.getFullYear()
		const targetMonth = targetDate.getMonth() + 1 // Convert 0-based to 1-based month
		const targetDay = targetDate.getDate()

		days.push(targetDay)

		// Add month if not already included
		if (!months.includes(targetMonth)) {
			months.push(targetMonth)
		}

		// Add year if not already included
		if (!years.includes(targetYear)) {
			years.push(targetYear)
		}
	}

	// Sort months and years in ascending order
	months.sort((a, b) => a - b)
	years.sort((a, b) => a - b)

	return { days, months, years }
}

// Given a date (day) and monht, and the current date, return the year in which the document was issued
// if the provided day and month indicate a date in December, while the current date is in January, the year of issue is the previous year
export const getIssuedYears = () => {
	const currentDate = new Date()
	const currentYear = currentDate.getFullYear()
	if (currentDate.getMonth() === 11 && currentDate.getDate() >= 23 && currentDate.getDate() <= 31) {
		return [currentYear - 1, currentYear]
	} else {
		return [currentYear]
	}
}

// Given the number of days, and the document issued date, calculate the expiration date
export const getExpirationDate = (days: number, documentIssuedDate: Date) => {
	const expirationDate = new Date(documentIssuedDate)
	expirationDate.setDate(expirationDate.getDate() + days)
	return expirationDate
}

export function generate7DaySlot() {
	const endDate = new Date() // Current date
	const startDate = new Date() // Start date initialized to current date
	startDate.setDate(endDate.getDate() - 6) // Subtract 6 days to include the current day in the 7-day slot

	// Creating the slot object
	const slot = {
		start: startDate,
		end: endDate,
	}
	return slot
}

export function generate15DaySlots() {
	const slots = []
	const endDate = new Date() as any // Current date as the end date
	const startDate = new Date(new Date().setMonth(endDate.getMonth() - 6)) as any // 6 months before the current date

	// Calculate the difference in days to adjust the first slot if necessary
	const daysDifference = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24))
	const initialSlotDays = Number(daysDifference) % 15

	// Adjust the initial slot start date if the first slot is not a full 15 days
	let slotStart = new Date(startDate)
	if (initialSlotDays > 0) {
		slotStart.setDate(startDate.getDate() + initialSlotDays)
	}

	let slotEnd = new Date(slotStart)
	slotEnd.setDate(slotEnd.getDate() + 14) // Set end date 14 days ahead to complete a 15-day slot

	while (slotEnd <= endDate) {
		slots.push({
			start: slotStart,
			end: slotEnd,
		})

		// Prepare the next slot start and end dates
		slotStart = new Date(slotEnd)
		slotStart.setDate(slotStart.getDate() + 1) // Move to the day after the current slot ends
		slotEnd = new Date(slotStart)
		slotEnd.setDate(slotEnd.getDate() + 14) // Prepare the next slot end date
	}

	// Add the last slot, which may not be a full 15 days
	if (slotStart < endDate) {
		slots.push({
			start: slotStart,
			end: endDate,
		})
	}
	return slots
}

export const getFullYears = (count = 40) => {
	const years = []
	for (let i = 0; i <= count; i++) {
		years[i] = { label: (new Date().getFullYear() - i).toString(), value: (new Date().getFullYear() - i).toString() }
	}
	return years
}

// Format date and time in pt (Portuguese) format day/month/year às hour:minute
export const getFormattedDateAndTime = (date: Date) => {
	return `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

// Format date in pt (Portuguese) format day/month/year
export const getFormattedDate = (date: Date) => {
	const dayOfMonth = date.toLocaleDateString('pt-BR', { day: '2-digit' })
	const month = date.toLocaleDateString('pt-BR', { month: 'long' })
	const year = date.toLocaleDateString('pt-BR', { year: 'numeric' })
	return `${dayOfMonth} de ${month} de ${year}`
}

export const getCompleteFormattedDate = (date: Date) => {
	// Format date in pt (Portuguese) format dayOfWeek, 02 Feb 2022
	const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'short' })
	const dayOfMonth = date.toLocaleDateString('pt-BR', { day: '2-digit' })
	const month = date.toLocaleDateString('pt-BR', { month: 'short' })
	const year = date.toLocaleDateString('pt-BR', { year: 'numeric' })
	return `${dayOfWeek}, ${dayOfMonth} de ${month} de ${year}`
}

// calculate full age based on date of birth
export const getFullAge = (date: Date) => {
	const today = new Date()
	const birthDate = new Date(date)
	let age = today.getFullYear() - birthDate.getFullYear()
	const m = today.getMonth() - birthDate.getMonth()
	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		age--
	}
	return age
}

// based on the date of registration, calculate the elapsed time or day or months or years since the registration
// return a string with the elapsed time

export const getElapsedTime = (date: Date) => {
	const today = new Date()
	const registrationDate = new Date(date)
	const timeDiff = Math.abs(today.getTime() - registrationDate.getTime())
	const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24))
	const diffMonths = Math.ceil(diffDays / 30)
	const diffYears = Math.ceil(diffDays / 365)
	return diffDays <= 30 ? `${diffDays} dia(s)` : diffMonths <= 12 ? `${diffMonths} mês(es)` : `${diffYears} ano(s)`
}

export function getTimeElapsedSinceRegistration(registrationDate: Date): string {
	const now = new Date()
	const years = differenceInYears(now, registrationDate)
	const months = differenceInMonths(now, registrationDate) % 12
	const days = differenceInDays(now, registrationDate) % 30 // Approximation, as months have varying lengths
	const hours = differenceInHours(now, registrationDate) % 24
	const minutes = differenceInMinutes(now, registrationDate) % 60
	const seconds = differenceInSeconds(now, registrationDate) % 60

	// Check each time component in descending order and return the first non-zero value
	if (years === 1) return `${years} ano`
	if (years > 1) return `${years} anos`
	if (months === 1) return `${months} mês`
	if (months > 1) return `${months} meses`
	if (days === 1) return `${days} dia`
	if (days > 1) return `${days} dias`
	if (hours === 1) return `${hours} hora`
	if (hours > 1) return `${hours} horas`
	if (minutes === 1) return `${minutes} min.`
	if (minutes > 1) return `${minutes} min.`
	if (seconds === 1) return `${seconds} seg.`
	if (seconds > 1) return `${seconds} seg.`

	return '0 segundos' // Return '0 segundos' if all values are zero
}

export const commercializationCampainsdateRange =
	new Date().getMonth() < 8
		? `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`
		: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`


export 	const formatDate = (date: string | null | undefined) => {
	try {
		const parsedDate = date ? new Date(date) : null
		return parsedDate && !isNaN(parsedDate.getTime())
			? Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(parsedDate)
			: 'Data inválida'
	} catch (error) {
		return 'Data inválida'
	}
}