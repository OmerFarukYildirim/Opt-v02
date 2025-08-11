package com.opt.Omer.appointment.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class AppointmentNoteRequestDTO {

    private Long id;

    private String noteText;

    private String attachmentUrl;

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;
}
