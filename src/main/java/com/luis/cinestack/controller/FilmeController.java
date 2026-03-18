package com.luis.cinestack.controller;

import com.luis.cinestack.model.Filme;
import com.luis.cinestack.repository.FilmeRepository;
import com.luis.cinestack.service.FilmeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*") 
@RestController 
@RequestMapping("/filmes")
public class FilmeController {

    @Autowired
    private FilmeRepository repository;

    @Autowired
    private FilmeService service; 

    @GetMapping("/usuario/{usuarioId}")
    public List<Filme> listarPorUsuario(@PathVariable Long usuarioId) {
        return repository.findByUsuarioId(usuarioId);
    }

    @GetMapping("/usuario/{usuarioId}/recentes")
    public List<Filme> listarRecentes(@PathVariable Long usuarioId) {
        return repository.findByUsuarioIdOrderByIdDesc(usuarioId);
    }

    @GetMapping("/usuario/{usuarioId}/favoritos")
    public List<Filme> listarFavoritos(@PathVariable Long usuarioId) {
        return repository.findByUsuarioIdAndFavoritoTrue(usuarioId);
    }

    // NOVAS ROTAS DE FILTROS: Vistos e Não Vistos
    @GetMapping("/usuario/{usuarioId}/vistos")
    public List<Filme> listarVistos(@PathVariable Long usuarioId) {
        return repository.findByUsuarioIdAndVistoTrue(usuarioId);
    }

    @GetMapping("/usuario/{usuarioId}/nao-vistos")
    public List<Filme> listarNaoVistos(@PathVariable Long usuarioId) {
        return repository.findByUsuarioIdAndVistoFalse(usuarioId);
    }

    @GetMapping("/search-tmdb")
    public Map<String, Object> search(@RequestParam String query) {
        return service.buscarNoTMDB(query);
    }

    @GetMapping("/details-tmdb/{id}")
    public Map<String, Object> details(@PathVariable Long id) {
        return service.buscarDetalhesEElenco(id);
    }

    @GetMapping("/descobrir/{categoria}")
    public Map<String, Object> descobrir(@PathVariable String categoria, @RequestParam(defaultValue = "1") int page) {
        return service.descobrirFilmes(categoria, page);
    }

    @PostMapping
    public Filme cadastrar(@RequestBody @Valid Filme filme) {
        return repository.save(filme);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }

    @PatchMapping("/{id}/favorito")
    public Filme alternarFavorito(@PathVariable Long id) {
        Filme filme = repository.findById(id).orElseThrow(() -> new RuntimeException("Filme não encontrado"));
        filme.setFavorito(!filme.getFavorito());
        return repository.save(filme);
    }

    // NOVA ROTA: Inverte o status de "visto"
    @PatchMapping("/{id}/visto")
    public Filme alternarVisto(@PathVariable Long id) {
        Filme filme = repository.findById(id).orElseThrow(() -> new RuntimeException("Filme não encontrado"));
        filme.setVisto(!filme.getVisto());
        return repository.save(filme);
    }
}