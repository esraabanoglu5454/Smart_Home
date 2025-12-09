import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CurtainControl = ({ device, onPositionChange }) => {
  const positions = [0, 25, 50, 75, 100];

  const handlePositionSelect = (position) => {
    onPositionChange(position);
  };

  const getPositionLabel = (position) => {
    if (position === 0) return 'Kapalı';
    if (position === 100) return 'Açık';
    return `${position}%`;
  };

  return (
    <View style={[styles.card, device.status && styles.cardActive]}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <Text style={styles.icon}>{device.icon}</Text>
          <View style={styles.info}>
            <Text style={styles.name}>{device.name}</Text>
            <Text style={styles.room}>{device.room}</Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {getPositionLabel(device.position)}
          </Text>
        </View>
      </View>

      <View style={styles.controlSection}>
        <Text style={styles.controlLabel}>Pozisyon Seçin</Text>
        <View style={styles.positionButtons}>
          {positions.map(position => (
            <TouchableOpacity
              key={position}
              style={[
                styles.positionButton,
                device.position === position && styles.positionButtonActive,
              ]}
              onPress={() => handlePositionSelect(position)}
            >
              <Text
                style={[
                  styles.positionButtonText,
                  device.position === position &&
                    styles.positionButtonTextActive,
                ]}
              >
                {getPositionLabel(position)}
              </Text>
            </TouchableOpacity>
          ))}
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
  cardActive: {
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e3f2fd',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
  },
  controlSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  controlLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  positionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  positionButton: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  positionButtonActive: {
    backgroundColor: '#1976d2',
  },
  positionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  positionButtonTextActive: {
    color: '#ffffff',
  },
});

export default CurtainControl;

