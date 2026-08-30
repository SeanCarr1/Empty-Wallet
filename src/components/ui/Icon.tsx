import React from 'react';
import * as LucideIcons from 'lucide-react-native';
import { LucideProps } from 'lucide-react-native';

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const Icon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  // Normalize string to PascalCase matching Lucide component names
  const formattedName = name
    .split(/[-_ ]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const iconsMap = LucideIcons as unknown as Record<string, React.FC<LucideProps>>;
  const IconComponent = iconsMap[formattedName] || iconsMap[name] || LucideIcons.CircleHelp;

  return <IconComponent {...props} />;
};
