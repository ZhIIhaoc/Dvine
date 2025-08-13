package com.dvineapi.controller;

import com.dvinedao.annotation.PermissionCheck;
import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.domain.PendingTour;
import com.dvinedao.domain.ReturnResult;
import com.dvineservice.service.PendingTourService;
import com.dvineservice.util.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing tour approvals
 * Only accessible by Manager and Owner level users
 */
@RestController
@RequestMapping("/approvals")
public class ApprovalController {
    
    @Autowired
    private PendingTourService pendingTourService;
    
    /**
     * Get all pending tours awaiting approval
     */
    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/pending-tours")
    @PermissionCheck(PermissionLevel.MANAGER)
    public ReturnResult getAllPendingTours() {
        List<PendingTour> pendingTours = pendingTourService.getAllPendingTours();
        return ReturnResult.success(pendingTours);
    }
    
    /**
     * Get specific pending tour details
     */
    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/tours/{pendingTourId}")
    @PermissionCheck(PermissionLevel.MANAGER)
    public ReturnResult getPendingTourById(@PathVariable Long pendingTourId) {
        PendingTour pendingTour = pendingTourService.getPendingTourById(pendingTourId);
        return ReturnResult.success(pendingTour);
    }
    
    /**
     * Approve a pending tour
     */
    @ResponseStatus(HttpStatus.OK)
    @PostMapping("/tours/{pendingTourId}/approve")
    @PermissionCheck(PermissionLevel.MANAGER)
    public ReturnResult approvePendingTour(@PathVariable Long pendingTourId) {
        Long reviewerId = UserUtil.getCurrentUserId();
        pendingTourService.approvePendingTour(pendingTourId, reviewerId);
        return ReturnResult.success();
    }
    
    /**
     * Reject a pending tour
     */
    @ResponseStatus(HttpStatus.OK)
    @PostMapping("/tours/{pendingTourId}/reject")
    @PermissionCheck(PermissionLevel.MANAGER)
    public ReturnResult rejectPendingTour(@PathVariable Long pendingTourId) {
        Long reviewerId = UserUtil.getCurrentUserId();
        pendingTourService.rejectPendingTour(pendingTourId, reviewerId);
        return ReturnResult.success();
    }
    
    /**
     * Get approval history (approved and rejected tours)
     */
    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/history")
    @PermissionCheck(PermissionLevel.MANAGER)
    public ReturnResult getApprovalHistory() {
        List<PendingTour> history = pendingTourService.getApprovalHistory();
        return ReturnResult.success(history);
    }
    
    /**
     * Get pending tours submitted by current user (for partners to track their submissions)
     */
    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/my-submissions")
    @PermissionCheck(PermissionLevel.PARTNER)
    public ReturnResult getMySubmissions() {
        Long currentUserId = UserUtil.getCurrentUserId();
        List<PendingTour> mySubmissions = pendingTourService.getPendingToursBySubmitter(currentUserId);
        return ReturnResult.success(mySubmissions);
    }
}