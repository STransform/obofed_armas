package com.oss2.common.form.dto;

import lombok.Data;

@Data
public class FormSchemaDTO {
    private Long id;
    private String title;
    private String schemaJson;
    private String createdBy;
    private String createdAt;
    private String updatedAt;
    private Boolean active;
    private String context;
}
