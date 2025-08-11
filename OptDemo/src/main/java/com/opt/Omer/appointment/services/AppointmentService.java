package com.opt.Omer.appointment.services;

import com.opt.Omer.appointment.dtos.AppointmentNoteDTO;
import com.opt.Omer.appointment.dtos.AppointmentNoteRequestDTO;
import com.opt.Omer.appointment.dtos.AppointmentRequestDTO;
import com.opt.Omer.appointment.dtos.AppointmentResponseDTO;
import com.opt.Omer.response.Response;

import java.util.List;

public interface AppointmentService {

    Response<AppointmentResponseDTO> createAppointment(AppointmentRequestDTO appointmentRequestDTO);
    void markOverdueAppointmentsAsCompleted();
    Response<AppointmentResponseDTO> cancelAppointment(Long appointmentId); // kullanıcı için
    Response<?> deleteAppointment(Long appointmentId);
    Response<List<AppointmentResponseDTO>> getAppointmentsByCustomerId(Long customerId);
    Response<List<AppointmentNoteDTO>> getAppointmentNotesByAppointmentId(Long appointmentId);
    Response<AppointmentNoteDTO> createAppointmentNote(AppointmentNoteRequestDTO appointmentNoteRequestDTO);
    Response<?> deleteAppointmentNote(Long appointmentNoteId);
    Response<AppointmentNoteDTO> updateAppointmentNote(AppointmentNoteRequestDTO appointmentNoteRequestDTO);
    Response<AppointmentResponseDTO> getAppointmentByDateAndStartTime(String date, String startTime);

}
