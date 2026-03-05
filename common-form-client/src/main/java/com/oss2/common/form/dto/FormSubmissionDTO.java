package com.oss2.common.form.dto;

import lombok.Data;
import java.util.Map;

@Data
public class FormSubmissionDTO {
    private Long id;
    private Long formSchemaId;
    private Map<String, Object> submissionData;
    private String submittedBy;
    private String submittedAt;
}
