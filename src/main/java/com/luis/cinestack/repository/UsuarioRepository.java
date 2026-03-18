package com.luis.cinestack.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.luis.cinestack.model.Usuario;
import java.util.Optional; 

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsernameAndSenha(String username, String senha);
}