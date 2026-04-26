package com.SmartCommerce.service;

import com.SmartCommerce.dto.PromotionUsageDTO;
import com.SmartCommerce.dto.RecordPromotionUsageRequest;

import java.math.BigDecimal;
import java.util.List;

public interface PromotionUsageService {

    PromotionUsageDTO recordUsage(RecordPromotionUsageRequest request);

    List<PromotionUsageDTO> getUsagesByUserId(Long userId);

    List<PromotionUsageDTO> getUsagesByPromotionId(Long promotionId);

    List<PromotionUsageDTO> getUsagesByOrderId(Long orderId);

    long countUsagesByPromotionId(Long promotionId);

    long countUsagesByUserId(Long userId);

    BigDecimal getTotalDiscountByPromotionId(Long promotionId);

    boolean hasUserUsedPromotion(Long userId, String code);
}
