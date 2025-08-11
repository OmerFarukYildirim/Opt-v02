package com.opt.Omer.meal.controller;


import com.opt.Omer.meal.dtos.MealItemRequestDTO;
import com.opt.Omer.meal.dtos.MealItemResponseDTO;
import com.opt.Omer.meal.services.MealItemService;
import com.opt.Omer.response.Response;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mealitem")
@RequiredArgsConstructor
public class MealItemController {

    private final MealItemService mealItemService;

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ADMIN')")
    ResponseEntity<Response<MealItemResponseDTO>> createMealItem(@RequestBody @Valid MealItemRequestDTO mealItemRequestDTO){
        return ResponseEntity.ok(mealItemService.createMealItem(mealItemRequestDTO));
    }

    @PutMapping("/update")
    @PreAuthorize("hasAuthority('ADMIN')")
    ResponseEntity<Response<MealItemResponseDTO>> updateMealItem(@RequestBody MealItemRequestDTO mealItemRequestDTO){
        return ResponseEntity.ok(mealItemService.updateMealItem(mealItemRequestDTO));
    }

    @GetMapping("/getById/{id}")
    ResponseEntity<Response<MealItemResponseDTO>> getMealItemById(@PathVariable Long id){
        return ResponseEntity.ok(mealItemService.getMealItemById(id));
    }

    @GetMapping("/getAll/{mealId}")
    ResponseEntity<Response<List<MealItemResponseDTO>>> getMealItemsByMealId(@PathVariable Long mealId){
        return ResponseEntity.ok(mealItemService.getMealItemsByMealId(mealId));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    ResponseEntity<Response<?>> deleteMealItem(@PathVariable Long id){
        return ResponseEntity.ok(mealItemService.deleteMealItem(id));
    }
}
