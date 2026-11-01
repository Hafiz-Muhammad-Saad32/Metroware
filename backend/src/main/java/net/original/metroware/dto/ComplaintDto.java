package net.original.metroware.dto;

public record ComplaintDto(
        Integer complaintId,
        Integer userId,
        String userName,
        String complaintText,
        String complaintDate) {
}