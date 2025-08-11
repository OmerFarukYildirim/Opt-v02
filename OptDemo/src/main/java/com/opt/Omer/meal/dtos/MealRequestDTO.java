package com.opt.Omer.meal.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class MealRequestDTO {

    @NotNull(message = "PT ID required")
    private Long ptId;
    @NotNull(message = "Customer ID required")
    private Long customerId;
    @NotBlank(message = "date required")
    private String date;

    private List<MealItemRequestDTO> mealItems;


}
