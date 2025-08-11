package com.opt.Omer.workout.repository;

import com.opt.Omer.workout.entity.WorkoutExercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutExercisesRepository extends JpaRepository<WorkoutExercise, Long> {

    List<WorkoutExercise> findByWorkoutPlanId(Long workoutPlanId);
}
