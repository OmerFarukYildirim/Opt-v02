package com.opt.Omer.workout.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@Table(name = "workouts")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Workout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long ptId;
    private Long customerId;
    private String date;

    @OneToMany(mappedBy = "workoutPlan", cascade = CascadeType.ALL)
    private List<WorkoutExercise> exercises;
}
