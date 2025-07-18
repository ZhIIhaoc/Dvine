package com.dvineservice.service;

import com.dvinedao.domain.Faq;

import java.util.List;

public interface FaqService {
    List<Faq> findAll();
    Faq findById(Long faqId);
    void createFaq(Faq faq, Long userId);
    void updateFaq(Faq faq, Long userId);
    void deleteFaq(Long faqId, Long userId);
}