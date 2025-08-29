import React, { useState, useEffect, useMemo } from 'react';

// --- Configuration ---
// FINAL STEP: Replace the URL below with your actual public URL from Render.
// Make sure it is the exact URL that shows "Hostizzy API is running!"
// and that you add /api/guest at the end.
const API_BASE_URL = 'https://hostizzy-backend.onrender.com/api/guest';

// --- MOCK DATA (For parts of the app not yet connected to the backend) ---
const mockReservationDetails = {
    id: 'res-001',
    propertyId: 'prop-01',
    checkIn: '2025-09-10',
    checkOut: '2025-09-13',
    primaryGuestPhone: '9876543210',
    numGuests: 4,
    guestsSubmitted: 1, // Start with 1 to represent the primary guest
};

const mockMenuData = {
    // Menu for Serene Villa, Goa
    'prop-01': {
        packages: [
            { id: 'pkg1', name: 'All Meals (Breakfast, Lunch, Dinner)', price: 1800 },
            { id: 'pkg2', name: 'Snacks, Dinner & Breakfast', price: 1500 },
        ],
        alaCarte: [
            { id: 'ac1', name: 'Extra French Fries', price: 250 },
            { id: 'ac2', name: 'Paneer Pakoda (8 pcs)', price: 350 },
            { id: 'ac3', name: 'Chicken 65', price: 450 },
        ],
        selections: {
             breakfast: {
                title: 'Breakfast',
                rules: 'Choose any 1 Veg & 1 Non-veg OR 2 Veg Dishes',
                categories: [
                    { name: 'Non-veg', items: ['Eggs to Order'], limit: 1 },
                    { name: 'Veg', items: ['Assorted paratha', 'Poori bhaji', 'Poha', 'Vegetable/Paneer Cheelas', 'Chole bhature'], limit: 2 }
                ],
                accompaniments: 'Toasts & Preserves, Tea/Coffee'
            },
            lunch: {
                title: 'Lunch',
                rules: 'Choose any 1 Preparation each from the below options',
                categories: [
                    { name: 'Vegetarian', items: ['Gobhi Masala', 'Bhindi do pyaza', 'Aloo capsicum', 'Jeera Aloo', 'Matar Paneer', 'Kadhai paneer'], limit: 1 },
                    { name: 'Dal', items: ['Rajma', 'Chole', 'Dal tadka', 'Sambhar'], limit: 1 },
                    { name: 'Non-Vegetarian', items: ['Chicken curry', 'Chicken kadhai', 'Butter chicken', 'Egg curry'], limit: 1 }
                ],
                accompaniments: 'Rice, Roti, Raita, Salad'
            },
            snacks: {
                title: 'Barbeque Starters/Snacks',
                rules: 'Choose any 2 Preparations each from the below options',
                categories: [
                    { name: 'Vegetarian', items: ['Paneer Tikka', 'Haryali paneer Tikka', 'Chilli Paneer dry', 'Tandoori Aloo', 'Honey chilli potato', 'Tandoori Gobhi', 'Vegetable pakoda', 'Maggie'], limit: 2 },
                    { name: 'Non-Vegetarian', items: ['Chicken Tikka', 'Chicken Malai Tikka', 'Haryali chicken Tikka', 'Chilli Chicken', 'Chicken Seekh kabab'], limit: 2 }
                ],
                accompaniments: ''
            },
            dinner: {
                title: 'Dinner',
                rules: 'Choose any 1 Preparation each from the below options',
                categories: [
                    { name: 'Dal', items: ['Dal Makhani', 'Dal Tadka', 'Dal achari'], limit: 1 },
                    { name: 'Panner', items: ['Kadhai Paneer', 'Butter Paneer', 'Matar paneer', 'Chilli paneer gravy', 'Paneer bhurji'], limit: 1 },
                    { name: 'Vegetarian', items: ['Gobhi Masala', 'Bhindi Masala', 'Jeera Aloo', 'Baigan Bharta', 'Aloo Beans', 'Aloo Shimla Mirch', 'Dum Aloo', 'Mixed Veg'], limit: 1 },
                    { name: 'Non-Vegetarian', items: ['Butter Chicken', 'Chicken Curry', 'Masala Chicken', 'Egg curry', 'Kadhai chicken'], limit: 1 }
                ],
                accompaniments: 'Rice, Roti, Salad, Raita, papad, achar'
            }
        }
    },
    // Menu for Mountain Getaway, Manali
    'prop-02': {
        packages: [
            { id: 'pkg1-manali', name: 'Hearty Mountain Breakfast & Dinner', price: 1600 },
        ],
        alaCarte: [
            { id: 'ac1-manali', name: 'Hot Chocolate', price: 200 },
            { id: 'ac2-manali', name: 'Garlic Bread', price: 300 },
        ],
        selections: {
             breakfast: {
                title: 'Breakfast',
                rules: 'Choose any 2',
                categories: [
                    { name: 'Mountain Specials', items: ['Siddu', 'Aloo Paratha with Curd', 'Maggi', 'Pancakes with Honey'], limit: 2 }
                ],
                accompaniments: 'Tea/Coffee/Juice'
            },
             dinner: {
                title: 'Dinner',
                rules: 'Choose 1 Dal and 1 Sabzi',
                categories: [
                    { name: 'Dal', items: ['Dal Makhani', 'Rajma'], limit: 1 },
                    { name: 'Sabzi', items: ['Aloo Gobhi', 'Paneer Butter Masala', 'Mixed Veg'], limit: 1 },
                    { name: 'Non-Vegetarian', items: ['Local Chicken Curry (Optional Add-on)'], limit: 1 }
                ],
                accompaniments: 'Rice, Tawa Roti, Salad'
            }
        }
    }
};


