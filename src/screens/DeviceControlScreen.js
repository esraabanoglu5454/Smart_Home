import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ModesScreen = ({ onNavigate }) => {
  const [modes, setModes] = useState([]);
  const [sensorData, setSensorData] = useState({
    motion: { detected: false },
    gas: { level: 150 },
    water: { leak: false },
    temperature: { value: 24 },
    humidity: { value: 55 },
    curtain: { position: 50 }
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modlar tanımları
  const availableModes = [
    {
      id: 'vacation',
      name: 'Tatil Modu',
      icon: 'airplane',
      color: '#FF6B6B',
      description: 'Hareket algılandığında bildirim gönderir',
      sensors: ['motion'],
      actions: [
        'Hareket algılandığında bildirim gönder',
        'Tüm ışıkları kapat',
        
      ]
    },
    {
      id: 'sleep',
      name: 'Uyku Modu',
      icon: 'moon',
      color: '#4ECDC4',
      description: 'Gece için optimal ayarlar',
      sensors: ['motion', 'light'],
      actions: [
        'Tüm ışıkları kapat',
        'Perdeleri kapat',
        
      ]
    },
    {
      id: 'away',
      name: 'Evde Değilim',
      icon: 'lock-closed',
      color: '#95E1D3',
      description: 'Güvenlik öncelikli mod',
      sensors: ['motion', 'gas', 'water'],
      actions: [
        'Hareket algılandığında bildirim',
        'Gaz kaçağında bildirim ve alarm',
        'Su kaçağında ana vana kapatma uyarısı'
      ]
    },
    {
      id: 'energy_saving',
      name: 'Enerji Tasarrufu',
      icon: 'leaf',
      color: '#A8E6CF',
      description: 'Düşük güç tüketimi',
      sensors: ['motion', 'light'],
      actions: [
        '5 dk hareket yoksa ışıkları kapat',
        'Kullanılmayan cihazları kapat'
      ]
    },
    {
      id: 'morning',
      name: 'Günaydın Modu',
      icon: 'sunny',
      color: '#FFD93D',
      description: 'Sabah rutini',
      sensors: ['light', 'temperature'],
      actions: [
        'Perdeleri yavaşça aç',
        'Işıkları kademeli aç',
      ]
    },
    {
      id: 'security',
      name: 'Maksimum Güvenlik',
      icon: 'shield-checkmark',
      color: '#FF6B9D',
      description: 'Tüm sensörler aktif',
      sensors: ['motion', 'gas', 'water', 'door'],
      actions: [
        'Tüm sensörlerden anlık bildirim',
        'Hareket kaydı tut',
        'Gaz/su anormalliğinde alarm'
      ]
    }
  ];

  useEffect(() => {
    loadModes();
    
    // Sensör verilerini her 10 saniyede bir güncelle (simülasyon)
    const interval = setInterval(() => {
      simulateSensorData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadModes = () => {
    setLoading(true);
    // API yerine local state kullanıyoruz
    setTimeout(() => {
      setLoading(false);
      setRefreshing(false);
    }, 500);
  };

  const simulateSensorData = () => {
    // Rastgele sensör verileri simülasyonu (test için)
    setSensorData({
      motion: { detected: Math.random() > 0.9 },
      gas: { level: Math.floor(Math.random() * 300) + 100 },
      water: { leak: Math.random() > 0.95 },
      temperature: { value: Math.floor(Math.random() * 10) + 20 },
      humidity: { value: Math.floor(Math.random() * 40) + 40 },
      curtain: { position: Math.floor(Math.random() * 100) }
    });
    
    checkSensorAlerts(sensorData);
  };

  const checkSensorAlerts = (data) => {
    modes.forEach(activeModeId => {
      const mode = availableModes.find(m => m.id === activeModeId);
      if (!mode) return;

      // Tatil modu - hareket algılama
      if (mode.id === 'vacation' && data.motion?.detected) {
        sendAlert('⚠️ Tatil Modu Uyarısı', 'Evinizde hareket algılandı!');
      }

      // Gaz sensörü kontrolü
      if (data.gas?.level > 400) {
        sendAlert('🚨 GAZ KAÇAĞI!', 'Hemen gaz vanasını kapatın!');
      }

      // Su sensörü kontrolü
      if (data.water?.leak) {
        sendAlert('💧 SU KAÇAĞI!', 'Su kaçağı algılandı!');
      }

      // Sıcaklık uyarısı
      if (data.temperature?.value > 35) {
        sendAlert('🌡️ Yüksek Sıcaklık', 'Oda sıcaklığı çok yüksek!');
      }
    });
  };

  const sendAlert = (title, message) => {
    Alert.alert(title, message, [
      { text: 'Tamam', style: 'default' }
    ]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadModes();
  };

  const handleToggleMode = (modeId) => {
    const isActive = modes.includes(modeId);
    
    if (isActive) {
      // Modu kapat
      setModes(modes.filter(id => id !== modeId));
      
    } else {
      // Modu aç
      setModes([...modes, modeId]);
      
    }
  };

  const renderSensorStatus = () => {
    return (
      <View style={styles.sensorContainer}>
        <Text style={styles.sectionTitle}>Sensör Durumu</Text>
        
        <View style={styles.sensorGrid}>
          {/* Hareket Sensörü */}
          <View style={styles.sensorCard}>
            <Ionicons 
              name={sensorData.motion?.detected ? "walk" : "walk-outline"} 
              size={24} 
              color={sensorData.motion?.detected ? "#FF6B6B" : "#999"} 
            />
            <Text style={styles.sensorLabel}>Hareket</Text>
            <Text style={[
              styles.sensorValue,
              sensorData.motion?.detected && styles.sensorAlert
            ]}>
              {sensorData.motion?.detected ? 'Algılandı' : 'Normal'}
            </Text>
          </View>

          {/* Gaz Sensörü */}
          <View style={styles.sensorCard}>
            <Ionicons 
              name="cloud-outline" 
              size={24} 
              color={sensorData.gas?.level > 400 ? "#FF6B6B" : "#4ECDC4"} 
            />
            <Text style={styles.sensorLabel}>Gaz</Text>
            <Text style={[
              styles.sensorValue,
              sensorData.gas?.level > 400 && styles.sensorAlert
            ]}>
              {sensorData.gas?.level || 0} ppm
            </Text>
          </View>

          {/* Su Sensörü */}
          <View style={styles.sensorCard}>
            <Ionicons 
              name="water-outline" 
              size={24} 
              color={sensorData.water?.leak ? "#FF6B6B" : "#4ECDC4"} 
            />
            <Text style={styles.sensorLabel}>Su</Text>
            <Text style={[
              styles.sensorValue,
              sensorData.water?.leak && styles.sensorAlert
            ]}>
              {sensorData.water?.leak ? 'Kaçak!' : 'Normal'}
            </Text>
          </View>

          {/* Sıcaklık */}
          <View style={styles.sensorCard}>
            <Ionicons 
              name="thermometer-outline" 
              size={24} 
              color="#F38181" 
            />
            <Text style={styles.sensorLabel}>Sıcaklık</Text>
            <Text style={styles.sensorValue}>
              {sensorData.temperature?.value || 0}°C
            </Text>
          </View>

          {/* Nem */}
          <View style={styles.sensorCard}>
            <Ionicons 
              name="water" 
              size={24} 
              color="#95E1D3" 
            />
            <Text style={styles.sensorLabel}>Nem</Text>
            <Text style={styles.sensorValue}>
              %{sensorData.humidity?.value || 0}
            </Text>
          </View>

          {/* Perde Durumu */}
          <View style={styles.sensorCard}>
            <Ionicons 
              name="sunny-outline" 
              size={24} 
              color="#FFD93D" 
            />
            <Text style={styles.sensorLabel}>Perde</Text>
            <Text style={styles.sensorValue}>
              %{sensorData.curtain?.position || 0}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderModeCard = (mode) => {
    const isActive = modes.includes(mode.id);

    return (
      <View key={mode.id} style={styles.modeCard}>
        <View style={styles.modeHeader}>
          <View style={styles.modeIconContainer}>
            <View style={[styles.modeIcon, { backgroundColor: mode.color }]}>
              <Ionicons name={mode.icon} size={28} color="#fff" />
            </View>
            <View style={styles.modeInfo}>
              <Text style={styles.modeName}>{mode.name}</Text>
              <Text style={styles.modeDescription}>{mode.description}</Text>
            </View>
          </View>
          <Switch
            value={isActive}
            onValueChange={() => handleToggleMode(mode.id)}
            trackColor={{ false: '#D1D1D1', true: mode.color }}
            thumbColor="#fff"
          />
        </View>

        {isActive && (
          <View style={styles.modeDetails}>
            <Text style={styles.actionsTitle}>Aktif Aksiyonlar:</Text>
            {mode.actions.map((action, index) => (
              <View key={index} style={styles.actionItem}>
                <Ionicons name="checkmark-circle" size={16} color={mode.color} />
                <Text style={styles.actionText}>{action}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Modlar</Text>
      </View>

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
          {renderSensorStatus()}

          <View style={styles.modesContainer}>
            <Text style={styles.sectionTitle}>Otomatik Modlar</Text>
            {availableModes.map(mode => renderModeCard(mode))}
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#666" />
            <Text style={styles.infoText}>
              Modları aktif ettiğinizde sensörler otomatik olarak izlenir ve 
              belirlenen aksiyonlar gerçekleştirilir.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#44436A',
    padding: 20,
    paddingTop: 16,

  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  content: {
    flex: 1,
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
  sensorContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sensorCard: {
    width: '31%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  sensorLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  sensorValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sensorAlert: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  modesContainer: {
    backgroundColor: '#fff',
    padding: 16,
  },
  modeCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  modeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modeInfo: {
    flex: 1,
  },
  modeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 13,
    color: '#666',
  },
  modeDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 8,
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 2,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    lineHeight: 18,
  },
});

export default ModesScreen;