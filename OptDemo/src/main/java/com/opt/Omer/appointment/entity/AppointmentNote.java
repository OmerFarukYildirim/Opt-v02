package com.opt.Omer.appointment.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "appointment_notes")
public class AppointmentNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @Lob
    private String noteText; // Örnek: "Bel ağrısından şikayet etti. Hareketler hafifletildi."

    private String attachmentUrl; // PDF, resim veya video linki vs.

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
