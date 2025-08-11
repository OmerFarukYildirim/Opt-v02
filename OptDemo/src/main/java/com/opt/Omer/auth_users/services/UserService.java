package com.opt.Omer.auth_users.services;



import com.opt.Omer.auth_users.dtos.UpdateStatusDTO;
import com.opt.Omer.auth_users.dtos.UserDTO;
import com.opt.Omer.auth_users.entity.User;
import com.opt.Omer.enums.SubscriptionStatus;
import com.opt.Omer.response.Response;

import java.util.List;

public interface UserService {


    User getCurrentLoggedInUser();

    Response<List<UserDTO>> getAllUsers();

    Response<UserDTO> getOwnAccountDetails();

    Response<?> updateOwnAccount(UserDTO userDTO);

    Response<?> deactivateOwnAccount();
    Response<List<UserDTO>> getPendingCustomers(); // admin
    Response<?> approvePendingCustomer(Long customerId); // admin
    Response<?> rejectPendingCustomer(Long customerId); // admin

    Response<?> updatePtPhoneNumberAndStatus(String phoneNumber);
    Response<SubscriptionStatus> getUserStatus(Long id);
    Response<UpdateStatusDTO> setUserStatus(UpdateStatusDTO updateStatusDTO);
    Response<UserDTO> getUserProfileById(Long id);

    Response<List<UserDTO>> getCustomersByPtId();

}
