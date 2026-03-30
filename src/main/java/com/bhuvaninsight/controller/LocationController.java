package com.bhuvaninsight.controller;
import com.bhuvaninsight.model.SavedLocation;
import com.bhuvaninsight.model.SearchHistory;
import com.bhuvaninsight.repository.SavedLocationRepository;
import com.bhuvaninsight.repository.SearchHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {
    private final SavedLocationRepository locationRepo;
    private final SearchHistoryRepository historyRepo;

    @GetMapping public List<SavedLocation> getAll(){ return locationRepo.findAll(); }
    @PostMapping public SavedLocation save(@RequestBody SavedLocation loc){ return locationRepo.save(loc); }
    @DeleteMapping("/{id}") public void delete(@PathVariable Long id){ locationRepo.deleteById(id); }
    @GetMapping("/history") public List<SearchHistory> history(){ return historyRepo.findTop20ByOrderBySearchedAtDesc(); }
    @PostMapping("/history") public SearchHistory saveHistory(@RequestBody SearchHistory h){ return historyRepo.save(h); }
}
