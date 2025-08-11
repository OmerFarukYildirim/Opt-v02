package com.opt.Omer.availability.repository;

import com.opt.Omer.availability.entity.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AvailabilityRepository extends JpaRepository<Availability, Long> {

    List<Availability> findByPtIdAndDate(Long ptId, String date);

    @Query("SELECT a FROM Availability a WHERE a.isAccessible = true ")
    List<Availability> findAvailabilitiesByIsAccassable();
}
