package com.opt.Omer.workout.controller;

import com.opt.Omer.response.Response;
import com.opt.Omer.workout.dtos.WorkoutExerciseRequestDTO;
import com.opt.Omer.workout.dtos.WorkoutExerciseResponseDTO;
import com.opt.Omer.workout.services.WorkoutExercisesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/workoutexercises")
public class WorkoutExerciseController {

    private final WorkoutExercisesService workoutExercisesService;

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ADMIN')")
    ResponseEntity<Response<WorkoutExerciseResponseDTO>> createWorkoutExercise(@RequestBody @Valid WorkoutExerciseRequestDTO workoutExerciseRequestDTO) {
        return ResponseEntity.ok(workoutExercisesService.createWorkoutExercise(workoutExerciseRequestDTO));
    }

    @PutMapping("/update")
    @PreAuthorize("hasAuthority('ADMIN')")
    ResponseEntity<Response<WorkoutExerciseResponseDTO>> updateWorkoutExercise(@RequestBody WorkoutExerciseRequestDTO workoutExerciseRequestDTO) {
        return ResponseEntity.ok(workoutExercisesService.updateWorkoutExercise(workoutExerciseRequestDTO));
    }

    @GetMapping("/getById/{id}")
    ResponseEntity<Response<WorkoutExerciseResponseDTO>> getWorkoutExerciseById(@PathVariable Long id) {
        return ResponseEntity.ok(workoutExercisesService.getWorkoutExerciseById(id));
    }

    @GetMapping("/getAll/{workoutId}")
    ResponseEntity<Response<List<WorkoutExerciseResponseDTO>>> getWorkoutExercisesByWorkoutId(@PathVariable Long workoutId) {
        return ResponseEntity.ok(workoutExercisesService.getWorkoutExercisesByWorkoutId(workoutId));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    ResponseEntity<Response<?>> deleteWorkoutExercise(@PathVariable Long id) {
        return ResponseEntity.ok(workoutExercisesService.deleteWorkoutExercise(id));
    }
}
