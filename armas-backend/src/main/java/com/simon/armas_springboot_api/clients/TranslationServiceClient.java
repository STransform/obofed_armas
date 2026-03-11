package com.simon.armas_springboot_api.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import com.simon.armas_springboot_api.config.FeignConfig;
import java.util.Map;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@FeignClient(name = "translation-service", url = "${translation-service.url}", configuration = FeignConfig.class)
public interface TranslationServiceClient {

    /**
     * Fetch all translations for a given language/locale (e.g. "en", "am", "om")
     */
    @GetMapping("/api/translations/{locale}")
    Map<String, String> getTranslations(@PathVariable("locale") String locale);

    /** Batch update translations from admin UI */
    @PostMapping("/api/translations")
    void updateTranslations(@RequestBody TranslationUpdateRequest request);

    /** Register a single new key from an entity listener */
    @PostMapping("/api/translations/register")
    void registerTranslation(@RequestBody TranslationRegistrationRequest request);

    /** Remove all translations starting with a prefix (on entity delete) */
    @DeleteMapping("/api/translations/prefix/{prefix}")
    void deleteTranslationsByPrefix(@PathVariable("prefix") String prefix);

    @Data
    @NoArgsConstructor
    class TranslationUpdateRequest {
        private String locale;
        private Map<String, String> updates;

        public TranslationUpdateRequest(String locale, Map<String, String> updates) {
            this.locale = locale;
            this.updates = updates;
        }
    }

    @Data
    @NoArgsConstructor
    class TranslationRegistrationRequest {
        private String messageKey;
        private String locale;
        private String messageValue;

        public TranslationRegistrationRequest(String messageKey, String locale, String messageValue) {
            this.messageKey = messageKey;
            this.locale = locale;
            this.messageValue = messageValue;
        }
    }
}
