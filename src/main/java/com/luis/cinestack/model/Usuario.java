package com.luis.cinestack.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;
    private String senha;
    private String nomeReal; // O nome que vai aparecer no "Olá, [Nome]!"
}