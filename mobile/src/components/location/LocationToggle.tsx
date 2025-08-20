import React from 'react';
import {Pressable} from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useLocation} from '../../hooks/useLocation';

interface LocationToggleProps {
  onToggle?: () => void;
}

const LocationToggle: React.FC<LocationToggleProps> = ({onToggle}) => {
  const {hasPermission, isLocationEnabled} = useLocation();

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    }
  };

  const getIconColor = () => {
    if (!hasPermission) return '#999';
    if (isLocationEnabled) return '#0088CC';
    return '#666';
  };

  const getIconName = () => {
    if (!hasPermission) return 'location-off';
    if (isLocationEnabled) return 'location-on';
    return 'location-searching';
  };

  return (
    <Pressable onPress={handleToggle}>
      <Icon
        name={getIconName()}
        size={20}
        color={getIconColor()}
      />
    </Pressable>
  );
};

export default LocationToggle;
