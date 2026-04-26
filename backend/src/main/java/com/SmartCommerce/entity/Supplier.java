package com.SmartCommerce.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "suppliers", indexes = {
    @Index(name = "idx_supplier_email", columnList = "email"),
    @Index(name = "idx_supplier_company", columnList = "company_name"),
    @Index(name = "idx_supplier_category", columnList = "category"),
    @Index(name = "idx_supplier_active", columnList = "is_active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Company name is required")
    @Size(max = 255, message = "Company name must not exceed 255 characters")
    @Column(name = "company_name", nullable = false, length = 255)
    private String companyName;

    @Size(max = 255, message = "Contact person name must not exceed 255 characters")
    @Column(name = "contact_person", length = 255)
    private String contactPerson;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Size(max = 50, message = "Phone must not exceed 50 characters")
    @Column(length = 50)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Size(max = 100, message = "City must not exceed 100 characters")
    @Column(length = 100)
    private String city;

    @Size(max = 100, message = "Country must not exceed 100 characters")
    @Column(length = 100)
    @Builder.Default
    private String country = "Sri Lanka";

    @Size(max = 100, message = "Category must not exceed 100 characters")
    @Column(length = 100)
    private String category;

    @Size(max = 100, message = "Tax ID must not exceed 100 characters")
    @Column(name = "tax_id", length = 100)
    private String taxId;

    @Column(name = "bank_details", columnDefinition = "TEXT")
    private String bankDetails;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @DecimalMin(value = "0.0", message = "Rating must be zero or greater")
    @DecimalMax(value = "5.0", message = "Rating must not exceed 5.0")
    @Column(precision = 2, scale = 1)
    @Builder.Default
    private BigDecimal rating = BigDecimal.ZERO;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "supplier", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProcurementOrder> procurementOrders = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public boolean isVerified() {
        return this.isActive != null && this.isActive;
    }
}
