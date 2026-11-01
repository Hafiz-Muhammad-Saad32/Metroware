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

// ek user ki ek khareed (ek safar). Payment aur tickets isi se jurte hain.
@Entity
@Table(name = "bookings")
@Getter
@Setter
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    @Column(nullable = false)
    private Integer userId;

    private Long busId;
    private Long pickupStopId;
    private Long dropStopId;

    // booking ke waqt ke naam (history sahi rahe, chahe bus/route/stop baad mein badle ya delete ho)
    @Column(nullable = false, length = 30)
    private String busNumber;

    @Column(nullable = false, length = 100)
    private String routeName;

    @Column(nullable = false, length = 100)
    private String pickupName;

    @Column(nullable = false, length = 100)
    private String dropName;

    @Column(nullable = false)
    private Integer unitPrice;

    @Column(nullable = false)
    private Instant bookedAt;
}