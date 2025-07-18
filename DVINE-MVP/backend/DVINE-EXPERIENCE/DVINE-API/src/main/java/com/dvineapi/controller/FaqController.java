package com.dvineapi.controller;

import com.dvinedao.annotation.PermissionCheck;
import com.dvinedao.domain.Faq;
import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.domain.ReturnResult;
import com.dvineservice.service.FaqService;
import com.dvineservice.util.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/faqs")
public class FaqController {
    
    @Autowired
    private FaqService faqService;

    @ResponseStatus(HttpStatus.OK)
    @GetMapping
    public ReturnResult findAll() {
        List<Faq> faqs = faqService.findAll();
        return ReturnResult.success(faqs);
    }

    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/{faqId}")
    public ReturnResult findById(@PathVariable Long faqId) {
        Faq faq = faqService.findById(faqId);
        return ReturnResult.success(faq);
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    @PermissionCheck(PermissionLevel.MANAGER)
    public ReturnResult createFaq(@RequestBody Faq faq) {
        Long userId = UserUtil.getCurrentUserId();
        faqService.createFaq(faq, userId);
        return ReturnResult.success();
    }

    @ResponseStatus(HttpStatus.OK)
    @PutMapping
    @PermissionCheck(PermissionLevel.MANAGER)
    public ReturnResult updateFaq(@RequestBody Faq faq) {
        Long userId = UserUtil.getCurrentUserId();
        faqService.updateFaq(faq, userId);
        return ReturnResult.success();
    }

    @ResponseStatus(HttpStatus.OK)
    @DeleteMapping("/{faqId}")
    @PermissionCheck(PermissionLevel.MANAGER)
    public ReturnResult deleteFaq(@PathVariable Long faqId) {
        Long userId = UserUtil.getCurrentUserId();
        faqService.deleteFaq(faqId, userId);
        return ReturnResult.success();
    }
}