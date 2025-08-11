package com.opt.Omer.meal.services;

import com.opt.Omer.auth_users.entity.User;
import com.opt.Omer.auth_users.services.UserService;
import com.opt.Omer.exceptions.BadRequestException;
import com.opt.Omer.exceptions.NotFoundException;
import com.opt.Omer.meal.dtos.MealItemRequestDTO;
import com.opt.Omer.meal.dtos.MealItemResponseDTO;
import com.opt.Omer.meal.entity.Meal;
import com.opt.Omer.meal.entity.MealItem;
import com.opt.Omer.meal.repository.MealItemRepository;
import com.opt.Omer.meal.repository.MealRepository;
import com.opt.Omer.response.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class MealItemServiceImpl implements MealItemService {

    private final MealItemRepository mealItemRepository;
    private final MealRepository mealRepository;
    private final ModelMapper modelMapper;
    private final UserService userService;


    @Override
    @Transactional
    public Response<MealItemResponseDTO> createMealItem(MealItemRequestDTO mealItemRequestDTO) {

        log.info("Inside createMealItem()");

        Meal meal = mealRepository.findById(mealItemRequestDTO.getMealId()).orElseThrow(() -> new NotFoundException("Meal not found"));

        MealItem mealItem = MealItem.builder().name(mealItemRequestDTO.getName()).description(mealItemRequestDTO.getDescription()).mealTime(mealItemRequestDTO.getMealTime()).youtubeUrl(mealItemRequestDTO.getYoutubeUrl()).mealPlan(meal).build();


        MealItem savedMealItem = mealItemRepository.save(mealItem);

        return Response.<MealItemResponseDTO>builder().statusCode(HttpStatus.OK.value()).message("MealItem created successfully").data(modelMapper.map(savedMealItem, MealItemResponseDTO.class)).build();
    }

    @Override
    @Transactional
    public Response<MealItemResponseDTO> updateMealItem(MealItemRequestDTO mealItemRequestDTO) {

        log.info("Inside updateMealItem()");

        // MealItem'ı ID'ye göre bul
        Optional<MealItem> existingMealItemOptional = mealItemRepository.findById(mealItemRequestDTO.getId());

        if (existingMealItemOptional.isPresent()) {
            MealItem existingMealItem = existingMealItemOptional.get();

            // Request DTO'dan gelen verilerle mevcut öğün öğesini güncelle
            // ModelMapper burada kısmi güncellemeyi de destekleyebilir,
            // ancak null değerlerin mevcut veriyi silmemesi için dikkatli olunmalıdır.
            // Örneğin, sadece name, description, youtubeUrl ve mealTime güncellenebilir.
            if (mealItemRequestDTO.getName() != null && !mealItemRequestDTO.getName().isBlank())
                existingMealItem.setName(mealItemRequestDTO.getName());
            if (mealItemRequestDTO.getDescription() != null && !mealItemRequestDTO.getDescription().isBlank())
                existingMealItem.setDescription(mealItemRequestDTO.getDescription());
            if (mealItemRequestDTO.getYoutubeUrl() != null && !mealItemRequestDTO.getYoutubeUrl().isBlank())
                existingMealItem.setYoutubeUrl(mealItemRequestDTO.getYoutubeUrl());
            if (mealItemRequestDTO.getMealTime() != null && !mealItemRequestDTO.getMealTime().isBlank())
                existingMealItem.setMealTime(mealItemRequestDTO.getMealTime());


            MealItem updatedMealItem = mealItemRepository.save(existingMealItem);
            MealItemResponseDTO mealItemResponseDTO = modelMapper.map(updatedMealItem, MealItemResponseDTO.class);

            return Response.<MealItemResponseDTO>builder().statusCode(HttpStatus.OK.value()).message("Öğün öğesi başarıyla güncellendi.").data(mealItemResponseDTO).build();
        } else {
            return Response.<MealItemResponseDTO>builder().statusCode(HttpStatus.NOT_FOUND.value()).message("Güncellenecek öğün öğesi bulunamadı.").data(null).build();
        }
    }

    @Override
    public Response<MealItemResponseDTO> getMealItemById(Long id) {

        log.info("Inside getMealItemById()");

        MealItem mealItem = mealItemRepository.findById(id).orElseThrow(() -> new NotFoundException("MealItem not found"));

        MealItemResponseDTO mealItemResponseDTO = modelMapper.map(mealItem, MealItemResponseDTO.class);

        return Response.<MealItemResponseDTO>builder().statusCode(HttpStatus.OK.value()).message("MealItem retrieved successfully").data(mealItemResponseDTO).build();
    }

    @Override
    public Response<?> deleteMealItem(Long id) {

        log.info("Inside deleteMealItem()");

        if (!mealItemRepository.existsById(id)) {
            throw new NotFoundException("Meal Item does not exists");
        }

        mealItemRepository.deleteById(id);

        return Response.builder().statusCode(HttpStatus.OK.value()).message("Meal Item deleted successfully").build();
    }

    @Override
    public Response<List<MealItemResponseDTO>> getMealItemsByMealId(Long mealId) {

        log.info("Inside getMealItemsByMealId()");

        List<MealItem> mealItems = mealItemRepository.findByMealPlanId(mealId);

        if (!mealItems.isEmpty()) {
            List<MealItemResponseDTO> mealItemResponseDTOS = mealItems.stream().map(mealItem -> modelMapper.map(mealItem, MealItemResponseDTO.class)).collect(Collectors.toList());

            return Response.<List<MealItemResponseDTO>>builder().statusCode(HttpStatus.OK.value()).message("Öğün öğeleri başarıyla getirildi.").data(mealItemResponseDTOS).build();
        } else {
            return Response.<List<MealItemResponseDTO>>builder().statusCode(HttpStatus.NOT_FOUND.value()).message("Bu öğün planına ait öğün öğesi bulunamadı.").data(Collections.emptyList()).build();
        }
    }
}

