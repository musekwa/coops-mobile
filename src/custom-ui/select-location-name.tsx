import { useEffect, useState } from 'react'
import { CustomPicker } from 'src/components/custom-select-item/CustomPicker'
import {
	AdminPostRecord,
	CountryRecord,
	DistrictRecord,
	ProvinceRecord,
	VillageRecord,
} from 'src/library/powersync/schemas/AppSchema'
import {
	selectAdminPostsByDistrictId,
	selectCountries,
	selectDistrictsByProvinceId,
	selectProvinces,
	selectVillagesByAdminPostId,
} from 'src/library/powersync/sql-statements'
import { LocationType } from 'src/types'

type Props = {
	currentValue: string
	valueName: string
	onChange: (v: string) => void
	placeholder: string
	referenceId?: string
	locationType: LocationType
}

export default function SelectLocationName({ currentValue, onChange, placeholder, referenceId, locationType }: Props) {
	const [locationNames, setLocationNames] = useState<{ label: string; value: string }[]>([])

	useEffect(() => {
		const fetchLocationNames = async () => {
			try {
				// Reset location names when referenceId changes (for dependent selects)
				if (locationType !== LocationType.PROVINCE && locationType !== LocationType.COUNTRY) {
					if (!referenceId || referenceId.trim() === '') {
						setLocationNames([])
						return
					}
				}

				if (locationType === LocationType.PROVINCE) {
					await selectProvinces((result: ProvinceRecord[]) => {
						if (result && Array.isArray(result)) {
							setLocationNames(
								result.map((r) => ({ label: r.name || '', value: r.id || '' })).filter((item) => item.value),
							)
						} else {
							setLocationNames([])
						}
					})
				} else if (locationType === LocationType.DISTRICT && referenceId) {
					await selectDistrictsByProvinceId(referenceId, (result: DistrictRecord[]) => {
						if (result && Array.isArray(result)) {
							setLocationNames(
								result.map((r) => ({ label: r.name || '', value: r.id || '' })).filter((item) => item.value),
							)
						} else {
							setLocationNames([])
						}
					})
				} else if (locationType === LocationType.ADMIN_POST && referenceId) {
					await selectAdminPostsByDistrictId(referenceId, (result: AdminPostRecord[]) => {
						if (result && Array.isArray(result)) {
							setLocationNames(
								result.map((r) => ({ label: r.name || '', value: r.id || '' })).filter((item) => item.value),
							)
						} else {
							setLocationNames([])
						}
					})
				} else if (locationType === LocationType.VILLAGE && referenceId) {
					await selectVillagesByAdminPostId(referenceId, (result: VillageRecord[]) => {
						if (result && Array.isArray(result)) {
							setLocationNames(
								result.map((r) => ({ label: r.name || '', value: r.id || '' })).filter((item) => item.value),
							)
						} else {
							setLocationNames([])
						}
					})
				} else if (locationType === LocationType.COUNTRY) {
					await selectCountries((result: CountryRecord[]) => {
						if (result && Array.isArray(result)) {
							setLocationNames(
								result.map((r) => ({ label: r.name || '', value: r.id || '' })).filter((item) => item.value),
							)
						} else {
							setLocationNames([])
						}
					})
				}
			} catch (error) {
				console.error('Error fetching location names:', error)
				setLocationNames([])
			}
		}
		fetchLocationNames()
	}, [locationType, referenceId])

	// Safely sort location names with null checks
	const sortedLocationNames = locationNames
		.filter((item) => item && item.label && item.value) // Filter out invalid items
		.sort((a, b) => {
			// Handle 'N/A' case - move to end
			if (a.label === 'N/A') return 1
			if (b.label === 'N/A') return -1
			// Case insensitive alphabetical sort
			return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
		})

	return (
		<CustomPicker
			value={currentValue || ''}
			placeholder={{ label: placeholder, value: null }}
			setValue={onChange}
			items={sortedLocationNames}
		/>
	)
}
