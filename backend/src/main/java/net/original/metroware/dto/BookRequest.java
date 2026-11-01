package net.original.metroware.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class BookRequest {

    @NotNull(message = "Select a bus first")
    private Long busId;

    @NotNull(message = "Select pickup and drop stops")
    private Long pickupStopId;

    @NotNull(message = "Select pickup and drop stops")
    private Long dropStopId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be between 1 and 10")
    @Max(value = 10, message = "Quantity must be between 1 and 10")
    private Integer quantity;

    @NotBlank(message = "Select a payment method")
    @Pattern(regexp = "cash|easypaisa", message = "Payment method must be cash or easypaisa")
    private String paymentMethod;

    // sirf easypaisa ke liye (store nahi hote)
    private String mobile;
    private String pin;
}