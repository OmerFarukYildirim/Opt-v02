package com.opt.Omer.availability.services;

import com.opt.Omer.appointment.entity.Appointment;
import com.opt.Omer.appointment.repository.AppointmentRepository;
import com.opt.Omer.availability.dtos.AvailabilityRequestDTO;
import com.opt.Omer.availability.dtos.AvailabilityResponseDTO;
import com.opt.Omer.availability.entity.Availability;
import com.opt.Omer.availability.repository.AvailabilityRepository;
import com.opt.Omer.exceptions.NotFoundException;
import com.opt.Omer.response.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AvailabilityServiceImpl implements AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final ModelMapper modelMapper;
    private final AppointmentRepository appointmentRepository;

    @Override
    @Transactional
    public Response<AvailabilityResponseDTO> createAvailability(AvailabilityRequestDTO availabilityRequestDTO) {
        log.info("Inside createAvailability()");

        Availability availability = Availability.builder()
                .ptId(availabilityRequestDTO.getPtId())
                .date(availabilityRequestDTO.getDate())
                .startTime(availabilityRequestDTO.getStartTime())
                .endTime(availabilityRequestDTO.getEndTime())
                .isAccessible(true)
                .build();

        Availability savedAvailability = availabilityRepository.save(availability);

        AvailabilityResponseDTO availabilityResponseDTO = modelMapper.map(savedAvailability, AvailabilityResponseDTO.class);

        return Response.<AvailabilityResponseDTO>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Müsaitlik başarıyla oluşturuldu.")
                .data(availabilityResponseDTO)
                .build();
    }

    @Override
    public Response<List<AvailabilityResponseDTO>> getAvailabilitiesByAccessable() {

        log.info("Inside getAvailabilitiesByAccessable()");
        List<Availability> availabilities = availabilityRepository.findAvailabilitiesByIsAccassable();

        List<AvailabilityResponseDTO> availabilityResponseDTOS = availabilities.stream()
                .map(availability -> modelMapper.map(availability, AvailabilityResponseDTO.class))
                .toList();


        return Response.<List<AvailabilityResponseDTO>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("True availabilities retrieved successfully")
                .data(availabilityResponseDTOS)
                .build();
    }

    @Override
    public Response<List<AvailabilityResponseDTO>> getAvailabilitiesByDate(Long ptId, String date) {

        log.info("Inside getAvailabilitiesByDate()");
        List<Availability> availabilities = availabilityRepository.findByPtIdAndDate(ptId, date);

        List<AvailabilityResponseDTO> availabilityResponseDTOS = availabilities.stream()
                .map(availability -> {
                    // Her bir availability nesnesini DTO'ya dönüştürüyoruz.
                    AvailabilityResponseDTO responseDTO = modelMapper.map(availability, AvailabilityResponseDTO.class);
                    String startTime = availability.getStartTime();

                    // Eğer müsaitlik durumu 'accessible=false' ise, ilgili randevu bilgilerini çekiyoruz.
                    if (!availability.isAccessible()) {
                        Appointment appointment = appointmentRepository.findByDateAndStartTime(date, startTime);
                        if (appointment != null) {
                            // Randevunun durumunu (status) DTO'ya ekliyoruz.
                            responseDTO.setStatus(appointment.getStatus());
                        }
                    }
                    return responseDTO;
                })
                .sorted(Comparator.comparing(AvailabilityResponseDTO::getStartTime))
                .toList();

        return Response.<List<AvailabilityResponseDTO>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("availabilities retrieved successfully")
                .data(availabilityResponseDTOS)
                .build();
    }

    @Override
    public Response<List<AvailabilityResponseDTO>> getAllAvailabilities() { // sadece pt bunu çağırabilir. bunu çağırdıktan sonra istediği availabilityleri aktif eder.
        log.info("Inside getAllAvailabilities()");
        List<Availability> availabilities = availabilityRepository.findAll();

        List<AvailabilityResponseDTO> availabilityResponseDTOS = availabilities.stream()
                .map(availability -> modelMapper.map(availability, AvailabilityResponseDTO.class))
                .toList();


        return Response.<List<AvailabilityResponseDTO>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("All availabilities retrieved successfully")
                .data(availabilityResponseDTOS)
                .build();
    }

    @Override
    public Response<?> deleteAvailability(Long availabilityId) {
        log.info("Inside deleteAvailability()");
        if (!availabilityRepository.existsById(availabilityId)){
            throw  new NotFoundException("Category Not Found");
        }
        availabilityRepository.deleteById(availabilityId);

        return Response.builder()
                .statusCode(HttpStatus.OK.value())
                .message("Availability deleted successfully")
                .build();
    }

    @Override
    public Response<?> makeAccessableTrue(Long availabilityId) {
        log.info("Inside makeAccessableTrue()");

        Availability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new NotFoundException("Availability Not Found"));

        availability.setAccessible(true);
        availabilityRepository.save(availability);
        return Response.builder()
                .statusCode(HttpStatus.OK.value())
                .message("Availability's accessable maked true")
                .build();
    }

    @Override
    public Response<?> makeAccessableFalse(Long availabilityId) {
        log.info("Inside makeAccessableFalse()");

        Availability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new NotFoundException("Availability Not Found"));

        availability.setAccessible(false);
        availabilityRepository.save(availability);
        return Response.builder()
                .statusCode(HttpStatus.OK.value())
                .message("Availability's accessable maked false")
                .build();
    }
}
