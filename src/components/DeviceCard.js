import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const DeviceCard = ({ device, onToggle }) => {
  const getStatusColor = () => {
    return device.status ? '#301934' : '#9e9e9e';
  };

  const getStatusText = () => {
    return device.status ? 'Açık' : 'Kapalı';
  };

  return (
    <TouchableOpacity
      style={[styles.card, device.status && styles.cardActive]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Text style={styles.icon}>{device.icon}</Text>
          <View style={styles.info}>
            <Text style={styles.name}>{device.name}</Text>
            <Text style={styles.room}>{device.room}</Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          {device.type === 'ac' && device.status && (
            <Text style={styles.temperature}>{device.temperature}°C</Text>
          )}
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor() },
            ]}
          />
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardActive: {
    borderLeftWidth: 4,
    borderLeftColor: '#301934',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  room: {
    fontSize: 14,
    color: '#666',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  temperature: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default DeviceCard;

