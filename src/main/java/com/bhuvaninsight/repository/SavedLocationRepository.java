package com.bhuvaninsight.repository;
import com.bhuvaninsight.model.SavedLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface SavedLocationRepository extends JpaRepository<SavedLocation,Long> {
    List<SavedLocation> findByType(String type);
}
