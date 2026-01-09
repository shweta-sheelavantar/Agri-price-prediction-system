import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import MarketPrices from './pages/MarketPrices';
import AIPredictions from './pages/AIPredictions';
import EnhancedPredictions from './pages/EnhancedPredictions';
import FarmProfile from './pages/FarmProfile';
import BuyerMatching from './pages/BuyerMatching';
import Settings from './pages/Settings';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import AuthTest from './pages/AuthTest';
import ProfileSetup from './pages/ProfileSetup';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import APIStatusIndicator from './components/APIStatusIndicator';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <APIStatusIndicator />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth-test" element={<AuthTest />} />
            <Route
              path="/profile-setup"
              element={
                <ProtectedRoute>
                  <ProfileSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/market-prices"
              element={
                <ProtectedRoute>
                  <MarketPrices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/predictions"
              element={
                <ProtectedRoute>
                  <AIPredictions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/enhanced-predictions"
              element={
                <ProtectedRoute>
                  <EnhancedPredictions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farm-profile"
              element={
                <ProtectedRoute>
                  <FarmProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyers"
              element={
                <ProtectedRoute>
                  <BuyerMatching />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
