package com.opt.Omer.meal.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Data
@Table(name = "meal_items")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MealItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;            // örn: Sabah Kahvaltısı
    private String description;     // örn: 2 yumurta, 1 dilim tam buğday
    private String youtubeUrl;      // örn: https://youtube.com/watch?v=omelet123

    @ManyToOne
    @JoinColumn(name = "meal_id")
    private Meal mealPlan;
    @NotBlank(message = "öğün zamanı girmeniz gerekiyor")
    private String mealTime;
}
