package com.luis.cinestack.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Libera todos os endpoints (auth, filmes, etc)
                .allowedOrigins("*") // Permite qualquer site (seu front-end)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS") // Libera todos os métodos, incluindo o OPTIONS (fantasma)
                .allowedHeaders("*"); // Permite qualquer cabeçalho
    }
}