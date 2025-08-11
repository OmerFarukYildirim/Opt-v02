package com.opt.Omer.notification.services;


import com.opt.Omer.notification.dtos.NotificationDTO;

public interface NotificationService {
    void sendEmail(NotificationDTO notificationDTO);
}
