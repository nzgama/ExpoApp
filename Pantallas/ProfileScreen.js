import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/Firebase';

const guardarPerfil = async (uid, datos) => {
    try {
        await setDoc(doc(db, 'usuarios', uid), {
            nombre: datos.nombre,
            email: datos.email,
            edad: datos.edad,
        });
        console.log('Perfil guardado exitosamente');
    } catch (error) {
        console.error('Error al guardar el perfil:', error);
    }
};

export default function ProfileScreen() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [edad, setEdad] = useState('');

    const handleSave = async () => {
        const uid = 'user-id'; // Reemplaza con el UID real del usuario
        const datos = { nombre, email, edad };
        await guardarPerfil(uid, datos);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Edit your profile here!</Text>
            <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Edad"
                value={edad}
                onChangeText={setEdad}
                keyboardType="numeric"
            />
            <Button title="Save Changes" onPress={handleSave} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    text: {
        fontSize: 18,
        marginBottom: 16,
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
});
