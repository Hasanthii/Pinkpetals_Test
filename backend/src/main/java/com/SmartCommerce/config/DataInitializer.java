package com.SmartCommerce.config;

import com.SmartCommerce.entity.Product;
import com.SmartCommerce.entity.User;
import com.SmartCommerce.repository.ProductRepository;
import com.SmartCommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@pinkpetals.com")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@pinkpetals.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("Admin")
                    .lastName("User")
                    .phone("0771234567")
                    .address("PinkPetals HQ")
                    .role(User.Role.ADMIN)
                    .isActive(true)
                    .build();
            
            userRepository.save(admin);
            log.info("Default admin user created: username=admin, email=admin@pinkpetals.com, password=admin123");
        }

        if (productRepository.count() == 0) {
            createSampleProducts();
        }
    }

    private void createSampleProducts() {
        Product[] products = {
            Product.builder()
                .name("Snail Mucin Power Essence")
                .brand("Cosrx")
                .description("A powerful serum that revitalizes your skin, giving it a natural glow. Enriched with 96% snail mucin.")
                .price(new BigDecimal("25.00"))
                .category("Serum")
                .stockQuantity(20)
                .benefits("Brightening, Anti-aging, Hydrating")
                .build(),
            Product.builder()
                .name("Water Sleeping Mask")
                .brand("Laneige")
                .description("Deeply hydrating sleep mask that locks in moisture for 24 hours. Perfect for all skin types.")
                .price(new BigDecimal("32.00"))
                .category("Face Mask")
                .stockQuantity(15)
                .benefits("Hydrating, Soothing, Nourishing")
                .build(),
            Product.builder()
                .name("Hyaluronic Acid 2% + B5")
                .brand("The Ordinary")
                .description("Luxurious hydrating treatment that provides intense moisture and nourishment.")
                .price(new BigDecimal("9.00"))
                .category("Serum")
                .stockQuantity(30)
                .benefits("Moisturizing, Plumping, Smoothing")
                .build(),
            Product.builder()
                .name("Daily Gentle Cleanser")
                .brand("Cetaphil")
                .description("Gentle yet effective cleansing gel that removes impurities without drying the skin.")
                .price(new BigDecimal("14.00"))
                .category("Cleanser")
                .stockQuantity(25)
                .benefits("Deep cleansing, Refreshing, pH balanced")
                .build(),
            Product.builder()
                .name("Dynasty Cream")
                .brand("Beauty of Joseon")
                .description("Rich moisturizer with a natural finish. Buildable hydration that lasts all day.")
                .price(new BigDecimal("24.00"))
                .category("Moisturizer")
                .stockQuantity(10)
                .benefits("Nourishing, Firming, Glowing")
                .build(),
            Product.builder()
                .name("Hydrating Facial Cleanser")
                .brand("Cerave")
                .description("Smooths skin texture and creates a perfect hydrating cleanse without compromising the skin barrier.")
                .price(new BigDecimal("16.00"))
                .category("Cleanser")
                .stockQuantity(18)
                .benefits("Smoothing, Barrier restoring, Non-foaming")
                .build(),
            Product.builder()
                .name("Regenerist Micro-Sculpting Cream")
                .brand("Olay")
                .description("Rich anti-aging cream infused with niacinamide to plump and soften skin.")
                .price(new BigDecimal("28.00"))
                .category("Moisturizer")
                .stockQuantity(35)
                .benefits("Moisturizing, Softening, Anti-aging")
                .build(),
            Product.builder()
                .name("AHA 7 Whitehead Power Liquid")
                .brand("Cosrx")
                .description("Gentle chemical exfoliator that adds clarity and reduces breakouts.")
                .price(new BigDecimal("19.00"))
                .category("Exfoliator")
                .stockQuantity(22)
                .benefits("Clear skin, Exfoliating, Smoothing")
                .build()
        };

        for (Product product : products) {
            productRepository.save(product);
        }
        log.info("Sample products created: " + products.length + " products");
    }
}
