package com.opt.Omer.meal.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Data
@Table(name = "meals")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Meal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long ptId;
    private Long customerId;
    private String date;

    @OneToMany(mappedBy = "mealPlan", cascade = CascadeType.ALL)
    private List<MealItem> mealItems;


    // users_roles tablosundan currentlogginguser fonksiyonu ile işlemi yapanın id sini pdId ye, tıkladığı (frontendin gönderdiği)
    // müşterinin id sini meal deki customerId ye ata. seçilen tarihi (frontendin) tarihe ata. ıtemsı da null ata(ilk oluşturuluşu olduğu için)
    // frontendde ise adım adım dto nun içini dolduracaksın.
}
