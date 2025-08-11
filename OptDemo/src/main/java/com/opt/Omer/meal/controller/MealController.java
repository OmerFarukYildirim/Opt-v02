package com.opt.Omer.meal.controller;


import com.opt.Omer.meal.dtos.MealRequestDTO;
import com.opt.Omer.meal.dtos.MealResponseDTO;
import com.opt.Omer.meal.services.MealService;
import com.opt.Omer.response.Response;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meal")
@RequiredArgsConstructor
public class MealController {

    private final MealService mealService;

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ADMIN')")
    ResponseEntity<Response<MealResponseDTO>> createMeal(@RequestBody @Valid MealRequestDTO mealRequestDTO){
        return ResponseEntity.ok(mealService.createMeal(mealRequestDTO));
    }

    @GetMapping("/get")
    ResponseEntity<Response<MealResponseDTO>> getOwnMeal(
            @RequestParam Long ptId,
            @RequestParam Long customerId,
            @RequestParam String date
    ){
        return ResponseEntity.ok(mealService.getOwnMeal(ptId, customerId, date));
    }

    @GetMapping("/getMeals")
    ResponseEntity<Response<List<MealResponseDTO>>> getOwnMeals(
            @RequestParam Long ptId,
            @RequestParam Long customerId
    ){
        return ResponseEntity.ok(mealService.getOwnMeals(ptId, customerId));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    ResponseEntity<Response<?>> deleteMeal(@PathVariable Long id){
        return ResponseEntity.ok(mealService.deleteMeal(id));
    }
}
