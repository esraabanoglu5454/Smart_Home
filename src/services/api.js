// API servis katmanı - Mock data ile çalışır
// Gerçek API entegrasyonu için bu dosyayı güncelleyin

class ApiService {
  constructor() {
    this.baseUrl = 'https://api.akilliev.local'; // Mock URL
    // this.devices = this.initializeDevices();
    this.sensors = this.initializeSensors();
  }

  initializeSensors() {
    return [
      {
        id: '1',
        name: 'Sıcaklık',
        value: 23.5,
        unit: '°C',
        icon: '🌡️',
        room: 'Veriler',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Nem',
        value: 45,
        unit: '%',
        icon: '💧',
        room: 'Veriler',
        timestamp: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Hareket Sensörü',
        value: false,
        unit: '',
        icon: '💃🏼',
        room: 'Veriler',
        timestamp: new Date().toISOString(),
      },
      {
        id: '4',
        name: 'Gaz Sensörü',
        value: 0,
        unit: 'ppm',
        icon: '⛽',
        room: 'Veriler',
        timestamp: new Date().toISOString(),
      },
    ];
  }

  // Cihazları getir
  async getDevices() {
    // Simüle edilmiş API çağrısı
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: this.devices });
      }, 300);
    });
  }

  // Cihaz durumunu değiştir
  async toggleDevice(deviceId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const device = this.devices.find(d => d.id === deviceId);
        if (device) {
          device.status = !device.status;
          resolve({ success: true, data: device });
        } else {
          resolve({ success: false, error: 'Cihaz bulunamadı' });
        }
      }, 200);
    });
  }

  // Sensör verilerini getir
  async getSensors() {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Sensör değerlerini rastgele güncelle (simülasyon)
        this.sensors.forEach(sensor => {
          if (sensor.name === 'Sıcaklık') {
            sensor.value = (20 + Math.random() * 8).toFixed(1);
          } else if (sensor.name === 'Nem') {
            sensor.value = Math.floor(30 + Math.random() * 30);
          } else if (sensor.name === 'Işık Seviyesi') {
            sensor.value = Math.floor(500 + Math.random() * 500);
          }
          sensor.timestamp = new Date().toISOString();
        });
        resolve({ success: true, data: this.sensors });
      }, 300);
    });
  }

  // Klima sıcaklığını ayarla
  async setTemperature(deviceId, temperature) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const device = this.devices.find(d => d.id === deviceId && d.type === 'ac');
        if (device) {
          device.temperature = temperature;
          resolve({ success: true, data: device });
        } else {
          resolve({ success: false, error: 'Cihaz bulunamadı' });
        }
      }, 200);
    });
  }

  // Perde pozisyonunu ayarla
  async setCurtainPosition(deviceId, position) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const device = this.devices.find(d => d.id === deviceId && d.type === 'curtain');
        if (device) {
          device.position = position;
          device.status = position > 0;
          resolve({ success: true, data: device });
        } else {
          resolve({ success: false, error: 'Cihaz bulunamadı' });
        }
      }, 200);
    });
  }
}

export default new ApiService();

