package com.opt.Omer.workout.services;


import com.opt.Omer.exceptions.NotFoundException;
import com.opt.Omer.meal.dtos.MealResponseDTO;
import com.opt.Omer.meal.entity.Meal;
import com.opt.Omer.response.Response;
import com.opt.Omer.workout.dtos.WorkoutRequestDTO;
import com.opt.Omer.workout.dtos.WorkoutResponseDTO;
import com.opt.Omer.workout.entity.Workout;
import com.opt.Omer.workout.entity.WorkoutExercise;
import com.opt.Omer.workout.repository.WorkoutExercisesRepository;
import com.opt.Omer.workout.repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkoutServiceImpl implements WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final ModelMapper modelMapper;
    private final WorkoutExercisesRepository workoutExercisesRepository;


    @Override
    @Transactional
    public Response<WorkoutResponseDTO> createWorkout(WorkoutRequestDTO workoutRequestDTO) {
        log.info("Inside createWorkout() for customer ID: {} and date: {}", workoutRequestDTO.getCustomerId(), workoutRequestDTO.getDate());

        Workout workout = Workout.builder()
                .ptId(workoutRequestDTO.getPtId())
                .customerId(workoutRequestDTO.getCustomerId())
                .date(workoutRequestDTO.getDate())
                .build();

        Workout savedWorkout = workoutRepository.save(workout);
        log.info("Workout saved with ID: {}", savedWorkout.getId());

        if (workoutRequestDTO.getExercises() != null && !workoutRequestDTO.getExercises().isEmpty()) {
            List<WorkoutExercise> workoutExercises = workoutRequestDTO.getExercises().stream()
                    .map(exerciseDTO -> {
                        WorkoutExercise workoutExercise = modelMapper.map(exerciseDTO, WorkoutExercise.class);
                        workoutExercise.setWorkoutPlan(savedWorkout);
                        return workoutExercise;
                    })
                    .collect(Collectors.toList());

            workoutExercisesRepository.saveAll(workoutExercises);
            log.info("{} meal items saved for Meal ID: {}", workoutExercises.size(), savedWorkout.getId());

            savedWorkout.setExercises(workoutExercises);
        }

        WorkoutResponseDTO workoutResponseDTO = modelMapper.map(savedWorkout, WorkoutResponseDTO.class);

        return Response.<WorkoutResponseDTO>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Öğün planı başarıyla oluşturuldu.")
                .data(workoutResponseDTO)
                .build();
    }

    @Override
    public Response<WorkoutResponseDTO> getOwnWorkout(Long ptId, Long customerId, String date) {
        log.info("Inside getOwnWorkout()");

        Workout workout = workoutRepository.findByPtIdAndCustomerIdAndDate(ptId,customerId,date).orElse(null);

        WorkoutResponseDTO workoutResponseDTO = modelMapper.map(workout, WorkoutResponseDTO.class);

        return Response.<WorkoutResponseDTO>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Workout retrieved successfully")
                .data(workoutResponseDTO)
                .build();
    }

    @Override
    public Response<?> deleteWorkout(Long id) {
        log.info("Inside deleteWorkout()");

        if (!workoutRepository.existsById(id)){
            throw  new NotFoundException("Workout Not Found");
        }
        workoutRepository.deleteById(id);

        return Response.builder()
                .statusCode(HttpStatus.OK.value())
                .message("Workout deleted successfully")
                .build();
    }

    @Override
    public Response<List<WorkoutResponseDTO>> getOwnWorkouts(Long ptId, Long customerId) {
        log.info("Inside getAvailabilitiesByDate()");
        List<Workout> workouts = workoutRepository.findByPtIdAndCustomerId(ptId, customerId);

        List<WorkoutResponseDTO> workoutResponseDTOS = workouts.stream()
                .map(workout -> {
                    // Her bir availability nesnesini DTO'ya dönüştürüyoruz.
                    WorkoutResponseDTO responseDTO = modelMapper.map(workout, WorkoutResponseDTO.class);
                    String date = workout.getDate();
                    return responseDTO;
                })
                .sorted(Comparator.comparing(WorkoutResponseDTO::getDate).reversed())
                .toList();

        return Response.<List<WorkoutResponseDTO>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("availabilities retrieved successfully")
                .data(workoutResponseDTOS)
                .build();
    }
}
