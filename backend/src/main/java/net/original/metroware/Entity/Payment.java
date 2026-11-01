package net.original.metroware.Entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

// har booking ki ek payment (cash ya easypaisa)
@Entity
@Table(name = "payments")
@Getter
@Setter
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    @Column(nullable = false)
    private Long bookingId;

    @Column(nullable = false, length = 20)
    private String paymentMethod; // cash | easypaisa

    @Column(nullable = false, length = 20)
    private String paymentStatus; // pending | paid

    @Column(nullable = false)
    private Integer amount;

    @Column(length = 50)
    private String transactionId;

    private Instant paidAt;
}