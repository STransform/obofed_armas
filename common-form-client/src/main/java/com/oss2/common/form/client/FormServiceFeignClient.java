package com.oss2.common.form.client;

import com.oss2.common.config.FeignClientConfig;
import com.oss2.common.form.dto.FormSchemaDTO;
import com.oss2.common.form.dto.FormSubmissionDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(name = "form-service", configuration = FeignClientConfig.class)
public interface FormServiceFeignClient {

    @GetMapping("/api/forms/{formId}")
    FormSchemaDTO getForm(@PathVariable("formId") Long formId);

    @PostMapping("/api/forms")
    FormSchemaDTO createOrUpdateForm(@RequestBody FormSchemaDTO formSchema);

    @PutMapping("/api/forms/{id}")
    FormSchemaDTO updateForm(@PathVariable("id") Long id, @RequestBody FormSchemaDTO formSchema);

    @PostMapping("/api/submissions")
    FormSubmissionDTO submitFormData(@RequestBody Map<String, Object> requestBody);

    @GetMapping("/api/submissions/form/{formSchemaId}")
    FormSubmissionDTO[] getFormSubmissions(@PathVariable("formSchemaId") Long formSchemaId);
}
