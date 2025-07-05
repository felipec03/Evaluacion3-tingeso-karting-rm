package com.example.karting_rm.repositories;

import com.example.karting_rm.entities.DescuentosPersonaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DescuentosPersonaRepository extends JpaRepository<DescuentosPersonaEntity, Long> {
}
