package com.SmartCommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionRequest {
    private String brand;
    private String subCategory;
    private String date;
    private Double unitPrice;
    private Double lagRevenue1;
    private Double rollingRev7;
    private Integer isDiscounted;
}
