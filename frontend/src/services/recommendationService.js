import api from './api';

const API_URL = '/recommend';

/**
 * Fetch product recommendation from backend API
 */
export const getProductRecommendation = async (brandName, subCategory, skinType, skinTone, eyeColor, hairColor, priceUsd) => {
    try {
        const response = await api.post(API_URL, {
            brandName,
            subCategory,
            skinType,
            skinTone,
            eyeColor,
            hairColor,
            priceUsd,
            sentimentScore: 0.75 
        });

        return response.data;
    } catch (error) {
        // Axios errors are handled by the interceptor in api.js, 
        // but we can add specific logic here if needed.
        console.error("Error in getProductRecommendation:", error);
        
        // Handle ML Server offline / unavailable (status 503)
        if (error.status === 503) {
            throw new Error("Recommendation service is currently unavailable.");
        }
        
        throw error;
    }
};

/**
 * Fetch list of skin types
 */
export const getSkinTypes = async () => {
    try {
        const response = await api.get(`${API_URL}/skin-types`);
        return response.data.skinTypes || []; 
    } catch (error) {
        console.error("Error in getSkinTypes:", error);
        return [];
    }
};

/**
 * Fetch list of skin tones
 */
export const getSkinTones = async () => {
    try {
        const response = await api.get(`${API_URL}/skin-tones`);
        return response.data.skinTones || []; 
    } catch (error) {
        console.error("Error in getSkinTones:", error);
        return [];
    }
};

/**
 * Fetch multiple recommendations efficiently in parallel using Promise.all
 */
export const getBatchProductRecommendations = async (products, skinProfile) => {
    if (!skinProfile || !products || products.length === 0) return {};
    
    // Map each product to a promise
    const promises = products.map(async (p) => {
        try {
            const res = await getProductRecommendation(
                p.brand || p.category,
                p.category, // using category as subCategory fallback
                skinProfile.skinType,
                skinProfile.skinTone,
                skinProfile.eyeColor,
                skinProfile.hairColor,
                p.price
            );
            return {
                id: p.id,
                status: res.isRecommended ? 'recommended' : 'not-recommended'
            };
        } catch (err) {
            return { id: p.id, status: 'hidden' };
        }
    });

    try {
        const results = await Promise.all(promises);
        const statusMap = {};
        results.forEach(r => {
            if (r.status !== 'hidden') {
                statusMap[r.id] = r.status;
            }
        });
        return statusMap;
    } catch (err) {
        return {};
    }
};
