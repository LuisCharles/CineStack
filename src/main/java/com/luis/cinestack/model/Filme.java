package com.luis.cinestack.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

@Entity
@Data
public class Filme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O título é obrigatório")
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String sinopse;

    @Min(1888)
    private Integer anoLancamento;

    @DecimalMin("0.0") @DecimalMax("10.0")
    private Double nota;

    private String urlCapa;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    private Boolean favorito = false;
    
    // NOVO: Campo para controlar se o filme já foi assistido (Padrão: falso)
    private Boolean visto = false; 
}