import { lottieAnimations } from '../utils/index';

export const getToastStyles = (type: string) => {
	switch (type) {
		case 'success':
			return {
				backgroundColor: '#def1d7',
				titleColor: '#1f8722',
				descriptionColor: '#1f8722',
                animationSource: lottieAnimations.success,
			}
		case 'error':
			return {
				backgroundColor: '#fae1db',
				titleColor: '#d9108a',
				descriptionColor: '#d9108a',
                animationSource: lottieAnimations.error,
			}
		case 'warning':
			return {
				backgroundColor: '#fef7ec',
				titleColor: '#f08135',
				descriptionColor: '#f08135',
                animationSource: lottieAnimations.warning,
			}
        case 'info':
            return {
                backgroundColor: '#e8f4fd',
                titleColor: '#0d6efd',
                descriptionColor: '#0d6efd',
                animationSource: lottieAnimations.info,
            }
		default:
			return {
				backgroundColor: 'white',
				titleColor: 'black',
				descriptionColor: 'gray',
                animationSource: lottieAnimations.success,
			}
	}
}
