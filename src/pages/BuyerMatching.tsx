import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter,
  MapPin,
  Star,
  Phone,
  Mail,
  MessageCircle,
  Handshake,
  TrendingUp,
  Shield,
  Clock,
  Users,
  Package
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { generateMockBuyers } from '../services/mockData';

interface Buyer {
  id: string;
  name: string;
  type: 'individual' | 'cooperative' | 'company';
  location: {
    state: string;
    district: string;
    village: string;
    coordinates: { lat: number; lng: number };
  };
  commoditiesInterested: string[];
  verificationStatus: 'verified' | 'pending' | 'unverified';
  rating: number;
  contactInfo: {
    phone: string;
    email: string;
  };
  minimumQuantity: number;
  paymentTerms: string;
  description?: string;
  totalPurchases?: number;
  lastActive?: Date;
}

const BuyerMatching = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [filteredBuyers, setFilteredBuyers] = useState<Buyer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    // Load buyers data
    const loadBuyers = () => {
      const mockBuyers = generateMockBuyers(25);
      const buyersWithExtras = mockBuyers.map(buyer => ({
        ...buyer,
        description: `Reliable ${buyer.type} specializing in ${buyer.commoditiesInterested.join(', ')}. Established business with good payment history.`,
        totalPurchases: Math.floor(Math.random() * 500) + 50,
        lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Within last week
      }));
      setBuyers(buyersWithExtras);
      setFilteredBuyers(buyersWithExtras);
      setIsLoading(false);
    };

    loadBuyers();
  }, []);

  useEffect(() => {
    // Filter buyers based on search and filters
    let filtered = buyers;

    if (searchTerm) {
      filtered = filtered.filter(buyer => 
        buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.location.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.commoditiesInterested.some(commodity => 
          commodity.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(buyer => buyer.type === selectedType);
    }

    if (selectedCommodity !== 'all') {
      filtered = filtered.filter(buyer => 
        buyer.commoditiesInterested.includes(selectedCommodity)
      );
    }

    // Sort by rating and verification status
    filtered.sort((a, b) => {
      if (a.verificationStatus === 'verified' && b.verificationStatus !== 'verified') return -1;
      if (b.verificationStatus === 'verified' && a.verificationStatus !== 'verified') return 1;
      return b.rating - a.rating;
    });

    setFilteredBuyers(filtered);
  }, [buyers, searchTerm, selectedType, selectedCommodity]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'individual': return '👤';
      case 'cooperative': return '🏢';
      case 'company': return '🏭';
      default: return '📦';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'individual': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'cooperative': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'company': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          <Shield className="w-3 h-3 mr-1" />
          Verified
        </span>;
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
          Unverified
        </span>;
    }
  };

  const handleContactBuyer = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setShowContactModal(true);
  };

  const commodities = ['Wheat', 'Rice', 'Cotton', 'Onion', 'Tomato', 'Potato', 'Soybean', 'Maize'];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading buyers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Buyer Matching</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Connect with verified buyers for your produce
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Handshake className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                {filteredBuyers.filter(b => b.verificationStatus === 'verified').length} Verified Buyers
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Buyers</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{buyers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Verified Buyers</p>
                <p className="text-2xl font-bold text-green-600">
                  {buyers.filter(b => b.verificationStatus === 'verified').length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {(buyers.reduce((sum, b) => sum + b.rating, 0) / buyers.length).toFixed(1)}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Deals</p>
                <p className="text-2xl font-bold text-purple-600">12</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search buyers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="individual">Individual</option>
                <option value="cooperative">Cooperative</option>
                <option value="company">Company</option>
              </select>

              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Commodities</option>
                {commodities.map(commodity => (
                  <option key={commodity} value={commodity}>{commodity}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Buyers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuyers.map((buyer) => (
            <div key={buyer.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getTypeIcon(buyer.type)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{buyer.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(buyer.type)}`}>
                        {buyer.type}
                      </span>
                      {getVerificationBadge(buyer.verificationStatus)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {buyer.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="w-4 h-4" />
                  <span>{buyer.location.district}, {buyer.location.state}</span>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Interested in:</p>
                  <div className="flex flex-wrap gap-1">
                    {buyer.commoditiesInterested.slice(0, 3).map((commodity, index) => (
                      <span key={index} className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-300">
                        {commodity}
                      </span>
                    ))}
                    {buyer.commoditiesInterested.length > 3 && (
                      <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-300">
                        +{buyer.commoditiesInterested.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Min Quantity:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{buyer.minimumQuantity} quintals</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Payment Terms:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{buyer.paymentTerms}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Total Purchases:</span>
                  <span className="font-medium text-green-600">{buyer.totalPurchases} quintals</span>
                </div>

                {buyer.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {buyer.description}
                  </p>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Last active: {buyer.lastActive?.toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleContactBuyer(buyer)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 flex items-center space-x-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Contact</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBuyers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No buyers found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showContactModal && selectedBuyer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Contact {selectedBuyer.name}
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Phone className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-medium text-gray-800 dark:text-white">{selectedBuyer.contactInfo.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-800 dark:text-white">{selectedBuyer.contactInfo.email}</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Call</span>
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerMatching;
