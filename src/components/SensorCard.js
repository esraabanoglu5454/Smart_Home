import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SensorCard = ({ sensor }) => {
  const formatValue = () => {
    if (typeof sensor.value === 'boolean') {
      return sensor.value ? 'Tespit Edildi' : 'Tespit Edilmedi';
    }
    return `${sensor.value} ${sensor.unit}`;
  };

  const formatTime = () => {
    const date = new Date(sensor.timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} saat önce`;
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Text style={styles.icon}>{sensor.icon}</Text>
          <View style={styles.info}>
            <Text style={styles.name}>{sensor.name}</Text>
            <Text style={styles.room}>{sensor.room}</Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.value}>{formatValue()}</Text>
          <Text style={styles.timestamp}>{formatTime()}</Text>
        </View>
      </View>
    </View>
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
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
});

export default SensorCard;

