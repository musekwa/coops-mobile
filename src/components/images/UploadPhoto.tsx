import React, { useCallback } from 'react'
import ImageHandleModal from '../modals/ImageHandleModal'
import { updateOne } from 'src/library/powersync/sql-statements'
import { ActorDetailRecord, TABLES } from 'src/library/powersync/schemas/AppSchema'
import { CurrentResourceType, useActionStore } from 'src/store/actions/actions'

type Props = {
	showImageHandleModal: boolean
	setShowImageHandleModal: (value: boolean) => void
	title: string
	currentResource: CurrentResourceType
	onError?: (message: string) => void
}

export default function UploadPhoto({
	showImageHandleModal,
	setShowImageHandleModal,
	title,
	currentResource,
	onError,
}: Props) {
	const { setToast } = useActionStore()

	const savePhoto = useCallback(
		async (photo: string) => {
			try {
				await updateOne<ActorDetailRecord>(
					`UPDATE ${TABLES.ACTOR_DETAILS} SET photo = ?, updated_at = ? WHERE actor_id = ?`,
					[photo, new Date().toISOString(), currentResource.id],
				)
				setToast({
					title: 'Foto gravada',
					description: 'A foto foi guardada com sucesso.',
					type: 'success',
					duration: 3000,
				})
			} catch (error) {
				console.error('ImageSaving:', error)
				const message = 'Erro ao gravar a foto. Tente novamente.'
				onError?.(message)
				setToast({
					title: 'Erro',
					description: message,
					type: 'error',
					duration: 4000,
				})
				throw error
			}
		},
		[currentResource.id, onError, setToast],
	)

	const deletePhoto = useCallback(async () => {
		try {
			await updateOne<ActorDetailRecord>(
				`UPDATE ${TABLES.ACTOR_DETAILS} SET photo = '', updated_at = ? WHERE actor_id = ?`,
				[new Date().toISOString(), currentResource.id],
			)
			setShowImageHandleModal(false)
			setToast({
				title: 'Foto apagada',
				description: 'A foto foi removida.',
				type: 'success',
				duration: 3000,
			})
		} catch (error) {
			console.error('ImageDeletion:', error)
			const message = 'Erro ao apagar a foto. Tente novamente.'
			onError?.(message)
			setToast({
				title: 'Erro',
				description: message,
				type: 'error',
				duration: 4000,
			})
		}
	}, [currentResource.id, onError, setShowImageHandleModal, setToast])

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
