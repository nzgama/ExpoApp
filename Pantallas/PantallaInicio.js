import { View, Text, Button } from 'react-native';

export default function PantallaInicio({ navigation }) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Bienvenido a la pantalla de inicio</Text>
            <Button title="Ir a Perfil" onPress={() => navigation.navigate('Perfil')} />
            <Button title="Ir a Ajustes" onPress={() => navigation.navigate('Ajustes')} />
        </View>
    );
}
