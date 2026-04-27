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

    const getUserKey = () => {
        const user = JSON.parse(localStorage.getItem('pinkpetals_user') || 'null');
        return user ? `pinkPetalsSkinProfile_${user.id || user.email}` : null;
    };

    // Load from local storage when initializing or user changes
    useEffect(() => {
        const key = getUserKey();
        if (key) {
            const savedProfile = localStorage.getItem(key);
            if (savedProfile) {
                try {
                    setSkinProfileState(JSON.parse(savedProfile));
                } catch (error) {
                    console.error("Failed to parse skin profile from local storage", error);
                }
            } else {
                setSkinProfileState(null);
            }
        } else {
            setSkinProfileState(null);
        }
    }, []);

    // Provide the setter which also updates local storage
    const setSkinProfile = (profile) => {
        const key = getUserKey();
        setSkinProfileState(profile);
        if (key) {
            localStorage.setItem(key, JSON.stringify(profile));
        }
    };

    // Export a clear method just in case
    const clearSkinProfile = () => {
        const key = getUserKey();
        setSkinProfileState(null);
        if (key) {
            localStorage.removeItem(key);
        }
    };

    return (
        <SkinProfileContext.Provider value={{ skinProfile, setSkinProfile, clearSkinProfile }}>
            {children}
        </SkinProfileContext.Provider>
    );
};
