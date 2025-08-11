package com.opt.Omer.meal.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class MealItemRequestDTO {

    private Long id;
    @NotBlank(message = "Meal name is required")
    private String name;
    private String description;
    private String youtubeUrl;
    @NotBlank(message = "Meal time is required")
    private String mealTime;


    @NotNull(message = "Meal ID is required")
    private Long mealId;
}
