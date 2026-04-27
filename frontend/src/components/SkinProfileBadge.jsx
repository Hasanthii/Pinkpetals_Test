import React, { useState, useEffect } from 'react';
import { useSkinProfile } from '../context/SkinProfileContext';
import { getProductRecommendation } from '../services/recommendationService';

const SkinProfileBadge = ({ brandName, subCategory, priceUsd, precomputedStatus }) => {
    const { skinProfile } = useSkinProfile();
    const [status, setStatus] = useState(precomputedStatus || 'loading'); // loading, recommended, not-recommended, unconfigured
    
    // Check if user is theoretically logged in (this would ideally check actual auth context too)
    // Here we'll just determine based on the existence of skinProfile
    
    useEffect(() => {
        if (precomputedStatus) {
            setStatus(precomputedStatus);
            return;
        }

        if (!skinProfile) {
            setStatus('unconfigured');
            return;
        }

        let isMounted = true;

        const fetchRecommendation = async () => {
            try {
                const response = await getProductRecommendation(
                    brandName,
                    subCategory,
                    skinProfile.skinType,
                    skinProfile.skinTone,
                    skinProfile.eyeColor,
                    skinProfile.hairColor,
                    priceUsd
                );
                
                if (isMounted) {
                    if (response.isRecommended) {
                        setStatus('recommended');
                    } else {
                        setStatus('not-recommended');
                    }
                }
            } catch (error) {
                if (isMounted) {
                    // Hide badge if the ML service is offline
                    setStatus('hidden');
                }
            }
        };

        setStatus('loading');
        fetchRecommendation();

        return () => {
            isMounted = false;
        };
    }, [skinProfile, brandName, subCategory, priceUsd, precomputedStatus]);

    if (status === 'hidden' || status === 'loading') {
        return null; // Do not show anything if loading or failed to reach API
    }

    if (status === 'unconfigured') {
        return (
            <a href="/profile/skin" className="inline-block text-xs font-medium text-rose-500 hover:text-rose-700 underline underline-offset-2 transition-colors">
                Set your skin profile
            </a>
        );
    }

    if (status === 'recommended') {
        return (
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-md border border-green-200 shadow-sm">
                <span className="text-sm">✅</span> Suits your skin
            </span>
        );
    }

    if (status === 'not-recommended') {
        return (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-1 rounded-md border border-amber-200 shadow-sm">
                <span className="text-sm">⚠️</span> May not suit you
            </span>
        );
    }

    return null;
};

export default SkinProfileBadge;
