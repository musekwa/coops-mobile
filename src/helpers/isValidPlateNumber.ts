// Plate number format: AAA 000 AA or AAA 00-00
// first type plate number: AAA 000 AA (three letters, three digits, two letters)
// second type plate number: AAA 00-00 (three letters, four digits with dash)
// first type plate number regex: /^[A-Z]{3} [0-9]{3} [A-Z]{2}$/
// second type plate number regex: /^[A-Z]{3} [0-9]{2}-[0-9]{2}$/

// parameter: firstPartPlate, secondPartPlate, thirdPartPlate

export const isPlateNumberValid = (
	firstPartPlate: string,
	secondPartPlate: string,
	thirdPartPlate: string,
): boolean => {
	// Validate first part (must be exactly 3 capital letters)
	if (!/^[A-Z]{3}$/.test(firstPartPlate)) {
		return false
	}

	// Check if it's the second type format (with dash)
	if (secondPartPlate.includes('-')) {
		// Second type: AAA 00-00 (third part should be empty)
		if (thirdPartPlate !== '') {
			return false
		}
		// Validate second part format: 00-00 (two digits, dash, two digits)
		return /^\d{2}-\d{2}$/.test(secondPartPlate)
	} else {
		// First type: AAA 000 AA
		// Validate second part: exactly 3 digits
		if (!/^\d{3}$/.test(secondPartPlate)) {
			return false
		}
		// Validate third part: exactly 2 capital letters
		return /^[A-Z]{2}$/.test(thirdPartPlate)
	}
}
