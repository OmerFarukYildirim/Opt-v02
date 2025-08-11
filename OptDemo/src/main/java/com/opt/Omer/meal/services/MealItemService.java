package com.opt.Omer.meal.services;

import com.opt.Omer.meal.dtos.MealItemRequestDTO;
import com.opt.Omer.meal.dtos.MealItemResponseDTO;
import com.opt.Omer.response.Response;

import java.util.List;

public interface MealItemService {

    Response<MealItemResponseDTO> createMealItem(MealItemRequestDTO mealItemRequestDTO);

    Response<MealItemResponseDTO> updateMealItem(MealItemRequestDTO mealItemRequestDTO);

    Response<MealItemResponseDTO> getMealItemById(Long id);

    Response<List<MealItemResponseDTO>> getMealItemsByMealId(Long mealId);

    Response<?> deleteMealItem(Long id);
}
