import mqtt from "mqtt";

let mqttClient = null;

export const connectMQTT = () => {
    if (mqttClient) {
        return mqttClient;
    }

    // HiveMQ Cloud WebSocket URL (TLS)
    console.log(process.env.EXPO_PUBLIC_HIVE_MQ_URL);
    const host = process.env.EXPO_PUBLIC_HIVE_MQ_URL;

    const options = {
        username: process.env.EXPO_PUBLIC_HIVE_MQ_USERNAME,
        password: process.env.EXPO_PUBLIC_HIVE_MQ_PASSWORD,
        clientId: "expo_" + Math.random().toString(16).substr(2, 8),
        keepalive: 30,
        reconnectPeriod: 5000,
    };

    console.log("Connecting MQTT...");
    mqttClient = mqtt.connect(host, options);

    mqttClient.on("connect", () => {
        console.log("🟢 Connected to MQTT!");
    });

    mqttClient.on("error", (err) => {
        console.error("MQTT Error:", err);
    });

    mqttClient.on("close", () => {
        console.log("MQTT Connection closed");
    });

    mqttClient.subscribe("#", (err) => {
        if (err) {
            console.log("Subscription error:", err);
        }
    });

    return mqttClient;
};
