package com.simon.armas_springboot_api.dto;

import java.time.LocalDateTime;

/**
 * Lightweight DTO for returning notification data.
 * Avoids serializing the full User entity and its relations.
 */
public class NotificationDTO {

    private Long id;
    private String title;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
    private String entityType;
    private Long entityId;
    private String context;

    public NotificationDTO() {
    }

    public NotificationDTO(
            Long id, String title, String message, boolean isRead,
            LocalDateTime createdAt, String entityType, Long entityId, String context) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.entityType = entityType;
        this.entityId = entityId;
        this.context = context;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setIsRead(boolean isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }
}
