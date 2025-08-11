package com.opt.Omer.appointment.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.opt.Omer.appointment.entity.Appointment;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class AppointmentNoteDTO {

    private Long id;

    private String noteText;

    private String attachmentUrl;


}
