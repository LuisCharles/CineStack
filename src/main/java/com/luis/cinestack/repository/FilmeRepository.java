package com.luis.cinestack.repository;

import com.luis.cinestack.model.Filme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FilmeRepository extends JpaRepository<Filme, Long> {
    // Aqui o Spring já nos dá métodos como save(), findAll(), deleteById()...
}