package com.opt.Omer.workout.services;

import com.opt.Omer.meal.dtos.MealResponseDTO;
import com.opt.Omer.response.Response;
import com.opt.Omer.workout.dtos.WorkoutRequestDTO;
import com.opt.Omer.workout.dtos.WorkoutResponseDTO;

import java.util.List;

public interface WorkoutService {

    Response<WorkoutResponseDTO> createWorkout(WorkoutRequestDTO workoutRequestDTO);
    Response<WorkoutResponseDTO> getOwnWorkout(Long ptId, Long customerId, String date);
    Response<?> deleteWorkout(Long id);
    Response<List<WorkoutResponseDTO>> getOwnWorkouts(Long ptId, Long customerId);
}
