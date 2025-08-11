package com.opt.Omer.appointment.controller;


import com.opt.Omer.appointment.dtos.AppointmentNoteDTO;
import com.opt.Omer.appointment.dtos.AppointmentNoteRequestDTO;
import com.opt.Omer.appointment.dtos.AppointmentRequestDTO;
import com.opt.Omer.appointment.dtos.AppointmentResponseDTO;
import com.opt.Omer.appointment.services.AppointmentService;
import com.opt.Omer.response.Response;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointment")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping("/createAppointment")
    ResponseEntity<Response<AppointmentResponseDTO>> createAppointment(@RequestBody @Valid AppointmentRequestDTO appointmentRequestDTO){
        return ResponseEntity.ok(appointmentService.createAppointment(appointmentRequestDTO));
    }

    @PutMapping("/cancel/{appointmentId}")
    ResponseEntity<Response<AppointmentResponseDTO>> cancelAppointment(@PathVariable Long appointmentId){
        return ResponseEntity.ok(appointmentService.cancelAppointment(appointmentId));
    }

    @DeleteMapping("/delete/{appointmentId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    ResponseEntity<Response<?>>deleteAppointment(@PathVariable Long appointmentId){
        return ResponseEntity.ok(appointmentService.deleteAppointment(appointmentId));
    }

    @GetMapping("/{customerId}")
    ResponseEntity<Response<List<AppointmentResponseDTO>>> getAppointmentsByCustomerId(@PathVariable Long customerId){
        return ResponseEntity.ok(appointmentService.getAppointmentsByCustomerId(customerId));
    }

    @GetMapping("/getNotes/{appointmentId}")
    ResponseEntity<Response<List<AppointmentNoteDTO>>> getAppointmentNotesByAppointmentId(@PathVariable Long appointmentId){
        return ResponseEntity.ok(appointmentService.getAppointmentNotesByAppointmentId(appointmentId));
    }

    @PostMapping("/createNote")
    @PreAuthorize("hasAuthority('ADMIN')")
    ResponseEntity<Response<AppointmentNoteDTO>> createAppointmentNote(@RequestBody @Valid AppointmentNoteRequestDTO appointmentNoteRequestDTO){
        return ResponseEntity.ok(appointmentService.createAppointmentNote(appointmentNoteRequestDTO));
    }

    @DeleteMapping("/deleteNote/{appointmentNoteId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    ResponseEntity<Response<?>> deleteAppointmentNote(@PathVariable Long appointmentNoteId){
        return ResponseEntity.ok(appointmentService.deleteAppointmentNote(appointmentNoteId));
    }

    @PutMapping("/updateNote")
    @PreAuthorize("hasAuthority('ADMIN')")
    ResponseEntity<Response<AppointmentNoteDTO>> updateAppointmentNote(@RequestBody AppointmentNoteRequestDTO appointmentNoteRequestDTO){
        return ResponseEntity.ok(appointmentService.updateAppointmentNote(appointmentNoteRequestDTO));
    }

    @GetMapping("/getAppointment")
    ResponseEntity<Response<AppointmentResponseDTO>> getAppointmentByDateAndStartTime(@RequestParam String date, @RequestParam String startTime) {
        return ResponseEntity.ok(appointmentService.getAppointmentByDateAndStartTime(date,startTime));
    }
}
