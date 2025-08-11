package com.opt.Omer.availability.dtos;

import com.opt.Omer.enums.AppointmentStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AvailabilityResponseDTO {
    private Long id;
    private Long ptId;
    private Long customerId;
    private String date;
    private String startTime;
    private String endTime;
    private boolean isAccessible;
    private AppointmentStatus status;
}
