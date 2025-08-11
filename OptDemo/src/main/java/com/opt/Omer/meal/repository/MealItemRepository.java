package com.opt.Omer.meal.repository;


import com.opt.Omer.meal.entity.MealItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface MealItemRepository extends JpaRepository<MealItem, Long> {

    List<MealItem> findByMealPlanId(Long mealPlanId);
}
