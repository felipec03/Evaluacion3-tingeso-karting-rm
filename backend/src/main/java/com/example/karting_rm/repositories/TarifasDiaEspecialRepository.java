package com.example.karting_rm.repositories;

import com.example.karting_rm.entities.TarifasDiaEspecialEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface TarifasDiaEspecialRepository extends JpaRepository<TarifasDiaEspecialEntity, Long> {
    TarifasDiaEspecialEntity findByFecha(LocalDate fecha);
}
