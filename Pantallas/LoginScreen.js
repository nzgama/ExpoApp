import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/Firebase';
import { useAuth } from '../auth/useAuth';

export default function LoginScreen({ navigation }) {
    const { setIsAuthenticated } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (username && password) {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, username, password);
                const uid = userCredential.user.uid;
                await SecureStore.setItemAsync('userToken', uid);
                setIsAuthenticated(!!uid);
            } catch (error) {
                console.error('Error during login:', error.message);
                alert('Login failed. Please check your credentials.');
            }
        }
    };

    const handleRegister = async () => {
        if (username && password) {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, username, password);
                const uid = userCredential.user.uid;
                await setIsAuthenticated(!!uid);
                // Wait for authentication state to update before navigating
                setTimeout(() => navigation.navigate('Tabs'), 100);
                navigation.navigate('Tabs');
            } catch (error) {
                console.error('Error during registration:', error.message);
                alert('Registration failed. Please try again.');
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={username}
                onChangeText={setUsername}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={handleRegister}>
                <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#333',
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#007BFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 12,
    },
    registerButton: {
        backgroundColor: '#28a745',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
