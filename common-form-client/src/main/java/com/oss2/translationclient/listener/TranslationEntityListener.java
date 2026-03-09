package com.oss2.translationclient.listener;

import com.oss2.translationclient.annotation.TranslatableField;
import com.oss2.translationclient.client.TranslationClient;
import com.oss2.translationclient.util.SpringContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import java.lang.reflect.Field;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

public class TranslationEntityListener {
    private static final Logger log = LoggerFactory.getLogger(TranslationEntityListener.class);

    @PrePersist
    @PreUpdate
    public void captureTranslations(Object entity) {
        try {
            Field[] fields = entity.getClass().getDeclaredFields();
            for (Field field : fields) {
                if (field.isAnnotationPresent(TranslatableField.class)) {
                    field.setAccessible(true);
                    Object value = field.get(entity);

                    if (value != null && value instanceof String) {
                        String strValue = (String) value;
                        String prefix = entity.getClass().getSimpleName().toLowerCase() + ".";

                        // If it doesn't already look like THIS entity's translation key, treat it as
                        // new raw text.
                        // Only skip if it already starts with our entity prefix (e.g. "organization.")
                        // The old `!strValue.contains(".")` was too broad and would skip emails /
                        // decimals.
                        if (!strValue.startsWith(prefix)) {
                            String originalText = strValue;
                            String entityId = extractId(entity);
                            String messageKey = prefix + entityId + "." + field.getName().toLowerCase();

                            TranslationClient translationClient = SpringContext.getBean(TranslationClient.class);
                            boolean registered = false;

                            if (translationClient != null) {
                                try {
                                    log.info("Registering translation key '{}' for content: {}", messageKey,
                                            originalText);
                                    translationClient.registerTranslation(
                                            new TranslationClient.TranslationRegistrationRequest(messageKey, "en",
                                                    originalText));
                                    registered = true;
                                } catch (Exception e) {
                                    log.error("Failed to register translation for key " + messageKey
                                            + ". Leaving original text to prevent data loss.", e);
                                }
                            } else {
                                log.warn("TranslationClient bean not available. Keeping original text.");
                            }

                            if (registered) {
                                // Overwrite entity field with generated key only if we managed to save it to
                                // translation-service
                                field.set(entity, messageKey);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error during TranslationEntityListener processing:", e);
        }
    }

    @jakarta.persistence.PreRemove
    public void removeTranslations(Object entity) {
        try {
            String prefix = entity.getClass().getSimpleName().toLowerCase() + "." + extractId(entity) + ".";
            TranslationClient translationClient = SpringContext.getBean(TranslationClient.class);
            if (translationClient != null) {
                CompletableFuture.runAsync(() -> {
                    try {
                        translationClient.deleteTranslationsByPrefix(prefix);
                        log.info("Deleted orphaned translations for prefix: {}", prefix);
                    } catch (Exception e) {
                        log.error("Failed to delete translations for prefix " + prefix, e);
                    }
                });
            }
        } catch (Exception e) {
            log.error("Error during TranslationEntityListener @PreRemove processing:", e);
        }
    }

    private String extractId(Object entity) {
        try {
            Field idField = entity.getClass().getDeclaredField("id");
            idField.setAccessible(true);
            Object idVal = idField.get(entity);
            if (idVal != null && !idVal.toString().isEmpty()) {
                return idVal.toString();
            }
        } catch (Exception e) {
            // Ignore if no id field is found
        }
        return UUID.randomUUID().toString().substring(0, 8);
    }
}
