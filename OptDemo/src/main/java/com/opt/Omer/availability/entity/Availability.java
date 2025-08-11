package com.opt.Omer.availability.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "availabilities")
public class Availability {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long ptId;

    private String date;

    private String startTime;

    private String endTime;

    private boolean isAccessible; // true: bu saat aralığındaki müsaitlikten randevu alınabilir

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
