package com.dvinedao.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Faq {
    private Long faqId; // FAQ ID
    private String question; // FAQ question
    private String answer; // FAQ answer
    private LocalDateTime createTime; // Creation timestamp
    private LocalDateTime updateTime; // Last update timestamp
}