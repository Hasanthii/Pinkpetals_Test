import React, { useState } from 'react';
import { useSkinProfile } from '../context/SkinProfileContext';

const SkinProfileSetup = () => {
    const { skinProfile, setSkinProfile } = useSkinProfile();
    
    const [skinType, setSkinTypeLocal] = useState(skinProfile?.skinType || '');
    const [skinTone, setSkinToneLocal] = useState(skinProfile?.skinTone || '');
    const [eyeColor, setEyeColorLocal] = useState(skinProfile?.eyeColor || '');
    const [hairColor, setHairColorLocal] = useState(skinProfile?.hairColor || '');

    const skinTypeOptions = ["Combination", "Normal", "Dry", "Oily"];
    const skinToneOptions = ["Fair", "Light", "Light Medium", "Fair Light", "Medium Tan", "Medium", "Tan", "Deep", "Rich", "Porcelain", "Dark", "Olive", "Not Sure"];
    const eyeColorOptions = ["Brown", "Green", "Blue", "Hazel", "Grey/Gray"];
    const hairColorOptions = ["Black", "Brown", "Blonde", "Auburn", "Red", "Gray", "Brunette"];

    const [isSaved, setIsSaved] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        setSkinProfile({
            skinType,
            skinTone,
            eyeColor,
            hairColor
        });
        setIsSaved(true);
        
        // Return back after short delay
        setTimeout(() => {
            window.history.back(); // Redirect back to previous page
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-6 font-sans">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-rose-100">
                <div className="bg-rose-100 p-8 text-center flex flex-col items-center">
                    {/* Skincare illustration placeholder */}
                    <div className="text-6xl mb-4">🧴✨</div>
                    <h1 className="text-2xl font-extrabold text-rose-900">Your Skin Profile</h1>
                    <p className="text-rose-700 mt-2 text-sm max-w-sm">
                        Tell us about your unique features and we'll personalize your entire shopping experience!
                    </p>
                </div>

                <div className="p-8">
                    {isSaved ? (
                        <div className="text-center py-10 animate-fade-in">
                            <span className="text-5xl block mb-4">🌸</span>
                            <h2 className="text-xl font-bold text-green-700 mb-2">Profile saved!</h2>
                            <p className="text-gray-600">
                                We'll now show personalized recommendations across the store. Redirecting...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Skin Type</label>
                                <select 
                                    value={skinType} 
                                    onChange={(e) => setSkinTypeLocal(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-rose-400 focus:border-rose-400 bg-gray-50"
                                    required
                                >
                                    <option value="" disabled>Select your skin type</option>
                                    {skinTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    {skinTypeOptions.length === 0 && <option value="Combination">Combination</option>}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Skin Tone</label>
                                <select 
                                    value={skinTone} 
                                    onChange={(e) => setSkinToneLocal(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-rose-400 focus:border-rose-400 bg-gray-50"
                                    required
                                >
                                    <option value="" disabled>Select your skin tone</option>
                                    {skinToneOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Eye Color</label>
                                <select 
                                    value={eyeColor} 
                                    onChange={(e) => setEyeColorLocal(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-rose-400 focus:border-rose-400 bg-gray-50"
                                    required
                                >
                                    <option value="" disabled>Select your eye color</option>
                                    {eyeColorOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Hair Color</label>
                                <select 
                                    value={hairColor} 
                                    onChange={(e) => setHairColorLocal(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-rose-400 focus:border-rose-400 bg-gray-50"
                                    required
                                >
                                    <option value="" disabled>Select your hair color</option>
                                    {hairColorOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full mt-8 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md hover:shadow-lg"
                            >
                                Save my profile
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkinProfileSetup;
