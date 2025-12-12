import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const NavigationBar = ({ currentScreen, onNavigate }) => {
  const navItems = [
    { id: 'home', label: 'Ana Sayfa', icon: '🏛️' },
    { id: 'devices', label: 'Modlar', icon: ' 🎮 ' },
    { id: 'sensors', label: 'Sensörler', icon: '🎛️' },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.navItem,
            currentScreen === item.id && styles.navItemActive,
          ]}
          onPress={() => onNavigate(item.id)}
        >
          <Text style={styles.icon}>{item.icon}</Text>
          <Text
            style={[
              styles.label,
              currentScreen === item.id && styles.labelActive,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: '#e3f2fd',
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  labelActive: {
    color: '#1976d2',
    fontWeight: '600',
  },
});

export default NavigationBar;

