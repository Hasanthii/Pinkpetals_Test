package com.SmartCommerce.service.impl;

import com.SmartCommerce.dto.CreateProductRequest;
import com.SmartCommerce.dto.ProductDTO;
import com.SmartCommerce.dto.UpdateProductRequest;
import com.SmartCommerce.entity.Product;
import com.SmartCommerce.entity.Supplier;
import com.SmartCommerce.exception.ResourceNotFoundException;
import com.SmartCommerce.repository.OrderItemRepository;
import com.SmartCommerce.repository.ProductRepository;
import com.SmartCommerce.repository.ReviewRepository;
import com.SmartCommerce.repository.SupplierRepository;
import com.SmartCommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final ReviewRepository reviewRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    public ProductDTO createProduct(CreateProductRequest request) {
        log.info("Creating new product with name: {}", request.name());

        Product product = Product.builder()
                .name(request.name())
                .brand(request.brand() != null ? request.brand() : "Pink Petals")
                .description(request.description())
                .price(request.price())
                .category(request.category())
                .stockQuantity(request.stockQuantity() != null ? request.stockQuantity() : 0)
                .imageUrl(request.imageUrl())
                .benefits(request.benefits())
                .build();

        if (request.supplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.supplierId())
                    .orElse(null);
            product.setSupplier(supplier);
        }

        Product savedProduct = productRepository.save(product);
        log.info("Product created successfully with id: {}", savedProduct.getId());

        return toDTO(savedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getAllProducts() {
        log.info("Fetching all products");
        List<Product> products = productRepository.findAll();
        log.info("Found {} products", products.size());
        return products.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        log.info("Fetching product with id: {}", id);
        Product product = findProductById(id);
        return toDTO(product);
    }

    @Override
    public ProductDTO updateProduct(Long id, UpdateProductRequest request) {
        log.info("Updating product with id: {}", id);

        Product product = findProductById(id);

        if (request.name() != null && !request.name().isBlank()) {
            product.setName(request.name());
        }
        if (request.brand() != null) {
            product.setBrand(request.brand());
        }
        if (request.description() != null) {
            product.setDescription(request.description());
        }
        if (request.price() != null) {
            product.setPrice(request.price());
        }
        if (request.category() != null && !request.category().isBlank()) {
            product.setCategory(request.category());
        }
        if (request.stockQuantity() != null) {
            product.setStockQuantity(request.stockQuantity());
        }
        if (request.imageUrl() != null) {
            product.setImageUrl(request.imageUrl());
        }
        if (request.supplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.supplierId())
                    .orElse(null);
            product.setSupplier(supplier);
        }
        if (request.benefits() != null) {
            product.setBenefits(request.benefits());
        }

        Product updatedProduct = productRepository.save(product);
        log.info("Product updated successfully with id: {}", updatedProduct.getId());

        return toDTO(updatedProduct);
    }

    @Override
    public void deleteProduct(Long id) {
        log.info("Deleting product with id: {}", id);

        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }

        reviewRepository.deleteByProductId(id);
        orderItemRepository.deleteByProductId(id);

        productRepository.deleteById(id);
        log.info("Product deleted successfully with id: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> searchProducts(String query) {
        log.info("Searching products with query: {}", query);

        if (query == null || query.trim().isBlank()) {
            return getAllProducts();
        }

        List<Product> products = productRepository.searchByKeyword(query.trim());
        log.info("Search returned {} products", products.size());

        return products.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByCategory(String category) {
        log.info("Fetching products by category: {}", category);

        if (category == null || category.trim().isBlank()) {
            return getAllProducts();
        }

        List<Product> products = productRepository.findByCategoryIgnoreCase(category.trim());
        log.info("Found {} products in category: {}", products.size(), category);

        return products.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getLowStockProducts(Integer threshold) {
        log.info("Fetching products with stock below threshold: {}", threshold);

        if (threshold == null || threshold < 0) {
            threshold = 10;
        }

        List<Product> products = productRepository.findByStockQuantityLessThan(threshold);
        log.info("Found {} low stock products", products.size());

        return products.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProductDTO updateStockQuantity(Long id, Integer newQuantity) {
        log.info("Updating stock quantity for product id: {} to: {}", id, newQuantity);

        Product product = findProductById(id);

        if (newQuantity == null || newQuantity < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be negative");
        }

        product.setStockQuantity(newQuantity);
        Product updatedProduct = productRepository.save(product);
        log.info("Stock quantity updated successfully for product id: {}", id);

        return toDTO(updatedProduct);
    }

    private Product findProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    private ProductDTO toDTO(Product product) {
        String supplierName = product.getSupplier() != null ? product.getSupplier().getCompanyName() : null;
        String supplierContact = product.getSupplier() != null ? product.getSupplier().getPhone() : null;
        
        return new ProductDTO(
                product.getId(),
                product.getName(),
                product.getBrand(),
                product.getDescription(),
                product.getPrice(),
                product.getCategory(),
                product.getStockQuantity(),
                product.getImageUrl(),
                product.getCreatedAt(),
                product.getUpdatedAt(),
                supplierName,
                supplierContact,
                product.getBenefits()
        );
    }
}
