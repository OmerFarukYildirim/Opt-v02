package com.opt.Omer.auth_users.dtos;

import com.opt.Omer.enums.SubscriptionStatus;
import lombok.Data;

import java.util.List;

@Data
public class LoginResponse {

    private String token;
    private List<String> roles;
    private SubscriptionStatus subscriptionStatus;

}
