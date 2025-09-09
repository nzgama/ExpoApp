import { AuthProvider } from './auth/AuthContext';
import { AppNavigator } from './router/AppNavigator';


export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
