// You can place this code in a file like `app/page.tsx` in a new Next.js project.
// Ensure you have Tailwind CSS and lucide-react installed:
// npm install lucide-react

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Upload, User, Shield, Utensils, Star, Camera, ArrowRight, Check, X, Plus, Minus, Info, PartyPopper, Lock, Edit, Building, LogIn, ShoppingCart, Loader2 } from 'lucide-react';

// --- Configuration ---
// FINAL STEP: Replace the placeholder URL below with your actual, working URL from Render.
const API_BASE_URL = 'https://hostizzy-backend.onrender.com/api/guest';


// --- Mock Data (For parts not yet connected to API) ---
const propertyMenus = {
    goa_villa: {
        breakfast: {
            title: 'Breakfast',
            rules: 'Choose any 1 Veg & 1 Non-veg Or 2 Veg Dishes',
            categories: {
                'Non-veg': { items: ['Eggs to Order'], max: 1 },
                'Veg': { items: ['Assorted paratha', 'Poori bhaji', 'Poha', 'Vegetable/Paneer Cheelas', 'Chole bhature'], max: 2 },
            },
            accompaniments: 'Toasts & Preserves, Tea/Coffee'
        },
        lunch: {
            title: 'Lunch',
            rules: 'Choose any 1 Preparation each from the below options',
            categories: {
                'Vegetarian': { items: ['Gobhi Masala', 'Bhindi do pyaza', 'Aloo capsicum', 'Jeera Aloo', 'Matar Paneer', 'Kadhai paneer'], max: 1 },
                'Dal': { items: ['Rajma', 'Chole', 'Dal tadka', 'Sambhar'], max: 1 },
                'Non-Vegetarian': { items: ['Chicken curry', 'Chicken kadhai', 'Butter chicken', 'Egg curry'], max: 1 },
            },
            accompaniments: 'Rice, Roti, Raita, Salad'
        },
        barbeque: {
            title: 'Barbeque Starters/Snacks',
            rules: 'Choose any 2 Preparations each from the below options',
            categories: {
                'Vegetarian': { items: ['Paneer Tikka', 'Haryali paneer Tikka', 'Chilli Paneer dry', 'Tandoori Aloo', 'Honey chilli potato', 'Tandoori Gobhi', 'Vegetable pakoda', 'Maggie'], max: 2 },
                'Non-Vegetarian': { items: ['Chicken Tikka', 'Chicken Malai Tikka', 'Haryali chicken Tikka', 'Chilli Chicken', 'Chicken Seekh kabab'], max: 2 },
            },
            accompaniments: null
        },
        dinner: {
            title: 'Dinner',
            rules: 'Choose any 1 Preparation each from the below options',
            categories: {
                'Dal': { items: ['Dal Makhani', 'Dal Tadka', 'Dal achari'], max: 1 },
                'Paneer': { items: ['Kadhai Paneer', 'Butter Paneer', 'Matar paneer', 'Chilli paneer gravy', 'Paneer bhurji'], max: 1 },
                'Vegetarian': { items: ['Gobhi Masala', 'Bhindi Masala', 'Jeera Aloo', 'Baigan Bharta', 'Aloo Beans', 'Aloo Shimla Mirch', 'Dum Aloo', 'Mixed Veg'], max: 1 },
                'Non-Vegetarian': { items: ['Butter Chicken', 'Chicken Curry', 'Masala Chicken', 'Egg curry', 'Kadhai chicken'], max: 1 },
            },
            accompaniments: 'Rice, Roti, Salad, Raita, papad, achar'
        }
    },
    manali_cottage: {
        breakfast: {
            title: 'Himalayan Breakfast',
            rules: 'Choose any 2 dishes',
            categories: {
                'Local & Fresh': { items: ['Siddu with Ghee', 'Aloo Paratha with Curd', 'Masala Omelette', 'Pancakes with Honey'], max: 2 },
            },
            accompaniments: 'Fresh Juice, Tea/Coffee'
        },
        dinner: {
            title: 'Hearty Dinner',
            rules: 'Choose 1 Main Course',
            categories: {
                'Main Course': { items: ['Himachali Dhaam (Veg)', 'Trout Fish Curry (Non-Veg)', 'Chicken Anardana', 'Paneer Butter Masala'], max: 1 },
            },
            accompaniments: 'Rice, Roti, Salad'
        }
    }
};

