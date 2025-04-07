import { AuthProvider } from './contexts/AuthContext';
import { Routes } from './routes';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}

export default App;
