package net.original.metroware.dto;

public record TicketDto(
        Long ticketId,
        Long bookingId,
        Integer userId,
        String userName,
        Long busId,
        String busNumber,
        String routeName,
        Long pickupStopId,
        Long dropStopId,
        String pickupName,
        String dropName,
        Integer price,
        String paymentMethod,
        String paymentStatus,
        String transactionId,
        String bookedAt) {
}