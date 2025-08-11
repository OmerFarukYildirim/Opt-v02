package com.opt.Omer.workout.services;

import com.opt.Omer.exceptions.NotFoundException;
import com.opt.Omer.meal.dtos.MealItemResponseDTO;
import com.opt.Omer.meal.entity.Meal;
import com.opt.Omer.meal.entity.MealItem;
import com.opt.Omer.response.Response;
import com.opt.Omer.workout.dtos.WorkoutExerciseRequestDTO;
import com.opt.Omer.workout.dtos.WorkoutExerciseResponseDTO;
import com.opt.Omer.workout.dtos.WorkoutRequestDTO;
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

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkoutExercisesServiceImpl implements WorkoutExercisesService {

    private final WorkoutExercisesRepository workoutExercisesRepository;
    private final WorkoutRepository workoutRepository;
    private final ModelMapper modelMapper;


    @Override
    @Transactional
    public Response<WorkoutExerciseResponseDTO> createWorkoutExercise(WorkoutExerciseRequestDTO workoutExerciseRequestDTO) {
        log.info("Inside createWorkoutExercise()");

        Workout workout = workoutRepository.findById(workoutExerciseRequestDTO.getWorkoutId())
                .orElseThrow(() -> new NotFoundException("Meal not found"));

        WorkoutExercise workoutExercise = WorkoutExercise.builder()
                .name(workoutExerciseRequestDTO.getName())
                .description(workoutExerciseRequestDTO.getDescription())
                .workoutTime(workoutExerciseRequestDTO.getWorkoutTime())
                .youtubeUrl(workoutExerciseRequestDTO.getYoutubeUrl())
                .workoutPlan(workout)
                .build();


        WorkoutExercise savedWorkoutExercise = workoutExercisesRepository.save(workoutExercise);

        return Response.<WorkoutExerciseResponseDTO>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Workout Exercise created successfully")
                .data(modelMapper.map(savedWorkoutExercise, WorkoutExerciseResponseDTO.class))
                .build();
    }

    @Override
    @Transactional
    public Response<WorkoutExerciseResponseDTO> updateWorkoutExercise(WorkoutExerciseRequestDTO workoutExerciseRequestDTO) {
        log.info("Inside updateMealItem()");

        Optional<WorkoutExercise> existingWorkoutExerciseOptional = workoutExercisesRepository.findById(workoutExerciseRequestDTO.getId());

        if (existingWorkoutExerciseOptional.isPresent()) {
            WorkoutExercise existingWorkoutExercise = existingWorkoutExerciseOptional.get();

            if(workoutExerciseRequestDTO.getName()!=null && !workoutExerciseRequestDTO.getName().isBlank())
                existingWorkoutExercise.setName(workoutExerciseRequestDTO.getName());

            if(workoutExerciseRequestDTO.getDescription()!=null && !workoutExerciseRequestDTO.getDescription().isBlank())
                existingWorkoutExercise.setDescription(workoutExerciseRequestDTO.getDescription());

            if(workoutExerciseRequestDTO.getYoutubeUrl()!=null && !workoutExerciseRequestDTO.getYoutubeUrl().isBlank())
                existingWorkoutExercise.setYoutubeUrl(workoutExerciseRequestDTO.getYoutubeUrl());

            if(workoutExerciseRequestDTO.getWorkoutTime()!=null && !workoutExerciseRequestDTO.getWorkoutTime().isBlank())
                existingWorkoutExercise.setWorkoutTime(workoutExerciseRequestDTO.getWorkoutTime());


            WorkoutExercise updatedWorkoutExercise = workoutExercisesRepository.save(existingWorkoutExercise);
            WorkoutExerciseResponseDTO workoutExerciseResponseDTO = modelMapper.map(updatedWorkoutExercise, WorkoutExerciseResponseDTO.class);

            return Response.<WorkoutExerciseResponseDTO>builder()
                    .statusCode(HttpStatus.OK.value())
                    .message("Spor hareketi başarıyla güncellendi.")
                    .data(workoutExerciseResponseDTO)
                    .build();
        } else {
            return Response.<WorkoutExerciseResponseDTO>builder()
                    .statusCode(HttpStatus.NOT_FOUND.value())
                    .message("Güncellenecek spor hareketi bulunamadı.")
                    .data(null)
                    .build();
        }
    }

    @Override
    public Response<WorkoutExerciseResponseDTO> getWorkoutExerciseById(Long id) {
        log.info("Inside getWorkoutExerciseById()");

        WorkoutExercise workoutExercise =  workoutExercisesRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("MealItem not found"));

        WorkoutExerciseResponseDTO workoutExerciseResponseDTO = modelMapper.map(workoutExercise, WorkoutExerciseResponseDTO.class);

        return Response.<WorkoutExerciseResponseDTO>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Workout Exercise retrieved successfully")
                .data(workoutExerciseResponseDTO)
                .build();
    }

    @Override
    public Response<List<WorkoutExerciseResponseDTO>> getWorkoutExercisesByWorkoutId(Long workoutId) {
        log.info("Inside getWorkoutExercisesByWorkoutId()");

        List<WorkoutExercise> workoutExercises = workoutExercisesRepository.findByWorkoutPlanId(workoutId);

        if (!workoutExercises.isEmpty()) {
            List<WorkoutExerciseResponseDTO> workoutExerciseResponseDTOS = workoutExercises.stream()
                    .map(workoutExercise -> modelMapper.map(workoutExercise, WorkoutExerciseResponseDTO.class))
                    .collect(Collectors.toList());

            return Response.<List<WorkoutExerciseResponseDTO>>builder()
                    .statusCode(HttpStatus.OK.value())
                    .message("Spor hareketleri başarıyla getirildi.")
                    .data(workoutExerciseResponseDTOS).build();
        } else {
            return Response.<List<WorkoutExerciseResponseDTO>>builder()
                    .statusCode(HttpStatus.NOT_FOUND.value())
                    .message("Bu spor planına ait spor hareketi bulunamadı.")
                    .data(Collections.emptyList()).build();
        }
    }

    @Override
    public Response<?> deleteWorkoutExercise(Long id) {
        log.info("Inside deleteWorkoutExercise()");

        if (!workoutExercisesRepository.existsById(id)) {
            throw new NotFoundException("Workout exercise does not exists");
        }

        workoutExercisesRepository.deleteById(id);

        return Response.builder()
                .statusCode(HttpStatus.OK.value())
                .message("Workout exercise deleted successfully")
                .build();
    }
}
