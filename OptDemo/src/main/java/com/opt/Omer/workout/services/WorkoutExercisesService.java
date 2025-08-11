package com.opt.Omer.workout.services;

import com.opt.Omer.meal.dtos.MealItemRequestDTO;
import com.opt.Omer.meal.dtos.MealItemResponseDTO;
import com.opt.Omer.response.Response;
import com.opt.Omer.workout.dtos.WorkoutExerciseRequestDTO;
import com.opt.Omer.workout.dtos.WorkoutExerciseResponseDTO;
import com.opt.Omer.workout.dtos.WorkoutRequestDTO;

import java.util.List;

public interface WorkoutExercisesService {

    Response<WorkoutExerciseResponseDTO> createWorkoutExercise(WorkoutExerciseRequestDTO workoutExerciseRequestDTO);

    Response<WorkoutExerciseResponseDTO> updateWorkoutExercise(WorkoutExerciseRequestDTO workoutExerciseRequestDTO);

    Response<WorkoutExerciseResponseDTO> getWorkoutExerciseById(Long id);

    Response<List<WorkoutExerciseResponseDTO>> getWorkoutExercisesByWorkoutId(Long workoutId);

    Response<?> deleteWorkoutExercise(Long id);
}
