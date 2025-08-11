package com.opt.Omer.enums;

public enum SubscriptionStatus {
    PENDING,
    APPROVE,
    REJECTED,
    ACTIVE,
    DEACTIVE,
    ADMIN
}//kayıt olurken pending olarak bekler, hoca kabul edince approve olur ödeme istenir. ödeme yapılınca active olur.
// hizmet süresi dolunca tekrar approve olur ve ödeme istenir. hoca reddederse rejected olur. rejectedleri home'a
// yönlendir ve orda ya aynı hocaya tekrar istek atması gerektiğini yada farklı hocanın telefon numarasını girip
// ona istek atması gerektiğini yaz. tekrar istek atınca pending olur ve aynı döngü.kullanıcı çıkış yaparsa deactive olur.
