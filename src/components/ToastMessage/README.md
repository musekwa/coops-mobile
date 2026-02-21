# 🍞 Custom Toast System

A beautiful, animated toast notification system inspired by [expo-animated-toast](https://github.com/rit3zh/expo-animated-toast) that appears at the bottom of the screen.

## ✨ Features

- **Beautiful Design**: Modern, rounded design with shadows and borders
- **Smooth Animations**: Slide-up entrance, scale animation, and slide-down exit
- **4 Toast Types**: Success, Error, Info, and Warning with distinct colors
- **Auto-dismiss**: Automatically hides after configurable duration
- **Manual Control**: Can be dismissed manually with close button
- **Safe Area Aware**: Respects device safe areas (notches, home indicators)
- **Touchable**: Can be tapped for custom actions
- **High Z-index**: Appears above all other content

## 🚀 Usage

### 1. Basic Usage

```tsx
import { useToast } from 'src/components/ToastMessage'

function MyComponent() {
	const { showSuccess, showError, showInfo, showWarning } = useToast()

	const handleSuccess = () => {
		showSuccess('Operation completed successfully!')
	}

	const handleError = () => {
		showError('Something went wrong!')
	}

	const handleInfo = () => {
		showInfo('Here is some information for you.')
	}

	const handleWarning = () => {
		showWarning('Please be careful with this action.')
	}

	return (
		<View>
			<Button onPress={handleSuccess} title="Show Success" />
			<Button onPress={handleError} title="Show Error" />
			<Button onPress={handleInfo} title="Show Info" />
			<Button onPress={handleWarning} title="Show Warning" />
		</View>
	)
}
```

### 2. Custom Duration

```tsx
// Show toast for 5 seconds instead of default 3 seconds
showSuccess('Custom duration message', 5000)
showError('Long error message', 8000)
```

### 3. Advanced Usage

```tsx
const { showToast, hideToast } = useToast()

// Custom toast with specific type and duration
showToast('Custom message', 'info', 4000)

// Manually hide toast
hideToast()
```

## 🎨 Toast Types & Colors

| Type        | Icon | Background       | Border                | Use Case              |
| ----------- | ---- | ---------------- | --------------------- | --------------------- |
| **Success** | ✅   | Green (#10b981)  | Dark Green (#059669)  | Successful operations |
| **Error**   | ❌   | Red (#ef4444)    | Dark Red (#dc2626)    | Errors and failures   |
| **Info**    | ℹ️   | Blue (#3b82f6)   | Dark Blue (#2563eb)   | General information   |
| **Warning** | ⚠️   | Orange (#f59e0b) | Dark Orange (#d97706) | Warnings and cautions |

## ⚙️ Configuration

### Default Settings

- **Duration**: 3000ms (3 seconds)
- **Position**: Bottom of screen with 20px margin
- **Animation Duration**: 300ms entrance, 250ms exit
- **Border Radius**: 16px
- **Shadow**: Subtle elevation with 8px shadow

### Customization

You can modify the toast appearance by editing the `toastConfig` object in `CustomToast.tsx`:

```tsx
const toastConfig = {
	success: {
		icon: 'checkmark-circle',
		backgroundColor: '#10b981', // Custom background color
		iconColor: '#ffffff', // Custom icon color
		textColor: '#ffffff', // Custom text color
		borderColor: '#059669', // Custom border color
	},
	// ... other types
}
```

## 🔧 Setup

The `ToastProvider` is already integrated in your `src/Providers.tsx` file, so you can use the toast system anywhere in your app without additional setup.

## 📱 Example Screenshots

The toast appears at the bottom of the screen with:

- Smooth slide-up animation from bottom
- Beautiful rounded design with shadows
- Type-specific colors and icons
- Close button for manual dismissal
- Auto-dismiss after specified duration

## 🎯 Best Practices

1. **Keep messages short** - Toast messages should be concise
2. **Use appropriate types** - Success for confirmations, Error for failures
3. **Don't overuse** - Toasts should provide value, not be annoying
4. **Consistent messaging** - Use similar language patterns across your app
5. **Accessibility** - Ensure sufficient contrast and readable text

## 🔄 Migration from react-native-toast-message

If you were using `react-native-toast-message` before:

```tsx
// Old way
import Toast from 'react-native-toast-message'
Toast.show({
	text1: 'Message',
	type: 'success',
})

// New way
import { useToast } from 'src/components/ToastMessage'
const { showSuccess } = useToast()
showSuccess('Message')
```

The new system provides a cleaner, more modern API with better animations and design!
