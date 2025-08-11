package com.opt.Omer.workout.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WorkoutExerciseRequestDTO {

    private Long id;

    @NotBlank(message = "name is required")
    private String name;

    @NotBlank(message = "description is required")
    private String description;

    @NotBlank(message = "youtubeUrl is required")
    private String youtubeUrl;

    @NotBlank(message = "workoutTime is required")
    private String workoutTime;

    @NotNull(message = "Workout ID is required")
    private Long workoutId;
}
