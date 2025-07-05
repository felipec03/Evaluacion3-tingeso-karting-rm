package com.example.karting_rm.repositories;

import com.example.karting_rm.entities.UsuarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UsuarioRepository extends JpaRepository<UsuarioEntity, Long> {
    UsuarioEntity findByEmail(String email);
}
