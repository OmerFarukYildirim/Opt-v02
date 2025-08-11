package com.opt.Omer.auth_users.entity;


import com.opt.Omer.enums.SubscriptionStatus;
import com.opt.Omer.payment.entity.Payment;
import com.opt.Omer.role.entity.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    @NotBlank(message = "password is required")
    private String password;
    @Column(unique = true)
    private String phoneNumber;

    private String profileUrl;

    private String address;

    private boolean isActive;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "users_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private List<Role> roles;

    @OneToMany(mappedBy = "user",cascade = CascadeType.ALL)
    private List<Payment> payments;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    private SubscriptionStatus subscriptionStatus;

    @ManyToOne
    @JoinColumn(name = "pt_id") // Veritabanındaki foreign key kolonunun adı
    private User personalTrainer;

}











