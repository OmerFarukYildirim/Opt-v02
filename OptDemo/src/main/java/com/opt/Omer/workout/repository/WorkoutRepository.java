package com.opt.Omer.workout.repository;

import com.opt.Omer.meal.entity.Meal;
import com.opt.Omer.workout.entity.Workout;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {

    Optional<Workout> findByPtIdAndCustomerIdAndDate(Long ptId, Long customerId, String date);
    List<Workout> findByPtIdAndCustomerId(Long ptId, Long customerId);
}
