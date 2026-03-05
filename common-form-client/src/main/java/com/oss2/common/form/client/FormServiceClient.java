package com.oss2.common.form.client;

import com.oss2.common.form.dto.FormSchemaDTO;
import com.oss2.common.form.dto.FormSubmissionDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FormServiceClient {
    // To hide FeignClient implementation details from consumers
    private final FormServiceFeignClient formServiceFeignClient;

    /**
     * Get a form schema by ID
     */
    public FormSchemaDTO getForm(Long formId) {
        try {
            return formServiceFeignClient.getForm(formId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch form from form-service: " + e.getMessage());
        }
    }

    /**
     * Submit form data
     */
    public FormSubmissionDTO submitFormData(Long formSchemaId, Map<String, Object> data) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("formSchemaId", formSchemaId);
            requestBody.put("submissionData", data);

            return formServiceFeignClient.submitFormData(requestBody);
        } catch (Exception e) {
            throw new RuntimeException("Failed to submit form data: " + e.getMessage());
        }
    }

    /**
     * Create or update a form schema
     */
    public FormSchemaDTO createOrUpdateForm(FormSchemaDTO formSchema) {
        try {
            return formServiceFeignClient.createOrUpdateForm(formSchema);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create/update form: " + e.getMessage());
        }
    }

    /**
     * Update an existing form schema
     */
    public FormSchemaDTO updateForm(Long id, FormSchemaDTO formSchema) {
        try {
            return formServiceFeignClient.updateForm(id, formSchema);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update form: " + e.getMessage());
        }
    }

    /**
     * Get submissions for a specific form
     */
    public FormSubmissionDTO[] getFormSubmissions(Long formSchemaId) {
        try {
            return formServiceFeignClient.getFormSubmissions(formSchemaId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch form submissions: " + e.getMessage());
        }
    }
}
