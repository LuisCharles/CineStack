package com.luis.cinestack.controller;

import com.luis.cinestack.model.Filme;
import com.luis.cinestack.repository.FilmeRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/filmes") // Define que essa API começa com /filmes
public class FilmeController {

    @Autowired
    private FilmeRepository repository;

    // Rota para listar todos os filmes
    @GetMapping
    public List<Filme> listar() {
        return repository.findAll();
    }

    // Rota para cadastrar um novo filme
    @PostMapping
    public Filme cadastrar(@RequestBody @Valid Filme filme) {
        return repository.save(filme);
    }

    // Rota para deletar um filme pelo ID
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}