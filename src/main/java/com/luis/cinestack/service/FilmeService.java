package com.luis.cinestack.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.List;

@Service
public class FilmeService {

    // Sua chave protegida no servidor
    private final String API_KEY = "b05801d780e80d62151c04f1f4afa6c2";
    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> buscarNoTMDB(String query) {
        String url = "https://api.themoviedb.org/3/search/movie?api_key=" + API_KEY + 
                     "&language=pt-BR&query=" + query;
        
        // O Java faz a requisição pesada
        return restTemplate.getForObject(url, Map.class);
    }

    public Map<String, Object> buscarDetalhesEElenco(Long tmdbId) {
        String url = "https://api.themoviedb.org/3/movie/" + tmdbId + 
                     "?api_key=" + API_KEY + "&language=pt-BR&append_to_response=credits";
        
        return restTemplate.getForObject(url, Map.class);
    }
}