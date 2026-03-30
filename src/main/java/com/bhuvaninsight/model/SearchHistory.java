package com.bhuvaninsight.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Entity @Table(name="search_history")
public class SearchHistory {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    private String query;
    private String resultJson;
    private LocalDateTime searchedAt;
    @PrePersist public void prePersist(){ searchedAt = LocalDateTime.now(); }
}
