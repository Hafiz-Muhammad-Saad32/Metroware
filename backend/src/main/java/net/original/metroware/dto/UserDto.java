package net.original.metroware.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserDto {

    private Integer userId;
    private String userName;
    private String userRole;
    private String userEmail;
}
