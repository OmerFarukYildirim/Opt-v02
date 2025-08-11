package com.opt.Omer.appointment.repository;

import com.opt.Omer.appointment.entity.Appointment;
import com.opt.Omer.availability.entity.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment,Long> {

    @Modifying
    @Query("UPDATE Appointment a SET a.status = 'COMPLETED' WHERE a.endTime < :currentTime")
    int completeOverdueAppointments(@Param("currentTime") LocalDateTime currentTime);

    Appointment findByDateAndStartTime(String date, String startTime);
    List<Appointment> findByCustomerId(Long customerId);

}
