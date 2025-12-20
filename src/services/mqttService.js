import Paho from 'paho-mqtt';

let pahoClient = null;
let isConnecting = false;
let messageQueue = []; // Queue for messages sent before connection is ready

const listeners = {
    message: new Set(),
};

/**
 * MQTT Message Wrapper to match expected interface
 */
const mqttWrapper = {
    on: (event, callback) => {
        if (event === 'message' && typeof callback === 'function') {
            listeners.message.add(callback);
        }
    },
    off: (event, callback) => {
        if (event === 'message') {
            listeners.message.delete(callback);
        }
    },
    publish: (topic, payload) => {
        if (!pahoClient || !pahoClient.isConnected()) {
            console.log(`MQTT henüz hazır değil, mesaj kuyruğa alındı: ${topic}`);
            messageQueue.push({ topic, payload });
            return;
        }
        try {
            const message = new Paho.Message(payload);
            message.destinationName = topic;
            pahoClient.send(message);
            console.log(`MQTT Mesaj gonderildi - ${topic}: ${payload}`);
        } catch (error) {
            console.error('MQTT publish hatasi:', error);
        }
    }
};

const onConnectionLost = (responseObject) => {
    isConnecting = false;
    if (responseObject.errorCode !== 0) {
        console.log('MQTT Bağlantısı kaybedildi:', responseObject.errorMessage);
        // Otomatik yeniden bağlanma
        setTimeout(() => connectMQTT(), 5000);
    }
};

const onMessageArrived = (message) => {
    const topic = message.destinationName;
    const payload = message.payloadString;
    listeners.message.forEach(callback => {
        try {
            callback(topic, payload);
        } catch (err) {
            console.error('MQTT callback hatasi:', err);
        }
    });
};

const flushMessageQueue = () => {
    if (messageQueue.length > 0) {
        console.log(`Kuyruktaki ${messageQueue.length} mesaj gönderiliyor...`);
        const currentQueue = [...messageQueue];
        messageQueue = [];
        currentQueue.forEach(msg => {
            mqttWrapper.publish(msg.topic, msg.payload);
        });
    }
};

export const connectMQTT = () => {
    if (pahoClient && pahoClient.isConnected()) {
        return mqttWrapper;
    }

    if (isConnecting) {
        return mqttWrapper;
    }

    isConnecting = true;

    try {
        const mqttUri = process.env.EXPO_PUBLIC_HIVE_MQ_URL;
        const user = process.env.EXPO_PUBLIC_HIVE_MQ_USERNAME;
        const pass = process.env.EXPO_PUBLIC_HIVE_MQ_PASSWORD;

        // URL'den host ve port ayıklama
        // wss://[host]:[port]/mqtt
        const urlMatch = mqttUri.match(/wss?:\/\/([^:/]+):(\d+)/);
        if (!urlMatch) {
            throw new Error("Geçersiz MQTT URL formatı");
        }

        const host = urlMatch[1];
        const port = parseInt(urlMatch[2], 10);
        const path = mqttUri.includes('/mqtt') ? '/mqtt' : '';

        console.log(`MQTT Paho Başlatılıyor: ${host}:${port}${path}`);

        pahoClient = new Paho.Client(host, port, path, "smart_home_" + Math.random().toString(16).slice(2, 8));

        pahoClient.onConnectionLost = onConnectionLost;
        pahoClient.onMessageArrived = onMessageArrived;

        const connectOptions = {
            onSuccess: () => {
                console.log('MQTT BAĞLANTISI BAŞARILI (Paho)!');
                isConnecting = false;

                const topics = [
                    'home/temperature/value',
                    'home/pir/value',
                    'home/pir2/value',
                    'home/gas/value',
                    'home/water/value',
                    'home/servo/value',
                    'home/yellow/value',
                    'home/navy/value',
                    'home/gas/warning',
                    'home/pir/warning',
                    'home/pir2/warning',
                    'home/water/warning'
                ];

                topics.forEach(topic => {
                    pahoClient.subscribe(topic);
                });

                flushMessageQueue();
            },
            onFailure: (err) => {
                console.error('MQTT BAĞLANTI HATASI (Paho):', err);
                isConnecting = false;
                setTimeout(() => connectMQTT(), 10000);
            },
            useSSL: mqttUri.startsWith('wss://'),
            userName: user,
            password: pass,
            keepAliveInterval: 60,
            cleanSession: true,
            mqttVersion: 4, // MQTT 3.1.1
        };

        pahoClient.connect(connectOptions);

    } catch (error) {
        console.error('MQTT Paho Kurulum Hatası:', error);
        isConnecting = false;
    }

    return mqttWrapper;
};

export const publishMessage = (topic, payload) => {
    mqttWrapper.publish(topic, payload);
};

export const disconnectMQTT = () => {
    if (pahoClient && pahoClient.isConnected()) {
        pahoClient.disconnect();
        console.log('MQTT bağlantısı sonlandırıldı');
    }
};