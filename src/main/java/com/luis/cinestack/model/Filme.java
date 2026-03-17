package com.luis.cinestack.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

@Entity
@Data // O Lombok cria os Getters e Setters automaticamente
public class Filme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O título é obrigatório")
    private String titulo;

    private String sinopse;

    @Min(1888)
    private Integer anoLancamento;

    @DecimalMin("0.0") @DecimalMax("10.0")
    private Double nota;

    private String urlCapa;
}