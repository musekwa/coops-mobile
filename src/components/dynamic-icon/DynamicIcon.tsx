import React from 'react';
import { View } from 'react-native';
import * as IconLibraries from '@expo/vector-icons';

type IconName = keyof typeof IconLibraries;
export type IconComponentType = typeof IconLibraries[IconName];

interface IconProps {
  library: IconName;
  name: string;
  size?: number;
  color?: string;
}

const DynamicIcon: React.FC<IconProps> = ({ library, name, size = 24, color = 'black' }) => {
  const IconComponent = IconLibraries[library] as IconComponentType;

  if (!IconComponent) {
    console.warn(`Icon library "${library}" not found`);
    return <View />;
  }

  return <IconComponent name={name} size={size} color={color} />;
};

// Usage example
const MenuIcon: React.FC<{ menuOption: string }> = ({ menuOption }) => {
  let iconProps: IconProps;

  switch (menuOption) {
    case 'home':
      iconProps = { library: 'Ionicons', name: 'home' };
      break;
    case 'settings':
      iconProps = { library: 'Feather', name: 'settings' };
      break;
    // Add more cases as needed
    default:
      iconProps = { library: 'MaterialIcons', name: 'error' };
  }

  return <DynamicIcon {...iconProps} />;
};

export { DynamicIcon, MenuIcon };