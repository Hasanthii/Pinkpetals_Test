package com.SmartCommerce.repository;

import com.SmartCommerce.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    Optional<Supplier> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    List<Supplier> findByIsActiveTrueOrderByCompanyNameAsc();

    List<Supplier> findByCategoryIgnoreCase(String category);

    List<Supplier> findByIsActiveTrueAndCategoryIgnoreCase(String category);

    @Query("SELECT DISTINCT s.category FROM Supplier s WHERE s.category IS NOT NULL ORDER BY s.category ASC")
    List<String> findAllCategories();

    @Query("SELECT s FROM Supplier s WHERE s.isActive = true AND " +
           "(LOWER(s.companyName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.contactPerson) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Supplier> searchSuppliers(@Param("keyword") String keyword);

    long countByIsActiveTrue();
}
