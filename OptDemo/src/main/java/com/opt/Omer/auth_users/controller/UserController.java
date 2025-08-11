package com.opt.Omer.auth_users.controller;



import com.opt.Omer.auth_users.dtos.UpdateStatusDTO;
import com.opt.Omer.auth_users.dtos.UserDTO;
import com.opt.Omer.auth_users.services.UserService;
import com.opt.Omer.enums.SubscriptionStatus;
import com.opt.Omer.response.Response;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;


    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')") // ADMIN ALONE HAVE ACCESS TO THIS endpoint
    public ResponseEntity<Response<List<UserDTO>>> getAllUsers(){
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Response<?>> updateOwnAccount(
            @ModelAttribute UserDTO userDTO,
            @RequestPart(value = "imageFile", required = false)MultipartFile imageFile
            ){
        userDTO.setImageFile(imageFile);
        return ResponseEntity.ok(userService.updateOwnAccount(userDTO));
    }

    @GetMapping("/account")
    public ResponseEntity<Response<UserDTO>> getOwnAccountDetails() {
        return ResponseEntity.ok(userService.getOwnAccountDetails());
    }


    @DeleteMapping("/deactivate")
    public ResponseEntity<Response<?>> deactivateOwnAccount() {
        return ResponseEntity.ok(userService.deactivateOwnAccount());
    }

    @PutMapping("/approve/{customerId}")
    public ResponseEntity<Response<?>> approvePendingCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(userService.approvePendingCustomer(customerId));
    }

    @GetMapping("/listByPending")
    public ResponseEntity<Response<List<UserDTO>>> getPendingCustomers() {
        return ResponseEntity.ok(userService.getPendingCustomers());
    }

    @PutMapping("/reject/{customerId}")
    public ResponseEntity<Response<?>> rejectPendingCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(userService.rejectPendingCustomer(customerId));
    }

    @PutMapping("/updateStatus")
    public ResponseEntity<Response<?>> updatePtPhoneNumberAndStatus(@RequestParam  String phoneNumber) {
        return ResponseEntity.ok(userService.updatePtPhoneNumberAndStatus(phoneNumber));
    }

    @GetMapping("/user-status/{id}")
    public ResponseEntity<Response<SubscriptionStatus>> getUserStatus(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserStatus(id));
    }

    @PutMapping("/update-user-status")
    public ResponseEntity<Response<UpdateStatusDTO>> setUserStatus(@RequestBody UpdateStatusDTO updateStatusDTO) {
        return ResponseEntity.ok(userService.setUserStatus(updateStatusDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Response<UserDTO>> getUserProfileById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserProfileById(id));
    }

    @GetMapping("/listAllCustomers")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response<List<UserDTO>>> getCustomersByPtId() {
        return ResponseEntity.ok(userService.getCustomersByPtId());
    }
}