// --- Helper Components ---

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
);

const ErrorMessage = ({ message }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative my-4" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{message}</span>
    </div>
);

// --- Main App Component ---

export default function App() {
    // --- State Management ---
    const [screen, setScreen] = useState('welcome'); // welcome, login, property, reservation, kyc, meals, review
    const [apiToken, setApiToken] = useState(null);
    const [userPhone, setUserPhone] = useState(null);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [guestData, setGuestData] = useState(mockReservationDetails); // Holds details for the selected reservation
    
    // --- Navigation Functions ---
    const handleLoginSuccess = (token, phone) => {
        setApiToken(token);
        setUserPhone(phone);
        setScreen('property');
    };

    const handlePropertySelect = (property) => {
        setSelectedProperty(property);
        setScreen('reservation');
    };
    
    const handleReservationSelect = (reservation) => {
        setSelectedReservation(reservation);
        // In a real app, you would fetch reservation details here. We use mock data for now.
        setGuestData({ ...mockReservationDetails, id: reservation.id, propertyId: selectedProperty.id });
        setScreen('kyc');
    };

    const goToKyc = () => setScreen('kyc');
    const goToMeals = () => setScreen('meals');
    const goToReview = () => setScreen('review');


    // --- Screen Rendering Logic ---
    const renderScreen = () => {
        switch (screen) {
            case 'welcome':
                return <WelcomeScreen onNext={() => setScreen('login')} />;
            case 'login':
                return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
            case 'property':
                return <PropertySelectionScreen onPropertySelect={handlePropertySelect} apiToken={apiToken} userPhone={userPhone} />;
            case 'reservation':
                 return <ReservationSelectionScreen property={selectedProperty} onReservationSelect={handleReservationSelect} onBack={() => setScreen('property')} />;
            case 'kyc':
                return <GuestInfoScreen onNext={goToMeals} guestData={guestData} />;
            case 'meals':
                return <MealSelectionScreen onNext={goToReview} guestData={guestData} onBack={goToKyc} />;
            case 'review':
                return <ReviewScreen onBack={goToMeals} guestData={guestData} />;
            default:
                return <WelcomeScreen onNext={() => setScreen('login')} />;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <div className="container mx-auto p-4 max-w-lg">
                {renderScreen()}
            </div>
        </div>
    );
}

// --- Screen Components ---

const WelcomeScreen = ({ onNext }) => {
    const images = [
        'https://placehold.co/600x800/0077b6/ffffff?text=Coastal+Getaway',
        'https://placehold.co/600x800/5a9a1d/ffffff?text=Mountain+Retreat',
        'https://placehold.co/600x800/f7b801/ffffff?text=Desert+Oasis',
        'https://placehold.co/600x800/d62828/ffffff?text=Urban+Escape'
    ];

    return (
        <div className="relative min-h-screen w-full max-w-lg -m-4 overflow-hidden">
            {/* Background Image Collage */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                {images.map((src, index) => (
                    <div key={index} className="bg-cover bg-center animate-zoom" style={{ backgroundImage: `url(${src})`, animationDelay: `${index * 150}ms` }}></div>
                ))}
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col justify-center items-center text-center min-h-screen p-8">
                <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in-down">Hostizzy</h1>
                <p className="text-white text-lg mb-8 animate-fade-in-up">Your seamless stay experience starts here.</p>
                <button 
                    onClick={onNext} 
                    className="bg-orange-500 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-orange-600 transition duration-300 transform hover:scale-105 animate-fade-in-up"
                    style={{ animationDelay: '300ms' }}
                >
                    Begin Pre-Check-in
                </button>
            </div>
             <style>{`
                @keyframes zoom {
                    from { transform: scale(1.2); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-zoom {
                    animation: zoom 1s ease-out forwards;
                }
                 @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.5s ease-out forwards;
                }
                 @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out 150ms forwards;
                }
            `}</style>
        </div>
    );
};

const LoginScreen = ({ onLoginSuccess }) => {
    const [bookingId, setBookingId] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const handleLogin = async () => {
        if (!bookingId || !phone) {
            setError('Please enter both Booking ID and Phone Number.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId, phone })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed. Please check your details.');
            }

            // --- SUCCESS ---
            onLoginSuccess(data.token, data.phone);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Hostizzy</h1>
                <p className="text-gray-500">Enter your details to find your booking.</p>
            </div>
            {error && <ErrorMessage message={error} />}
            <div className="space-y-6">
                <input type="text" placeholder="Booking ID (e.g., HZ-G0A-123)" value={bookingId} onChange={e => setBookingId(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <input type="tel" placeholder="10-Digit Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <button onClick={handleLogin} disabled={loading} className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition duration-300 disabled:bg-orange-300">
                    {loading ? 'Verifying...' : 'Find My Reservation'}
                </button>
            </div>
        </div>
    );
};

const PropertySelectionScreen = ({ onPropertySelect, apiToken, userPhone }) => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProperties = async () => {
            if (!userPhone) return;
            try {
                // Pass the phone number as a query parameter
                const response = await fetch(`${API_BASE_URL}/reservations?phone=${userPhone}`, {
                    headers: {
                        // In a real app, the token would be a real JWT
                        'Authorization': `Bearer ${apiToken}`
                    }
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Could not fetch properties.');
                }
                setProperties(data);
            } catch (err)
 {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchProperties();
    }, [apiToken, userPhone]);

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
             <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Properties</h1>
                <p className="text-gray-500">Select a property to see your reservations.</p>
            </div>
            {loading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            <div className="space-y-4">
                {properties.map(prop => (
                    <div key={prop.id} onClick={() => onPropertySelect(prop)} className="bg-gray-100 p-4 rounded-lg cursor-pointer hover:bg-orange-100 transition duration-300">
                        <h2 className="font-bold text-lg">{prop.name}</h2>
                        <p className="text-sm text-gray-600">{prop.reservations.length} upcoming reservation(s)</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ReservationSelectionScreen = ({ property, onReservationSelect, onBack }) => (
     <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">{property.name}</h1>
            <p className="text-gray-500">Select your upcoming stay.</p>
        </div>
        <div className="space-y-4">
            {property.reservations.map(res => (
                 <div key={res.id} onClick={() => onReservationSelect(res)} className="bg-gray-100 p-4 rounded-lg cursor-pointer hover:bg-orange-100 transition duration-300">
                    <h2 className="font-bold text-lg">Reservation #{res.id}</h2>
                    <p className="text-sm text-gray-600">Check-in: {new Date(res.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            ))}
        </div>
         <div className="mt-8 text-center">
             <button onClick={onBack} className="text-orange-500 hover:underline">Back to Properties</button>
        </div>
    </div>
);

const GuestInfoScreen = ({ onNext, guestData }) => {
    const [guests, setGuests] = useState(guestData.guestsSubmitted);
    
    const progress = (guests / guestData.numGuests) * 100;
    
    const simulateGuestAdd = () => {
        if (guests < guestData.numGuests) {
            setGuests(prev => prev + 1);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Guest Information</h1>
                <p className="text-gray-500">Please add details for all guests.</p>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-6">
                <p className="text-sm text-center mb-2">{guests} of {guestData.numGuests} Guests Submitted</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            {/* Guest Form (for primary guest) */}
            <div className="border p-4 rounded-lg">
                 <h2 className="font-bold mb-4 text-lg">Your Details (Primary Guest)</h2>
                 {/* A real form would go here */}
                 <p className="text-gray-600 text-sm">Your details have been pre-filled. You can now simulate other guests submitting their details.</p>
            </div>

            {/* Simulation Button */}
            <div className="my-6 text-center">
                 <button onClick={simulateGuestAdd} className="bg-yellow-400 text-yellow-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed" disabled={guests >= guestData.numGuests}>
                     Simulate Guest Submission
                </button>
                <p className="text-xs text-gray-500 mt-2">In the live app, each guest will do this from their own device.</p>
            </div>

            {/* Navigation */}
            <div className="mt-8">
                <button onClick={onNext} className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition disabled:bg-orange-300 disabled:cursor-not-allowed" disabled={guests < guestData.numGuests}>
                    Proceed to Meal Selection
                </button>
            </div>
        </div>
    );
};

const MealSelectionScreen = ({ onNext, guestData, onBack }) => {
    const [activeTab, setActiveTab] = useState('packages');
    const menu = mockMenuData[guestData.propertyId];

    const isMenuLocked = useMemo(() => {
        const checkInDate = new Date(guestData.checkIn);
        const cutoffDate = new Date(checkInDate.getTime() - (24 * 60 * 60 * 1000));
        return new Date() > cutoffDate;
    }, [guestData.checkIn]);
    
    if (!menu) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                 <h1 className="text-3xl font-bold text-gray-800 mb-4">Meal Selections</h1>
                 <p>No menu data available for this property.</p>
                 <button onClick={onBack} className="mt-6 text-orange-500 hover:underline">Back to Guest Info</button>
             </div>
        )
    }

    if (isMenuLocked) {
        return (
             <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                 <h1 className="text-3xl font-bold text-gray-800 mb-4">Meal Selections</h1>
                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                    The meal selection window has closed. It locks 24 hours before check-in.
                 </div>
                 <button onClick={onBack} className="mt-6 text-orange-500 hover:underline">Back to Guest Info</button>
             </div>
        );
    }
    
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
             <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Meal Selection</h1>
                <p className="text-gray-500">Finalize your meals for your stay.</p>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('packages')} className={`${activeTab === 'packages' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Meal Packages
                    </button>
                    <button onClick={() => setActiveTab('alaCarte')} className={`${activeTab === 'alaCarte' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        À La Carte (Optional)
                    </button>
                </nav>
            </div>

            <div className="py-6">
                {activeTab === 'packages' && (
                    <div>
                        <div className="bg-blue-50 p-4 rounded-lg mb-6">
                             <h3 className="font-bold text-lg mb-2">Cost Calculation</h3>
                            {/* Cost calculation form would go here */}
                             <p className="text-sm text-gray-700">Select a package and specify guest counts to see the estimated cost.</p>
                        </div>
                        {Object.values(menu.selections).map(section => (
                            <div key={section.title} className="mb-4 border-b pb-4">
                                <h4 className="font-bold text-xl mb-2">{section.title}</h4>
                                <p className="text-sm text-gray-500 mb-2">{section.rules}</p>
                                <p className="text-sm font-semibold text-gray-600 mb-3">{section.accompaniments}</p>
                                {section.categories.map(cat => (
                                    <div key={cat.name}>
                                        <h5 className="font-semibold text-orange-700">{cat.name}</h5>
                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                            {cat.items.map(item => (
                                                <label key={item} className="flex items-center space-x-2">
                                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                                                    <span className="text-sm text-gray-700">{item}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'alaCarte' && (
                     <div>
                        {menu.alaCarte.map(item => (
                            <div key={item.id} className="flex justify-between items-center py-2 border-b">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-gray-600">₹{item.price}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                     <button className="px-2 py-1 border rounded">-</button>
                                     <span>0</span>
                                     <button className="px-2 py-1 border rounded">+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-8 flex justify-between items-center">
                 <button onClick={onBack} className="text-orange-500 hover:underline">Back</button>
                <button onClick={() => alert("Finalizing selections!")} className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition">
                    Finalize Selections
                </button>
            </div>
        </div>
    );
};

const ReviewScreen = ({ guestData, onBack }) => {
    const isReviewAvailable = useMemo(() => {
        const checkOutDate = new Date(guestData.checkOut);
        const today = new Date();
        // Set hours to 0 to compare dates only
        checkOutDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        return today >= checkOutDate;
    }, [guestData.checkOut]);

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
             <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Post-Stay Review</h1>
            </div>
            {isReviewAvailable ? (
                <div>
                     <p className="text-gray-600 mb-4">How was your stay at {mockReservationDetails.propertyId === 'prop-01' ? 'Serene Villa, Goa' : 'Mountain Getaway, Manali'}?</p>
                     <textarea className="w-full p-2 border rounded-lg" rows="5" placeholder="Share your experience..."></textarea>
                     <div className="mt-4">
                         <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photos</label>
                         <input type="file" multiple className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"/>
                     </div>
                      <div className="mt-8 flex justify-between items-center">
                        <button onClick={onBack} className="text-orange-500 hover:underline">Back</button>
                        <button onClick={() => alert("Submitting review!")} className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition">
                            Submit Review
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-gray-600 mb-4">The review option will become available on your check-out day: {new Date(guestData.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
                     <button onClick={onBack} className="text-orange-500 hover:underline">Back to Meal Selection</button>
                </div>
            )}
        </div>
    );
};

