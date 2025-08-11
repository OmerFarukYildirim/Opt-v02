package com.opt.Omer.meal.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class MealResponseDTO {

    private Long id;
    private Long ptId;
    private Long customerId;
    private String date;

    private List<MealItemResponseDTO> mealItems;
}
