package com.opt.Omer.appointment.repository;

import com.opt.Omer.appointment.entity.AppointmentNote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentNoteRepository extends JpaRepository<AppointmentNote, Long> {
}
