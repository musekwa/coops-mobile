import { View, Text, TextInput } from "react-native";
import React, { useState } from "react";
import { useColorScheme } from "nativewind";
import { colors } from "src/constants";

type CustomTextInputProps = {
  value: string | number | Date | undefined;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder: string;
  editable?: boolean;
  label: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad" | "decimal-pad" | "number-pad";
  multiline?: boolean;
  numberOfLines?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters" | undefined;
  autoCompleteType?: "off" | "email" | "password" | "username" | "name" | "tel" | "street-address" | "postal-code" | "cc-number" | "cc-csc" | "cc-exp" | "cc-exp-month" | "cc-exp-year" | "off";
  textContentType?: "none" |   "emailAddress" | "location" | "middleName" | "name" | "namePrefix" | "nameSuffix" | "nickname" | "organizationName" | "telephoneNumber" | "username" | "password" | "newPassword" | "oneTimeCode" | "organizationTitle" | "addressCity" ,
  style?: any;
};

export default function CustomTextInput({
  value,
  onChangeText,
  onBlur,
  placeholder,
  label,
  secureTextEntry = false,
  keyboardType = "default",
  multiline = false,
  numberOfLines = 1,
  autoCapitalize = "none",
  editable = true,
  autoCompleteType = "off",
  textContentType = "none",
  style = {},
}: CustomTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const isDarkMode = useColorScheme().colorScheme === 'dark';
  return (
    <View className="flex flex-col space-y-3">
{label &&      <Text className="text-[14px] font-normal text-black dark:text-white">
        {label}
      </Text>}
      <TextInput
        editable={editable}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={[style, {
          color: isDarkMode ? colors.white : colors.black,
        }]}
        placeholderTextColor="#808080" 
        placeholder={placeholder}
        autoCompleteType={autoCompleteType}
        value={value}
        onBlur={onBlur}
        onChangeText={onChangeText}
        onFocus={()=>{
          // the text input must be visible when it is focused and the keyboard is open
        }}
        autoCapitalize={autoCapitalize}
        textContentType={textContentType}
        className="border border-slate-300 p-3 text-[14px] shadow-sm shadow-black rounded-xl bg-gray-50 dark:bg-black"
      />
    </View>
  );
}
