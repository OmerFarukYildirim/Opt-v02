package com.opt.Omer.appointment.services;


import com.opt.Omer.appointment.dtos.AppointmentNoteDTO;
import com.opt.Omer.appointment.dtos.AppointmentNoteRequestDTO;
import com.opt.Omer.appointment.dtos.AppointmentRequestDTO;
import com.opt.Omer.appointment.dtos.AppointmentResponseDTO;
import com.opt.Omer.appointment.entity.Appointment;
import com.opt.Omer.appointment.entity.AppointmentNote;
import com.opt.Omer.appointment.repository.AppointmentNoteRepository;
import com.opt.Omer.appointment.repository.AppointmentRepository;
import com.opt.Omer.auth_users.entity.User;
import com.opt.Omer.auth_users.repository.UserRepository;
import com.opt.Omer.auth_users.services.UserService;
import com.opt.Omer.availability.entity.Availability;
import com.opt.Omer.availability.repository.AvailabilityRepository;
import com.opt.Omer.enums.AppointmentStatus;
import com.opt.Omer.enums.NotificationType;
import com.opt.Omer.enums.SubscriptionStatus;
import com.opt.Omer.exceptions.BadRequestException;
import com.opt.Omer.exceptions.NotFoundException;
import com.opt.Omer.notification.dtos.NotificationDTO;
import com.opt.Omer.notification.services.NotificationService;
import com.opt.Omer.response.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentNoteRepository appointmentNoteRepository;
    private final ModelMapper modelMapper;
    private final AvailabilityRepository availabilityRepository;
    private final UserService userService;
    private final NotificationService notificationService; // NotificationService'i ekleyin
    private final SpringTemplateEngine templateEngine; // TemplateEngine'i ekleyin
    private final UserRepository userRepository;

    @Override
    @Transactional
    public Response<AppointmentResponseDTO> createAppointment(AppointmentRequestDTO appointmentRequestDTO) {
        log.info("Inside createAppointment() for customer ID: {} and date: {}", appointmentRequestDTO.getCustomerId(), appointmentRequestDTO.getDate());

        Availability availability = availabilityRepository.findById(appointmentRequestDTO.getAvailabilityId())
                .orElseThrow(()-> new NotFoundException("Availability not found"));

        Appointment appointment1 = appointmentRepository.findByDateAndStartTime(
                appointmentRequestDTO.getDate(),
                appointmentRequestDTO.getStartTime()
        );

        if (appointment1 != null) {
            throw new BadRequestException("Randevu daha önce alınmış");
        }else{
            if(availability.isAccessible()){
                Appointment appointment = Appointment.builder()
                        .ptId(appointmentRequestDTO.getPtId())
                        .customerId(appointmentRequestDTO.getCustomerId())
                        .date(availability.getDate())
                        .startTime(availability.getStartTime())
                        .endTime(availability.getEndTime())
                        .createdAt(LocalDateTime.now())
                        .status(AppointmentStatus.BOOKED)
                        .videoCallUrl(appointmentRequestDTO.getVideoCallUrl())
                        .build();

                Appointment savedAppointment = appointmentRepository.save(appointment);
                log.info("Appointment saved with ID: {}", savedAppointment.getId());

                if (appointmentRequestDTO.getNotes() != null && !appointmentRequestDTO.getNotes().isEmpty()) {
                    List<AppointmentNote> appointmentNotes = appointmentRequestDTO.getNotes().stream()
                            .map(noteDTO -> {
                                AppointmentNote appointmentNote = modelMapper.map(noteDTO, AppointmentNote.class);
                                appointmentNote.setAppointment(savedAppointment);
                                return appointmentNote;
                            })
                            .collect(Collectors.toList());

                    appointmentNoteRepository.saveAll(appointmentNotes);
                    log.info("{} appointment notes saved for Appointment ID: {}", appointmentNotes.size(), savedAppointment.getId());

                    savedAppointment.setNotes(appointmentNotes);
                }

                // E-posta gönderimi için gerekli verileri hazırlayın
                try {
                    User customer = userRepository.findById(savedAppointment.getCustomerId()).orElseThrow(()-> new NotFoundException("Customer not found"));
                    User trainer = userRepository.findById(savedAppointment.getPtId()).orElseThrow(()-> new NotFoundException("Trainer not found"));

                    Context context = new Context();
                    context.setVariable("customerName", customer.getName());
                    context.setVariable("trainerName", trainer.getName());
                    context.setVariable("appointmentDate", savedAppointment.getDate().toString());
                    context.setVariable("appointmentTime", savedAppointment.getStartTime().toString());
                    context.setVariable("appointmentType", "Online Seans"); // Bu alanı dinamik hale getirebilirsiniz
                    context.setVariable("joinLink", savedAppointment.getVideoCallUrl());
                    context.setVariable("currentYear", LocalDateTime.now().getYear());

                    String htmlContent = templateEngine.process("appointment-confirmation", context);

                    NotificationDTO notificationDTO = NotificationDTO.builder()
                            .recipient(customer.getEmail())
                            .subject("Randevu Onayınız")
                            .body(htmlContent)
                            .type(NotificationType.EMAIL)
                            .isHtml(true)
                            .build();

                    notificationService.sendEmail(notificationDTO);
                    log.info("Appointment confirmation email sent to customer: {}", customer.getEmail());

                } catch (Exception e) {
                    log.error("Failed to send appointment confirmation email: {}", e.getMessage());
                    // Hata durumunda bile randevu oluşturma işleminin devam etmesini sağlayın
                }

                AppointmentResponseDTO appointmentResponseDTO = modelMapper.map(savedAppointment, AppointmentResponseDTO.class);

                return Response.<AppointmentResponseDTO>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Randevu başarıyla oluşturuldu.")
                        .data(appointmentResponseDTO)
                        .build();
            } else {
                return Response.<AppointmentResponseDTO>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Hocanızın müsait olduğu bir randevuyu seçin.")
                        .build();
            }
        }
    }

    @Override
    @Scheduled(fixedRate = 900000) // 15 dakika = 900000 milisaniye // bu anatasyon springin otomatik olarak 15dkda bir fonksiyonu çağırmasını sağlar.
    @Transactional
    public void markOverdueAppointmentsAsCompleted() {
        // Güncel zamanı Java tarafında oluşturup parametre olarak geçirin
        int updatedCount = appointmentRepository.completeOverdueAppointments(LocalDateTime.now());
        System.out.println(updatedCount + " adet randevu tamamlandı olarak işaretlendi.");
    }

    @Override
    public Response<AppointmentResponseDTO> cancelAppointment(Long appointmentId) {
        log.info("Inside cancelAppointment()");

        User currentUser = userService.getCurrentLoggedInUser();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(()-> new NotFoundException("Appointment not found"));

        // *** GÜVENLİK KONTROLÜ ***
        // Randevunun sahibi ile mevcut kullanıcıyı karşılaştırıyoruz
        log.info("Appointment PT ID: {}", appointment.getPtId());
        log.info("Current User ID: {}", currentUser.getId());
        if(currentUser.getSubscriptionStatus() == SubscriptionStatus.ACTIVE){
            log.info("active e girdi: {}", currentUser.getSubscriptionStatus());
            if (!appointment.getCustomerId().equals(currentUser.getId())) {
                return Response.<AppointmentResponseDTO>builder()
                        .statusCode(HttpStatus.FORBIDDEN.value())
                        .message("Bu randevuyu iptal etme yetkiniz yok.")
                        .build();
            }
        }else if(currentUser.getSubscriptionStatus() == SubscriptionStatus.ADMIN){
            log.info("Admıne girdi {}", currentUser.getSubscriptionStatus());
            if (!appointment.getPtId().equals(currentUser.getId())) {
                return Response.<AppointmentResponseDTO>builder()
                        .statusCode(HttpStatus.FORBIDDEN.value())
                        .message("Bu randevuyu iptal etme yetkiniz yok.")
                        .build();
            }
        }


        // Mevcut randevu nesnesinin durumunu doğrudan güncelleyin.
        appointment.setStatus(AppointmentStatus.CANCELLED);

        // Güncellenmiş nesneyi veritabanına kaydedin.
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Kaydedilen nesneyi DTO'ya çevirerek geri döndürün.
        AppointmentResponseDTO appointmentResponseDTO = modelMapper.map(savedAppointment, AppointmentResponseDTO.class);

        return Response.<AppointmentResponseDTO>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Appointment cancelled successfully")
                .data(appointmentResponseDTO)
                .build();
    }

    @Override
    public Response<?> deleteAppointment(Long appointmentId) {
        log.info("Inside deleteAppointment()");
        
        if (!appointmentRepository.existsById(appointmentId)){
            throw  new NotFoundException("Category Not Found");
        }

        appointmentRepository.deleteById(appointmentId);

        return Response.builder()
                .statusCode(HttpStatus.OK.value())
                .message("Appointment deleted successfully")
                .build();
    }

    @Override
    public Response<List<AppointmentResponseDTO>> getAppointmentsByCustomerId(Long customerId) {
        log.info("Inside getAppointmentsByCustomerId()");

        List<Appointment> appointments = appointmentRepository.findByCustomerId(customerId);


        if (!appointments.isEmpty()) {
            List<AppointmentResponseDTO> appointmentResponseDTOS = appointments.stream()
                    .map(appointment -> modelMapper.map(appointment, AppointmentResponseDTO.class))
                    .toList();

            return Response.<List<AppointmentResponseDTO>>builder()
                    .statusCode(HttpStatus.OK.value())
                    .message("Randevu notları başarıyla getirildi.")
                    .data(appointmentResponseDTOS)
                    .build();
        } else {
            return Response.<List<AppointmentResponseDTO>>builder()
                    .statusCode(HttpStatus.NOT_FOUND.value())
                    .message("Bu randevuya ait notlar bulunamadı.")
                    .data(Collections.emptyList()).build();
        }
    }

    @Override
    public Response<List<AppointmentNoteDTO>> getAppointmentNotesByAppointmentId(Long appointmentId) {
        log.info("Inside getAppointmentNotesByAppointmentId()");

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(()-> new NotFoundException("Appointment not found"));
        
        List<AppointmentNote> appointmentNotes = appointment.getNotes();

        if (!appointmentNotes.isEmpty()) {
            List<AppointmentNoteDTO> appointmentNoteDTOS = appointmentNotes.stream()
                    .map(appointmentNote -> modelMapper.map(appointmentNote, AppointmentNoteDTO.class))
                    .collect(Collectors.toList());

            return Response.<List<AppointmentNoteDTO>>builder()
                    .statusCode(HttpStatus.OK.value())
                    .message("Randevu notları başarıyla getirildi.")
                    .data(appointmentNoteDTOS)
                    .build();
        } else {
            return Response.<List<AppointmentNoteDTO>>builder()
                    .statusCode(HttpStatus.NOT_FOUND.value())
                    .message("Bu randevuya ait notlar bulunamadı.")
                    .data(Collections.emptyList()).build();
        }
    }

    @Override
    @Transactional
    public Response<AppointmentNoteDTO> createAppointmentNote(AppointmentNoteRequestDTO appointmentNoteRequestDTO) {

        log.info("Inside createAppointmentNoteByAppointmentId()");

        Appointment appointment = appointmentRepository.findById(appointmentNoteRequestDTO.getAppointmentId())
                .orElseThrow(() -> new NotFoundException("Appointment not found"));

        AppointmentNote appointmentNote = AppointmentNote.builder()
                .noteText(appointmentNoteRequestDTO.getNoteText())
                .attachmentUrl(appointmentNoteRequestDTO.getAttachmentUrl())
                .appointment(appointment)
                .createdAt(LocalDateTime.now())
                .build();


        AppointmentNote savedAppointmentNote = appointmentNoteRepository.save(appointmentNote);

        return Response.<AppointmentNoteDTO>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Appointment Note created successfully")
                .data(modelMapper.map(savedAppointmentNote, AppointmentNoteDTO.class))
                .build();
    }

    @Override
    public Response<?> deleteAppointmentNote(Long appointmentNoteId) {
        log.info("Inside deleteAppointmentNoteByAppointmentId()");

        if (!appointmentNoteRepository.existsById(appointmentNoteId)){
            throw  new NotFoundException("Category Not Found");
        }

        appointmentNoteRepository.deleteById(appointmentNoteId);

        return Response.builder()
                .statusCode(HttpStatus.OK.value())
                .message("Appointment Note deleted successfully")
                .build();
    }

    @Override
    public Response<AppointmentNoteDTO> updateAppointmentNote(AppointmentNoteRequestDTO appointmentNoteRequestDTO) {
        log.info("Inside updateAppointmentNoteByAppointmentId()");

        Optional<AppointmentNote> existingAppointmentNoteOptional = appointmentNoteRepository.findById(appointmentNoteRequestDTO.getId());

        if (existingAppointmentNoteOptional.isPresent()) {
            AppointmentNote existingAppointmentNote = existingAppointmentNoteOptional.get();

            if(appointmentNoteRequestDTO.getNoteText()!=null && !appointmentNoteRequestDTO.getNoteText().isBlank())
                existingAppointmentNote.setNoteText(appointmentNoteRequestDTO.getNoteText());

            if(appointmentNoteRequestDTO.getAttachmentUrl()!=null && !appointmentNoteRequestDTO.getAttachmentUrl().isBlank())
                existingAppointmentNote.setAttachmentUrl(appointmentNoteRequestDTO.getAttachmentUrl());


            AppointmentNote updatedAppointmentNote = appointmentNoteRepository.save(existingAppointmentNote);
            AppointmentNoteDTO appointmentNoteDTO = modelMapper.map(updatedAppointmentNote, AppointmentNoteDTO.class);

            return Response.<AppointmentNoteDTO>builder()
                    .statusCode(HttpStatus.OK.value())
                    .message("Randevu notu başarıyla güncellendi.")
                    .data(appointmentNoteDTO)
                    .build();
        } else {
            return Response.<AppointmentNoteDTO>builder()
                    .statusCode(HttpStatus.NOT_FOUND.value())
                    .message("Güncellenecek randevu notu bulunamadı.")
                    .data(null)
                    .build();
        }
    }

    @Override
    public Response<AppointmentResponseDTO> getAppointmentByDateAndStartTime(String date, String startTime) {

        Appointment appointment = appointmentRepository.findByDateAndStartTime(date, startTime);
        if(appointment==null){
            throw  new NotFoundException("Appointment not found");
        }else{
            AppointmentResponseDTO appointmentResponseDTO = modelMapper.map(appointment, AppointmentResponseDTO.class);
            return Response.<AppointmentResponseDTO>builder()
                    .statusCode(HttpStatus.OK.value())
                    .message("Appointment retrieved successfully")
                    .data(appointmentResponseDTO)
                    .build();
        }
    }
}
