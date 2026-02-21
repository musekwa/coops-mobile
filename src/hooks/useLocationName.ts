import { useEffect, useState } from 'react'
import { useUserDetails } from 'src/hooks/queries'
import { getDistrictById } from 'src/library/sqlite/selects'

export function useLocationName() {
	const { userDetails, isLoading: isUserLoading } = useUserDetails()
	const [locationName, setLocationName] = useState<string>('')

	useEffect(() => {
		const fetchLocationName = async () => {
			if (userDetails?.district_id) {
				try {
					const district = (await getDistrictById(userDetails.district_id)) as string
					setLocationName(district || '')
				} catch (error) {
					console.error('Error fetching district name:', error)
					setLocationName('')
				}
			} else if (!isUserLoading) {
				setLocationName('')
			}
		}
		fetchLocationName()
	}, [userDetails?.district_id, isUserLoading])

	return locationName
}
