package com.opt.Omer.workout.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;


@Data
public class WorkoutRequestDTO {

    @NotNull(message = "PT ID is required")
    private Long ptId;

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotBlank(message = "Date is required")
    private String date;

    private List<WorkoutExerciseRequestDTO> exercises;
}
