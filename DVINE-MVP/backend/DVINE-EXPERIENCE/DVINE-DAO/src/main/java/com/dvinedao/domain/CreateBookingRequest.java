package com.dvinedao.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Request DTO for creating a new tour booking.
 * Contains only the fields needed from the client to initiate booking.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {
    private Long tourId;
    private Integer quantity = 1;
    private LocalDate travelDate;
    private String customerNotes;
}