const mockAlacarteMenu = [
    { id: 'ac1', name: 'French Fries', price: 150, category: 'Snacks' },
    { id: 'ac2', name: 'Chilli Paneer Dry', price: 280, category: 'Snacks' },
    { id: 'ac3', name: 'Masala Papad (2 pcs)', price: 100, category: 'Snacks' },
    { id: 'ac4', name: 'Soft Drink (600ml)', price: 80, category: 'Beverages' },
    { id: 'ac5', name: 'Mineral Water (1L)', price: 50, category: 'Beverages' },
];

// --- Reusable Components ---
const CustomModal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 shadow-2xl max-w-sm w-full transform transition-all scale-95 animate-in fade-in-0 zoom-in-95">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-800">{title}</h2><button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button></div>
            {children}
        </div>
    </div>
);

// --- Screen Components ---

const WelcomeScreen = ({ onProceed }) => (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-white text-center p-4 bg-gray-800">
        <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2600&auto=format&fit=crop')", opacity: 0.4 }}></div>
        <div className="relative z-10">
            <img src="https://placehold.co/150x50/ff6347/ffffff?text=Hostizzy" alt="Hostizzy Logo" className="h-16 mx-auto mb-4" />
            <h1 className="text-5xl md:text-6xl font-extrabold drop-shadow-lg">Welcome to Hostizzy</h1>
            <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md">Your seamless guest experience starts here. Complete your pre-check-in formalities with ease.</p>
            <button onClick={onProceed} className="mt-8 bg-teal-500 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-teal-600 transition-all duration-300 transform hover:scale-105 shadow-xl">
                Begin Pre-Check-in
            </button>
        </div>
    </div>
);

const LoginScreen = ({ onLogin }) => {
    const [phone, setPhone] = useState('');
    const [bookingId, setBookingId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, bookingId })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Login failed. Please check your details.');
            onLogin(data.user, data.token);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full">
                <header className="text-center mb-8"><img src="https://placehold.co/150x50/ff6347/ffffff?text=Hostizzy" alt="Hostizzy Logo" className="h-12 mx-auto mb-4" /><h1 className="text-3xl font-bold text-gray-800">Guest Login</h1><p className="text-gray-600">Please enter your details to find your reservations.</p></header>
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-6">
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <div><label htmlFor="bookingId" className="block text-sm font-medium text-gray-700">Booking Reference</label><input id="bookingId" type="text" value={bookingId} onChange={e => setBookingId(e.target.value)} placeholder="e.g. HZ-GOA-123" className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-400" required /></div>
                    <div><label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label><input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit mobile number" className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-400" required /></div>
                    <button type="submit" disabled={loading} className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 transition-all duration-300 flex items-center justify-center disabled:bg-gray-400">
                        {loading ? <Loader2 className="animate-spin mr-2"/> : <LogIn className="mr-2" size={20}/>}
                        Find My Stays
                    </button>
                </form>
            </div>
        </div>
    );
};

