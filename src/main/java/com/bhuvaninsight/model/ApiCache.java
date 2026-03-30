package com.bhuvaninsight.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@Entity
@Table(name = "api_cache")
public class ApiCache {
    @Id
    private String cacheKey;

    @Column(columnDefinition = "LONGTEXT")
    private String value;

    private LocalDateTime cachedAt;

    public boolean isStale(int ttlMinutes) {
        return cachedAt == null || cachedAt.isBefore(LocalDateTime.now().minusMinutes(ttlMinutes));
    }
}
