package net.original.metroware.dto;

public record LostFoundDto(
        Integer itemId,
        Integer userId,
        String userName,
        String itemName,
        String description,
        String itemType, // "lost" ya "found"
        String date) {
}