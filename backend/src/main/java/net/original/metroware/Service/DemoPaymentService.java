package net.original.metroware.Service;

import java.security.SecureRandom;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import net.original.metroware.exception.ApiException;

// DEMO: koi asli paisa nahi. Asli Easypaisa lagane par sirf ye class badlegi.
@Service
public class DemoPaymentService {

    private final SecureRandom random = new SecureRandom();

    // payment kamyab ho to transactionId return karta hai
    public String charge(String mobile, String pin, int amount) {

        if (mobile == null || !mobile.matches("03\\d{9}")) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Enter a valid 11 digit number, like 03001234567");
        }
        if (pin == null || !pin.matches("\\d{5}")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PIN must be 5 digits");
        }

        // PIN 00000 = failed payment dikhane ke liye
        if ("00000".equals(pin)) {
            throw new ApiException(HttpStatus.PAYMENT_REQUIRED,
                    "Insufficient balance in your Easypaisa account");
        }

        return "EP" + (10000000 + random.nextInt(90000000));
    }
}