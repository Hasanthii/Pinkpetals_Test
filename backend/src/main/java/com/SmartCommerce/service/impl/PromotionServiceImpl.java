package com.SmartCommerce.service.impl;

import com.SmartCommerce.dto.*;
import com.SmartCommerce.entity.Promotion;
import com.SmartCommerce.entity.PromotionUsage;
import com.SmartCommerce.entity.User;
import com.SmartCommerce.exception.BadRequestException;
import com.SmartCommerce.exception.ResourceNotFoundException;
import com.SmartCommerce.repository.PromotionRepository;
import com.SmartCommerce.repository.PromotionUsageRepository;
import com.SmartCommerce.repository.UserRepository;
import com.SmartCommerce.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final PromotionUsageRepository promotionUsageRepository;
    private final UserRepository userRepository;

    @Override
    public PromotionDTO createPromotion(CreatePromotionRequest request) {
        if (request.code() == null || request.code().trim().isEmpty()) {
            throw new BadRequestException("Promotion code cannot be empty");
        }

        String normalizedCode = request.code().toUpperCase().trim();

        if (promotionRepository.existsByCode(normalizedCode)) {
            throw new BadRequestException("Promotion code already exists: " + normalizedCode);
        }

        if (request.startDate().isAfter(request.expiryDate())) {
            throw new BadRequestException("Start date must be before expiry date");
        }

        if (request.discountType().equalsIgnoreCase("PERCENTAGE")) {
            if (request.discountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new BadRequestException("Percentage discount cannot exceed 100%");
            }
        }

        Promotion promotion = request.toEntity();
        promotion.setCode(normalizedCode);

        Promotion saved = promotionRepository.save(promotion);
        return PromotionDTO.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionDTO> getAllPromotions() {
        return promotionRepository.findAll().stream()
                .map(PromotionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionDTO getPromotionById(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + id));
        return PromotionDTO.fromEntity(promotion);
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionDTO getPromotionByCode(String code) {
        String normalizedCode = code.toUpperCase().trim();
        Promotion promotion = promotionRepository.findByCode(normalizedCode)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with code: " + normalizedCode));
        return PromotionDTO.fromEntity(promotion);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionDTO> getPublicPromotions() {
        LocalDateTime now = LocalDateTime.now();
        return promotionRepository.findAllActiveAndPublicPromotions(now).stream()
                .map(PromotionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionDTO> getActivePromotions() {
        LocalDateTime now = LocalDateTime.now();
        return promotionRepository.findAllActivePromotions(now).stream()
                .map(PromotionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public PromotionDTO updatePromotion(Long id, UpdatePromotionRequest request) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + id));

        if (request.code() != null && !request.code().trim().isEmpty()) {
            String normalizedCode = request.code().toUpperCase().trim();
            if (promotionRepository.existsByCodeAndIdNot(normalizedCode, id)) {
                throw new BadRequestException("Promotion code already exists: " + normalizedCode);
            }
            promotion.setCode(normalizedCode);
        }

        if (request.description() != null) {
            promotion.setDescription(request.description());
        }

        if (request.discountType() != null) {
            try {
                Promotion.DiscountType type = Promotion.DiscountType.valueOf(request.discountType().toUpperCase());
                promotion.setDiscountType(type);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid discount type. Must be PERCENTAGE or FIXED_AMOUNT");
            }
        }

        if (request.discountValue() != null) {
            if (request.discountType() != null && request.discountType().equalsIgnoreCase("PERCENTAGE")) {
                if (request.discountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
                    throw new BadRequestException("Percentage discount cannot exceed 100%");
                }
            }
            promotion.setDiscountValue(request.discountValue());
        }

        if (request.minimumOrderAmount() != null) {
            promotion.setMinimumOrderAmount(request.minimumOrderAmount());
        }

        if (request.maxUses() != null) {
            promotion.setMaxUses(request.maxUses());
        }

        if (request.startDate() != null) {
            promotion.setStartDate(request.startDate());
        }

        if (request.expiryDate() != null) {
            promotion.setExpiryDate(request.expiryDate());
        }

        if (request.isActive() != null) {
            promotion.setIsActive(request.isActive());
        }

        if (request.isPublic() != null) {
            promotion.setIsPublic(request.isPublic());
        }

        Promotion updated = promotionRepository.save(promotion);
        return PromotionDTO.fromEntity(updated);
    }

    @Override
    public void deletePromotion(Long id) {
        if (!promotionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Promotion not found with id: " + id);
        }
        promotionRepository.deleteById(id);
    }

    @Override
    public PromotionDTO activatePromotion(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + id));
        promotion.setIsActive(true);
        Promotion updated = promotionRepository.save(promotion);
        return PromotionDTO.fromEntity(updated);
    }

    @Override
    public PromotionDTO deactivatePromotion(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + id));
        promotion.setIsActive(false);
        Promotion updated = promotionRepository.save(promotion);
        return PromotionDTO.fromEntity(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public ValidatePromotionResponse validatePromotion(String code, BigDecimal orderAmount) {
        String normalizedCode = code.toUpperCase().trim();

        Promotion promotion = promotionRepository.findByCode(normalizedCode)
                .orElse(null);

        if (promotion == null) {
            return new ValidatePromotionResponse(
                    false, normalizedCode, null, null, null,
                    "Invalid promotion code"
            );
        }

        if (!promotion.getIsActive()) {
            return new ValidatePromotionResponse(
                    false, normalizedCode,
                    promotion.getDiscountType().name(),
                    promotion.getDiscountValue(),
                    null,
                    "This promotion is currently inactive"
            );
        }

        if (promotion.isExpired()) {
            return new ValidatePromotionResponse(
                    false, normalizedCode,
                    promotion.getDiscountType().name(),
                    promotion.getDiscountValue(),
                    null,
                    "This promotion has expired"
            );
        }

        if (promotion.isNotStarted()) {
            return new ValidatePromotionResponse(
                    false, normalizedCode,
                    promotion.getDiscountType().name(),
                    promotion.getDiscountValue(),
                    null,
                    "This promotion has not started yet"
            );
        }

        if (promotion.hasReachedMaxUses()) {
            return new ValidatePromotionResponse(
                    false, normalizedCode,
                    promotion.getDiscountType().name(),
                    promotion.getDiscountValue(),
                    null,
                    "This promotion has reached its maximum number of uses"
            );
        }

        BigDecimal minimumAmount = promotion.getMinimumOrderAmount();
        if (minimumAmount == null) {
            minimumAmount = BigDecimal.ZERO;
        }

        if (orderAmount.compareTo(minimumAmount) < 0) {
            return new ValidatePromotionResponse(
                    false, normalizedCode,
                    promotion.getDiscountType().name(),
                    promotion.getDiscountValue(),
                    null,
                    "Minimum order amount of " + minimumAmount + " required"
            );
        }

        BigDecimal calculatedDiscount = calculateDiscount(normalizedCode, orderAmount);

        return new ValidatePromotionResponse(
                true, normalizedCode,
                promotion.getDiscountType().name(),
                promotion.getDiscountValue(),
                calculatedDiscount,
                "Promotion is valid"
        );
    }

    @Override
    public BigDecimal calculateDiscount(String code, BigDecimal orderAmount) {
        String normalizedCode = code.toUpperCase().trim();

        Promotion promotion = promotionRepository.findByCode(normalizedCode)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with code: " + normalizedCode));

        BigDecimal discount;

        if (promotion.getDiscountType() == Promotion.DiscountType.PERCENTAGE) {
            discount = orderAmount.multiply(promotion.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discount = promotion.getDiscountValue();
        }

        if (discount.compareTo(orderAmount) > 0) {
            discount = orderAmount;
        }

        return discount;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionDTO> getExpiredPromotions() {
        LocalDateTime now = LocalDateTime.now();
        return promotionRepository.findExpiredPromotions(now).stream()
                .map(PromotionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionDTO> getScheduledPromotions() {
        LocalDateTime now = LocalDateTime.now();
        return promotionRepository.findScheduledPromotions(now).stream()
                .map(PromotionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public PromotionDTO makePublic(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + id));
        promotion.setIsPublic(true);
        Promotion updated = promotionRepository.save(promotion);
        return PromotionDTO.fromEntity(updated);
    }

    @Override
    public PromotionDTO makePrivate(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + id));
        promotion.setIsPublic(false);
        Promotion updated = promotionRepository.save(promotion);
        return PromotionDTO.fromEntity(updated);
    }

    @Override
    public PromotionDTO updateMaxUses(Long id, Integer maxUses) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + id));
        promotion.setMaxUses(maxUses);
        Promotion updated = promotionRepository.save(promotion);
        return PromotionDTO.fromEntity(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isPromotionValid(String code) {
        String normalizedCode = code.toUpperCase().trim();
        ValidatePromotionResponse response = validatePromotion(normalizedCode, BigDecimal.valueOf(Integer.MAX_VALUE));
        return response.isValid();
    }
}
