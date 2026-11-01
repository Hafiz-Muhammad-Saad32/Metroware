package net.original.metroware.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ComplaintRequest {

    @NotBlank(message = "Write your complaint first")
    @Size(max = 1000, message = "Complaint is too long (max 1000 characters)")
    private String complaintText;
}