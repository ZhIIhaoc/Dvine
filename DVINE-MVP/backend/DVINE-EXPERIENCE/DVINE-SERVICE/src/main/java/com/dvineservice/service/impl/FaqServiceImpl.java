package com.dvineservice.service.impl;

import com.dvinedao.domain.Faq;
import com.dvinedao.mapper.FaqMapper;
import com.dvineservice.exception.NotFoundException;
import com.dvineservice.service.FaqService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@Transactional
public class FaqServiceImpl implements FaqService {

    @Autowired
    private FaqMapper faqMapper;

    @Override
    public List<Faq> findAll() {
        return faqMapper.findAll();
    }

    @Override
    public Faq findById(Long faqId) {
        Faq faq = faqMapper.findById(faqId);
        if (faq == null) {
            throw new NotFoundException("FAQ not found");
        }
        return faq;
    }

    @Override
    public void createFaq(Faq faq, Long userId) {
        faqMapper.createFaq(faq);
        log.info("FAQ created successfully by user: {}", userId);
    }

    @Override
    public void updateFaq(Faq faq, Long userId) {
        int updateFaq = faqMapper.updateFaq(faq);
        if (updateFaq == 0) {
            throw new NotFoundException("FAQ not found");
        }
        log.info("FAQ updated successfully by user: {}", userId);
    }

    @Override
    public void deleteFaq(Long faqId, Long userId) {
        int deletedFaq = faqMapper.deleteFaq(faqId);
        if (deletedFaq == 0) {
            throw new NotFoundException("FAQ not found");
        }
        log.info("FAQ deleted successfully by user: {}", userId);
    }
}