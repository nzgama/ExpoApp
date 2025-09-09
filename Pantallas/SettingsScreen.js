import { View, Text, Button, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../auth/useAuth';

export default function SettingsScreen() {
    const { setIsAuthenticated } = useAuth();

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('userToken');
        setIsAuthenticated(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Settings</Text>
            <Button title="Logout" onPress={handleLogout} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 18,
        marginBottom: 16,
    },
});
