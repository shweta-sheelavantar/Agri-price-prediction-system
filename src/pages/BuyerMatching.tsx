import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin,
  Star,
  MessageCircle,
  Handshake,
  TrendingUp,
  Shield,
  Clock,
  Users,
  Info,
  Plus,
  Phone,
  Mail,
  X,
  Edit,
  Trash2,
  Building
} from 'lucide-react';
import PageNavigation from '../components/PageNavigation';
import { useAuth } from '../contexts/AuthContext';

interface Buyer {
  id: string;
  name: string;
  businessName: string;
  phone: string;
  email: string;
  location: string;
  commodities: string[];
  notes: string;
  addedAt: Date;
}

const BuyerMatching = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [buyers, setBuyers] = useState<Buyer[]>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('agrifriend_buyers');
    return saved ? JSON.parse(saved) : [];
  });
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    phone: '',
    email: '',
    location: '',
    commodities: [] as string[],
    notes: ''
  });

  // Get farmer's primary crop for personalized message
  const primaryCrop = profile?.primary_crop || 'your crops';

  const commodities = ['Wheat', 'Rice', 'Cotton', 'Onion', 'Tomato', 'Potato', 'Soybean', 'Maize', 'Sugarcane', 'Groundnut'];

  const saveBuyers = (newBuyers: Buyer[]) => {
    setBuyers(newBuyers);
    localStorage.setItem('agrifriend_buyers', JSON.stringify(newBuyers));
  };

  const handleAddBuyer = () => {
    if (!formData.name || !formData.phone) {
      alert('Please enter at least name and phone number');
      return;
    }

    const newBuyer: Buyer = {
      id: editingBuyer?.id || Date.now().toString(),
      name: formData.name,
      businessName: formData.businessName,
      phone: formData.phone,
      email: formData.email,
      location: formData.location,
      commodities: formData.commodities,
      notes: formData.notes,
      addedAt: editingBuyer?.addedAt || new Date()
    };

    if (editingBuyer) {
      saveBuyers(buyers.map(b => b.id === editingBuyer.id ? newBuyer : b));
    } else {
      saveBuyers([...buyers, newBuyer]);
    }

    resetForm();
  };

  const handleDeleteBuyer = (id: string) => {
    if (confirm('Are you sure you want to delete this buyer?')) {
      saveBuyers(buyers.filter(b => b.id !== id));
    }
  };

  const handleEditBuyer = (buyer: Buyer) => {
    setEditingBuyer(buyer);
    setFormData({
      name: buyer.name,
      businessName: buyer.businessName,
      phone: buyer.phone,
      email: buyer.email,
      location: buyer.location,
      commodities: buyer.commodities,
      notes: buyer.notes
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      businessName: '',
      phone: '',
      email: '',
      location: '',
      commodities: [],
      notes: ''
    });
    setEditingBuyer(null);
    setShowAddModal(false);
  };

  const toggleCommodity = (commodity: string) => {
    if (formData.commodities.includes(commodity)) {
      setFormData({
        ...formData,
        commodities: formData.commodities.filter(c => c !== commodity)
      });
    } else {
      setFormData({
        ...formData,
        commodities: [...formData.commodities, commodity]
      });
    }
  };

  // Filter buyers
  const filteredBuyers = buyers.filter(buyer => {
    const matchesSearch = buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         buyer.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         buyer.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCommodity = selectedCommodity === 'all' || 
                            buyer.commodities.includes(selectedCommodity);
    return matchesSearch && matchesCommodity;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <PageNavigation title="Buyer Matching" />
      
      {/* Action Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Buyer</span>
            </button>
            <Handshake className="w-5 h-5 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              Marketplace
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
              <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Buyer Marketplace Coming Soon
              </h3>
              <p className="text-blue-700 dark:text-blue-300 mb-4">
                We're building a network of verified buyers for {primaryCrop} and other agricultural products. 
                Once buyers register on our platform, you'll be able to:
              </p>
              <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 space-y-1">
                <li>View verified buyer profiles with ratings and reviews</li>
                <li>See their purchase history and payment terms</li>
                <li>Connect directly via phone or email</li>
                <li>Get matched based on your crop and location</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Search Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search buyers by name, business, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Commodities</option>
              {commodities.map(commodity => (
                <option key={commodity} value={commodity}>{commodity}</option>
              ))}
            </select>
          </div>
          
          {buyers.length > 0 && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredBuyers.length} of {buyers.length} buyers
            </p>
          )}
        </div>

        {/* Buyer List */}
        {filteredBuyers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {filteredBuyers.map(buyer => (
              <div key={buyer.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full">
                      <Building className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">{buyer.name}</h3>
                      {buyer.businessName && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{buyer.businessName}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditBuyer(buyer)}
                      className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBuyer(buyer.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {buyer.location && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {buyer.location}
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <a href={`tel:${buyer.phone}`} className="text-primary-600 hover:underline">{buyer.phone}</a>
                </div>

                {buyer.email && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-3">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <a href={`mailto:${buyer.email}`} className="text-primary-600 hover:underline">{buyer.email}</a>
                  </div>
                )}

                {buyer.commodities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {buyer.commodities.map(commodity => (
                      <span key={commodity} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                        {commodity}
                      </span>
                    ))}
                  </div>
                )}

                {buyer.notes && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic border-t border-gray-100 dark:border-gray-700 pt-3 mt-3">
                    "{buyer.notes}"
                  </p>
                )}

                <div className="flex space-x-2 mt-4">
                  <a
                    href={`tel:${buyer.phone}`}
                    className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 flex items-center justify-center space-x-1"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call</span>
                  </a>
                  {buyer.email && (
                    <a
                      href={`mailto:${buyer.email}`}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center space-x-1"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : buyers.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 mb-6">
            <div className="text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No Matching Buyers</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </div>
        ) : null}

        {/* Empty State - Only show when no buyers */}
        {buyers.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12">
            <div className="text-center">
              <div className="bg-gray-100 dark:bg-gray-700 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                No Buyers Added Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                Add your buyer contacts manually to keep track of potential buyers for {primaryCrop}.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Your First Buyer</span>
                </button>
                <Link 
                  to="/market-prices" 
                  className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Check Market Prices</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* How It Will Work Section */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">How Buyer Matching Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">Verified Buyers</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                All buyers are verified with proper documentation and business credentials
              </p>
            </div>
            <div className="text-center p-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">Ratings & Reviews</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                See ratings from other farmers to make informed decisions
              </p>
            </div>
            <div className="text-center p-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">Direct Contact</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Connect directly with buyers via phone or email
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Buyer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {editingBuyer ? 'Edit Buyer' : 'Add New Buyer'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Rajesh Kumar"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Business Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="e.g., Kumar Traders"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g., 9876543210"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g., buyer@example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Ludhiana, Punjab"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Commodities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interested Commodities
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {commodities.map(commodity => (
                      <button
                        key={commodity}
                        type="button"
                        onClick={() => toggleCommodity(commodity)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          formData.commodities.includes(commodity)
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {commodity}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional notes about this buyer..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBuyer}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingBuyer ? 'Update Buyer' : 'Add Buyer'}
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
