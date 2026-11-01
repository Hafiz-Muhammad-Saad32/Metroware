package net.original.metroware.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.original.metroware.Service.TicketService;
import net.original.metroware.dto.TicketDto;

// /api/admin/** pehle se SecurityConfig mein sirf ADMIN ke liye hai
@RestController
@RequestMapping("/api/admin/tickets")
public class AdminTicketController {

    private final TicketService ticketService;

    public AdminTicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public List<TicketDto> allTickets() {
        return ticketService.allTickets();
    }

    // cash mil gaya: poori booking paid
    @PutMapping("/booking/{bookingId}/paid")
    public List<TicketDto> markPaid(@PathVariable("bookingId") Long bookingId) {
        return ticketService.markBookingPaid(bookingId);
    }
}