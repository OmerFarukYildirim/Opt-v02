package com.opt.Omer.meal.services;


import com.opt.Omer.appointment.entity.Appointment;
import com.opt.Omer.auth_users.entity.User;
import com.opt.Omer.auth_users.services.UserService;
import com.opt.Omer.availability.dtos.AvailabilityResponseDTO;
import com.opt.Omer.availability.entity.Availability;
import com.opt.Omer.exceptions.NotFoundException;
import com.opt.Omer.meal.dtos.MealItemResponseDTO;
import com.opt.Omer.meal.dtos.MealRequestDTO;
import com.opt.Omer.meal.dtos.MealResponseDTO;
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

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MealServiceImpl implements MealService {

    private final MealRepository mealRepository;
    private final MealItemRepository mealItemRepository;
    private final ModelMapper modelMapper;


    @Override
    @Transactional
    public Response<MealResponseDTO> createMeal(MealRequestDTO mealRequestDTO) {
        log.info("Inside createMeal() for customer ID: {} and date: {}", mealRequestDTO.getCustomerId(), mealRequestDTO.getDate());

        // 1. MealRequestDTO'dan Meal entity'sini oluştur
        // Meal entity'sindeki mealItems listesi @OneToMany olduğu için,
        // Meal kaydedildikten sonra MealItem'lar ilişkilendirilebilir.
        Meal meal = Meal.builder()
                .ptId(mealRequestDTO.getPtId())
                .customerId(mealRequestDTO.getCustomerId())
                .date(mealRequestDTO.getDate())
                // mealItems burada set edilmeyecek, çünkü Meal kaydedildikten sonra ilişkilendirilecekler.
                .build();

        // 2. Meal entity'sini kaydet (ID'si oluşması için)
        Meal savedMeal = mealRepository.save(meal);
        log.info("Meal saved with ID: {}", savedMeal.getId());

        // 3. MealItem'ları işle ve kaydet (eğer varsa)
        if (mealRequestDTO.getMealItems() != null && !mealRequestDTO.getMealItems().isEmpty()) {
            List<MealItem> mealItems = mealRequestDTO.getMealItems().stream()
                    .map(itemDto -> {
                        MealItem mealItem = modelMapper.map(itemDto, MealItem.class);
                        mealItem.setMealPlan(savedMeal); // Yeni oluşturulan Meal ile ilişkilendir
                        return mealItem;
                    })
                    .collect(Collectors.toList());

            // Tüm meal item'ları kaydet
            mealItemRepository.saveAll(mealItems);
            log.info("{} meal items saved for Meal ID: {}", mealItems.size(), savedMeal.getId());

            // Kaydedilen meal item'ları savedMeal objesine geri set et
            // Bu, DTO'ya maplerken mealItems listesinin dolu olmasını sağlar.
            savedMeal.setMealItems(mealItems);
        }

        // 4. Kaydedilen Meal entity'sini MealResponseDTO'ya dönüştür
        MealResponseDTO mealResponseDTO = modelMapper.map(savedMeal, MealResponseDTO.class);

        // 5. Başarılı yanıtı döndür
        return Response.<MealResponseDTO>builder()
                .statusCode(HttpStatus.OK.value()) // 201 Created durum kodu
                .message("Öğün planı başarıyla oluşturuldu.") // Düzeltilmiş mesaj
                .data(mealResponseDTO) // Oluşturulan öğün planı verisini geri döndür
                .build();
    }

    @Override
    public Response<MealResponseDTO> getOwnMeal(Long ptId, Long customerId, String date) {

        log.info("Inside getOwnMeal()");

        Meal meal = mealRepository.findByPtIdAndCustomerIdAndDate(ptId,customerId,date)
                .orElse(null);

        MealResponseDTO mealResponseDTO = modelMapper.map(meal, MealResponseDTO.class);

        return Response.<MealResponseDTO>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Meal retrieved successfully")
                .data(mealResponseDTO)
                .build();
    }

    @Override
    public Response<?> deleteMeal(Long id) {

        log.info("Inside deleteCategory()");

        if (!mealRepository.existsById(id)){
            throw  new NotFoundException("Meal Not Found");
        }

        mealRepository.deleteById(id);


        return Response.builder()
                .statusCode(HttpStatus.OK.value())
                .message("Meal deleted successfully")
                .build();

    }

    @Override
    public Response<List<MealResponseDTO>> getOwnMeals(Long ptId, Long customerId) {

            log.info("Inside getAvailabilitiesByDate()");
            List<Meal> meals = mealRepository.findByPtIdAndCustomerId(ptId, customerId);

            List<MealResponseDTO> mealResponseDTOS = meals.stream()
                    .map(meal -> {
                        // Her bir availability nesnesini DTO'ya dönüştürüyoruz.
                        MealResponseDTO responseDTO = modelMapper.map(meal, MealResponseDTO.class);
                        String date = meal.getDate();
                        return responseDTO;
                    })
                    .sorted(Comparator.comparing(MealResponseDTO::getDate).reversed())
                    .toList();

            return Response.<List<MealResponseDTO>>builder()
                    .statusCode(HttpStatus.OK.value())
                    .message("availabilities retrieved successfully")
                    .data(mealResponseDTOS)
                    .build();
    }

}
