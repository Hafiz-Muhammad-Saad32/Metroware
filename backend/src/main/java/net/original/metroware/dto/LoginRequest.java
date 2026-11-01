package net.original.metroware.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Email is required")
    private String userEmail;

    @NotBlank(message = "Password is required")
    private String userPassword;
}