package com.recruitsmart.service;

import com.recruitsmart.model.Customer;
import com.recruitsmart.model.Lead;
import com.recruitsmart.model.Opportunity;
import com.recruitsmart.repository.CustomerRepository;
import com.recruitsmart.repository.LeadRepository;
import com.recruitsmart.repository.OpportunityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConversionService {

    @Autowired
    private LeadRepository leadRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OpportunityRepository opportunityRepository;

    @Transactional
    public Customer convertLeadToCustomer(Long leadId) {
        Lead lead = leadRepository.findById(leadId).orElseThrow();
        
        // 1. Create Customer from Lead data
        Customer customer = new Customer();
        customer.setName(lead.getName());
        customer.setEmail(lead.getEmail());
        customer.setIndustry("Technology"); // Default for recruitment focus
        customer = customerRepository.save(customer);
        
        // 2. Create an initial Opportunity
        Opportunity opp = new Opportunity();
        opp.setTitle("New Engagement: " + lead.getName());
        opp.setStage("Prospecting");
        opp.setValue(lead.getMlScore() * 10000); // Initial value based on ML score
        opp.setCustomer(customer);
        opportunityRepository.save(opp);
        
        // 3. Delete or Update Lead Status
        leadRepository.delete(lead);
        
        return customer;
    }
}
