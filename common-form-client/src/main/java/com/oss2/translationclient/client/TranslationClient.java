package com.oss2.translationclient.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@FeignClient(name = "translation-service", url = "${translation-service.url:http://localhost:8086}", configuration = com.oss2.translationclient.config.TranslationFeignConfig.class)
public interface TranslationClient {

    @PostMapping("/api/translations/register")
    void registerTranslation(@RequestBody TranslationRegistrationRequest request);

    @org.springframework.web.bind.annotation.DeleteMapping("/api/translations/prefix/{prefix}")
    void deleteTranslationsByPrefix(@org.springframework.web.bind.annotation.PathVariable("prefix") String prefix);

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    class TranslationRegistrationRequest {
        private String messageKey;
        private String locale;
        private String messageValue;
    }
}
