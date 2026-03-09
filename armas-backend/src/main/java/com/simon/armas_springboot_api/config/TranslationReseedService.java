package com.simon.armas_springboot_api.config;

import com.simon.armas_springboot_api.clients.TranslationServiceClient;
import com.simon.armas_springboot_api.models.Document;
import com.simon.armas_springboot_api.models.Organization;
import com.simon.armas_springboot_api.repositories.DocumentRepository;
import com.simon.armas_springboot_api.repositories.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class TranslationReseedService implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(TranslationReseedService.class);

    private final OrganizationRepository organizationRepository;
    private final DocumentRepository documentRepository;
    private final TranslationServiceClient translationServiceClient;

    @Override
    public void run(ApplicationArguments args) {
        try {
            // Fetch all currently registered English translations once
            Map<String, String> existingEnTranslations = translationServiceClient.getTranslationsByLocale("en");

            reseedOrganizations(existingEnTranslations);
            reseedDocuments(existingEnTranslations);

            log.info("[TranslationReseedService] Re-seed complete.");
        } catch (Exception e) {
            log.warn(
                    "[TranslationReseedService] Could not re-seed translations (translation-service may not be ready yet): {}",
                    e.getMessage());
        }
    }

    private void reseedOrganizations(Map<String, String> existing) {
        try {
            List<Organization> orgs = organizationRepository.findAll();
            int count = 0;
            for (Organization org : orgs) {
                String orgname = org.getOrgname();
                // Only process values that look like a translation key (e.g.
                // "organization.BSC.orgname")
                if (orgname != null && orgname.startsWith("organization.") && orgname.contains(".orgname")) {
                    if (!existing.containsKey(orgname)) {
                        // The middle segment is the entity ID — use it as the fallback English value
                        String[] parts = orgname.split("\\.");
                        String fallbackValue = parts.length >= 2 ? parts[1] : org.getId();
                        registerTranslation(orgname, fallbackValue);
                        count++;
                    }
                }
            }
            if (count > 0) {
                log.info("[TranslationReseedService] Re-seeded {} organization name translations.", count);
            }
        } catch (Exception e) {
            log.warn("[TranslationReseedService] Error re-seeding organizations: {}", e.getMessage());
        }
    }

    private void reseedDocuments(Map<String, String> existing) {
        try {
            List<Document> docs = documentRepository.findAll();
            int count = 0;
            for (Document doc : docs) {
                String reportype = doc.getReportype();
                // Only process values that look like a translation key (e.g.
                // "document.uuid.reportype")
                if (reportype != null && reportype.startsWith("document.") && reportype.contains(".reportype")) {
                    if (!existing.containsKey(reportype)) {
                        // Use the middle UUID segment (shortened) as the fallback English display value
                        String[] parts = reportype.split("\\.");
                        String idSegment = parts.length >= 2 ? parts[1] : doc.getId();
                        // If it looks like a UUID (36 chars), abbreviate to first 8 chars for
                        // readability
                        String fallbackValue = (idSegment.length() == 36 && idSegment.contains("-"))
                                ? idSegment.substring(0, 8)
                                : idSegment;
                        registerTranslation(reportype, fallbackValue);
                        count++;
                    }
                }
            }
            if (count > 0) {
                log.info("[TranslationReseedService] Re-seeded {} document report type translations.", count);
            }
        } catch (Exception e) {
            log.warn("[TranslationReseedService] Error re-seeding documents: {}", e.getMessage());
        }
    }

    private void registerTranslation(String key, String value) {
        try {
            translationServiceClient.registerTranslation(
                    new TranslationServiceClient.TranslationRegistrationRequest(key, "en", value));
            log.debug("[TranslationReseedService] Registered: {} = {}", key, value);
        } catch (Exception e) {
            log.warn("[TranslationReseedService] Failed to register key '{}': {}", key, e.getMessage());
        }
    }
}
