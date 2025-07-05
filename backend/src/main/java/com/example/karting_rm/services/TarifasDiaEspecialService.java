package com.example.karting_rm.services;

import com.example.karting_rm.entities.TarifasDiaEspecialEntity;
import com.example.karting_rm.repositories.TarifasDiaEspecialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TarifasDiaEspecialService {

    @Autowired
    private TarifasDiaEspecialRepository tarifasDiaEspecialRepository;

    public List<TarifasDiaEspecialEntity> getAllTarifasEspeciales() {
        return tarifasDiaEspecialRepository.findAll();
    }

    public TarifasDiaEspecialEntity getTarifaByFecha(LocalDate fecha) {
        return tarifasDiaEspecialRepository.findByFecha(fecha);
    }
}
