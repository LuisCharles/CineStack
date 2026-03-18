package com.luis.cinestack.repository;

import com.luis.cinestack.model.Filme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FilmeRepository extends JpaRepository<Filme, Long> {
    
    List<Filme> findByUsuarioId(Long usuarioId);
    
    List<Filme> findByUsuarioIdOrderByIdDesc(Long usuarioId);
    
    List<Filme> findByUsuarioIdAndFavoritoTrue(Long usuarioId);
    
    // Busca os filmes que já foram vistos ou os que faltam ver
    List<Filme> findByUsuarioIdAndVistoTrue(Long usuarioId);
    
    List<Filme> findByUsuarioIdAndVistoFalse(Long usuarioId);
}