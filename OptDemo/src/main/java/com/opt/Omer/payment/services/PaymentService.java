package com.opt.Omer.payment.services;



import com.opt.Omer.auth_users.entity.User;
import com.opt.Omer.payment.dtos.PaymentDTO;
import com.opt.Omer.payment.entity.Payment;
import com.opt.Omer.response.Response;
import com.stripe.model.PaymentIntent;

import java.util.List;

public interface PaymentService {

    Response<?> initializePayment(Long userId);
    void updatePaymentStatus(PaymentDTO paymentDTO);
    Response<List<PaymentDTO>> getAllPayments();
    Response<PaymentDTO> getPaymentById(Long paymentId);

}
