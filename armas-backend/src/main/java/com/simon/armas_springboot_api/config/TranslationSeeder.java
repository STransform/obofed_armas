package com.simon.armas_springboot_api.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.simon.armas_springboot_api.clients.TranslationServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.util.Map;

@Component
public class TranslationSeeder {
    private static final Logger log = LoggerFactory.getLogger(TranslationSeeder.class);

    @Autowired
    private TranslationServiceClient translationClient;

    @Autowired
    private ObjectMapper objectMapper;

    @PostConstruct
    public void seedTranslations() {
        try {
            log.info("Starting translation seeding from JSON files...");
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource[] resources = resolver.getResources("classpath:messages/*.json");

            for (Resource resource : resources) {
                String filename = resource.getFilename();
                if (filename != null) {
                    String locale = filename.replace(".json", "");
                    try (InputStream is = resource.getInputStream()) {
                        Map<String, String> translations = objectMapper.readValue(is,
                                new TypeReference<Map<String, String>>() {
                                });

                        // We do not check existing keys here because the TranslationService handles it
                        // idempotently
                        // However we send them as a batch or one-by-one?
                        // The existing translation-service API has POST /api/translations (batch)

                        TranslationServiceClient.TranslationUpdateRequest request = new TranslationServiceClient.TranslationUpdateRequest(
                                locale, translations);

                        translationClient.updateTranslations(request);
                        log.info("Seeded {} translations for locale '{}'", translations.size(), locale);
                    } catch (Exception e) {
                        log.error("Failed to seed translations from file " + filename, e);
                    }
                }
            }
            log.info("Translation seeding completed.");
        } catch (Exception e) {
            log.error("Error during translation seeding", e);
        }
    }
}
