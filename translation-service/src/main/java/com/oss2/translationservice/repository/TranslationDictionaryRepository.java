package com.oss2.translationservice.repository;

import com.oss2.translationservice.model.TranslationDictionary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TranslationDictionaryRepository extends JpaRepository<TranslationDictionary, Long> {
    Optional<TranslationDictionary> findByMessageKeyAndLocale(String messageKey, String locale);

    List<TranslationDictionary> findByLocale(String locale);

    void deleteByMessageKeyStartingWith(String prefix);
}
