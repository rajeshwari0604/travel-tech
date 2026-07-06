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

// Helper: Markdown parser to render styled HTML elements in React
const parseBold = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const parseMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('###')) {
      const title = trimmed.replace(/^###\s*/, '');
      return (
        <div key={index} className="mt-6 mb-3 border-l-4 border-blue-500 pl-3">
          <h4 className="text-lg font-bold text-blue-700">{parseBold(title)}</h4>
        </div>
      );
    }
    if (trimmed.startsWith('##')) {
      const title = trimmed.replace(/^##\s*/, '');
      return (
        <div key={index} className="mt-8 mb-4 border-b border-gray-200 pb-2">
          <h3 className="text-xl font-bold text-gray-800">{parseBold(title)}</h3>
        </div>
      );
    }
    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const item = trimmed.replace(/^[-*]\s*/, '');
      return (
        <li key={index} className="ml-5 list-disc text-gray-600 my-1 text-sm md:text-base leading-relaxed">
          {parseBold(item)}
        </li>
      );
    }
    if (trimmed === '') {
      return <div key={index} className="h-2" />;
    }
    return (
      <p key={index} className="text-gray-600 my-2 text-sm md:text-base leading-relaxed">
        {parseBold(trimmed)}
      </p>
    );
  });
};

// Helper: Generates a highly customized local mock itinerary when API key is missing or fails
const generateMockItinerary = (formData) => {
  const { fromDestination, toDestination, fromDate, toDate, budgetMin, budgetMax, adults, children, preferences } = formData;
  const daysCount = Math.max(1, Math.ceil((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)) + 1) || 3;
  const totalTravelers = parseInt(adults) + parseInt(children);
  
  let result = `## Trip Itinerary: ${fromDestination} to ${toDestination}\n`;
  result += `**Duration:** ${daysCount} Days (${fromDate} to ${toDate})\n`;
  result += `**Travelers:** ${totalTravelers} (${adults} Adults, ${children} Children)\n`;
  result += `**Estimated Budget:** ₹${budgetMin || '10,000'} - ₹${budgetMax || '30,000'} INR\n\n`;
  
  result += `Here is your custom-tailored travel plan focusing on your selected preferences:\n\n`;

  const getPrefLabel = (cat, val) => {
    const options = {
      adventure: { 'extreme-sports': 'Extreme Sports', 'mountain-climbing': 'Mountain Climbing', 'water-sports': 'Water Sports', 'hiking': 'Hiking' },
      food: { 'local-cuisine': 'Local Cuisine', 'street-food': 'Street Food', 'fine-dining': 'Fine Dining' },
      sightseeing: { beaches: 'Beaches', parks: 'Parks', monuments: 'Monuments' },
      touristAttractions: { 'historical-sites': 'Historical Sites', 'amusement-parks': 'Amusement Parks', 'wildlife-parks': 'Wildlife Parks' },
      relaxation: { spa: 'Spa', yoga: 'Yoga', 'beach-resorts': 'Beach Resorts' }
    };
    return options[cat]?.[val] || val;
  };

  const activePrefs = [];
  Object.keys(preferences).forEach(cat => {
    preferences[cat].forEach(val => {
      activePrefs.push(getPrefLabel(cat, val));
    });
  });

  if (activePrefs.length > 0) {
    result += `**Key Focus Areas:** ${activePrefs.join(', ')}\n\n`;
  }

  for (let i = 1; i <= daysCount; i++) {
    result += `### Day ${i}: Exploring ${toDestination}\n`;
    
    if (preferences.adventure.length > 0 && i % 2 === 1) {
      result += `- **Morning (Adventure):** Head out for an early session of **${getPrefLabel('adventure', preferences.adventure[i % preferences.adventure.length])}**. Ensure you bring comfortable gear and stay hydrated.\n`;
    } else if (preferences.sightseeing.length > 0) {
      result += `- **Morning (Sightseeing):** Visit the famous **${getPrefLabel('sightseeing', preferences.sightseeing[i % preferences.sightseeing.length])}** around ${toDestination}. Great spot for photography.\n`;
    } else {
      result += `- **Morning:** Start with a walking tour of central ${toDestination} and explore the local markets.\n`;
    }

    if (preferences.food.length > 0) {
      result += `- **Lunch (Food):** Treat yourself to **${getPrefLabel('food', preferences.food[i % preferences.food.length])}** at a top-rated local dining spot.\n`;
    } else {
      result += `- **Lunch:** Enjoy a meal at a highly recommended local cafe serving regional specialties.\n`;
    }

    if (preferences.touristAttractions.length > 0 && i % 2 === 0) {
      result += `- **Afternoon (Attractions):** Explore **${getPrefLabel('touristAttractions', preferences.touristAttractions[i % preferences.touristAttractions.length])}** to learn about the history and culture of the area.\n`;
    } else if (preferences.sightseeing.length > 1) {
      result += `- **Afternoon (Sightseeing):** Take a relaxing tour of **${getPrefLabel('sightseeing', preferences.sightseeing[1])}**.\n`;
    } else {
      result += `- **Afternoon:** Visit the city center, check out popular landmarks, and enjoy souvenir shopping.\n`;
    }

    if (preferences.relaxation.length > 0) {
      result += `- **Evening (Relaxation):** Unwind with a peaceful **${getPrefLabel('relaxation', preferences.relaxation[i % preferences.relaxation.length])}** session to recharge for the next day.\n`;
    } else {
      result += `- **Evening:** Enjoy a quiet sunset view from a scenic viewpoint followed by dinner at a rooftop restaurant.\n`;
    }
    result += `\n`;
  }

  result += `## 💡 Travel Tips for ${toDestination}\n`;
  result += `- Respect local customs and cultural guidelines.\n`;
  result += `- Keep digital and physical copies of your travel documents.\n`;
  result += `- Try local transportation options for an authentic experience.\n`;

  return result;
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
  const [itinerarySource, setItinerarySource] = useState(''); // 'live', 'mock', 'mock-fallback'
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(localStorage.getItem('gemini_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);

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

  const handleSaveApiKey = (key) => {
    setApiKeyInput(key);
    if (key) {
      localStorage.setItem('gemini_api_key', key);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  const getTotalTravelers = () => {
    return parseInt(formData.adults) + parseInt(formData.children) || 1;
  };

  const handleSubmit = async () => {
    if (!formData.fromDestination || !formData.toDestination || !formData.fromDate || !formData.toDate) {
      alert('Please fill in all required fields (Destinations and Dates).');
      return;
    }

    setIsLoading(true);
    setItinerary('');
    setItinerarySource('');

    const prompt = `Plan a detailed, multi-day travel itinerary from ${formData.fromDestination} to ${formData.toDestination} starting from ${formData.fromDate} to ${formData.toDate}.
    Budget: ₹${formData.budgetMin || '10,000'} - ₹${formData.budgetMax || '30,000'} INR.
    Total Travelers: ${getTotalTravelers()} (${formData.adults} Adults, ${formData.children} Children).
    Preferences: ${JSON.stringify(formData.preferences)}.
    Please format the response nicely in Markdown, using '### Day X:' for each day's headings and bullet points for activities. Include travel tips at the end.`;

    const activeKey = apiKeyInput || process.env.REACT_APP_GEMINI_API_KEY;

    if (!activeKey) {
      // Demo mode / Fallback immediately
      setTimeout(() => {
        const mockItinerary = generateMockItinerary(formData);
        setItinerary(mockItinerary);
        setItinerarySource('mock');
        setIsLoading(false);
      }, 800);
      return;
    }

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        setItinerary(response.data.candidates[0].content.parts[0].text);
        setItinerarySource('live');
      } else {
        throw new Error('Unexpected response structure');
      }
    } catch (error) {
      console.error('Error generating itinerary with Gemini API:', error);
      // Fallback to local generator
      const mockItinerary = generateMockItinerary(formData);
      setItinerary(mockItinerary);
      setItinerarySource('mock-fallback');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#74ebd5] to-[#9face6] flex justify-center items-center p-4">
      <div className="bg-white rounded-xl p-6 md:p-8 w-full max-w-2xl shadow-lg overflow-y-auto max-h-[95vh]">
        <h1 className="text-2xl md:text-3xl text-center text-blue-500 font-bold mb-6">
          AI Trip Planner
        </h1>

        {/* API Settings Section */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg" style={{ fontSize: '14px' }}>
          <button 
            type="button" 
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex justify-between items-center text-gray-700 font-semibold transition-colors"
            style={{ 
              padding: '6px 12px', 
              margin: 0, 
              backgroundColor: 'transparent', 
              color: '#4a5568',
              border: 'none',
              boxShadow: 'none',
              width: '100%',
              display: 'flex',
              textAlign: 'left'
            }}
          >
            <span style={{ fontWeight: '600' }}>⚙️ API Settings {apiKeyInput ? ' (Key Saved)' : ' (Demo/Simulation Mode)'}</span>
            <span>{showSettings ? '▲' : '▼'}</span>
          </button>
          
          {showSettings && (
            <div className="mt-3 pt-3 border-t border-gray-200" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p className="text-xs text-gray-500" style={{ margin: 0, fontSize: '11px', color: '#718096' }}>
                Enter your Google Gemini API Key. If left empty, the app uses <strong>Demo Mode</strong> with realistic local travel plans.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={(e) => handleSaveApiKey(e.target.value)}
                  style={{ 
                    flexGrow: 1, 
                    padding: '8px 12px', 
                    border: '1px solid #cbd5e0', 
                    borderRadius: '6px', 
                    fontSize: '13px',
                    margin: 0
                  }}
                />
                {apiKeyInput && (
                  <button
                    type="button"
                    onClick={() => handleSaveApiKey('')}
                    style={{ 
                      padding: '8px 16px', 
                      backgroundColor: '#e53e3e', 
                      color: 'white', 
                      borderRadius: '6px', 
                      fontSize: '13px',
                      fontWeight: '600',
                      border: 'none',
                      margin: 0,
                      width: 'auto',
                      cursor: 'pointer'
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400" style={{ margin: 0, fontSize: '10px', color: '#a0aec0' }}>
                Saved locally in your browser storage. Never sent to any external server.
              </p>
            </div>
          )}
        </div>

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
            disabled={isLoading}
            className={`w-full p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-lg font-semibold transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ 
              textAlign: 'center', 
              display: 'block', 
              margin: '24px 0', 
              backgroundColor: '#38a169', 
              color: 'white',
              border: 'none',
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {isLoading ? 'Generating Itinerary...' : 'Generate Itinerary'}
          </button>

          {/* Itinerary Display */}
          {itinerary && (
            <div className="mt-8 pt-6 border-t-2 border-gray-100" style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px', width: '100%' }}>
                <h3 className="text-xl font-bold text-gray-800" style={{ margin: 0, flexGrow: 1, fontSize: '22px' }}>Generated Itinerary</h3>
                {itinerarySource === 'live' && (
                  <span style={{ padding: '4px 12px', backgroundColor: '#c6f6d5', color: '#22543d', fontSize: '12px', fontWeight: '600', borderRadius: '9999px', border: '1px solid #b2f5ea' }}>
                    ✨ Live Gemini AI
                  </span>
                )}
                {itinerarySource === 'mock' && (
                  <span style={{ padding: '4px 12px', backgroundColor: '#ebf8ff', color: '#2b6cb0', fontSize: '12px', fontWeight: '600', borderRadius: '9999px', border: '1px solid #bee3f8' }}>
                    🤖 Demo Mode (Simulated)
                  </span>
                )}
                {itinerarySource === 'mock-fallback' && (
                  <span style={{ padding: '4px 12px', backgroundColor: '#feebc8', color: '#744210', fontSize: '12px', fontWeight: '600', borderRadius: '9999px', border: '1px solid #fbd38d' }}>
                    ⚠️ API Error (Fallback Demo)
                  </span>
                )}
              </div>
              
              <div style={{ backgroundColor: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', maxHeight: '50vh', overflowY: 'auto', textAlign: 'left' }}>
                <div>
                  {parseMarkdown(itinerary)}
                </div>
              </div>

              <div className="mt-4" style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(itinerary);
                    alert('Itinerary copied to clipboard!');
                  }}
                  style={{ 
                    padding: '10px 16px', 
                    backgroundColor: '#3182ce', 
                    color: 'white', 
                    borderRadius: '8px', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    border: 'none',
                    margin: 0,
                    width: 'auto',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;

