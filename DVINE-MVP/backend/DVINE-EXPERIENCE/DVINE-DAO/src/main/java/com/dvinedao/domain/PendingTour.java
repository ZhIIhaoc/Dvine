package com.dvinedao.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Represents a pending tour that requires approval from manager or owner
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PendingTour {
    private Long pendingTourId;
    private Long catalogueId;
    private String title;
    private String destination;
    private String description;
    private Double price;
    private String primaryImageUrl;
    private Long submittedBy; // User ID who submitted
    private OperationType operationType; // CREATE, UPDATE, DELETE
    private Long originalTourId; // For UPDATE/DELETE operations
    private Integer status; // 0=PENDING, 1=APPROVED, 2=REJECTED
    private Long reviewedBy; // User ID who reviewed
    private LocalDateTime submissionTime;
    private LocalDateTime reviewTime;
    private List<String> images; // List of image URLs
    
    // For displaying submitter and reviewer info
    private String submitterName;
    private String reviewerName;
    
    public enum OperationType {
        CREATE, UPDATE, DELETE
    }
}