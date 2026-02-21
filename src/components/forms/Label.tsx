import { Text } from "react-native";
import { cn } from "src/utils/tailwind";
type LabelProps = {
	label: string;
	className?: string;
};

export default function Label({ label, className }: LabelProps) {
	return <Text className={cn(`text-[14px] text-black dark:text-white font-normal pb-2 ${className}`)}>{label}</Text>;
}

