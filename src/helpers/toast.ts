import Toast from "react-native-root-toast";

export const showToast = (message: string, color: string) => {
  const toast = Toast.show(message, {
    duration: Toast.durations.LONG,
    position: -100,
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 100,
    backgroundColor: color,
  });

  setTimeout(() => {
    Toast.hide(toast);
  }, 3000);
};
