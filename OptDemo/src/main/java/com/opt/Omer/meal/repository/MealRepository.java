package com.opt.Omer.meal.repository;

import com.opt.Omer.meal.dtos.MealResponseDTO;
import com.opt.Omer.meal.entity.Meal;
import com.opt.Omer.response.Response;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MealRepository extends JpaRepository<Meal, Long> {

    Optional<Meal> findByPtIdAndCustomerIdAndDate(Long ptId, Long customerId, String date);
    List<Meal> findByPtIdAndCustomerId(Long ptId, Long customerId);

}
