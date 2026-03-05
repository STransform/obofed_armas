package com.oss2.translationservice.controller;

import com.oss2.translationservice.service.TranslationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/translations")
@RequiredArgsConstructor
public class TranslationController {

    private final TranslationService translationService;

    // GET /api/translations returns all translations grouped by key
    @GetMapping
    public ResponseEntity<Map<String, Map<String, String>>> getAllTranslationsGrouped() {
        return ResponseEntity.ok(translationService.getAllTranslationsGroupedByKey());
    }

    // GET /api/translations/{locale} returns translations just for one language
    @GetMapping("/{locale}")
    public ResponseEntity<Map<String, String>> getTranslationsByLocale(@PathVariable String locale) {
        return ResponseEntity.ok(translationService.getAllTranslationsForLocale(locale));
    }

    // POST /api/translations handles updates from the Next.js admin dashboard
    @PostMapping
    public ResponseEntity<Void> processTranslationsUpdate(@RequestBody TranslationUpdateRequest request) {
        if (request.getUpdates() != null && !request.getUpdates().isEmpty()) {
            for (Map.Entry<String, String> entry : request.getUpdates().entrySet()) {
                translationService.saveTranslation(entry.getKey(), request.getLocale(), entry.getValue());
            }
        }
        return ResponseEntity.ok().build();
    }

    // POST /api/translations/register handles new keys auto-registered by
    // microservices
    @PostMapping("/register")
    public ResponseEntity<Void> registerTranslation(@RequestBody TranslationRegistrationRequest request) {
        translationService.saveTranslation(request.getMessageKey(), request.getLocale(), request.getMessageValue());
        return ResponseEntity.ok().build();
    }

    // DELETE /api/translations/prefix/{prefix} removes all translations starting
    // with a prefix
    @DeleteMapping("/prefix/{prefix}")
    public ResponseEntity<Void> deleteTranslationsByPrefix(@PathVariable String prefix) {
        translationService.deleteTranslationsByPrefix(prefix);
        return ResponseEntity.ok().build();
    }

    @Data
    public static class TranslationUpdateRequest {
        private String locale; // e.g. "am"
        private Map<String, String> updates; // e.g {"service.123.title": "የጤና አገልግሎት"}
    }

    @Data
    public static class TranslationRegistrationRequest {
        private String messageKey;
        private String locale;
        private String messageValue;
    }
}
