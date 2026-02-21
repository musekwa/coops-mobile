import React, { useCallback } from 'react'
import ImageHandleModal from '../modals/ImageHandleModal'
import { ShipmentType } from 'src/store/tracking/shipment'
import { updateOne } from 'src/library/powersync/sql-statements'
import { ActorDetailRecord, TABLES } from 'src/library/powersync/schemas/AppSchema'
import { CurrentResourceType } from 'src/store/actions/actions'

type Props = {
	showImageHandleModal: boolean
	setShowImageHandleModal: (value: boolean) => void
	title: string
	currentResource: CurrentResourceType
}

export default function UploadPhoto({ showImageHandleModal, setShowImageHandleModal, title, currentResource }: Props) {
	function isShipment(obj: any): obj is ShipmentType {
		if (obj === undefined) return false
		if (obj === null) return false

		if (obj.licenseId !== undefined) return true
		return false
	}

	const savePhoto = useCallback(
		async (photo: string) => {
			if (isShipment({})) {
			} else {
				try {
					// All actor types (FARMER, TRADER, GROUP) now use ACTOR_DETAILS
					await updateOne<ActorDetailRecord>(
						`UPDATE ${TABLES.ACTOR_DETAILS} SET photo = ?, updated_at = ? WHERE actor_id = ?`,
						[photo, new Date().toISOString(), currentResource.id],
					)
					console.log('Photo saved')
				} catch (error) {
					console.log('ImageSaving:', error)
					throw error
				}
			}
		},
		[currentResource.name, currentResource.id],
	)
	const deletePhoto = useCallback(() => {
		if (isShipment({})) {
		} else {
			try {
				setShowImageHandleModal(false)
			} catch (error) {
				console.log('ImageDeletion:', error)
				setShowImageHandleModal(false)
				throw error
			}
		}
	}, [])

	return (
		<ImageHandleModal
			title={title}
			savePhoto={savePhoto}
			deletePhoto={deletePhoto}
			showImageHandleModal={showImageHandleModal}
			setShowImageHandleModal={setShowImageHandleModal}
		/>
	)
}
