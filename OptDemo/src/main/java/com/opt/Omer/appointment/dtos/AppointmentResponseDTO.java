package com.opt.Omer.appointment.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.opt.Omer.enums.AppointmentStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class AppointmentResponseDTO {

    private Long id;

    private Long ptId;

    private Long customerId;

    private String date;

    private String startTime;

    private String endTime;

    private String videoCallUrl;

    private AppointmentStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<AppointmentNoteDTO> notes;
}