const PropertySelectionScreen = ({ user, apiToken, onSelectProperty }) => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        const fetchReservations = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(`${API_BASE_URL}/reservations?phone=${user.phone_number}`, {
                    headers: { 'Authorization': `Bearer ${apiToken}` }
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Could not fetch reservations.');

                // Group reservations by property
                const groupedByProperty = data.reduce((acc, res) => {
                    if (!acc[res.property_id]) {
                        acc[res.property_id] = {
                            id: res.property_id,
                            name: res.property_name,
                            reservations: []
                        };
                    }
                    acc[res.property_id].reservations.push(res);
                    return acc;
                }, {});

                setProperties(Object.values(groupedByProperty));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (user && apiToken) {
            fetchReservations();
        }
    }, [user, apiToken]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="max-w-2xl w-full">
                <header className="text-center mb-8"><img src="https://placehold.co/150x50/ff6347/ffffff?text=Hostizzy" alt="Hostizzy Logo" className="h-10 mx-auto mb-4" /><h1 className="text-3xl font-bold text-gray-800">Welcome, {user.full_name}!</h1><p className="text-gray-600">You have bookings at the following properties. Please select one.</p></header>
                {loading && <div className="text-center"><Loader2 className="animate-spin inline-block text-teal-500" size={32}/></div>}
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div className="space-y-4">
                    {properties.map(prop => (
                        <button key={prop.id} onClick={() => onSelectProperty(prop)} className="w-full text-left bg-white p-4 rounded-xl shadow-lg border border-gray-100 hover:border-teal-400 hover:bg-teal-50 transition-all">
                            <div className="flex items-center"><Building className="text-teal-500 mr-4" size={32} /><div><h2 className="text-xl font-bold text-gray-800">{prop.name}</h2></div></div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ReservationSelectionScreen = ({ user, property, onSelectReservation }) => {
    // We receive the full property object with its reservations now
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="max-w-2xl w-full">
                <header className="text-center mb-8"><img src="https://placehold.co/150x50/ff6347/ffffff?text=Hostizzy" alt="Hostizzy Logo" className="h-10 mx-auto mb-4" /><h1 className="text-3xl font-bold text-gray-800">My Reservations at {property.name}</h1><p className="text-gray-600">Please select your upcoming stay.</p></header>
                <div className="space-y-4">
                    {property.reservations.map(res => (
                        <button key={res.booking_id} onClick={() => onSelectReservation(res)} className="w-full text-left bg-white p-4 rounded-xl shadow-lg border border-gray-100 hover:border-teal-400 hover:bg-teal-50 transition-all">
                            <div className="flex items-center"><div><h2 className="text-lg font-bold text-gray-800">Booking Ref: {res.booking_id}</h2><p className="text-gray-600 text-sm">Check-in: {new Date(res.check_in_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} for {res.number_of_guests} guests</p></div></div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const GuestFlow = ({ reservationData, onComplete }) => {
    const [step, setStep] = useState(1);
    const [reservation, setReservation] = useState({
      ...reservationData,
      propertyName: reservationData.property_name,
      checkInDate: reservationData.check_in_date,
      checkOutDate: reservationData.check_out_date,
      bookingRef: reservationData.booking_id,
      numGuests: reservationData.number_of_guests,
      propertyId: 'goa_villa', // This needs to be dynamic based on property
      isPrimaryGuest: true, // Assuming the logged in user is primary
    });
    const [guests, setGuests] = useState([]);
    const [currentGuest, setCurrentGuest] = useState({ fullName: '', dob: '', phone: '', idType: 'Aadhar', idNumber: '', idDocument: null, idDocumentName: '' });
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [review, setReview] = useState({ rating: 0, comment: '', photos: [] });
    const [isPrimaryGuest, setIsPrimaryGuest] = useState(reservation.isPrimaryGuest);
    const [mealPackage, setMealPackage] = useState(null);
    const [guestAges, setGuestAges] = useState({ adults: reservation.numGuests, kids_5_12: 0, kids_under_5: 0 });
    const [mealSelections, setMealSelections] = useState({});
    const [isMenuFinalized, setIsMenuFinalized] = useState(false);
    const [activeMealTab, setActiveMealTab] = useState('packages');
    const [alacarteOrder, setAlacarteOrder] = useState({});

    const propertyMenu = propertyMenus[reservation.propertyId] || {};
    
    const isReviewAvailable = useMemo(() => new Date() >= new Date(reservation.checkOutDate), [reservation.checkOutDate]);
    const isMenuLocked = useMemo(() => new Date() > new Date(new Date(reservation.checkInDate).getTime() - (24 * 60 * 60 * 1000)), [reservation.checkInDate]);
    const handleAddGuest = (e) => { e.preventDefault(); if (!currentGuest.fullName || !currentGuest.dob || !currentGuest.phone || !currentGuest.idNumber || !currentGuest.idDocument) { alert("Please fill all fields and upload an ID."); return; } setShowOtpModal(true); };
    const handleVerifyOtp = () => { if (otp === '1234') { const newGuest = { ...currentGuest, id: guests.length + 1, isVerified: true, isPrimary: isPrimaryGuest }; setGuests([...guests, newGuest]); setCurrentGuest({ fullName: '', dob: '', phone: '', idType: 'Aadhar', idNumber: '', idDocument: null, idDocumentName: '' }); setShowOtpModal(false); setOtp(''); setIsPrimaryGuest(false); } else { alert("Invalid OTP. Please try again."); } };
    const simulateGuestSubmission = () => { if (guests.length < reservation.numGuests) { const guestNumber = guests.length + 1; const simulatedGuest = { id: guestNumber, fullName: `Guest ${guestNumber}`, isVerified: true, isPrimary: false, }; setGuests(prevGuests => [...prevGuests, simulatedGuest]); } };
    const handleMealSelection = (meal, category, item) => { setMealSelections(prev => { const newSelections = { ...prev }; if (!newSelections[meal]) newSelections[meal] = {}; if (!newSelections[meal][category]) newSelections[meal][category] = []; const currentCategorySelections = newSelections[meal][category]; const maxSelections = propertyMenu[meal].categories[category].max; if (currentCategorySelections.includes(item)) { newSelections[meal][category] = currentCategorySelections.filter(i => i !== item); } else { if (currentCategorySelections.length < maxSelections) { newSelections[meal][category].push(item); } } return newSelections; }); };
    const handleBreakfastSelection = (category, item) => { setMealSelections(prev => { const newSelections = { ...prev }; const breakfast = newSelections.breakfast || {}; const veg = breakfast['Veg'] || []; const nonVeg = breakfast['Non-veg'] || []; const isCurrentlySelected = (breakfast[category] || []).includes(item); if (isCurrentlySelected) { breakfast[category] = breakfast[category].filter(i => i !== item); } else { if (category === 'Veg') { if (veg.length < 2 && (veg.length + nonVeg.length < 2)) { breakfast['Veg'] = [...veg, item]; } } else if (category === 'Non-veg') { if (nonVeg.length < 1 && veg.length < 2) { breakfast['Non-veg'] = [...nonVeg, item]; } } } newSelections.breakfast = breakfast; return newSelections; }); };
    const handleAlacarteChange = (itemId, change) => { setAlacarteOrder(prev => { const newOrder = { ...prev }; const currentQty = newOrder[itemId] || 0; newOrder[itemId] = Math.max(0, currentQty + change); return newOrder; }); };
    const totalPackageCost = useMemo(() => { if (!mealPackage) return 0; const pricePerAdult = mealPackage === 'all_meals' ? 1800 : 1500; const adultCost = guestAges.adults * pricePerAdult; const kidCost = guestAges.kids_5_12 * (pricePerAdult * 0.5); const totalDays = Math.ceil((new Date(reservation.checkOutDate) - new Date(reservation.checkInDate)) / (1000 * 60 * 60 * 24)); return (adultCost + kidCost) * totalDays; }, [mealPackage, guestAges, reservation]);
    const totalAlacarteCost = useMemo(() => { return Object.entries(alacarteOrder).reduce((total, [itemId, quantity]) => { const item = mockAlacarteMenu.find(i => i.id === itemId); return total + (item ? item.price * quantity : 0); }, 0); }, [alacarteOrder]);

    const StepIndicator = ({ currentStep }) => {
        const steps = ['Guest Details', 'Meal Selection', 'Review'];
        return (<nav aria-label="Progress"><ol className="flex justify-between items-center mb-8">{steps.map((step, index) => (<React.Fragment key={step}><li className="flex flex-col items-center"><div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${currentStep >= index + 1 ? 'bg-teal-500' : 'bg-gray-300'}`}>{currentStep > index + 1 ? <Check /> : index + 1}</div><span className={`mt-2 text-xs text-center ${currentStep >= index + 1 ? 'text-teal-600 font-semibold' : 'text-gray-500'}`}>{step}</span></li>{index < steps.length - 1 && <div className={`flex-1 h-1 mx-2 ${currentStep > index + 1 ? 'bg-teal-500' : 'bg-gray-300'}`}></div>}</React.Fragment>))}</ol></nav>);
    };

    const InfoCard = ({ reservation }) => (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 mb-6"><h2 className="text-xl font-bold text-gray-800">{reservation.propertyName}</h2><p className="text-gray-600 text-sm">Booking Ref: <span className="font-semibold text-gray-700">{reservation.bookingRef}</span></p><div className="flex justify-between mt-3 text-sm border-t pt-3"><div className="text-center"><p className="text-gray-500">Check-in</p><p className="font-semibold text-gray-800">{new Date(reservation.checkInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div><div className="text-center"><p className="text-gray-500">Check-out</p><p className="font-semibold text-gray-800">{new Date(reservation.checkOutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div><div className="text-center"><p className="text-gray-500">Guests</p><p className="font-semibold text-gray-800">{reservation.numGuests}</p></div></div></div>
    );

    const renderKycStep = () => (
        <section>
            <header className="mb-4"><h2 className="text-2xl font-bold text-gray-800 flex items-center"><User className="mr-2 text-teal-500"/> Guest Information</h2><p className="text-gray-600 mt-1">Each guest must submit their details. This screen shows the overall progress.</p></header>
            <div className="mb-6"><div className="flex justify-between mb-1"><span className="text-base font-medium text-teal-700">Progress</span><span className="text-sm font-medium text-teal-700">{guests.length} of {reservation.numGuests} Guests Submitted</span></div><div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-teal-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(guests.length / reservation.numGuests) * 100}%` }}></div></div></div>
            <div className="space-y-3 mb-6">{guests.map(g => (<div key={g.id} className="bg-green-50 border border-green-200 p-3 rounded-lg flex justify-between items-center animate-in fade-in-0"><p className="text-green-800 font-medium">{g.isPrimary ? `${g.fullName} (Primary)` : g.fullName}</p><div className="flex items-center text-green-600 text-sm"><Shield size={16} className="mr-1"/> Verified</div></div>))}</div>
            {!guests.some(g => g.isPrimary && g.id) && (
                <form onSubmit={handleAddGuest} className="bg-white p-5 rounded-xl shadow-lg border"><h3 className="font-semibold text-lg mb-4 text-gray-700">Add Your (Primary Guest) Details</h3><div className="space-y-4"><input type="text" placeholder="Full Name (as per ID)" value={currentGuest.fullName} onChange={e => setCurrentGuest({...currentGuest, fullName: e.target.value})} className="w-full p-3 border rounded-lg" required /><input type="date" value={currentGuest.dob} onChange={e => setCurrentGuest({...currentGuest, dob: e.target.value})} className="w-full p-3 border rounded-lg" required /><input type="tel" placeholder="Phone Number" value={currentGuest.phone} onChange={e => setCurrentGuest({...currentGuest, phone: e.target.value})} className="w-full p-3 border rounded-lg" required /><div className="flex gap-2"><select value={currentGuest.idType} onChange={e => setCurrentGuest({...currentGuest, idType: e.target.value})} className="p-3 border rounded-lg"><option>Aadhar</option><option>Passport</option><option>Driving License</option></select><input type="text" placeholder="ID Number" value={currentGuest.idNumber} onChange={e => setCurrentGuest({...currentGuest, idNumber: e.target.value})} className="w-full p-3 border rounded-lg" required /></div><div><label htmlFor="file-upload" className="w-full flex items-center justify-center p-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"><Upload className="mr-2 text-gray-500" size={20}/><span className="text-sm text-gray-600">{currentGuest.idDocumentName || 'Upload ID Document'}</span></label><input id="file-upload" type="file" className="hidden" onChange={e => { const file = e.target.files[0]; if (file) setCurrentGuest({...currentGuest, idDocument: file, idDocumentName: file.name })}} required /></div><div className="flex items-start"><input id="consent" type="checkbox" className="h-4 w-4 text-teal-600 border-gray-300 rounded mt-1" required /><label htmlFor="consent" className="ml-2 text-sm text-gray-600">I consent to the processing of my personal data.</label></div><button type="submit" className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 flex items-center justify-center"><Plus className="mr-2" size={20}/> Add & Verify My Details</button></div></form>
            )}
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center"><p className="text-sm text-yellow-800 mb-2">For testing: Click to simulate other guests submitting their details.</p><button onClick={simulateGuestSubmission} disabled={guests.length >= reservation.numGuests} className="bg-yellow-400 text-yellow-900 font-semibold py-2 px-4 rounded-lg hover:bg-yellow-500 disabled:bg-gray-300">Simulate Guest Submission</button></div>
            <div className="mt-8">{guests.length === reservation.numGuests ? (<button onClick={() => setStep(2)} className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 flex items-center justify-center animate-in fade-in-0">Proceed to Meal Selection <ArrowRight className="ml-2" size={20}/></button>) : (<div className="w-full bg-gray-100 text-gray-600 font-medium py-3 px-4 rounded-lg flex items-center justify-center text-center">Waiting for all guests to submit details...</div>)}</div>
        </section>
    );

    const renderMealsStep = () => (
        <section>
            <header className="mb-6"><h2 className="text-2xl font-bold text-gray-800 flex items-center"><Utensils className="mr-2 text-teal-500"/> Meal Selection</h2><p className="text-gray-600">Please select your meal options for the group.</p></header>
            <div className="border-b border-gray-200 mb-6"><nav className="-mb-px flex space-x-6" aria-label="Tabs"><button onClick={() => setActiveMealTab('packages')} className={`${activeMealTab === 'packages' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Meal Packages</button><button onClick={() => setActiveMealTab('alacarte')} className={`${activeMealTab === 'alacarte' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}>À La Carte <ShoppingCart className="ml-2" size={16} /></button></nav></div>
            {activeMealTab === 'packages' && (<div><div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 mb-6"><h3 className="font-bold text-lg text-gray-800 mb-4">1. Select Meal Package</h3><div className="grid sm:grid-cols-2 gap-4 mb-4"><button onClick={() => setMealPackage('all_meals')} className={`p-4 border-2 rounded-lg text-left ${mealPackage === 'all_meals' ? 'border-teal-500 bg-teal-50' : 'border-gray-300'}`}><p className="font-bold">All Meals</p><p className="text-sm">Breakfast, Lunch, Snacks & Dinner</p><p className="font-bold mt-1">₹1800 / head</p></button><button onClick={() => setMealPackage('snacks_dinner_breakfast')} className={`p-4 border-2 rounded-lg text-left ${mealPackage === 'snacks_dinner_breakfast' ? 'border-teal-500 bg-teal-50' : 'border-gray-300'}`}><p className="font-bold">Partial Plan</p><p className="text-sm">Snacks, Dinner & Breakfast</p><p className="font-bold mt-1">₹1500 / head</p></button></div><h3 className="font-bold text-lg text-gray-800 mb-2 mt-6">2. Specify Guest Ages</h3><div className="grid grid-cols-3 gap-4 text-center"><div><label className="text-sm font-medium">Adults (&gt;12y)</label><input type="number" value={guestAges.adults} onChange={e => setGuestAges({...guestAges, adults: +e.target.value})} className="w-full p-2 border rounded-lg mt-1 text-center"/></div><div><label className="text-sm font-medium">Kids (5-12y)</label><input type="number" value={guestAges.kids_5_12} onChange={e => setGuestAges({...guestAges, kids_5_12: +e.target.value})} className="w-full p-2 border rounded-lg mt-1 text-center"/></div><div><label className="text-sm font-medium">Kids (&lt;5y)</label><input type="number" value={guestAges.kids_under_5} onChange={e => setGuestAges({...guestAges, kids_under_5: +e.target.value})} className="w-full p-2 border rounded-lg mt-1 text-center"/></div></div></div>{mealPackage && (<div className="space-y-6">{Object.entries(propertyMenu).map(([mealKey, mealDetails]) => { const isBreakfast = mealKey === 'breakfast'; const currentSelections = mealSelections[mealKey] || {}; const vegSelections = currentSelections['Veg'] || []; const nonVegSelections = currentSelections['Non-veg'] || []; return (<div key={mealKey} className="bg-white p-5 rounded-xl shadow-lg border"><h3 className="font-bold text-xl text-gray-800 mb-1">{mealDetails.title}</h3><p className="text-sm text-gray-500 mb-4">{mealDetails.rules}</p>{Object.entries(mealDetails.categories).map(([catKey, catDetails]) => (<div key={catKey} className="mb-4"><h4 className="font-semibold text-teal-700 border-b-2 border-teal-100 pb-1 mb-2">{catKey}</h4><div className="space-y-2">{catDetails.items.map(item => { const isSelected = (currentSelections[catKey] || []).includes(item); let isDisabled = false; if (isBreakfast) { if (!isSelected) { if (catKey === 'Veg' && (vegSelections.length >= 2 || (vegSelections.length >= 1 && nonVegSelections.length >= 1))) isDisabled = true; if (catKey === 'Non-veg' && (nonVegSelections.length >= 1 || vegSelections.length >= 2)) isDisabled = true; } } else { isDisabled = !isSelected && (currentSelections[catKey] || []).length >= catDetails.max; } return (<label key={item} className={`flex items-center p-3 rounded-lg border ${isSelected ? 'bg-teal-50 border-teal-300' : 'bg-white'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}><input type="checkbox" checked={isSelected} disabled={isDisabled || isMenuLocked || isMenuFinalized} onChange={() => isBreakfast ? handleBreakfastSelection(catKey, item) : handleMealSelection(mealKey, catKey, item)} className="h-5 w-5 text-teal-600 rounded"/><span className="ml-3 text-gray-700">{item}</span></label>)})}</div></div>))}{mealDetails.accompaniments && <p className="text-sm text-gray-600 mt-4 pt-2 border-t"><b>Accompaniments:</b> {mealDetails.accompaniments}</p>}</div>)})}</div>)}</div>)}
            {activeMealTab === 'alacarte' && (<div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100"><h3 className="font-bold text-lg text-gray-800 mb-4">À La Carte Menu</h3><div className="space-y-3">{mockAlacarteMenu.map(item => (<div key={item.id} className="flex justify-between items-center"><div><p className="font-semibold text-gray-700">{item.name}</p><p className="text-sm text-gray-500">₹{item.price}</p></div><div className="flex items-center gap-2"><button onClick={() => handleAlacarteChange(item.id, -1)} disabled={isMenuLocked || isMenuFinalized} className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 disabled:opacity-50">-</button><span className="font-bold w-6 text-center">{alacarteOrder[item.id] || 0}</span><button onClick={() => handleAlacarteChange(item.id, 1)} disabled={isMenuLocked || isMenuFinalized} className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 disabled:opacity-50">+</button></div></div>))}</div></div>)}
            <div className="mt-6 sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 rounded-t-xl border-t"><div className="bg-gray-100 p-3 rounded-lg flex justify-between items-center"><p className="font-semibold">Total Estimated Cost:</p><p className="font-bold text-xl text-teal-600">₹{(totalPackageCost + totalAlacarteCost).toLocaleString('en-IN')}</p></div><div className="mt-4">{isMenuLocked ? (<div className="w-full bg-gray-200 text-gray-600 font-bold py-3 px-4 rounded-lg flex items-center justify-center"><Lock className="mr-2" size={20}/> Menu is Locked</div>) : isMenuFinalized ? (<div className="flex items-center gap-4"><div className="w-full bg-green-100 text-green-800 font-bold py-3 px-4 rounded-lg flex items-center justify-center"><Check className="mr-2" size={20}/> Selections Finalized</div><button onClick={() => setIsMenuFinalized(false)} className="bg-gray-200 text-gray-800 p-3 rounded-lg hover:bg-gray-300"><Edit size={20}/></button></div>) : (<button onClick={() => setIsMenuFinalized(true)} disabled={!mealPackage && totalAlacarteCost === 0} className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 disabled:bg-gray-300">Finalize Selections</button>)}<button onClick={() => setStep(3)} disabled={!isMenuFinalized || !isReviewAvailable} className="mt-4 w-full bg-gray-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-800 flex items-center justify-center disabled:bg-gray-300">{isReviewAvailable ? 'Proceed to Review' : `Review available on ${new Date(reservation.checkOutDate).toLocaleDateString('en-IN')}`} <ArrowRight className="ml-2" size={20}/></button></div></div>
        </section>
    );

    const renderReviewStep = () => (
        <section>
            <header className="mb-6"><h2 className="text-2xl font-bold text-gray-800 flex items-center"><Star className="mr-2 text-teal-500"/> Share Your Experience</h2><p className="text-gray-600">Your feedback helps us improve. Please rate your stay at {reservation.propertyName}.</p></header>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-in fade-in-0">
                <div className="mb-6"><p className="text-center font-semibold mb-3 text-gray-700">Overall Rating</p><div className="flex justify-center gap-2">{[1, 2, 3, 4, 5].map(star => (<Star key={star} size={40} className={`cursor-pointer transition-all duration-200 ${review.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`} onClick={() => setReview({ ...review, rating: star })}/>))}</div></div>
                <textarea placeholder="Tell us about your stay..." rows="5" value={review.comment} onChange={e => setReview({ ...review, comment: e.target.value })} className="w-full p-3 border rounded-lg mb-4"></textarea>
                <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Add Photos</label><div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-400"><Camera className="mx-auto h-12 w-12 text-gray-400" /><p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p><input type="file" multiple className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" /></div></div>
                <button onClick={() => setStep(4)} className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600">Submit Review</button>
            </div>
        </section>
    );

    const renderCompletionStep = () => (
        <section className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-100 animate-in fade-in-0">
            <PartyPopper size={60} className="mx-auto text-teal-500 mb-4"/><h2 className="text-2xl font-bold text-gray-800">All Set!</h2><p className="text-gray-600 mt-2 mb-6">Thank you. We look forward to hosting you at {reservation.propertyName}.</p>
            <button onClick={onComplete} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300">Back to Login</button>
        </section>
    );

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <div className="container mx-auto max-w-2xl p-4 sm:p-6">
                <header className="text-center mb-8"><img src="https://placehold.co/150x50/ff6347/ffffff?text=Hostizzy" alt="Hostizzy Logo" className="h-10 mx-auto mb-4" /></header>
                {step < 4 && <StepIndicator currentStep={step} />}
                <InfoCard reservation={reservation} />
                <main>
                    {step === 1 && renderKycStep()}
                    {step === 2 && isPrimaryGuest && renderMealsStep()}
                    {step === 2 && !isPrimaryGuest && (<div className="text-center bg-white p-8 rounded-xl shadow-lg border"><h2 className="text-2xl font-bold text-gray-800">Thank You!</h2><p className="text-gray-600 mt-2">Your details have been submitted. The primary guest will now select the meals for the group.</p></div>)}
                    {step === 3 && renderReviewStep()}
                    {step === 4 && renderCompletionStep()}
                </main>
            </div>
            {showOtpModal && (<CustomModal title="Verify Phone Number" onClose={() => setShowOtpModal(false)}><p className="text-center text-gray-600 mb-6">An OTP has been sent to {currentGuest.phone}. (Hint: it's 1234)</p><input type="text" maxLength="4" value={otp} onChange={e => setOtp(e.target.value)} className="w-full p-4 text-center text-2xl tracking-[1em] border rounded-lg mb-6" placeholder="----"/><button onClick={handleVerifyOtp} className="w-full bg-teal-500 text-white font-bold py-3 rounded-lg hover:bg-teal-600">Verify & Add My Details</button></CustomModal>)}
        </div>
    );
};

// --- App Container ---
export default function App() {
    const [page, setPage] = useState('welcome'); // welcome, login, property_selection, reservation_selection, guestFlow
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [apiToken, setApiToken] = useState(null);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [activeReservation, setActiveReservation] = useState(null);

    const handleLogin = (user, token) => {
        setLoggedInUser(user);
        setApiToken(token);
        setPage('property_selection');
    };

    const handleSelectProperty = (property) => {
        setSelectedProperty(property);
        setPage('reservation_selection');
    };

    const handleSelectReservation = (reservation) => {
        setActiveReservation(reservation);
        setPage('guestFlow');
    };
    
    const resetFlow = () => {
        setLoggedInUser(null);
        setApiToken(null);
        setSelectedProperty(null);
        setActiveReservation(null);
        setPage('welcome');
    };

    if (page === 'welcome') {
        return <WelcomeScreen onProceed={() => setPage('login')} />;
    }
    if (page === 'login') {
        return <LoginScreen onLogin={handleLogin} />;
    }
    if (page === 'property_selection') {
        return <PropertySelectionScreen user={loggedInUser} apiToken={apiToken} onSelectProperty={handleSelectProperty} />;
    }
    if (page === 'reservation_selection') {
        return <ReservationSelectionScreen user={loggedInUser} property={selectedProperty} onSelectReservation={handleSelectReservation} />;
    }
    if (page === 'guestFlow') {
        return <GuestFlow reservationData={activeReservation} onComplete={resetFlow} />;
    }

    return <div>Loading...</div>;
}

