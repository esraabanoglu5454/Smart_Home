import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Switch
} from "react-native";
import apiService from "../services/api";
import DeviceCard from "../components/DeviceCard";
import { connectMQTT } from "../services/mqttService";

const formatBackendTime = (raw) => {
    if (!raw || raw == "Az önce") return "";

    const iso = raw.replace(" ", "T").slice(0, 23);
    const date = new Date(iso);

    return date.toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const HomeScreen = ({ onNavigate }) => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [temperature, setTemperature] = useState(23.5);
    const [humidity, setHumidity] = useState(45);
    const [temperatureTime, setTemperatureTime] = useState("Az önce");
    const [pir, setPir] = useState(false);
    const [pirTime, setPirTime] = useState("Az önce");
    const [pir2, setPir2] = useState(false);
    const [pirTime2, setPirTime2] = useState("Az önce");
    const [gas, setGas] = useState(0);
    const [gasTime, setGasTime] = useState("Az önce");
    const [waterValue, setWaterValue] = useState(false);
    const [waterTime, setWaterTime] = useState("Az önce");

    useEffect(() => {
        const client = connectMQTT();
        loadData();

        const handleMessage = (topic, message) => {
            try {
                if (topic == "home/temperature/value") {
                    const raw = message.toString();
                    const data = JSON.parse(raw);

                    setTemperature(data.temperature);
                    setHumidity(data.humidity);
                    setTemperatureTime(data.time);
                } else if (topic == "home/pir/value") {
                    const raw = message.toString();
                    const data = JSON.parse(raw);
                    console.log("PIR Data:", data);

                    setPir(data.miniPirValue);
                    setPirTime(data.time);

                } else if (topic == "home/pir2/value") {
                    const raw = message.toString();
                    const data = JSON.parse(raw);

                    setPir2(data.miniPir2Value);
                    setPirTime2(data.time);
                } else if (topic == "home/gas/value") {
                    const raw = message.toString();
                    const data = JSON.parse(raw);

                    setGas(data.gasValue);
                    setGasTime(data.time);
                } else if (topic == "home/water/value") {
                    const raw = message.toString();
                    const data = JSON.parse(raw);

                    setWaterValue(data.waterValue);
                    setWaterTime(data.time);
                }
            } catch (err) {
                console.error("Error processing MQTT message:", err);
            }
        };

        client.on("message", handleMessage);
        return () => {
            client.off("message", handleMessage);
        };
    }, []);

    const loadData = async () => {
        const client = connectMQTT();
        setLoading(true);
        try {
            const devicesResponse = await apiService.getDevices();

            if (devicesResponse.success) {
                setDevices(devicesResponse.data);
            }

            client.publish("home/value/temperature", "GET");
            client.publish("home/value/pir", "GET");
            client.publish("home/value/pir2", "GET");
            client.publish("home/value/gas", "GET");
            client.publish("home/value/water", "GET");
        } catch (error) {
            console.error("Veri yükleme hatası:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    // async function handleToggleDevice(deviceId) {
    //     const response = await apiService.toggleDevice(deviceId);
    //     if (response.success) {
    //         setDevices((prevDevices) =>
    //             prevDevices.map((device) =>
    //                 device.id === deviceId
    //                     ? { ...device, status: response.data.status }
    //                     : device
    //             )
    //         );
    //     }
    // }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.header}>
                <Text style={styles.title}>Akıllı Evim</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Yükleniyor...</Text>
                </View>
            ) : (
                <>
                    {/* Hızlı Erişim */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
                        <View style={styles.quickAccess}>
                            <TouchableOpacity
                                style={styles.quickButton}
                                onPress={() => onNavigate("devices")}
                            >
                                <Text style={styles.quickIcon}>🎮</Text>
                                <Text style={styles.quickLabel}>Modlar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.quickButton}
                                onPress={() => onNavigate("sensors")}
                            >
                                <Text style={styles.quickIcon}>🎛️</Text>
                                <Text style={styles.quickLabel}>Sensörler</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Sensör Verileri */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Aktif Cihazlar</Text>

                        {/* Sıcaklık Sensörü */}
                        <View style={styles.sensorCard}>
                            <View style={styles.sensorContent}>
                                <View style={styles.leftSection}>
                                    <Text style={styles.sensorIcon}>🌡️</Text>
                                    <View style={styles.sensorInfo}>
                                        <Text style={styles.sensorName}>
                                            Sıcaklık
                                        </Text>
                                        <Text style={styles.sensorRoom}>
                                            Veriler
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.rightSection}>
                                    <Text style={styles.sensorValue}>
                                        {temperature} °C
                                    </Text>
                                    <Text style={styles.sensorTimestamp}>
                                        {formatBackendTime(temperatureTime)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Nem Sensörü */}
                        <View style={styles.sensorCard}>
                            <View style={styles.sensorContent}>
                                <View style={styles.leftSection}>
                                    <Text style={styles.sensorIcon}>💧</Text>
                                    <View style={styles.sensorInfo}>
                                        <Text style={styles.sensorName}>
                                            Nem
                                        </Text>
                                        <Text style={styles.sensorRoom}>
                                            Veriler
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.rightSection}>
                                    <Text style={styles.sensorValue}>
                                        {humidity} %
                                    </Text>
                                    <Text style={styles.sensorTimestamp}>
                                        {formatBackendTime(temperatureTime)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Alt Kat Hareket Sensörü */}
                        <View style={styles.sensorCard}>
                            <View style={styles.sensorContent}>
                                <View style={styles.leftSection}>
                                    <Text style={styles.sensorIcon}>💃🏼</Text>
                                    <View style={styles.sensorInfo}>
                                        <Text style={styles.sensorName}>
                                            Alt Kat Hareket Sensörü
                                        </Text>
                                        <Text style={styles.sensorRoom}>
                                            Veriler
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.rightSection}>
                                    <Text style={styles.sensorValue}>
                                        Son Algılanma
                                    </Text>
                                    <Text style={styles.sensorTimestamp}>
                                        {formatBackendTime(pirTime)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Üst Kat Hareket Sensörü */}
                        <View style={styles.sensorCard}>
                            <View style={styles.sensorContent}>
                                <View style={styles.leftSection}>
                                    <Text style={styles.sensorIcon}>💃🏼</Text>
                                    <View style={styles.sensorInfo}>
                                        <Text style={styles.sensorName}>
                                            Üst Kat Hareket Sensörü
                                        </Text>
                                        <Text style={styles.sensorRoom}>
                                            Veriler
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.rightSection}>
                                    <Text style={styles.sensorValue}>
                                        Son Algılanma
                                    </Text>
                                    <Text style={styles.sensorTimestamp}>
                                        {formatBackendTime(pirTime2)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Su Sensörü */}
                        <View style={styles.sensorCard}>
                            <View style={styles.sensorContent}>
                                <View style={styles.leftSection}>
                                    <Text style={styles.sensorIcon}>💦</Text>
                                    <View style={styles.sensorInfo}>
                                        <Text style={styles.sensorName}>
                                            Su Sensörü
                                        </Text>
                                        <Text style={styles.sensorRoom}>
                                            Veriler
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.rightSection}>
                                    <View style={styles.ledControlContainer}>
                                        <Text style={styles.sensorValue}>
                                            Son Algılanma
                                        </Text>
                                    </View>
                                    <Text style={styles.sensorTimestamp}>
                                        {formatBackendTime(waterTime)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Gaz Sensörü */}
                        <View style={styles.sensorCard}>
                            <View style={styles.sensorContent}>
                                <View style={styles.leftSection}>
                                    <Text style={styles.sensorIcon}>⛽</Text>
                                    <View style={styles.sensorInfo}>
                                        <Text style={styles.sensorName}>
                                            Gaz Sensörü
                                        </Text>
                                        <Text style={styles.sensorRoom}>
                                            Veriler
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.rightSection}>
                                    <Text style={styles.sensorValue}>
                                        Son Algılanma
                                    </Text>
                                    <Text style={styles.sensorTimestamp}>
                                        {formatBackendTime(gasTime)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        backgroundColor: "#44436A",
        padding: 20,
        paddingTop: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#ffffff",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: "#e3f2fd",
    },
    loadingContainer: {
        padding: 40,
        alignItems: "center",
    },
    loadingText: {
        fontSize: 16,
        color: "#666",
    },
    statsContainer: {
        flexDirection: "row",
        padding: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#ffffff",
        padding: 20,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statValue: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#1976d2",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: "#666",
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 12,
    },
    quickAccess: {
        flexDirection: "row",
        gap: 12,
    },
    quickButton: {
        flex: 1,
        backgroundColor: "#ffffff",
        padding: 20,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    quickLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    emptyText: {
        textAlign: "center",
        color: "#999",
        padding: 20,
        fontSize: 14,
    },
    // Sensor Card Styles
    sensorCard: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sensorContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    leftSection: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    sensorIcon: {
        fontSize: 32,
        marginRight: 12,
    },
    sensorInfo: {
        flex: 1,
    },
    sensorName: {
        fontSize: 20,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    sensorRoom: {
        fontSize: 14,
        color: "#666",
    },
    rightSection: {
        alignItems: "flex-end",
    },
    sensorValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1976d2",
        marginBottom: 4,
    },
    sensorTimestamp: {
        fontSize: 12,
        color: "#999",
    },
});

export default HomeScreen;