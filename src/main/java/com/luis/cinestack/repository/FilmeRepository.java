package com.luis.cinestack.repository;

import com.luis.cinestack.model.Filme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FilmeRepository extends JpaRepository<Filme, Long> {
    // Aqui o Spring já nos dá métodos como save(), findAll(), deleteById()...

    // O Spring Data JPA cria a query sozinho pelo nome do método!
    List<Filme> findByTituloContainingIgnoreCase(String titulo);
}