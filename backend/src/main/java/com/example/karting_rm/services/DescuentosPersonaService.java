package com.example.karting_rm.services;

import com.example.karting_rm.entities.DescuentosPersonaEntity;
import com.example.karting_rm.repositories.DescuentosPersonaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DescuentosPersonaService {

    @Autowired
    private DescuentosPersonaRepository descuentosPersonaRepository;

    public List<DescuentosPersonaEntity> getAllDescuentos() {
        return descuentosPersonaRepository.findAll();
    }
}
