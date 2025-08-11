package com.opt.Omer.auth_users.repository;

import com.opt.Omer.auth_users.entity.User;
import com.opt.Omer.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);

    List<User> findBySubscriptionStatusAndPersonalTrainer_Id(SubscriptionStatus subscriptionStatus, Long personalTrainerId);

    List<User> findByPersonalTrainerId(Long personalTrainerId);
}