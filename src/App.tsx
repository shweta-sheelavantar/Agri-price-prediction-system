import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import MarketPrices from './pages/MarketPrices';
import AIPredictions from './pages/AIPredictions';
import FarmProfile from './pages/FarmProfile';
import Inventory from './pages/Inventory';
import Financial from './pages/Financial';
import BuyerMatching from './pages/BuyerMatching';
import Settings from './pages/Settings';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import APIStatusIndicator from './components/APIStatusIndicator';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          {/* API Status Indicator */}
          <APIStatusIndicator />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
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
              path="/farm-profile"
              element={
                <ProtectedRoute>
                  <FarmProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/financial"
              element={
                <ProtectedRoute>
                  <Financial />
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
