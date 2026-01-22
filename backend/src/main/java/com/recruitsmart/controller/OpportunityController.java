package com.recruitsmart.controller;

import com.recruitsmart.model.Opportunity;
import com.recruitsmart.repository.OpportunityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/opportunities")
@CrossOrigin(origins = "*")
public class OpportunityController {

    @Autowired
    private OpportunityRepository opportunityRepository;

    @GetMapping
    public List<Opportunity> getAllOpportunities() {
        return opportunityRepository.findAll();
    }

    @PostMapping
    public Opportunity createOpportunity(@RequestBody Opportunity opportunity) {
        Objects.requireNonNull(opportunity, "Opportunity cannot be null");
        return opportunityRepository.save(opportunity);
    }

    @PutMapping("/{id}")
    public Opportunity updateOpportunity(@PathVariable Long id, @RequestBody Opportunity details) {
        Objects.requireNonNull(id, "ID cannot be null");
        Objects.requireNonNull(details, "Opportunity details cannot be null");
        Opportunity opp = opportunityRepository.findById(id).orElseThrow();
        opp.setTitle(details.getTitle());
        opp.setValue(details.getValue());
        opp.setStage(details.getStage());
        return opportunityRepository.save(opp);
    }

    @DeleteMapping("/{id}")
    public void deleteOpportunity(@PathVariable Long id) {
        Objects.requireNonNull(id, "ID cannot be null");
        opportunityRepository.deleteById(id);
    }
}
