import React from 'react';
import { Text } from 'react-native';
import { MaterialCommunityIcons, Ionicons, Octicons, AntDesign, FontAwesome, FontAwesome5, Feather, Entypo, SimpleLineIcons, EvilIcons, MaterialIcons } from '@expo/vector-icons';

export type IconFamily =
    | 'MaterialCommunityIcons'
    | 'Ionicons'
    | 'Octicons'
    | 'AntDesign'
    | 'FontAwesome'
    | 'FontAwesome5'
    | 'Feather'
    | 'Entypo'
    | 'SimpleLineIcons'
    | 'EvilIcons'
    | 'MaterialIcons';

interface AppIconProps {
    family?: IconFamily;
    name: any; // Expo vector icons accept string for name, but TS complains without `any` for dynamic names
    size?: number;
    color?: string;
    style?: any;
}

const IconComponents = {
    MaterialCommunityIcons,
    Ionicons,
    Octicons,
    AntDesign,
    FontAwesome,
    FontAwesome5,
    Feather,
    Entypo,
    SimpleLineIcons,
    EvilIcons,
    MaterialIcons
};

const AppIcon: React.FC<AppIconProps> = ({ family = 'MaterialCommunityIcons', name, size = 24, color = '#000', style }) => {
    const IconComponent = IconComponents[family];

    if (!IconComponent) {
        console.warn(`Icon family "${family}" not found. Rendering default.`);
        return <Text style={[{ fontSize: size, color }, style]}>?</Text>; // Fallback
    }

    return <IconComponent name={name} size={size} color={color} style={style} />;
};

export default AppIcon; 