
// This function checks if there are any duplicates in the identifiers array
export const checkDuplicates = (identifiers: string[], newIdentifier: string) => {
	// return all identifiers that are equal to the new identifier

    // Identifiers are of type string. check the similarities between the identifiers and the new identifier
	const duplicates = identifiers.filter((identifier) => identifier === newIdentifier)
	return duplicates
}


