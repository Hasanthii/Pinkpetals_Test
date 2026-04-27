import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the context
const SkinProfileContext = createContext();

// Create a custom hook to use the context
export const useSkinProfile = () => {
    return useContext(SkinProfileContext);
};

// Context Provider component
export const SkinProfileProvider = ({ children }) => {
    const [skinProfile, setSkinProfileState] = useState(null);

    // Load from local storage when initializing
    useEffect(() => {
        const savedProfile = localStorage.getItem('pinkPetalsSkinProfile');
        if (savedProfile) {
            try {
                setSkinProfileState(JSON.parse(savedProfile));
            } catch (error) {
                console.error("Failed to parse skin profile from local storage", error);
            }
        }
    }, []);

    // Provide the setter which also updates local storage
    const setSkinProfile = (profile) => {
        setSkinProfileState(profile);
        localStorage.setItem('pinkPetalsSkinProfile', JSON.stringify(profile));
    };

    // Export a clear method just in case
    const clearSkinProfile = () => {
        setSkinProfileState(null);
        localStorage.removeItem('pinkPetalsSkinProfile');
    };

    return (
        <SkinProfileContext.Provider value={{ skinProfile, setSkinProfile, clearSkinProfile }}>
            {children}
        </SkinProfileContext.Provider>
    );
};
