package com.opt.Omer.appointment.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class AppointmentRequestDTO {

    @NotNull(message = "PT ID required")
    private Long ptId;

    @NotNull(message = "Customer ID required")
    private Long customerId;

    private String date;

    private String startTime;

    private String endTime;

    private String videoCallUrl;

    private List<AppointmentNoteDTO> notes;

    @NotNull(message = "Availability ID required")
    private Long availabilityId;
}
