package com.example.karting_rm.repositories;

import com.example.karting_rm.entities.ReservaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<ReservaEntity, Long> {
    List<ReservaEntity> findByemailarrendatario(String emailArrendatario);
    List<ReservaEntity> findByFecha(LocalDate fecha);
}