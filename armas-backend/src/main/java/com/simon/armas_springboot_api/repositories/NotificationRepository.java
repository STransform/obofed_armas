package com.simon.armas_springboot_api.repositories;

import com.simon.armas_springboot_api.models.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Fetch unread notifications for a user, ordered newest-first.
     * Using an explicit @Query avoids any unintended joins and gives the DB
     * the chance to use an index on (user_id, is_read).
     */
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdAndIsReadFalse(@Param("userId") Long userId);
}