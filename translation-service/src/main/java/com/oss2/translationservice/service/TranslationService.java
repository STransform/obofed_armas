package com.oss2.translationservice.service;

import com.oss2.translationservice.model.TranslationDictionary;
import com.oss2.translationservice.repository.TranslationDictionaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TranslationService {

    private final TranslationDictionaryRepository repository;

    @Transactional(readOnly = true)
    public Map<String, Map<String, String>> getAllTranslationsGroupedByKey() {
        List<TranslationDictionary> allTranslations = repository.findAll();
        Map<String, Map<String, String>> grouped = new HashMap<>();

        for (TranslationDictionary td : allTranslations) {
            grouped.computeIfAbsent(td.getMessageKey(), k -> new HashMap<>())
                    .put(td.getLocale(), td.getMessageValue());
        }
        return grouped;
    }

    @Transactional(readOnly = true)
    public Map<String, String> getAllTranslationsForLocale(String locale) {
        List<TranslationDictionary> localeTranslations = repository.findByLocale(locale);
        Map<String, String> translations = new HashMap<>();
        for (TranslationDictionary td : localeTranslations) {
            translations.put(td.getMessageKey(), td.getMessageValue());
        }
        return translations;
    }

    @Transactional
    public void saveTranslation(String messageKey, String locale, String messageValue) {
        if (messageValue == null || messageValue.trim().isEmpty()) {
            return;
        }

        Optional<TranslationDictionary> existingOpt = repository.findByMessageKeyAndLocale(messageKey, locale);
        if (existingOpt.isPresent()) {
            TranslationDictionary existing = existingOpt.get();
            existing.setMessageValue(messageValue);
            repository.save(existing);
        } else {
            TranslationDictionary newEntry = new TranslationDictionary();
            newEntry.setMessageKey(messageKey);
            newEntry.setLocale(locale);
            newEntry.setMessageValue(messageValue);
            repository.save(newEntry);
        }
    }

    @Transactional
    public void deleteTranslationsByPrefix(String prefix) {
        if (prefix != null && !prefix.trim().isEmpty()) {
            repository.deleteByMessageKeyStartingWith(prefix);
        }
    }
}
