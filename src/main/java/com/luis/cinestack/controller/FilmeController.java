package com.luis.cinestack.controller;

import com.luis.cinestack.model.Filme;
import com.luis.cinestack.repository.FilmeRepository;
import com.luis.cinestack.service.FilmeService; // ADICIONADO: Importação do seu Service
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map; // ADICIONADO: Importação para o Map funcionar

@CrossOrigin(origins = "*") 
@RestController 
@RequestMapping("/filmes")
public class FilmeController {

    @Autowired
    private FilmeRepository repository;

    @Autowired
    private FilmeService service; 

    @GetMapping
    public List<Filme> listar() {
        return repository.findAll();
    }

    // O Java agora busca no TMDB e entrega mastigado pro JS
    @GetMapping("/search-tmdb")
    public Map<String, Object> search(@RequestParam String query) {
        return service.buscarNoTMDB(query);
    }

    @GetMapping("/details-tmdb/{id}")
    public Map<String, Object> details(@PathVariable Long id) {
        return service.buscarDetalhesEElenco(id);
    }

    @PostMapping
    public Filme cadastrar(@RequestBody @Valid Filme filme) {
        return repository.save(filme);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}