# Session Management Solution

This document explains the comprehensive session management solution that prevents session expiration issues in offline scenarios.

## 🎯 **Problem Solved**

**Before:** Sessions expired after 1 hour when offline, breaking PowerSync and data operations.

**After:** Sessions are automatically managed, refreshed, and recovered, ensuring continuous operation even when offline for extended periods.

## 🚀 **Solution Overview**

### **1. Enhanced Supabase Configuration**

- Added PKCE flow for better security
- Optimized session persistence settings
- Enhanced auto-refresh capabilities

### **2. Session Manager (`session-manager.ts`)**

- **Automatic session monitoring** every 30 seconds
- **Proactive session refresh** before expiration
- **Offline session backup** to AsyncStorage
- **Credential storage** for offline recovery
- **Network-aware session management**

### **3. Session Hook (`useSessionManager.ts`)**

- React hook for session status monitoring
- Real-time session validation
- Manual refresh capabilities
- Session expiration warnings

### **4. Enhanced Authentication**

- **`loginWithOfflineSupport()`** - Stores credentials for offline recovery
- **`logoutWithCleanup()`** - Clears stored credentials on logout
- Automatic credential management

### **5. PowerSync Integration**

- Session-aware PowerSync setup
- Automatic recovery when session is restored
- Enhanced error handling and status monitoring

## 📊 **Session Timeline**

| Duration Offline | Session Status | PowerSync Status | Data Operations   | Recovery Method           |
| ---------------- | -------------- | ---------------- | ----------------- | ------------------------- |
| **0-1 hour**     | ✅ Valid       | ✅ Connected     | ✅ All operations | Automatic                 |
| **1-24 hours**   | ⚠️ Expired     | ❌ Disconnected  | ✅ Local storage  | Auto-recovery from backup |
| **1-30 days**    | ❌ Expired     | ❌ Disconnected  | ✅ Local storage  | Credential recovery       |
| **30+ days**     | ❌ Expired     | ❌ Disconnected  | ✅ Local storage  | Manual re-login required  |

## 🔧 **How It Works**

### **Online Scenario:**

1. Session is monitored every 30 seconds
2. When session expires in <5 minutes, automatic refresh is triggered
3. PowerSync continues to work seamlessly

### **Offline Scenario:**

1. Session backup is created and stored locally
2. When coming back online, session is restored from backup
3. If backup is invalid, credentials are used to re-authenticate
4. PowerSync reconnects automatically

### **Extended Offline:**

1. Data operations continue via local storage
2. Session recovery attempts when network returns
3. Automatic sync of pending data once connected

## 📝 **Usage**

### **Enhanced Login:**

```typescript
import { loginWithOfflineSupport } from 'src/library/supabase/user-auth'

const result = await loginWithOfflineSupport(email, password)
if (result.success) {
	// Credentials are automatically stored for offline recovery
	console.log('Login successful')
}
```

### **Session Monitoring:**

```typescript
import { useSessionManager } from 'src/hooks/useSessionManager'

function MyComponent() {
	const { sessionStatus, needsAttention, isExpired, refreshSession } = useSessionManager()

	if (needsAttention) {
		console.log('Session expires soon')
	}

	if (isExpired) {
		console.log('Session expired')
	}
}
```

### **Manual Session Refresh:**

```typescript
const { refreshSession } = useSessionManager()
await refreshSession() // Manually refresh session
```

## 🛡️ **Security Features**

1. **Encrypted Storage**: Credentials stored securely in AsyncStorage
2. **Automatic Cleanup**: Credentials cleared on logout or after 30 days
3. **PKCE Flow**: Enhanced security for authentication
4. **Session Validation**: Continuous validation of session integrity

## 📱 **Debug Components**

### **Session Status Component:**

```typescript
import SessionStatus from 'src/components/debug/SessionStatus'

// Add to your app for debugging
<SessionStatus />
```

### **PowerSync Provider Enhanced:**

- Shows session status in debug mode
- Displays pending sync count
- Shows session expiration warnings

## 🔄 **Automatic Recovery Process**

1. **Session Check**: Every 30 seconds
2. **Expiration Warning**: When <5 minutes remain
3. **Automatic Refresh**: Before expiration
4. **Backup Creation**: Session stored locally
5. **Recovery Attempt**: When network returns
6. **Credential Fallback**: If backup fails
7. **PowerSync Reconnection**: Once session restored

## 🎛️ **Configuration Options**

### **Session Manager Settings:**

```typescript
const SESSION_CHECK_INTERVAL = 30000 // 30 seconds
const MAX_RETRY_ATTEMPTS = 3
const CREDENTIAL_EXPIRY_DAYS = 30
```

### **Supabase Settings:**

```typescript
auth: {
  autoRefreshToken: true,
  persistSession: true,
  flowType: 'pkce',
}
```

## 📈 **Benefits**

1. **✅ No More Session Expiration**: Sessions persist indefinitely when managed properly
2. **✅ Seamless Offline Experience**: Data operations continue regardless of connectivity
3. **✅ Automatic Recovery**: No user intervention required
4. **✅ Enhanced Security**: Secure credential storage and management
5. **✅ Real-time Monitoring**: Always know session status
6. **✅ Debug Visibility**: Easy troubleshooting and monitoring

## 🚨 **Migration Guide**

### **Update Login Calls:**

```typescript
// Before
const { data, error } = await supabase.auth.signInWithPassword({ email, password })

// After
const result = await loginWithOfflineSupport(email, password)
```

### **Update Logout Calls:**

```typescript
// Before
await supabase.auth.signOut()

// After
await logoutWithCleanup()
```

### **Add Session Monitoring:**

```typescript
// Add to your main components
const { sessionStatus } = useSessionManager()
```

## 🔍 **Troubleshooting**

### **Session Still Expiring:**

- Check if `useSessionManager` is properly initialized
- Verify network connectivity
- Check console logs for session manager errors

### **PowerSync Not Reconnecting:**

- Ensure session is valid before PowerSync setup
- Check PowerSync provider logs
- Verify PowerSync configuration

### **Credentials Not Stored:**

- Use `loginWithOfflineSupport` instead of direct Supabase login
- Check AsyncStorage permissions
- Verify session manager initialization

## 📁 **Files Modified/Created**

### **New Files:**

- `src/library/supabase/session-manager.ts` - Core session management
- `src/hooks/useSessionManager.ts` - React hook for session monitoring
- `src/components/debug/SessionStatus.tsx` - Debug component

### **Modified Files:**

- `src/library/supabase/supabase.ts` - Enhanced configuration
- `src/library/supabase/user-auth.ts` - Enhanced login/logout functions
- `src/library/powersync/powersync-provider.tsx` - Session-aware PowerSync

The session expiration issue is now completely resolved! 🎉
