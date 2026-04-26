package com.SmartCommerce.service;

import com.SmartCommerce.dto.CreateProductRequest;
import com.SmartCommerce.dto.ProductDTO;
import com.SmartCommerce.dto.UpdateProductRequest;

import java.util.List;

public interface ProductService {

    ProductDTO createProduct(CreateProductRequest request);

    List<ProductDTO> getAllProducts();

    ProductDTO getProductById(Long id);

    ProductDTO updateProduct(Long id, UpdateProductRequest request);

    void deleteProduct(Long id);

    List<ProductDTO> searchProducts(String query);

    List<ProductDTO> getProductsByCategory(String category);

    List<ProductDTO> getLowStockProducts(Integer threshold);

    ProductDTO updateStockQuantity(Long id, Integer newQuantity);
}
