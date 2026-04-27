const API_URL = '/api/recommend';

/**
 * Fetch product recommendation from backend API
 */
export const getProductRecommendation = async (brandName, subCategory, skinType, skinTone, eyeColor, hairColor, priceUsd) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Note: sentimentScore is mocked here as 0.75 for example, or passed if available.
            body: JSON.stringify({
                brandName,
                subCategory,
                skinType,
                skinTone,
                eyeColor,
                hairColor,
                priceUsd,
                sentimentScore: 0.75 
            })
        });

        // Handle ML Server offline / unavailable
        if (response.status === 503) {
            throw new Error("Recommendation service is currently unavailable.");
        }

        if (!response.ok) {
            throw new Error("Failed to configure recommendation request.");
        }

        return await response.json();
    } catch (error) {
        console.error("Error in getProductRecommendation:", error);
        throw error;
    }
};

/**
 * Fetch list of skin types
 */
export const getSkinTypes = async () => {
    try {
        const response = await fetch(`${API_URL}/skin-types`);
        if (!response.ok) throw new Error("Failed to fetch skin types.");
        const data = await response.json();
        return data.skinTypes || []; 
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
        const response = await fetch(`${API_URL}/skin-tones`);
        if (!response.ok) throw new Error("Failed to fetch skin tones.");
        const data = await response.json();
        return data.skinTones || []; 
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
