package com.SmartCommerce.controller;

import com.SmartCommerce.dto.*;
import com.SmartCommerce.service.PromotionService;
import com.SmartCommerce.service.PromotionUsageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowedHeaders = "*")
public class PromotionController {

    private final PromotionService promotionService;
    private final PromotionUsageService promotionUsageService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionDTO> createPromotion(@Valid @RequestBody CreatePromotionRequest request) {
        PromotionDTO created = promotionService.createPromotion(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PromotionDTO>> getAllPromotions() {
        List<PromotionDTO> promotions = promotionService.getAllPromotions();
        return ResponseEntity.ok(promotions);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionDTO> getPromotionById(@PathVariable Long id) {
        PromotionDTO promotion = promotionService.getPromotionById(id);
        return ResponseEntity.ok(promotion);
    }

    @GetMapping("/code/{code}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionDTO> getPromotionByCode(@PathVariable String code) {
        PromotionDTO promotion = promotionService.getPromotionByCode(code);
        return ResponseEntity.ok(promotion);
    }

    @GetMapping("/public")
    public ResponseEntity<List<PromotionDTO>> getPublicPromotions() {
        List<PromotionDTO> promotions = promotionService.getPublicPromotions();
        return ResponseEntity.ok(promotions);
    }

    @GetMapping("/active")
    public ResponseEntity<List<PromotionDTO>> getActivePromotions() {
        List<PromotionDTO> promotions = promotionService.getActivePromotions();
        return ResponseEntity.ok(promotions);
    }

    @GetMapping("/expired")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PromotionDTO>> getExpiredPromotions() {
        List<PromotionDTO> promotions = promotionService.getExpiredPromotions();
        return ResponseEntity.ok(promotions);
    }

    @GetMapping("/scheduled")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PromotionDTO>> getScheduledPromotions() {
        List<PromotionDTO> promotions = promotionService.getScheduledPromotions();
        return ResponseEntity.ok(promotions);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionDTO> updatePromotion(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePromotionRequest request) {
        PromotionDTO updated = promotionService.updatePromotion(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePromotion(@PathVariable Long id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionDTO> activatePromotion(@PathVariable Long id) {
        PromotionDTO activated = promotionService.activatePromotion(id);
        return ResponseEntity.ok(activated);
    }

    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionDTO> deactivatePromotion(@PathVariable Long id) {
        PromotionDTO deactivated = promotionService.deactivatePromotion(id);
        return ResponseEntity.ok(deactivated);
    }

    @PostMapping("/{id}/public")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionDTO> makePublic(@PathVariable Long id) {
        PromotionDTO promoted = promotionService.makePublic(id);
        return ResponseEntity.ok(promoted);
    }

    @PostMapping("/{id}/private")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionDTO> makePrivate(@PathVariable Long id) {
        PromotionDTO privated = promotionService.makePrivate(id);
        return ResponseEntity.ok(privated);
    }

    @PostMapping("/validate")
    public ResponseEntity<ValidatePromotionResponse> validatePromotion(
            @RequestParam String code,
            @RequestParam BigDecimal orderAmount) {
        ValidatePromotionResponse response = promotionService.validatePromotion(code, orderAmount);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/calculate")
    public ResponseEntity<BigDecimal> calculateDiscount(
            @RequestParam String code,
            @RequestParam BigDecimal orderAmount) {
        BigDecimal discount = promotionService.calculateDiscount(code, orderAmount);
        return ResponseEntity.ok(discount);
    }

    @PostMapping("/record-usage")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER')")
    public ResponseEntity<PromotionUsageDTO> recordUsage(
            @Valid @RequestBody RecordPromotionUsageRequest request) {
        PromotionUsageDTO recorded = promotionUsageService.recordUsage(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(recorded);
    }

    @GetMapping("/usage/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PromotionUsageDTO>> getUsagesByUserId(@PathVariable Long userId) {
        List<PromotionUsageDTO> usages = promotionUsageService.getUsagesByUserId(userId);
        return ResponseEntity.ok(usages);
    }

    @GetMapping("/usage/promotion/{promotionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PromotionUsageDTO>> getUsagesByPromotionId(@PathVariable Long promotionId) {
        List<PromotionUsageDTO> usages = promotionUsageService.getUsagesByPromotionId(promotionId);
        return ResponseEntity.ok(usages);
    }

    @GetMapping("/usage/order/{orderId}")
    public ResponseEntity<List<PromotionUsageDTO>> getUsagesByOrderId(@PathVariable Long orderId) {
        List<PromotionUsageDTO> usages = promotionUsageService.getUsagesByOrderId(orderId);
        return ResponseEntity.ok(usages);
    }

    @GetMapping("/usage/user/{userId}/count")
    public ResponseEntity<Long> countUsagesByUserId(@PathVariable Long userId) {
        long count = promotionUsageService.countUsagesByUserId(userId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/usage/promotion/{promotionId}/count")
    public ResponseEntity<Long> countUsagesByPromotionId(@PathVariable Long promotionId) {
        long count = promotionUsageService.countUsagesByPromotionId(promotionId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/usage/promotion/{promotionId}/total-discount")
    public ResponseEntity<BigDecimal> getTotalDiscountByPromotionId(@PathVariable Long promotionId) {
        BigDecimal total = promotionUsageService.getTotalDiscountByPromotionId(promotionId);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/check-user-usage")
    public ResponseEntity<Boolean> checkUserUsedPromotion(
            @RequestParam Long userId,
            @RequestParam String code) {
        boolean hasUsed = promotionUsageService.hasUserUsedPromotion(userId, code);
        return ResponseEntity.ok(hasUsed);
    }
}
