package com.SmartCommerce.service.impl;

import com.SmartCommerce.dto.PromotionUsageDTO;
import com.SmartCommerce.dto.RecordPromotionUsageRequest;
import com.SmartCommerce.entity.Promotion;
import com.SmartCommerce.entity.PromotionUsage;
import com.SmartCommerce.entity.User;
import com.SmartCommerce.exception.BadRequestException;
import com.SmartCommerce.exception.ResourceNotFoundException;
import com.SmartCommerce.repository.PromotionRepository;
import com.SmartCommerce.repository.PromotionUsageRepository;
import com.SmartCommerce.repository.UserRepository;
import com.SmartCommerce.service.PromotionService;
import com.SmartCommerce.service.PromotionUsageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PromotionUsageServiceImpl implements PromotionUsageService {

    private final PromotionUsageRepository promotionUsageRepository;
    private final PromotionRepository promotionRepository;
    private final UserRepository userRepository;
    private final PromotionService promotionService;

    @Override
    public PromotionUsageDTO recordUsage(RecordPromotionUsageRequest request) {
        String normalizedCode = request.code().toUpperCase().trim();

        Promotion promotion = promotionRepository.findByCode(normalizedCode)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with code: " + normalizedCode));

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.userId()));

        BigDecimal discountAmount = promotionService.calculateDiscount(normalizedCode, request.orderAmount());

        promotion.incrementUsage();
        promotionRepository.save(promotion);

        PromotionUsage usage = PromotionUsage.builder()
                .promotion(promotion)
                .user(user)
                .orderId(request.orderId())
                .discountAmount(discountAmount)
                .build();

        PromotionUsage saved = promotionUsageRepository.save(usage);
        return PromotionUsageDTO.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionUsageDTO> getUsagesByUserId(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        return promotionUsageRepository.findByUserId(userId).stream()
                .map(PromotionUsageDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionUsageDTO> getUsagesByPromotionId(Long promotionId) {
        if (!promotionRepository.existsById(promotionId)) {
            throw new ResourceNotFoundException("Promotion not found with id: " + promotionId);
        }
        return promotionUsageRepository.findByPromotionId(promotionId).stream()
                .map(PromotionUsageDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionUsageDTO> getUsagesByOrderId(Long orderId) {
        return promotionUsageRepository.findByOrderId(orderId).stream()
                .map(PromotionUsageDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long countUsagesByPromotionId(Long promotionId) {
        return promotionUsageRepository.countByPromotionId(promotionId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countUsagesByUserId(Long userId) {
        return promotionUsageRepository.countByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalDiscountByPromotionId(Long promotionId) {
        BigDecimal total = promotionUsageRepository.sumDiscountAmountByPromotionId(promotionId);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasUserUsedPromotion(Long userId, String code) {
        String normalizedCode = code.toUpperCase().trim();
        Promotion promotion = promotionRepository.findByCode(normalizedCode).orElse(null);
        if (promotion == null) {
            return false;
        }
        return promotionUsageRepository.existsByPromotionIdAndUserId(promotion.getId(), userId);
    }
}
