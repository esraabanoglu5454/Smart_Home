import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import apiService from '../services/api';
import DeviceCard from '../components/DeviceCard';
import TemperatureControl from '../components/TemperatureControl';
import CurtainControl from '../components/CurtainControl';

const DeviceControlScreen = ({ onNavigate }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('all');

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const response = await apiService.getDevices();
      if (response.success) {
        setDevices(response.data);
      }
    } catch (error) {
      console.error('Cihaz yükleme hatası:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDevices();
  };

  const handleToggleDevice = async (deviceId) => {
    const response = await apiService.toggleDevice(deviceId);
    if (response.success) {
      setDevices(prevDevices =>
        prevDevices.map(device =>
          device.id === deviceId
            ? { ...device, status: response.data.status }
            : device
        )
      );
    }
  };

  const handleTemperatureChange = async (deviceId, temperature) => {
    const response = await apiService.setTemperature(deviceId, temperature);
    if (response.success) {
      setDevices(prevDevices =>
        prevDevices.map(device =>
          device.id === deviceId
            ? { ...device, temperature: response.data.temperature }
            : device
        )
      );
    }
  };

  const handleCurtainPositionChange = async (deviceId, position) => {
    const response = await apiService.setCurtainPosition(deviceId, position);
    if (response.success) {
      setDevices(prevDevices =>
        prevDevices.map(device =>
          device.id === deviceId
            ? {
                ...device,
                position: response.data.position,
                status: response.data.status,
              }
            : device
        )
      );
    }
  };

  const rooms = ['all', ...new Set(devices.map(d => d.room))];
  const filteredDevices =
    selectedRoom === 'all'
      ? devices
      : devices.filter(d => d.room === selectedRoom);

  const groupedDevices = filteredDevices.reduce((acc, device) => {
    if (!acc[device.type]) {
      acc[device.type] = [];
    }
    acc[device.type].push(device);
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cihaz Kontrolü</Text>
      </View>

      {/* Oda Filtresi */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {rooms.map(room => (
          <TouchableOpacity
            key={room}
            style={[
              styles.filterButton,
              selectedRoom === room && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedRoom(room)}
          >
            <Text
              style={[
                styles.filterText,
                selectedRoom === room && styles.filterTextActive,
              ]}
            >
              {room === 'all' ? 'Tümü' : room}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {Object.keys(groupedDevices).map(type => (
            <View key={type} style={styles.typeSection}>
              <Text style={styles.typeTitle}>
                {getTypeLabel(type)}
              </Text>
              {groupedDevices[type].map(device => (
                <View key={device.id}>
                  {device.type === 'ac' ? (
                    <TemperatureControl
                      device={device}
                      onToggle={() => handleToggleDevice(device.id)}
                      onTemperatureChange={(temp) =>
                        handleTemperatureChange(device.id, temp)
                      }
                    />
                  ) : device.type === 'curtain' ? (
                    <CurtainControl
                      device={device}
                      onPositionChange={(pos) =>
                        handleCurtainPositionChange(device.id, pos)
                      }
                    />
                  ) : (
                    <DeviceCard
                      device={device}
                      onToggle={() => handleToggleDevice(device.id)}
                    />
                  )}
                </View>
              ))}
            </View>
          ))}
          {filteredDevices.length === 0 && (
            <Text style={styles.emptyText}>Bu odada cihaz bulunamadı</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const getTypeLabel = (type) => {
  const labels = {
    light: 'Işıklar',
    ac: 'Klima',
    security: 'Güvenlik',
    curtain: 'Perdeler',
  };
  return labels[type] || type;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#301934',
    padding: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#1976d2',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  typeSection: {
    marginBottom: 24,
  },
  typeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 40,
    fontSize: 16,
  },
});

export default DeviceControlScreen;

