package com.SmartCommerce.service.impl;

import com.SmartCommerce.dto.CreateSupplierRequest;
import com.SmartCommerce.dto.SupplierDTO;
import com.SmartCommerce.dto.UpdateSupplierRequest;
import com.SmartCommerce.entity.Supplier;
import com.SmartCommerce.exception.BadRequestException;
import com.SmartCommerce.exception.ResourceNotFoundException;
import com.SmartCommerce.repository.SupplierRepository;
import com.SmartCommerce.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;

    @Override
    public SupplierDTO createSupplier(CreateSupplierRequest request) {
        if (supplierRepository.existsByEmail(request.email())) {
            throw new BadRequestException("A supplier with this email already exists: " + request.email());
        }

        Supplier supplier = Supplier.builder()
                .companyName(request.companyName())
                .contactPerson(request.contactPerson())
                .email(request.email())
                .phone(request.phone())
                .address(request.address())
                .city(request.city())
                .country(request.country() != null ? request.country() : "Sri Lanka")
                .category(request.category())
                .taxId(request.taxId())
                .bankDetails(request.bankDetails())
                .notes(request.notes())
                .isActive(true)
                .build();

        Supplier saved = supplierRepository.save(supplier);
        return SupplierDTO.fromEntity(saved);
    }

    @Override
    public SupplierDTO createSupplierByRegistration(CreateSupplierRequest request) {
        if (supplierRepository.existsByEmail(request.email())) {
            throw new BadRequestException("A supplier with this email already exists: " + request.email());
        }

        Supplier supplier = Supplier.builder()
                .companyName(request.companyName())
                .contactPerson(request.contactPerson())
                .email(request.email())
                .phone(request.phone())
                .address(request.address())
                .city(request.city())
                .country(request.country() != null ? request.country() : "Sri Lanka")
                .category(request.category())
                .notes(request.notes())
                .isActive(false)
                .build();

        Supplier saved = supplierRepository.save(supplier);
        return SupplierDTO.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierDTO> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(SupplierDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierDTO> getActiveSuppliers() {
        return supplierRepository.findByIsActiveTrueOrderByCompanyNameAsc().stream()
                .map(SupplierDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierDTO getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        return SupplierDTO.fromEntity(supplier);
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierDTO getSupplierByEmail(String email) {
        Supplier supplier = supplierRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with email: " + email));
        return SupplierDTO.fromEntity(supplier);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierDTO> getSuppliersByCategory(String category) {
        return supplierRepository.findByIsActiveTrueAndCategoryIgnoreCase(category).stream()
                .map(SupplierDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierDTO> searchSuppliers(String keyword) {
        return supplierRepository.searchSuppliers(keyword).stream()
                .map(SupplierDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public SupplierDTO updateSupplier(Long id, UpdateSupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        if (request.email() != null && !request.email().equals(supplier.getEmail())) {
            if (supplierRepository.existsByEmailAndIdNot(request.email(), id)) {
                throw new BadRequestException("A supplier with this email already exists: " + request.email());
            }
            supplier.setEmail(request.email());
        }

        if (request.companyName() != null) {
            supplier.setCompanyName(request.companyName());
        }
        if (request.contactPerson() != null) {
            supplier.setContactPerson(request.contactPerson());
        }
        if (request.phone() != null) {
            supplier.setPhone(request.phone());
        }
        if (request.address() != null) {
            supplier.setAddress(request.address());
        }
        if (request.city() != null) {
            supplier.setCity(request.city());
        }
        if (request.country() != null) {
            supplier.setCountry(request.country());
        }
        if (request.category() != null) {
            supplier.setCategory(request.category());
        }
        if (request.taxId() != null) {
            supplier.setTaxId(request.taxId());
        }
        if (request.bankDetails() != null) {
            supplier.setBankDetails(request.bankDetails());
        }
        if (request.notes() != null) {
            supplier.setNotes(request.notes());
        }
        if (request.rating() != null) {
            supplier.setRating(request.rating());
        }
        if (request.isActive() != null) {
            supplier.setIsActive(request.isActive());
        }

        Supplier updated = supplierRepository.save(supplier);
        return SupplierDTO.fromEntity(updated);
    }

    @Override
    public void deleteSupplier(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new ResourceNotFoundException("Supplier not found with id: " + id);
        }
        supplierRepository.deleteById(id);
    }

    @Override
    public SupplierDTO activateSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        supplier.setIsActive(true);
        Supplier updated = supplierRepository.save(supplier);
        return SupplierDTO.fromEntity(updated);
    }

    @Override
    public SupplierDTO deactivateSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        supplier.setIsActive(false);
        Supplier updated = supplierRepository.save(supplier);
        return SupplierDTO.fromEntity(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        return supplierRepository.findAllCategories();
    }

    @Override
    @Transactional(readOnly = true)
    public long getActiveSupplierCount() {
        return supplierRepository.countByIsActiveTrue();
    }
}
