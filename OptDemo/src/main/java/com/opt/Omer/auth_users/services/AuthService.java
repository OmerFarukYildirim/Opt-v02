package com.opt.Omer.auth_users.services;


import com.opt.Omer.auth_users.dtos.LoginRequest;
import com.opt.Omer.auth_users.dtos.LoginResponse;
import com.opt.Omer.auth_users.dtos.RegistrationRequest;
import com.opt.Omer.response.Response;

public interface AuthService {
    Response<?> register(RegistrationRequest registrationRequest);
    Response<LoginResponse> login(LoginRequest loginRequest);
}
