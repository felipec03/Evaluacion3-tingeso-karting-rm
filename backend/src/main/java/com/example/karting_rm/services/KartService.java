package com.example.karting_rm.services;

import com.example.karting_rm.entities.KartEntity;
import com.example.karting_rm.repositories.KartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class KartService {
    @Autowired
    private KartRepository kartRepository;

    public ArrayList<KartEntity> getKarts() {
        return (ArrayList<KartEntity>) kartRepository.findAll();
    }

    public KartEntity getKartById(Long id) {
        return kartRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kart no encontrado con id: " + id));
    }

    public KartEntity saveKart(KartEntity kart) {
        return kartRepository.save(kart);
    }

    public KartEntity updateKart(KartEntity kart) {
        if (!kartRepository.existsById(kart.getId())) {
            throw new RuntimeException("Kart no encontrado");
        }
        return kartRepository.save(kart);
    }

    public void deleteKart(Long id) {
        if (!kartRepository.existsById(id)) {
            throw new RuntimeException("Kart no encontrado");
        }
        kartRepository.deleteById(id);
    }

    public List<KartEntity> getKartsByEstado(KartEntity.Estado estado) {
        return kartRepository.findByEstado(estado);
    }

    public KartEntity cambiarEstadoKart(Long id, KartEntity.Estado nuevoEstado) {
        KartEntity kart = getKartById(id);
        kart.setEstado(nuevoEstado);
        return kartRepository.save(kart);
    }
}
