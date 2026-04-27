import React, { useState, useEffect } from 'react';
import { useSkinProfile } from '../context/SkinProfileContext';
import { getProductRecommendation } from '../services/recommendationService';

const ProductRecommendation = ({ brandName, subCategory, priceUsd }) => {
    const { skinProfile } = useSkinProfile();

    // Form states
    const [skinType, setSkinType] = useState(skinProfile?.skinType || '');
    const [skinTone, setSkinTone] = useState(skinProfile?.skinTone || '');
    const [eyeColor, setEyeColor] = useState(skinProfile?.eyeColor || '');
    const [hairColor, setHairColor] = useState(skinProfile?.hairColor || '');

    // Hardcoded options as specified
    const skinTypeOptions = ["Combination", "Normal", "Dry", "Oily"];
    const skinToneOptions = ["Fair", "Light", "Light Medium", "Fair Light", "Medium Tan", "Medium", "Tan", "Deep", "Rich", "Porcelain", "Dark", "Olive", "Not Sure"];
    const eyeColorOptions = ["Brown", "Green", "Blue", "Hazel", "Grey/Gray"];
    const hairColorOptions = ["Black", "Brown", "Blonde", "Auburn", "Red", "Gray", "Brunette"];

    // UI States
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    // Auto-run if profile is completely filled
    useEffect(() => {
        if (skinProfile?.skinType && skinProfile?.skinTone && skinProfile?.eyeColor && skinProfile?.hairColor) {
            handleCheckRecommendation(skinProfile.skinType, skinProfile.skinTone, skinProfile.eyeColor, skinProfile.hairColor);
        }
    }, [skinProfile, brandName, subCategory, priceUsd]);

    const onSubmit = (e) => {
        e.preventDefault();
        handleCheckRecommendation(skinType, skinTone, eyeColor, hairColor);
    };

    const handleCheckRecommendation = async (st, stone, ecolor, hcolor) => {
        if (!st || !stone || !ecolor || !hcolor) return;

        setLoading(true);
        setErrorMsg(null);
        setResult(null);

        try {
            const recommendation = await getProductRecommendation(
                brandName,
                subCategory,
                st,
                stone,
                ecolor,
                hcolor,
                priceUsd
            );
            setResult(recommendation);
        } catch (error) {
            setErrorMsg("Recommendation service unavailable. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 shadow-sm my-8 text-gray-800 font-sans max-w-2xl mx-auto">
            {/* Header section */}
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        Is this product right for you?
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Tell us about your skin and we'll check if this product suits your profile
                    </p>
                </div>
                <span className="bg-pink-100 text-pink-700 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                    Powered by AI ✨
                </span>
            </div>

            {/* Form Section */}
            {!result && !loading && !errorMsg && (
                <form onSubmit={onSubmit} className="bg-white p-5 rounded-xl shadow-inner mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Skin Type</label>
                            <select 
                                value={skinType} 
                                onChange={(e) => setSkinType(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-rose-400 focus:border-rose-400"
                                required
                            >
                                <option value="" disabled>Select Type</option>
                                {skinTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                {skinTypeOptions.length === 0 && <option value="Combination">Combination</option>}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Skin Tone</label>
                            <select 
                                value={skinTone} 
                                onChange={(e) => setSkinTone(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-rose-400 focus:border-rose-400"
                                required
                            >
                                <option value="" disabled>Select Tone</option>
                                {skinToneOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Eye Color</label>
                            <select 
                                value={eyeColor} 
                                onChange={(e) => setEyeColor(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-rose-400 focus:border-rose-400"
                                required
                            >
                                <option value="" disabled>Select Eye Color</option>
                                {eyeColorOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Hair Color</label>
                            <select 
                                value={hairColor} 
                                onChange={(e) => setHairColor(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-rose-400 focus:border-rose-400"
                                required
                            >
                                <option value="" disabled>Select Hair Color</option>
                                {hairColorOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        className="mt-5 w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-lg transition-colors"
                    >
                        Check if this suits me 🌸
                    </button>
                </form>
            )}

            {/* Loading Section */}
            {loading && (
                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-inner mb-4">
                    <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
                    <p className="mt-3 text-sm text-gray-600">Analyzing your skin profile...</p>
                </div>
            )}

            {/* Error Section */}
            {errorMsg && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl text-sm mb-4">
                    <div className="flex items-center gap-2">
                        <span>ℹ️</span>
                        <p>{errorMsg}</p>
                    </div>
                    {/* Does not block purchase natively in the page */}
                </div>
            )}

            {/* Result Section */}
            {result && !loading && !errorMsg && (
                <div className="bg-white p-5 rounded-xl shadow-inner mb-4 animate-fade-in transition-opacity duration-500 ease-in-out">
                    {result.isRecommended ? (
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-3xl">✅</span>
                                <div>
                                    <h4 className="text-lg font-bold text-green-700">Great news! This product suits your profile</h4>
                                    <span className="inline-block mt-1 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                                        {Math.round(result.confidence)}% match
                                    </span>
                                </div>
                            </div>
                            <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-4 rounded-r-md">
                                <p className="text-sm text-green-900 italic">"{result.insight}"</p>
                            </div>
                            <div className="flex flex-col md:flex-row gap-3">
                                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg shadow-sm transition-colors text-center">
                                    Add to Cart
                                </button>
                                <button className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-lg transition-colors text-center">
                                    See similar products
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-3xl">⚠️</span>
                                <div>
                                    <h4 className="text-lg font-bold text-amber-700">This may not suit your skin profile</h4>
                                    <span className="inline-block mt-1 bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                                        {Math.round(result.confidence)}% confidence
                                    </span>
                                </div>
                            </div>
                            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 mb-4 rounded-r-md">
                                <p className="text-sm text-amber-900 italic">"{result.insight}"</p>
                            </div>
                            <div className="flex flex-col md:flex-row gap-3 items-center">
                                <button className="w-full md:w-auto px-6 bg-white border border-amber-300 hover:bg-amber-50 text-amber-700 font-semibold py-2.5 rounded-lg transition-colors text-center">
                                    See better alternatives
                                </button>
                                <p className="text-xs text-gray-500 text-center w-full md:w-auto">
                                    This is an AI suggestion — results may vary per individual
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductRecommendation;
