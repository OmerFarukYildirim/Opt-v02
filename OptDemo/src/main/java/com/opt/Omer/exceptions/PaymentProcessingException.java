package com.opt.Omer.exceptions;

public class PaymentProcessingException extends RuntimeException{

    public PaymentProcessingException(String message){
        super(message);
    }
}
