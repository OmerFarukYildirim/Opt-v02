package com.opt.Omer.meal.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class MealItemResponseDTO {

    private Long id;
    private String name;
    private String description;
    private String youtubeUrl;
    private String mealTime;

}
