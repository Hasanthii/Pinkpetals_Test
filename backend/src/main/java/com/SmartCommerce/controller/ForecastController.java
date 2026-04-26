package com.SmartCommerce.controller;

import com.SmartCommerce.dto.PredictionRequest;
import com.SmartCommerce.dto.PredictionResponse;
import com.SmartCommerce.service.MlPredictionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class ForecastController {

    private final MlPredictionService mlPredictionService;

    @Autowired
    public ForecastController(MlPredictionService mlPredictionService) {
        this.mlPredictionService = mlPredictionService;
    }

    @PostMapping("/predict")
    public ResponseEntity<PredictionResponse> predictRevenue(@RequestBody PredictionRequest request) {
        PredictionResponse prediction = mlPredictionService.predictSales(request);
        return ResponseEntity.ok(prediction);
    }

    @GetMapping("/ml/brands")
    public ResponseEntity<List<String>> getBrands() {
        List<String> brands = mlPredictionService.getBrands();
        return ResponseEntity.ok(brands);
    }

    @GetMapping("/ml/categories")
    public ResponseEntity<List<String>> getCategories() {
        List<String> categories = mlPredictionService.getCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/ml/health")
    public ResponseEntity<Map<String, String>> checkHealth() {
        boolean isUp = mlPredictionService.checkHealth();
        if (isUp) {
            return ResponseEntity.ok(Map.of("status", "UP"));
        } else {
            return ResponseEntity.status(503).body(Map.of("status", "DOWN"));
        }
    }
}
