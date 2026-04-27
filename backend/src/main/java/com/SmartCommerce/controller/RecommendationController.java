package com.SmartCommerce.controller;

import com.SmartCommerce.dto.RecommendationRequest;
import com.SmartCommerce.dto.RecommendationResponse;
import com.SmartCommerce.exception.MlServiceUnavailableException;
import com.SmartCommerce.service.ProductRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recommend")
@CrossOrigin(origins = "http://localhost:5173")
public class RecommendationController {

    private final ProductRecommendationService recommendationService;

    @Autowired
    public RecommendationController(ProductRecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping
    public ResponseEntity<?> getRecommendation(@RequestBody RecommendationRequest request) {
        try {
            RecommendationResponse response = recommendationService.getRecommendation(request);
            return ResponseEntity.ok(response);
        } catch (MlServiceUnavailableException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred");
        }
    }

    @GetMapping("/skin-types")
    public ResponseEntity<?> getSkinTypes() {
        try {
            return ResponseEntity.ok(recommendationService.getSkinTypes());
        } catch (MlServiceUnavailableException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(e.getMessage());
        }
    }

    @GetMapping("/skin-tones")
    public ResponseEntity<?> getSkinTones() {
        try {
            return ResponseEntity.ok(recommendationService.getSkinTones());
        } catch (MlServiceUnavailableException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(e.getMessage());
        }
    }
}
