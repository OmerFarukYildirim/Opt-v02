package com.opt.Omer.workout.dtos;

import lombok.Data;

@Data
public class WorkoutExerciseResponseDTO {

    private Long id;
    private String name;
    private String description;
    private String youtubeUrl;
    private String workoutTime;
}
