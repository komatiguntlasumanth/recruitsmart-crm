package com.recruitsmart.controller;

import com.recruitsmart.model.Lead;
import com.recruitsmart.repository.LeadRepository;
import com.recruitsmart.service.MLService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/leads")
@CrossOrigin(origins = "*")
public class LeadController {

    @Autowired
    private LeadRepository leadRepository;

    @Autowired
    private MLService mlService;

    @Autowired
    private com.recruitsmart.service.ConversionService conversionService;

    @PostMapping("/{id}/convert")
    public com.recruitsmart.model.Customer convertLead(@PathVariable Long id) {
        return conversionService.convertLeadToCustomer(id);
    }

    @GetMapping
    public List<Lead> getAllLeads() {
        return leadRepository.findAll();
    }

    @PostMapping
    public Lead createLead(@RequestBody Lead lead) {
        // Automatically calculate ML score when a lead is created
        lead.setMlScore(mlService.calculateLeadScore(lead));
        return leadRepository.save(lead);
    }

    @GetMapping("/{id}")
    public Lead getLeadById(@PathVariable Long id) {
        return leadRepository.findById(id).orElseThrow();
    }

    @PutMapping("/{id}")
    public Lead updateLead(@PathVariable Long id, @RequestBody Lead leadDetails) {
        Lead lead = leadRepository.findById(id).orElseThrow();
        lead.setName(leadDetails.getName());
        lead.setEmail(leadDetails.getEmail());
        lead.setPhone(leadDetails.getPhone());
        lead.setCompany(leadDetails.getCompany());
        lead.setStatus(leadDetails.getStatus());
        
        // Recalculate score on update
        lead.setMlScore(mlService.calculateLeadScore(lead));
        
        return leadRepository.save(lead);
    }

    @DeleteMapping("/{id}")
    public void deleteLead(@PathVariable Long id) {
        leadRepository.deleteById(id);
    }
}
