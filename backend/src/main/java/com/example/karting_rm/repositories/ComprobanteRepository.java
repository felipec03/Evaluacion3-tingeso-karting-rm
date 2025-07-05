package com.example.karting_rm.repositories;

import com.example.karting_rm.entities.ComprobanteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComprobanteRepository extends JpaRepository<ComprobanteEntity, Long> {
    List<ComprobanteEntity> findByEmail(String email);
    Optional<ComprobanteEntity> findByReservaId(Long reservaId);
}
