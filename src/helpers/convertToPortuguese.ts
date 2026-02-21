import { groupManagerPositions } from 'src/constants'

export const positionLabelInPortuguese = (positionValue: string) => {
	if (!positionValue) return positionValue
	const positionLabel = groupManagerPositions.find((p) => p.value === positionValue)
	if (positionLabel) return positionLabel.label
	return positionValue
}
