package com.SmartCommerce.service;

import com.SmartCommerce.dto.*;
import com.SmartCommerce.entity.Promotion;

import java.math.BigDecimal;
import java.util.List;

public interface PromotionService {

    PromotionDTO createPromotion(CreatePromotionRequest request);

    List<PromotionDTO> getAllPromotions();

    PromotionDTO getPromotionById(Long id);

    PromotionDTO getPromotionByCode(String code);

    List<PromotionDTO> getPublicPromotions();

    List<PromotionDTO> getActivePromotions();

    PromotionDTO updatePromotion(Long id, UpdatePromotionRequest request);

    void deletePromotion(Long id);

    PromotionDTO activatePromotion(Long id);

    PromotionDTO deactivatePromotion(Long id);

    ValidatePromotionResponse validatePromotion(String code, BigDecimal orderAmount);

    BigDecimal calculateDiscount(String code, BigDecimal orderAmount);

    List<PromotionDTO> getExpiredPromotions();

    List<PromotionDTO> getScheduledPromotions();

    PromotionDTO makePublic(Long id);

    PromotionDTO makePrivate(Long id);

    PromotionDTO updateMaxUses(Long id, Integer maxUses);

    boolean isPromotionValid(String code);
}
