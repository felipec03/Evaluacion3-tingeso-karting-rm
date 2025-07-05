package com.example.karting_rm.services;

import com.example.karting_rm.entities.UsuarioEntity;
import com.example.karting_rm.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class UsuarioService {
    @Autowired
    UsuarioRepository usuarioRepository;

    public ArrayList<UsuarioEntity> getUsuarios() {
        return (ArrayList<UsuarioEntity>) usuarioRepository.findAll();
    }

    public UsuarioEntity getByEmail(String email){
        return usuarioRepository.findByEmail(email);
    }
}
