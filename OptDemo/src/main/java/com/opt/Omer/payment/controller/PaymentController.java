// src/main/java/com/opt/Omer/payment/controller/PaymentController.java
package com.opt.Omer.payment.controller;

import com.opt.Omer.payment.dtos.PaymentDTO;
import com.opt.Omer.payment.services.PaymentService;
import com.opt.Omer.response.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Bu endpoint, belirli bir kullanıcı için Stripe ile ödeme niyetini (Payment Intent) başlatır.
     * @param userId Ödeme işlemini başlatan kullanıcının ID'si.
     * @return Başarılı bir durumda clientSecret içeren bir yanıt döner.
     */
    @PostMapping("/pay/{userId}")
    public ResponseEntity<Response<?>> initializePayment(@PathVariable Long userId) {
        log.info("Request to initialize payment for user ID: {}", userId);
        return ResponseEntity.ok(paymentService.initializePayment(userId));
    }

    /**
     * Bu endpoint, Stripe'tan gelen webhook'lar veya frontend'den gelen güncellemeler
     * ile ödeme işleminin durumunu günceller.
     * @param paymentRequest Ödeme durumunu güncellemek için gereken bilgileri içeren DTO.
     */
    @PutMapping("/update")
    public ResponseEntity<Void> updatePaymentStatus(@RequestBody PaymentDTO paymentRequest) {
        log.info("Request to update payment status for transaction ID: {}", paymentRequest.getTransactionId());
        paymentService.updatePaymentStatus(paymentRequest);
        return ResponseEntity.ok().build();
    }

    /**
     * Tüm ödeme geçmişini listeleyen bir endpoint. Sadece ADMIN yetkisine sahip kullanıcılar erişebilir.
     * @return Tüm ödemelerin listesini içeren bir yanıt.
     */
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response<List<PaymentDTO>>> getAllPayments() {
        log.info("Request to get all payments by an ADMIN");
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    /**
     * Belirli bir ödeme işlemini ID'sine göre getiren bir endpoint.
     * @param paymentId Görüntülenecek ödeme işleminin ID'si.
     * @return İstenilen ödeme işlemini içeren bir yanıt.
     */
    @GetMapping("/{paymentId}")
    public ResponseEntity<Response<PaymentDTO>> getPaymentById(@PathVariable Long paymentId) {
        log.info("Request to get payment by ID: {}", paymentId);
        return ResponseEntity.ok(paymentService.getPaymentById(paymentId));
    }
}
