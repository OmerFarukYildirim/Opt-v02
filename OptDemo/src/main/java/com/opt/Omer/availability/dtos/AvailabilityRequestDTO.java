package com.opt.Omer.availability.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AvailabilityRequestDTO {

    private Long id;
    @NotNull(message = "PT ID required")
    private Long ptId;
    @NotNull(message = "Date required")
    private String date;
    private String startTime;
    private String endTime;
}
