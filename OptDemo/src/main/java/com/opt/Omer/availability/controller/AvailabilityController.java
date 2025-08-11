package com.opt.Omer.availability.controller;

import com.opt.Omer.availability.dtos.AvailabilityRequestDTO;
import com.opt.Omer.availability.dtos.AvailabilityResponseDTO;
import com.opt.Omer.availability.services.AvailabilityService;
import com.opt.Omer.response.Response;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/availability")
public class AvailabilityController{

    private final AvailabilityService availabilityService;

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response<AvailabilityResponseDTO>> createAvailability(@RequestBody @Valid AvailabilityRequestDTO availabilityRequestDTO){
        return ResponseEntity.ok(availabilityService.createAvailability(availabilityRequestDTO));
    }

    @GetMapping("/accessible")
    public ResponseEntity<Response<List<AvailabilityResponseDTO>>> getAvailabilitiesByAccessible(){
        return ResponseEntity.ok(availabilityService.getAvailabilitiesByAccessable());
    }

    @GetMapping("/all")
    //@PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response<List<AvailabilityResponseDTO>>> getAllAvailabilities(){
        return ResponseEntity.ok(availabilityService.getAllAvailabilities());
    }

    @DeleteMapping("/{availabilityId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response<?>> deleteAvailability(@PathVariable Long availabilityId){
        return ResponseEntity.ok(availabilityService.deleteAvailability(availabilityId));
    }

    @PutMapping("/makeTrue/{availabilityId}")
    //@PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response<?>> makeAccessableTrue(@PathVariable Long availabilityId){
        return ResponseEntity.ok(availabilityService.makeAccessableTrue(availabilityId));
    }

    @PutMapping("/makeFalse/{availabilityId}")
    //@PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response<?>> makeAccessableFalse(@PathVariable Long availabilityId){
        return ResponseEntity.ok(availabilityService.makeAccessableFalse(availabilityId));
    }

    @GetMapping("/date")
    Response<List<AvailabilityResponseDTO>> getAvailabilitiesByDate(
            @RequestParam Long ptId,
            @RequestParam String date){
        return availabilityService.getAvailabilitiesByDate(ptId,date);
    }
}
