package net.original.metroware.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LostFoundRequest {

    @NotBlank(message = "Item name is required")
    @Size(max = 100, message = "Item name is too long")
    private String itemName;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description is too long (max 1000 characters)")
    private String description;

    @NotBlank(message = "Select lost or found")
    @Pattern(regexp = "lost|found", message = "Type must be lost or found")
    private String itemType;
}