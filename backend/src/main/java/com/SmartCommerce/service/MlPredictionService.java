package com.SmartCommerce.service;

import com.SmartCommerce.dto.PredictionRequest;
import com.SmartCommerce.dto.PredictionResponse;
import com.SmartCommerce.exception.MlServiceUnavailableException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
public class MlPredictionService {

    private final RestTemplate restTemplate;
    private final String mlServerUrl = "http://127.0.0.1:5000";

    @Autowired
    public MlPredictionService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public PredictionResponse predictSales(PredictionRequest request) {
        try {
            String url = mlServerUrl + "/predict";
            ResponseEntity<PredictionResponse> response = restTemplate.postForEntity(url, request, PredictionResponse.class);
            return response.getBody();
        } catch (RestClientException e) {
            throw new MlServiceUnavailableException("ML server is currently unavailable");
        }
    }

    public List<String> getBrands() {
        try {
            String url = mlServerUrl + "/brands";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            if (response.getBody() != null && response.getBody().containsKey("brands")) {
                return (List<String>) response.getBody().get("brands");
            }
            return List.of();
        } catch (RestClientException e) {
            throw new MlServiceUnavailableException("ML server is currently unavailable");
        }
    }

    public List<String> getCategories() {
        try {
            String url = mlServerUrl + "/categories";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            if (response.getBody() != null && response.getBody().containsKey("categories")) {
                return (List<String>) response.getBody().get("categories");
            }
            return List.of();
        } catch (RestClientException e) {
            throw new MlServiceUnavailableException("ML server is currently unavailable");
        }
    }

    public boolean checkHealth() {
        try {
            String url = mlServerUrl + "/health";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (RestClientException e) {
            return false;
        }
    }
}
