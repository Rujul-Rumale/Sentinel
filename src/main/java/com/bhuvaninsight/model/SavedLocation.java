package com.bhuvaninsight.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Entity @Table(name="saved_locations")
public class SavedLocation {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    private String name;
    private Double lat;
    private Double lon;
    private String type; // "search","bookmark","compare"
    private String metadata; // JSON string for extra fields
    private LocalDateTime createdAt;
    @PrePersist public void prePersist(){ createdAt = LocalDateTime.now(); }
}
