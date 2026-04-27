package com.SmartCommerce.service;

import com.SmartCommerce.dto.RecommendationRequest;
import com.SmartCommerce.dto.RecommendationResponse;
import com.SmartCommerce.exception.MlServiceUnavailableException;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

@Service
public class ProductRecommendationService {

    private final RestTemplate restTemplate;
    private final String FLASK_SERVER_URL = "http://127.0.0.1:5000";

    public ProductRecommendationService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        this.restTemplate = new RestTemplate(factory);
    }

    public RecommendationResponse getRecommendation(RecommendationRequest request) {
        try {
            return restTemplate.postForObject(FLASK_SERVER_URL + "/recommend", request, RecommendationResponse.class);
        } catch (ResourceAccessException e) {
            throw new MlServiceUnavailableException("Recommendation service is currently unavailable");
        } catch (Exception e) {
            throw new RuntimeException("Error occurred while getting recommendations", e);
        }
    }

    public Object getSkinTypes() {
        try {
            return restTemplate.getForObject(FLASK_SERVER_URL + "/skin-types", Object.class);
        } catch (ResourceAccessException e) {
            throw new MlServiceUnavailableException("Recommendation service is currently unavailable");
        }
    }

    public Object getSkinTones() {
        try {
            return restTemplate.getForObject(FLASK_SERVER_URL + "/skin-tones", Object.class);
        } catch (ResourceAccessException e) {
            throw new MlServiceUnavailableException("Recommendation service is currently unavailable");
        }
    }
}
