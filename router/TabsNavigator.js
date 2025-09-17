import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../Pantallas/HomeScreen';
import ProfileScreen from '../Pantallas/ProfileScreen';
import SettingsScreen from '../Pantallas/SettingsScreen';
import NotesScreen from '../Pantallas/NotesScreen';

const Tab = createBottomTabNavigator();

export default function TabsNavigator() {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
            <Tab.Screen name="Notas" component={NotesScreen} />
        </Tab.Navigator>
    );
}
