import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { usePowerSyncStatus } from 'src/hooks/usePowerSyncStatus'
import { forceSync } from 'src/library/powersync/system'

export default function PowerSyncStatus() {
	const { isReady, isConnected, lastSyncedAt, error, status } = usePowerSyncStatus()

	const handleForceSync = async () => {
		try {
			console.log('Forcing PowerSync sync...')
			await forceSync()
		} catch (err) {
			console.error('Force sync failed:', err)
		}
	}

	if (__DEV__) {
		return (
			<View style={styles.container}>
				<Text style={styles.title}>PowerSync Status</Text>
				<Text style={[styles.status, { color: isConnected ? 'green' : 'red' }]}>
					{isConnected ? 'Connected' : 'Disconnected'}
				</Text>
				<Text style={styles.text}>Ready: {isReady ? 'Yes' : 'No'}</Text>
				{lastSyncedAt && <Text style={styles.text}>Last Synced: {lastSyncedAt.toLocaleTimeString()}</Text>}
				{error && <Text style={styles.error}>Error: {error}</Text>}
				<TouchableOpacity style={styles.button} onPress={handleForceSync}>
					<Text style={styles.buttonText}>Force Sync</Text>
				</TouchableOpacity>
				<Text style={styles.debug}>Debug: {JSON.stringify(status, null, 2)}</Text>
			</View>
		)
	}

	return null
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 50,
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
	error: {
		color: 'red',
		fontSize: 10,
		marginBottom: 5,
	},
	button: {
		backgroundColor: 'blue',
		padding: 5,
		borderRadius: 3,
		marginBottom: 5,
	},
	buttonText: {
		color: 'white',
		fontSize: 10,
		textAlign: 'center',
	},
	debug: {
		color: 'yellow',
		fontSize: 8,
		fontFamily: 'monospace',
	},
})
