package com.opt.Omer.availability.services;

import com.opt.Omer.availability.dtos.AvailabilityRequestDTO;
import com.opt.Omer.availability.dtos.AvailabilityResponseDTO;
import com.opt.Omer.response.Response;

import java.util.List;

public interface AvailabilityService {

    Response<AvailabilityResponseDTO> createAvailability(AvailabilityRequestDTO availabilityRequestDTO);
    Response<List<AvailabilityResponseDTO>> getAvailabilitiesByAccessable();
    Response<List<AvailabilityResponseDTO>> getAllAvailabilities();
    Response<?> deleteAvailability(Long availabilityId);
    Response<?> makeAccessableTrue(Long availabilityId);
    Response<?> makeAccessableFalse(Long availabilityId);
    Response<List<AvailabilityResponseDTO>> getAvailabilitiesByDate(Long ptId, String date);
}
