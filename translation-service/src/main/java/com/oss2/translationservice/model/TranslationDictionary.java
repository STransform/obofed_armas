package com.oss2.translationservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "translation_dictionary", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "messageKey", "locale" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TranslationDictionary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String messageKey;

    @Column(nullable = false)
    private String locale; // e.g. "en", "am", "om"

    @Column(columnDefinition = "TEXT")
    private String messageValue;
}
