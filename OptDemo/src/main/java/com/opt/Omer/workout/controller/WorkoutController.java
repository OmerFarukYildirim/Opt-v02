package com.opt.Omer.workout.controller;

import com.opt.Omer.meal.dtos.MealResponseDTO;
import com.opt.Omer.response.Response;
import com.opt.Omer.workout.dtos.WorkoutRequestDTO;
import com.opt.Omer.workout.dtos.WorkoutResponseDTO;
import com.opt.Omer.workout.services.WorkoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/workout")
public class WorkoutController {

    private final WorkoutService workoutService;

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response<WorkoutResponseDTO>> createWorkout(@RequestBody WorkoutRequestDTO workoutRequestDTO){
        return ResponseEntity.ok(workoutService.createWorkout(workoutRequestDTO));
    }

    @GetMapping("/all")
    public ResponseEntity<Response<WorkoutResponseDTO>> getOwnWorkout(
            @RequestParam Long ptId,
            @RequestParam Long customerId,
            @RequestParam String date
    ){
        return ResponseEntity.ok(workoutService.getOwnWorkout(ptId,customerId,date));
    }

    @GetMapping("/getWorkouts")
    ResponseEntity<Response<List<WorkoutResponseDTO>>> getOwnWorkouts(
            @RequestParam Long ptId,
            @RequestParam Long customerId
    ){
        return ResponseEntity.ok(workoutService.getOwnWorkouts(ptId, customerId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response<?>> deleteWorkout(@PathVariable Long id){
        return ResponseEntity.ok(workoutService.deleteWorkout(id));
    }
}
