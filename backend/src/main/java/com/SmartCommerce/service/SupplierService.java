package com.SmartCommerce.service;

import com.SmartCommerce.dto.CreateSupplierRequest;
import com.SmartCommerce.dto.SupplierDTO;
import com.SmartCommerce.dto.UpdateSupplierRequest;

import java.util.List;

public interface SupplierService {

    SupplierDTO createSupplier(CreateSupplierRequest request);

    SupplierDTO createSupplierByRegistration(CreateSupplierRequest request);

    List<SupplierDTO> getAllSuppliers();

    List<SupplierDTO> getActiveSuppliers();

    SupplierDTO getSupplierById(Long id);

    SupplierDTO getSupplierByEmail(String email);

    List<SupplierDTO> getSuppliersByCategory(String category);

    List<SupplierDTO> searchSuppliers(String keyword);

    SupplierDTO updateSupplier(Long id, UpdateSupplierRequest request);

    void deleteSupplier(Long id);

    SupplierDTO activateSupplier(Long id);

    SupplierDTO deactivateSupplier(Long id);

    List<String> getAllCategories();

    long getActiveSupplierCount();
}
