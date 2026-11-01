package net.original.metroware.Controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import net.original.metroware.Entity.User;
import net.original.metroware.Service.TicketService;
import net.original.metroware.dto.BookRequest;
import net.original.metroware.dto.QuoteDto;
import net.original.metroware.dto.TicketDto;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping("/quote")
    public QuoteDto quote(
            @RequestParam("pickupStopId") Long pickupStopId,
            @RequestParam("dropStopId") Long dropStopId,
            @RequestParam("quantity") int quantity) {
        return ticketService.getQuote(pickupStopId, dropStopId, quantity);
    }

    @PostMapping
    public List<TicketDto> book(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BookRequest request) {
        return ticketService.book(user, request);
    }

    @GetMapping("/my")
    public List<TicketDto> myTickets(@AuthenticationPrincipal User user) {
        return ticketService.myTickets(user);
    }
}