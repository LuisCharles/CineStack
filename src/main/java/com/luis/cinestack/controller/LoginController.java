package com.luis.cinestack.controller;

import com.luis.cinestack.model.Usuario;
import com.luis.cinestack.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", allowedHeaders = "*") 
@RestController
@RequestMapping("/auth")
public class LoginController {

    @Autowired
    private UsuarioRepository repository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario loginData) {
        return repository.findByUsernameAndSenha(loginData.getUsername(), loginData.getSenha())
                .map(user -> ResponseEntity.ok(user))
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody Usuario novoUsuario) {
        try {
            if (novoUsuario.getUsername() == null || novoUsuario.getSenha() == null) {
                return ResponseEntity.badRequest().body("Dados incompletos");
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(novoUsuario));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro: " + e.getMessage());
        }
    }
}