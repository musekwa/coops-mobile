# PowerSync Configuration Fix

This document explains the changes made to fix PowerSync insert statement issues in preview and production modes.

## Problem

The original PowerSync configuration was incomplete, causing:

- Insert statements to fail silently in preview/production modes
- Data not syncing to the backend
- No proper error handling or fallback mechanisms

## Solution

### 1. Fixed PowerSync System Configuration (`system.ts`)

**Before:**

```typescript
export const setupPowerSync = async () => {
	const connector = new Connector()
	powersync.connect(connector) // Missing await and configuration
}
```

**After:**

```typescript
export const setupPowerSync = async () => {
	const connector = new Connector()
	await powersync.init() // Initialize database first
	await powersync.connect(connector, {
		fetchStrategy: FetchStrategy.Sequential, // Better for poor connections
		params: {
			batchSize: 100,
		},
	})

	if (powersync.connected) {
		await powersync.waitForFirstSync({ priority: 1 })
		return true
	}
	return false
}
```

### 2. Enhanced PowerSync Provider (`powersync-provider.tsx`)

- Added proper error handling
- Network status monitoring
- Automatic retry on network reconnection
- Connection status tracking

### 3. Insert Fallback Mechanism (`insert-utils.ts`)

Created utility functions that:

- Try PowerSync first
- Fall back to ApiClient if PowerSync fails
- Provide detailed error reporting
- Ensure data is saved even if PowerSync is down

### 4. PowerSync Status Hook (`usePowerSyncStatus.ts`)

A React hook that provides:

- Real-time connection status
- Last sync timestamp
- Error information
- Status debugging information

## Usage

### Basic Insert with Fallback

```typescript
import { insertWithFallback } from 'src/library/powersync/insert-utils'

const result = await insertWithFallback(
	'INSERT INTO farmers (id, name) VALUES (?, ?)',
	[farmerId, farmerName],
	'farmers',
	farmerData,
)

if (result.success) {
	console.log('Data saved successfully')
} else {
	console.error('Save failed:', result.message)
}
```

### Check PowerSync Status

```typescript
import { usePowerSyncStatus } from 'src/hooks/usePowerSyncStatus'

function MyComponent() {
	const { isReady, isConnected, lastSyncedAt, error } = usePowerSyncStatus()

	if (!isReady) {
		return <Text>PowerSync not ready</Text>
	}

	return <Text>PowerSync connected: {isConnected ? 'Yes' : 'No'}</Text>
}
```

### Debug Component (Development Only)

```typescript
import PowerSyncStatus from 'src/components/debug/PowerSyncStatus'

// Add to your app for debugging
<PowerSyncStatus />
```

## Environment Configuration

Make sure these environment variables are set:

```env
EXPO_PUBLIC_POWERSYNC_URL=your_powersync_url
EXPO_PUBLIC_CONNECTCAJU_BACKEND_URL=your_backend_url
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## Testing

1. **Development**: Check console logs for PowerSync connection status
2. **Preview/Production**: Use the debug component to monitor status
3. **Network Issues**: Test with poor/no network connection
4. **Fallback**: Verify ApiClient fallback works when PowerSync fails

## Migration Guide

To update existing insert functions:

1. Import the fallback utility:

```typescript
import { insertWithFallback } from '../powersync/insert-utils'
```

2. Replace direct PowerSync calls:

```typescript
// Before
const result = await powersync.execute(query, params)

// After
const result = await insertWithFallback(query, params, tableName, data)
```

3. Handle the result object:

```typescript
if (result.success) {
	console.log('Success:', result.message)
} else {
	console.error('Failed:', result.message)
}
```

## Troubleshooting

### PowerSync Not Connecting

- Check environment variables
- Verify network connectivity
- Check Supabase authentication
- Review console logs for errors

### Insert Statements Failing

- Check if PowerSync is connected
- Verify table names and column names
- Check for data type mismatches
- Review ApiClient fallback logs

### Data Not Syncing

- Check PowerSync connection status
- Verify sync rules configuration
- Check Supabase permissions
- Review PowerSync logs

## Files Modified

- `src/library/powersync/system.ts` - Main PowerSync configuration
- `src/library/powersync/powersync-provider.tsx` - React provider
- `src/library/powersync/insert-utils.ts` - Fallback utilities
- `src/hooks/usePowerSyncStatus.ts` - Status hook
- `src/components/debug/PowerSyncStatus.tsx` - Debug component
- `src/library/sqlite/inserts.ts` - Example updated insert function
