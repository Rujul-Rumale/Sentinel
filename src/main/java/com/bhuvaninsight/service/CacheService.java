package com.bhuvaninsight.service;

import com.bhuvaninsight.model.ApiCache;
import com.bhuvaninsight.repository.ApiCacheRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CacheService {
    private final ApiCacheRepository repo;
    private static final int TTL_MINUTES = 5;

    public String getOrFetch(String key, Supplier<String> fetcher) {
        Optional<ApiCache> cached = repo.findById(key);
        if (cached.isPresent() && !cached.get().isStale(TTL_MINUTES)) {
            log.debug("Cache hit: {}", key);
            return cached.get().getValue();
        }
        try {
            String fresh = fetcher.get();
            ApiCache entry = cached.orElse(new ApiCache());
            entry.setCacheKey(key);
            entry.setValue(fresh);
            entry.setCachedAt(LocalDateTime.now());
            repo.save(entry);
            return fresh;
        } catch (Exception e) {
            log.warn("Fetch failed for {}: {}", key, e.getMessage());
            return cached.map(ApiCache::getValue).orElse("{}");
        }
    }
}
