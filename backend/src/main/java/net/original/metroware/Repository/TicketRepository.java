package net.original.metroware.Repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import net.original.metroware.Entity.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByBookingIdIn(Collection<Long> bookingIds);

    List<Ticket> findByBookingIdOrderByTicketId(Long bookingId);
}