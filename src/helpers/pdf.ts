import { shareAsync } from "expo-sharing"
import * as Print from 'expo-print'

export const convertHTMLToURI = async (html: string) => {
		try {
		const { uri } = await Print.printToFileAsync({
			html,
			base64: true,
			margins: {
				left: 20,
				top: 50,
				right: 20,
				bottom: 100,
			},
		})
		return uri
	} catch (error) {
		console.error('There was an error printing to file:', error)
		throw new Error('There was an error printing to file')
	}
}


export const sharePDF = async (uri: string) => {
    try {
        await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' })
    } catch (error) {
        console.error('There was an error sharing the file:', error)
        throw new Error('There was an error sharing the file')
    }
}