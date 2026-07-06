import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

const PreferenceSection = ({ title, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        className={`w-full text-left p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg mt-2.5 transition-colors ${isOpen ? 'bg-green-600' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
      </button>
      {isOpen && (
        <div className="pl-5 mt-2.5">
          <div className="space-y-2">
            {options.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  value={option.value}
                  onChange={(e) => onChange(option.value, e.target.checked)}
                  className="form-checkbox"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TripPlanner = () => {
  const [formData, setFormData] = useState({
    fromDestination: '',
    toDestination: '',
    fromDate: '',
    toDate: '',
    budgetMin: '',
    budgetMax: '',
    adults: 1,
    children: 0,
    preferences: {
      adventure: [],
      food: [],
      sightseeing: [],
      touristAttractions: [],
      relaxation: []
    }
  });

  const [itinerary, setItinerary] = useState('');

  const preferenceOptions = {
    adventure: [
      { value: 'extreme-sports', label: 'Extreme Sports' },
      { value: 'mountain-climbing', label: 'Mountain Climbing' },
      { value: 'water-sports', label: 'Water Sports' },
      { value: 'hiking', label: 'Hiking' }
    ],
    food: [
      { value: 'local-cuisine', label: 'Local Cuisine' },
      { value: 'street-food', label: 'Street Food' },
      { value: 'fine-dining', label: 'Fine Dining' }
    ],
    sightseeing: [
      { value: 'beaches', label: 'Beaches' },
      { value: 'parks', label: 'Parks' },
      { value: 'monuments', label: 'Monuments' }
    ],
    touristAttractions: [
      { value: 'historical-sites', label: 'Historical Sites' },
      { value: 'amusement-parks', label: 'Amusement Parks' },
      { value: 'wildlife-parks', label: 'Wildlife Parks' }
    ],
    relaxation: [
      { value: 'spa', label: 'Spa' },
      { value: 'yoga', label: 'Yoga' },
      { value: 'beach-resorts', label: 'Beach Resorts' }
    ]
  };

  const handlePreferenceChange = (category, value, checked) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: checked
          ? [...prev.preferences[category], value]
          : prev.preferences[category].filter((item) => item !== value)
      }
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const getTotalTravelers = () => {
    return parseInt(formData.adults) + parseInt(formData.children) || 1;
  };

  const handleSubmit = async () => {
    const prompt = `Plan a trip from ${formData.fromDestination} to ${formData.toDestination} from ${formData.fromDate} to ${formData.toDate}. Budget: ₹${formData.budgetMin} - ₹${formData.budgetMax}. Total Travelers: ${getTotalTravelers()}. Preferences: ${JSON.stringify(formData.preferences)}`;

    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com',
        {
          prompt: prompt,
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer AIzaSyA2-lapRbxlszgWOEhAYIPc51wV3sDLs6M`, // Replace with your actual API key
          }
        }
      );

      setItinerary(response.data.itinerary);
    } catch (error) {
      console.error('Error generating itinerary:', error);
      alert('Error generating itinerary. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#74ebd5] to-[#9face6] flex justify-center items-center p-4">
      <div className="bg-white rounded-xl p-6 md:p-8 w-full max-w-2xl shadow-lg overflow-y-auto max-h-[95vh]">
        <h1 className="text-2xl md:text-3xl text-center text-blue-500 font-bold mb-6">
          AI Trip Planner
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">From Destination</label>
            <input
              type="text"
              name="fromDestination"
              value={formData.fromDestination}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg focus:border-blue-500 outline-none"
              placeholder="Enter starting point"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">To Destination</label>
            <input
              type="text"
              name="toDestination"
              value={formData.toDestination}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg focus:border-blue-500 outline-none"
              placeholder="Enter destination point"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">From Date</label>
              <input
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">To Date</label>
              <input
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:border-blue-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Budget Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Min Budget (₹)</label>
              <input
                type="number"
                name="budgetMin"
                value={formData.budgetMin}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:border-blue-500 outline-none"
                placeholder="Enter min budget"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Max Budget (₹)</label>
              <input
                type="number"
                name="budgetMax"
                value={formData.budgetMax}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:border-blue-500 outline-none"
                placeholder="Enter max budget"
                required
              />
            </div>
          </div>

          {/* Number of Travelers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Adults</label>
              <input
                type="number"
                name="adults"
                value={formData.adults}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:border-blue-500 outline-none"
                placeholder="Enter number of adults"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Children</label>
              <input
                type="number"
                name="children"
                value={formData.children}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:border-blue-500 outline-none"
                placeholder="Enter number of children"
                min="0"
              />
            </div>
          </div>

          {/* Preferences */}
          {Object.keys(preferenceOptions).map((category) => (
            <PreferenceSection
              key={category}
              title={category.charAt(0).toUpperCase() + category.slice(1)}
              options={preferenceOptions[category]}
              onChange={(value, checked) => handlePreferenceChange(category, value, checked)}
            />
          ))}

          <button
            onClick={handleSubmit}
            className="w-full p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-lg font-semibold transition-colors"
          >
            Generate Itinerary
          </button>

          {itinerary && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-700">Generated Itinerary</h3>
              <textarea
                readOnly
                value={itinerary}
                className="w-full p-3 border rounded-lg mt-3 text-sm text-gray-600"
                rows={10}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;
