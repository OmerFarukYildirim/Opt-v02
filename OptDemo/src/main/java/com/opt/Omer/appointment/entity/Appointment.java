package com.opt.Omer.appointment.entity;


import com.opt.Omer.enums.AppointmentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long ptId;

    private Long customerId;

    private String date;

    private String startTime;

    private String endTime;

    private String videoCallUrl;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;

    @OneToMany(mappedBy = "appointment", cascade = CascadeType.ALL)
    private List<AppointmentNote> notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
