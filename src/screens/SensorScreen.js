import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Switch,
} from "react-native";
import apiService from "../services/api";
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

const SensorScreen = ({ onNavigate }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [temperature, setTemperature] = useState(23.5);
    const [humidity, setHumidity] = useState(45);
    const [temperatureTime, setTemperatureTime] = useState("Az önce");
    const [pirValue, setPirValue] = useState(false);
    const [pirTime, setPirTime] = useState("Az önce");
    const [pir2Value, setPir2Value] = useState(false);
    const [pirTime2, setPirTime2] = useState("Az önce");
    const [gasValue, setGasValue] = useState(0);
    const [gasTime, setGasTime] = useState("Az önce");
    const [waterValue, setWaterValue] = useState(false);
    const [waterTime, setWaterTime] = useState("Az önce");
    const [yellowLed, setYellowLed] = useState(false);
    const [yellowLedTime, setYellowLedTime] = useState("Az önce");
    const [navyLed, setNavyLed] = useState(false);
    const [navyLedTime, setNavyLedTime] = useState("Az önce");
    const [curtain, setCurtain] = useState(false);
    const [curtainTime, setCurtainTime] = useState("Az önce");

    // UI Switches State
    const [tempSwitch, setTempSwitch] = useState(false);
    const [humiditySwitch, setHumiditySwitch] = useState(false);
    const [pirSwitch, setPirSwitch] = useState(false);
    const [pir2Switch, setPir2Switch] = useState(false);
    const [gasSwitch, setGasSwitch] = useState(false);
    const [waterSwitch, setWaterSwitch] = useState(false);

    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        const client = connectMQTT();
        loadSensors();

        const handleMessage = (topic, message) => {
            if (topic == "home/temperature/value") {
                const raw = message.toString();
                const data = JSON.parse(raw);

                setTempSwitch(data.temperatureSensor);
                console.log(tempSwitch)
                setTemperature(data.temperature);
                setHumidity(data.humidity);
                setTemperatureTime(data.time);

                // Update switch state if status is present
                // const isActive = data.temperature === true;
                // setTempSwitch(isActive);
                // setHumiditySwitch(isActive);
            } else if (topic == "home/pir/value") {
                const raw = message.toString();
                const data = JSON.parse(raw);

                setPirValue(data.miniPirValue);
                setPirTime(data.time);

                // Update switch state
                setPirSwitch(data.miniPirValue === true);
            } else if (topic == "home/pir2/value") {
                const raw = message.toString();
                const data = JSON.parse(raw);

                setPir2Value(data.miniPir2Value);
                setPirTime2(data.time);

                // Update switch state
                setPir2Switch(data.miniPir2Value === true);
            } else if (topic == "home/gas/value") {
                const raw = message.toString();
                const data = JSON.parse(raw);

                setGasValue(data.gasValue);
                setGasTime(data.time);

                // Update switch state
                setGasSwitch(data.gasValue === true);
            } else if (topic == "home/water/value") {
                const raw = message.toString();
                const data = JSON.parse(raw);

                setWaterValue(data.waterValue);
                setWaterTime(data.time);

                // Update switch state
                setWaterSwitch(data.waterValue === true);
            } else if (topic == "home/servo/value") {
                const raw = message.toString();
                const data = JSON.parse(raw);

                setCurtain(data.servoValue === true);
                setCurtainTime(data.time);
            } else if (topic == "home/yellow/value") {
                const raw = message.toString();
                const data = JSON.parse(raw);

                setYellowLed(data.yellowValue === true);
            } else if (topic == "home/navy/value") {
                const raw = message.toString();
                const data = JSON.parse(raw);

                setNavyLed(data.navyValue === true);
            }
        };

        client.on("message", handleMessage);

        return () => {
            client.off("message", handleMessage);
        };
    }, []);

    const loadSensors = async () => {
        const client = connectMQTT();
        try {
            client.publish("home/value/temperature", "GET");
            client.publish("home/value/pir", "GET");
            client.publish("home/value/pir2", "GET");
            client.publish("home/value/gas", "GET");
            client.publish("home/value/water", "GET");
            client.publish("home/value/servo", "GET");
            client.publish("home/value/yellow", "GET");
            client.publish("home/value/navy", "GET");
        } catch (error) {
            console.error("Sensör yükleme hatası:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadSensors();
    };

    const handleCurtainValue = () => {
        const client = connectMQTT();
        const newState = !curtain;
        setCurtain(newState);
        client.publish("home/curtain", newState ? "ON" : "OFF");
    };

    const handleToggleYellowLed = () => {
        const client = connectMQTT();
        const newState = !yellowLed;
        setYellowLed(newState);
        client.publish("home/yellow", newState ? "ON" : "OFF");
    };

    const handleToggleNavyLed = () => {
        const client = connectMQTT();
        const newState = !navyLed;
        setNavyLed(newState);
        client.publish("home/navy", newState ? "ON" : "OFF");
    };

    // Toggle Handlers
    const handleToggleTemp = () => {
        const client = connectMQTT();
        const newState = !tempSwitch;
        setTempSwitch(newState);
        setHumiditySwitch(newState);
        client.publish("home/temperature", newState ? "ON" : "OFF");
    };
    const handleToggleHumidity = () => {
        const client = connectMQTT();
        const newState = !humiditySwitch;
        setHumiditySwitch(newState);
        setTempSwitch(newState);
        client.publish("home/temperature", newState ? "ON" : "OFF");
    };
    const handleTogglePir = () => {
        const client = connectMQTT();
        const newState = !pirSwitch;
        setPirSwitch(newState);
        client.publish("home/pir", newState ? "ON" : "OFF");
    };
    const handleTogglePir2 = () => {
        const client = connectMQTT();
        const newState = !pir2Switch;
        setPir2Switch(newState);
        client.publish("home/pir2", newState ? "ON" : "OFF");
    };
    const handleToggleGas = () => {
        const client = connectMQTT();
        const newState = !gasSwitch;
        setGasSwitch(newState);
        client.publish("home/gas", newState ? "ON" : "OFF");
    };
    const handleToggleWater = () => {
        const client = connectMQTT();
        const newState = !waterSwitch;
        setWaterSwitch(newState);
        client.publish("home/water", newState ? "ON" : "OFF");
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Sensör Verileri</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Yükleniyor...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                >
                    <View style={styles.roomSection}>
                        <Text style={styles.roomTitle}>Veriler</Text>

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
                                    <View style={styles.ledControlContainer}>
                                        <Text style={styles.sensorValue}>
                                            {temperature} °C
                                        </Text>
                                        <Switch
                                            value={tempSwitch}
                                            onValueChange={handleToggleTemp}
                                            trackColor={{ false: "#D1D1D1", true: "#1976d2" }}
                                            thumbColor="#fff"
                                        />
                                    </View>
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
                                    <View style={styles.ledControlContainer}>
                                        <Text style={styles.sensorValue}>
                                            {humidity} %
                                        </Text>
                                        <Switch
                                            value={tempSwitch}
                                            onValueChange={handleToggleHumidity}
                                            trackColor={{ false: "#D1D1D1", true: "#1976d2" }}
                                            thumbColor="#fff"
                                        />
                                    </View>
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
                                    <View style={styles.ledControlContainer}>
                                        <Text style={styles.sensorValue}>
                                            Son Algılanma
                                        </Text>
                                        <Switch
                                            value={pirSwitch}
                                            onValueChange={handleTogglePir}
                                            trackColor={{ false: "#D1D1D1", true: "#1976d2" }}
                                            thumbColor="#fff"
                                        />
                                    </View>
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
                                    <View style={styles.ledControlContainer}>
                                        <Text style={styles.sensorValue}>
                                            Son Algılanma
                                        </Text>
                                        <Switch
                                            value={pir2Switch}
                                            onValueChange={handleTogglePir2}
                                            trackColor={{ false: "#D1D1D1", true: "#1976d2" }}
                                            thumbColor="#fff"
                                        />
                                    </View>
                                    <Text style={styles.sensorTimestamp}>
                                        {formatBackendTime(pirTime2)}
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
                                    <View style={styles.ledControlContainer}>
                                        <Text style={styles.sensorValue}>
                                            Son Algılanma
                                        </Text>
                                        <Switch
                                            value={gasSwitch}
                                            onValueChange={handleToggleGas}
                                            trackColor={{ false: "#D1D1D1", true: "#1976d2" }}
                                            thumbColor="#fff"
                                        />
                                    </View>
                                    <Text style={styles.sensorTimestamp}>
                                        {formatBackendTime(gasTime)}
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
                                        <Switch
                                            value={waterSwitch}
                                            onValueChange={handleToggleWater}
                                            trackColor={{ false: "#D1D1D1", true: "#1976d2" }}
                                            thumbColor="#fff"
                                        />
                                    </View>
                                    <Text style={styles.sensorTimestamp}>
                                        {formatBackendTime(waterTime)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Perde */}
                        <View
                            style={[
                                styles.sensorCard,
                                curtain && styles.ledCardActive,
                            ]}
                        >
                            <View style={styles.sensorContent}>
                                <View style={styles.leftSection}>
                                    <Text style={styles.sensorIcon}>🪟</Text>
                                    <View style={styles.sensorInfo}>
                                        <Text style={styles.sensorName}>
                                            Perde
                                        </Text>
                                        <Text style={styles.sensorRoom}>
                                            Veriler
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.rightSection}>
                                    <View style={styles.ledControlContainer}>
                                        <Text
                                        // style={[
                                        //     styles.sensorValue,
                                        //     { color: "#FFD700" },
                                        // ]}
                                        >
                                            {curtain ? "Açık" : "Kapalı"}
                                        </Text>
                                        <Switch
                                            value={curtain}
                                            onValueChange={handleCurtainValue}
                                            trackColor={{
                                                false: "#D1D1D1",
                                                true: "#fb00c5ff",
                                            }}
                                            thumbColor="#fff"
                                        />
                                    </View>
                                    <Text style={styles.sensorTimestamp}>
                                        {formatBackendTime(curtainTime)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Sarı LED */}
                        <View
                            style={[
                                styles.sensorCard,
                                yellowLed && styles.ledCardActive,
                            ]}
                        >
                            <View style={styles.sensorContent}>
                                <View style={styles.leftSection}>
                                    <Text style={styles.sensorIcon}>💡</Text>
                                    <View style={styles.sensorInfo}>
                                        <Text style={styles.sensorName}>
                                            Sarı LED
                                        </Text>
                                        <Text style={styles.sensorRoom}>
                                            Veriler
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.rightSection}>
                                    <View style={styles.ledControlContainer}>
                                        <Text
                                            style={[
                                                styles.sensorValue,
                                                { color: "#FFD700" },
                                            ]}
                                        >
                                            {yellowLed ? "Açık" : "Kapalı"}
                                        </Text>
                                        <Switch
                                            value={yellowLed}
                                            onValueChange={
                                                handleToggleYellowLed
                                            }
                                            trackColor={{
                                                false: "#D1D1D1",
                                                true: "#FFD700",
                                            }}
                                            thumbColor="#fff"
                                        />
                                    </View>
                                    {/* <Text style={styles.sensorTimestamp}>{formatBackendTime(yellowLedTime)}</Text> */}
                                </View>
                            </View>
                        </View>

                        {/* Lacivert LED */}
                        <View
                            style={[
                                styles.sensorCard,
                                navyLed && styles.ledCardActive,
                            ]}
                        >
                            <View style={styles.sensorContent}>
                                <View style={styles.leftSection}>
                                    <Text style={styles.sensorIcon}>💡</Text>
                                    <View style={styles.sensorInfo}>
                                        <Text style={styles.sensorName}>
                                            Lacivert LED
                                        </Text>
                                        <Text style={styles.sensorRoom}>
                                            Veriler
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.rightSection}>
                                    <View style={styles.ledControlContainer}>
                                        <Text
                                            style={[
                                                styles.sensorValue,
                                                { color: "#000080" },
                                            ]}
                                        >
                                            {navyLed ? "Açık" : "Kapalı"}
                                        </Text>
                                        <Switch
                                            value={navyLed}
                                            onValueChange={handleToggleNavyLed}
                                            trackColor={{
                                                false: "#D1D1D1",
                                                true: "#000080",
                                            }}
                                            thumbColor="#fff"
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            )}
        </View>
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
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#ffffff",
        marginBottom: 4,
    },
    autoRefreshButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    autoRefreshText: {
        fontSize: 12,
        color: "#ffffff",
        fontWeight: "600",
    },
    filterContainer: {
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    filterContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#f5f5f5",
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: "#1976d2",
    },
    filterText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    filterTextActive: {
        color: "#ffffff",
        fontWeight: "600",
    },
    content: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 16,
        color: "#666",
    },
    roomSection: {
        marginBottom: 24,
    },
    roomTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 12,
        marginTop: 8,
    },
    emptyText: {
        textAlign: "center",
        color: "#999",
        padding: 40,
        fontSize: 16,
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
    ledCardActive: {
        backgroundColor: "#f0f8ff",
        borderWidth: 2,
        borderColor: "#1976d2",
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
    ledControlContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
});

export default SensorScreen;
