import React from 'react';
import * as LucideIcons from 'lucide-react-native';
import { LucideProps } from 'lucide-react-native';

interface DynamicIconProps extends LucideProps {
  name: string;
}

const ICON_ALIASES: Record<string, string> = {
  Home: 'House',
  Train: 'TrainFront',
  MoreHorizontal: 'Ellipsis',
  PlusCircle: 'CirclePlus',
  Edit: 'Pencil',
  Edit3: 'Pencil',
};

export const Icon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  // Normalize string to PascalCase matching Lucide component names
  const formattedName = name
    .split(/[-_ ]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const resolvedName = ICON_ALIASES[formattedName] || ICON_ALIASES[name] || formattedName;

  const iconsMap = LucideIcons as unknown as Record<string, React.FC<LucideProps>>;
  const IconComponent =
    iconsMap[resolvedName] ||
    iconsMap[formattedName] ||
    iconsMap[name] ||
    LucideIcons.CircleHelp;

  return <IconComponent {...props} />;
};
