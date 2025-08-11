package com.opt.Omer.workout.dtos;

import lombok.Data;

import java.util.List;

@Data
public class WorkoutResponseDTO {

    private Long id;
    private Long ptId;
    private Long customerId;
    private String date;

    private List<WorkoutExerciseResponseDTO> exercises;
}
