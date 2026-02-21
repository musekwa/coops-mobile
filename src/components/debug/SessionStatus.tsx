import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useSessionManager } from 'src/hooks/useSessionManager'

export default function SessionStatus() {
	const { sessionStatus, needsAttention, isExpired, refreshSession } = useSessionManager()

	const formatTimeUntilExpiry = (seconds: number) => {
		if (seconds <= 0) return 'Expired'
		if (seconds < 60) return `${Math.round(seconds)}s`
		if (seconds < 3600) return `${Math.round(seconds / 60)}m`
		return `${Math.round(seconds / 3600)}h`
	}

	const handleRefreshSession = async () => {
		try {
			console.log('Manually refreshing session...')
			await refreshSession()
		} catch (err) {
			console.error('Manual session refresh failed:', err)
		}
	}

	if (__DEV__) {
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Session Status</Text>
				<Text style={[styles.status, { color: sessionStatus.isValid ? 'green' : 'red' }]}>
					{sessionStatus.isValid ? 'Valid' : 'Invalid'}
				</Text>

				{sessionStatus.expiresAt && (
					<Text style={styles.text}>Expires: {sessionStatus.expiresAt.toLocaleString()}</Text>
				)}

				<Text style={styles.text}>Time left: {formatTimeUntilExpiry(sessionStatus.timeUntilExpiry)}</Text>

				{sessionStatus.error && <Text style={styles.error}>Error: {sessionStatus.error}</Text>}

				{needsAttention && <Text style={styles.warning}>⚠️ Session expires soon</Text>}

				{isExpired && <Text style={styles.error}>❌ Session expired</Text>}

				<TouchableOpacity style={styles.button} onPress={handleRefreshSession}>
					<Text style={styles.buttonText}>Refresh Session</Text>
				</TouchableOpacity>
			</View>
		)
	}

	return null
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 100,
		right: 10,
		backgroundColor: 'rgba(0,0,0,0.8)',
		padding: 10,
		borderRadius: 5,
		maxWidth: 200,
		zIndex: 1000,
	},
	title: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 12,
		marginBottom: 5,
	},
	status: {
		fontSize: 10,
		fontWeight: 'bold',
		marginBottom: 2,
	},
	text: {
		color: 'white',
		fontSize: 10,
		marginBottom: 2,
	},
	warning: {
		color: 'orange',
		fontSize: 10,
		marginBottom: 2,
	},
	error: {
		color: 'red',
		fontSize: 10,
		marginBottom: 5,
	},
	button: {
		backgroundColor: 'blue',
		padding: 5,
		borderRadius: 3,
		marginTop: 5,
	},
	buttonText: {
		color: 'white',
		fontSize: 10,
		textAlign: 'center',
	},
})
