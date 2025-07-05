package com.example.karting_rm.repositories;

import com.example.karting_rm.entities.KartEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface KartRepository extends JpaRepository<KartEntity, Long> {
    List<KartEntity> findByEstado(KartEntity.Estado estado);
    KartEntity findByCodificacion(String codificacion);
}
