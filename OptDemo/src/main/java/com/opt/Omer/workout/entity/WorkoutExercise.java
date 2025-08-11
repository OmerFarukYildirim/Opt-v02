package com.opt.Omer.workout.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Entity
@Data
@Table(name = "workout_exercises")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WorkoutExercise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;          // örn: Push-up
    private String description;   // örn: Göğüs kası için
    private String youtubeUrl;    // örn: https://youtube.com/watch?v=abc123

    @ManyToOne
    @JoinColumn(name = "workout_plan_id")
    private Workout workoutPlan;

    @NotBlank(message = "çalışma zamanı girmeniz gerekiyor")
    private String workoutTime;
}
