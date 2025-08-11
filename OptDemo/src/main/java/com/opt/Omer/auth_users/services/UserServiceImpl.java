package com.opt.Omer.auth_users.services;

import com.opt.Omer.auth_users.dtos.UpdateStatusDTO;
import com.opt.Omer.auth_users.dtos.UserDTO;
import com.opt.Omer.auth_users.entity.User;
import com.opt.Omer.auth_users.repository.UserRepository;
import com.opt.Omer.availability.dtos.AvailabilityResponseDTO;
import com.opt.Omer.aws.AWSS3Service;
import com.opt.Omer.enums.SubscriptionStatus;
import com.opt.Omer.exceptions.BadRequestException;
import com.opt.Omer.exceptions.NotFoundException;
import com.opt.Omer.notification.dtos.NotificationDTO;
import com.opt.Omer.notification.services.NotificationService;
import com.opt.Omer.response.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URL;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    private final NotificationService notificationService;
    private final AWSS3Service awss3Service;


    @Override
    public User getCurrentLoggedInUser() {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        return userRepository.findByEmail(email)
                .orElseThrow(()-> new NotFoundException("user not found"));

    }

    @Override
    public Response<List<UserDTO>> getAllUsers() {

        log.info("INSIDE getAllUsers()");

        List<User> userList = userRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));

        List<UserDTO> userDTOS = modelMapper.map(userList, new TypeToken<List<UserDTO>>() {
        }.getType());

        return Response.<List<UserDTO>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("All users retreived successfully")
                .data(userDTOS)
                .build();
    }

    @Override
    public Response<UserDTO> getOwnAccountDetails() {

        log.info("INSIDE getOwnAccountDetails()");

        User user = getCurrentLoggedInUser();

        UserDTO userDTO = modelMapper.map(user, UserDTO.class);
        userDTO.setPtId(user.getPersonalTrainer().getId());
        return Response.<UserDTO>builder()
                .statusCode(HttpStatus.OK.value())
                .message("success")
                .data(userDTO)
                .build();

    }

    @Override
    public Response<?> updateOwnAccount(UserDTO userDTO) {

        log.info("INSIDE updateOwnAccount()");

        // Fetch the currently logged-in user
        User user = getCurrentLoggedInUser();

        String profileUrl = user.getProfileUrl();
        MultipartFile imageFile = userDTO.getImageFile();


        log.info("EXISTIN Profile URL IS: " + profileUrl);

        // Check if a new imageFile was provided
        if (imageFile != null && !imageFile.isEmpty()) {
            // Delete the old image from S3 if it exists
            if (profileUrl != null && !profileUrl.isEmpty()) {
                String keyName = profileUrl.substring(profileUrl.lastIndexOf("/") + 1);
                awss3Service.deleteFile("profile/" + keyName);

                log.info("Deleted old profile image from s3");
            }
            //upload new image
            String imageName = UUID.randomUUID().toString() + "_" + imageFile.getOriginalFilename();
            URL newImageUrl = awss3Service.uploadFile("profile/" + imageName, imageFile);

            user.setProfileUrl(newImageUrl.toString());
        }


        // Update user details
        if (userDTO.getName() != null) {
            user.setName(userDTO.getName());
        }

        if (userDTO.getPhoneNumber() != null) {
            user.setPhoneNumber(userDTO.getPhoneNumber());
        }

        if (userDTO.getAddress() != null) {
            user.setAddress(userDTO.getAddress());
        }

        if (userDTO.getEmail() != null && !userDTO.getEmail().equals(user.getEmail())) {
            // Check if the new email is already taken
            if (userRepository.existsByEmail(userDTO.getEmail())) {
                throw new BadRequestException("Email already exists");
            }
            user.setEmail(userDTO.getEmail());
        }

        if (userDTO.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }

        // Save the updated user
        userRepository.save(user);

        return Response.builder()
                .statusCode(HttpStatus.OK.value())
                .message("Account updated successfully")
                .build();

    }

    @Override
    public Response<?> deactivateOwnAccount() {

        log.info("INSIDE deactivateOwnAccount()");

        User user = getCurrentLoggedInUser();

        // Deactivate the user
        user.setActive(false);
        userRepository.save(user);

        //SEND EMAIL AFTER DEACTIVATION

        // Send email notification
        NotificationDTO notificationDTO = NotificationDTO.builder()
                .recipient(user.getEmail())
                .subject("Account Deactivated")
                .body("Your account has been deactivated. If this was a mistake, please contact support.")
                .build();
        notificationService.sendEmail(notificationDTO);

        // Return a success response
        return Response.builder()
                .statusCode(HttpStatus.OK.value())
                .message("Account deactivated successfully")
                .build();

    }

    @Override
    public Response<List<UserDTO>> getPendingCustomers() {

        log.info("INSIDE getPendingCustomers()");

        User admin = getCurrentLoggedInUser();
        SubscriptionStatus subscriptionStatus = SubscriptionStatus.PENDING;
        List<User> customerList = userRepository.findBySubscriptionStatusAndPersonalTrainer_Id(subscriptionStatus,admin.getId());

        List<UserDTO> customerDTOS = customerList.stream()
                .map(user -> modelMapper.map(user, UserDTO.class))
                .toList();

        return Response.<List<UserDTO>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Pending customers retrieved successfully")
                .data(customerDTOS)
                .build();
    }

    @Override
    public Response<?> approvePendingCustomer(Long customerId) {

        log.info("INSIDE approvePendingCustomer()");

    User customerUser = userRepository.findById(customerId)
            .orElseThrow(() -> new BadRequestException("Customer not found"));

    customerUser.setSubscriptionStatus(SubscriptionStatus.APPROVE);
    userRepository.save(customerUser);

        return Response.builder()
                .statusCode(HttpStatus.OK.value())
                .message("Status updated with approved successfully")
                .build();
    }

    @Override
    public Response<?> rejectPendingCustomer(Long customerId) {

        log.info("INSIDE rejectPendingCustomer()");

        User customerUser = userRepository.findById(customerId)
                .orElseThrow(() -> new BadRequestException("Customer not found"));

        customerUser.setSubscriptionStatus(SubscriptionStatus.REJECTED);
        userRepository.save(customerUser);

        return Response.builder()
                .statusCode(HttpStatus.OK.value())
                .message("Status updated with rejected successfully")
                .build();
    }

    @Override
    public Response<?> updatePtPhoneNumberAndStatus(String phoneNumber) {

        log.info("INSIDE updatePtPhoneNumberAndStatus()");

        User customer = getCurrentLoggedInUser();

        User pt = userRepository.findByPhoneNumber(customer.getPersonalTrainer().getPhoneNumber())
                .orElseThrow(() -> new BadRequestException("PT not found"));

        customer.setSubscriptionStatus(SubscriptionStatus.PENDING);
        userRepository.save(customer);

        pt.setPhoneNumber(phoneNumber);
        userRepository.save(pt);

        return Response.builder()
                .statusCode(HttpStatus.OK.value())
                .message("Status updated with pending and phone number changed successfully")
                .build();
    }

    @Override
    public Response<SubscriptionStatus> getUserStatus(Long id) {

        User user =  userRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("User not found"));

        return Response.<SubscriptionStatus>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Status updated with pending and phone number changed successfully")
                .data(user.getSubscriptionStatus())
                .build();
    }

    @Override
    public Response<UpdateStatusDTO> setUserStatus(UpdateStatusDTO updateStatusDTO) {
        User user =  userRepository.findById(updateStatusDTO.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));

            user.setSubscriptionStatus(updateStatusDTO.getStatus());
            userRepository.save(user);

            return Response.<UpdateStatusDTO>builder()
                    .statusCode(HttpStatus.OK.value())
                    .message("Status updated successfully")
                    .data(updateStatusDTO)
                    .build();

    }

    @Override
    public Response<UserDTO> getUserProfileById(Long id) {
        User user =  userRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("User not found"));

        UserDTO userDTO = modelMapper.map(user, UserDTO.class);
        userDTO.setPtId(user.getPersonalTrainer().getId());
        return Response.<UserDTO>builder()
                .statusCode(HttpStatus.OK.value())
                .message("success")
                .data(userDTO)
                .build();
    }

    @Override
    public Response<List<UserDTO>> getCustomersByPtId() {
        log.info("INSIDE getCustomersByPtId()");

        User admin = getCurrentLoggedInUser();

        List<User> customerList = userRepository.findByPersonalTrainerId(admin.getPersonalTrainer().getId());

        List<UserDTO> customerDTOS = customerList.stream()
                .map(user -> modelMapper.map(user, UserDTO.class))
                .toList();

        return Response.<List<UserDTO>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Customers retrieved successfully")
                .data(customerDTOS)
                .build();
    }


}















