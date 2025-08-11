package com.opt.Omer.meal.services;

import com.opt.Omer.meal.dtos.MealRequestDTO;
import com.opt.Omer.meal.dtos.MealResponseDTO;
import com.opt.Omer.response.Response;

import java.util.List;

public interface MealService {

    Response<MealResponseDTO> createMeal(MealRequestDTO mealRequestDTO);
    Response<MealResponseDTO> getOwnMeal(Long ptId, Long customerId, String date);
    Response<?> deleteMeal(Long id);
    Response<List<MealResponseDTO>> getOwnMeals(Long ptId, Long customerId);

}
