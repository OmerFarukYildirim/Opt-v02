// src/main/java/com/opt/Omer/payment/services/PaymentServiceImpl.java
package com.opt.Omer.payment.services;

import com.opt.Omer.auth_users.entity.User;
import com.opt.Omer.auth_users.repository.UserRepository;
import com.opt.Omer.enums.PaymentGateway;
import com.opt.Omer.enums.PaymentStatus;
import com.opt.Omer.enums.SubscriptionStatus;
import com.opt.Omer.exceptions.NotFoundException;
import com.opt.Omer.notification.dtos.NotificationDTO;
import com.opt.Omer.notification.services.NotificationService;
import com.opt.Omer.payment.dtos.PaymentDTO;
import com.opt.Omer.payment.entity.Payment;
import com.opt.Omer.payment.repository.PaymentRepository;
import com.opt.Omer.response.Response;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final TemplateEngine templateEngine;
    private final ModelMapper modelMapper;

    @Value("${stripe.api.secret.key}")
    private String secreteKey;
    @Value("${frontend.base.url}")
    private String frontendBaseUrl;

    @Override
    public Response<?> initializePayment(Long userId) {
        log.info("inside initializePayment() for user: {}", userId);

        // Hata yakalama bloğunu tüm işleme yayıyoruz.
        try {
            log.info("Stripe API gizli anahtarı ayarlanıyor.");
            Stripe.apiKey = secreteKey;

            // stripeSecretKey'in null veya boş olup olmadığını kontrol edin
            if (secreteKey == null || secreteKey.isEmpty()) {
                throw new IllegalStateException("Stripe API gizli anahtarı bulunamadı veya boş.");
            }
            log.info("Stripe API gizli anahtarı başarıyla ayarlandı.");

            log.info("Kullanıcı ID'sine göre kullanıcı aranıyor: {}", userId);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NotFoundException("User not found with ID: " + userId));
            log.info("Kullanıcı bulundu: {}", user.getEmail());

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(5000L) // 50.00 TL (5000 kuruş)
                    .setCurrency("try")
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .setDescription("Subscription fee for user: " + user.getEmail())
                    .build();

            log.info("Stripe PaymentIntent oluşturuluyor...");
            PaymentIntent paymentIntent = PaymentIntent.create(params);
            log.info("Stripe PaymentIntent başarıyla oluşturuldu. ID: {}", paymentIntent.getId());

            Payment payment = Payment.builder()
                    .amount(new BigDecimal("50.00"))
                    .paymentStatus(PaymentStatus.PENDING)
                    .paymentGateway(PaymentGateway.STRIPE)
                    .transactionId(paymentIntent.getId()) // transactionId olarak PaymentIntent ID'sini kullanıyoruz
                    .user(user)
                    .build();

            log.info("Ödeme objesi veritabanına kaydediliyor...");
            paymentRepository.save(payment);
            log.info("Ödeme objesi başarıyla kaydedildi. Ödeme ID'si: {}", payment.getId());


            return Response.builder()
                    .statusCode(HttpStatus.OK.value())
                    .message("Payment intent created successfully")
                    .data(paymentIntent.getClientSecret())
                    .build();

        } catch (NotFoundException e) {
            log.error("Hata: Kullanıcı bulunamadı. ID: {}", userId, e);
            return Response.builder()
                    .statusCode(HttpStatus.NOT_FOUND.value())
                    .message(e.getMessage())
                    .build();
        } catch (StripeException e) {
            log.error("Stripe API hatası: {}", e.getMessage(), e);
            return Response.builder()
                    .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Stripe'da ödeme oluşturulurken hata oluştu.")
                    .data(e.getMessage())
                    .build();
        } catch (Exception e) {
            log.error("Ödeme başlatılırken beklenmedik bir hata oluştu: {}", e.getMessage(), e);
            return Response.builder()
                    .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Sunucu tarafında bilinmeyen bir hata oluştu.")
                    .data(e.getMessage())
                    .build();
        }
    }


    @Override
    public void updatePaymentStatus(PaymentDTO paymentRequest) {
        log.info("inside updatePaymentStatus() with transactionId: {}", paymentRequest.getTransactionId());

        Payment payment = paymentRepository.findByTransactionId(paymentRequest.getTransactionId())
                .orElseThrow(() -> new NotFoundException("Payment not found"));

        payment.setPaymentStatus(paymentRequest.getPaymentStatus());
        payment.setFailureReason(paymentRequest.getFailureReason());
        payment.setPaymentDate(LocalDateTime.now());


        paymentRepository.save(payment);

        User user = payment.getUser();
        if (paymentRequest.isSuccess()) {
            user.setSubscriptionStatus(SubscriptionStatus.ACTIVE);
            userRepository.save(user);
            sendPaymentSuccessEmail(user, payment);
        } else {
            user.setSubscriptionStatus(SubscriptionStatus.APPROVE);
            userRepository.save(user);
            sendPaymentFailureEmail(user, payment);
        }
    }

    private void sendPaymentSuccessEmail(User user, Payment payment) {
        log.info("Sending payment success email to: {}", user.getEmail());
        Context context = new Context(Locale.forLanguageTag("tr-TR"));
        context.setVariable("customerName", user.getName());
        context.setVariable("serviceName", "Online Personal Trainer");
        context.setVariable("amount", payment.getAmount() + " TL");
        context.setVariable("paymentDate", payment.getPaymentDate().format(DateTimeFormatter.ofPattern("dd MMMM yyyy HH:mm", Locale.forLanguageTag("tr-TR"))));
        context.setVariable("transactionId", payment.getTransactionId());
        context.setVariable("paymentHistoryLink", frontendBaseUrl + "/payment-history");

        // Thymeleaf şablonunu işleme
        String emailBody = templateEngine.process("payment-successful-pt", context);

        notificationService.sendEmail(NotificationDTO.builder()
                .recipient(user.getEmail())
                .subject("Ödemeniz Başarılı - Aboneliğiniz Başladı")
                .body(emailBody)
                .isHtml(true)
                .build());
    }

    private void sendPaymentFailureEmail(User user, Payment payment) {
        log.info("Sending payment failure email to: {}", user.getEmail());
        Context context = new Context(Locale.forLanguageTag("tr-TR"));
        context.setVariable("customerName", user.getName());
        context.setVariable("serviceName", "Online Personal Trainer");
        context.setVariable("failureReason", payment.getFailureReason() != null ? payment.getFailureReason() : "Bilinmeyen Hata");
        context.setVariable("amount", payment.getAmount() + " TL");
        context.setVariable("paymentLink", frontendBaseUrl + "/payment");

        // Thymeleaf şablonunu işleme
        String emailBody = templateEngine.process("payment-failed-pt", context);

        notificationService.sendEmail(NotificationDTO.builder()
                .recipient(user.getEmail())
                .subject("Ödemeniz Başarısız - Tekrar Deneyin")
                .body(emailBody)
                .isHtml(true)
                .build());
    }

    @Override
    public Response<List<PaymentDTO>> getAllPayments() {
        log.info("inside getAllPayments()");
        List<Payment> paymentList = paymentRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        List<PaymentDTO> paymentDTOS = modelMapper.map(paymentList, new TypeToken<List<PaymentDTO>>() {}.getType());

        paymentDTOS.forEach(item -> {
            item.setUser(null);
        });

        return Response.<List<PaymentDTO>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("payment retreived succeessfully")
                .data(paymentDTOS)
                .build();
    }

    @Override
    public Response<PaymentDTO> getPaymentById(Long paymentId) {
        log.info("inside getPaymentById()");
        Payment payment = paymentRepository.findById(paymentId).orElseThrow(()-> new NotFoundException("Payment not found"));
        PaymentDTO paymentDTOS = modelMapper.map(payment, PaymentDTO.class);

        paymentDTOS.getUser().setRoles(null);

        return Response.<PaymentDTO>builder()
                .statusCode(HttpStatus.OK.value())
                .message("payment retreived succeessfully by id")
                .data(paymentDTOS)
                .build();
    }
}
