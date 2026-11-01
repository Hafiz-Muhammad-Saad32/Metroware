package net.original.metroware.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.original.metroware.Entity.Booking;
import net.original.metroware.Entity.Bus;
import net.original.metroware.Entity.Payment;
import net.original.metroware.Entity.Route;
import net.original.metroware.Entity.RouteStop;
import net.original.metroware.Entity.Stop;
import net.original.metroware.Entity.Ticket;
import net.original.metroware.Entity.User;
import net.original.metroware.Repository.BookingRepository;
import net.original.metroware.Repository.BusRepository;
import net.original.metroware.Repository.PaymentRepository;
import net.original.metroware.Repository.RouteRepository;
import net.original.metroware.Repository.RouteStopRepository;
import net.original.metroware.Repository.StopRepository;
import net.original.metroware.Repository.TicketRepository;
import net.original.metroware.Repository.UserRepository;
import net.original.metroware.dto.BookRequest;
import net.original.metroware.dto.QuoteDto;
import net.original.metroware.dto.TicketDto;
import net.original.metroware.exception.ApiException;
import net.original.metroware.util.GeoUtils;

@Service
public class TicketService {

    private static final double SHORT_TRIP_KM = 15.0;
    private static final int SHORT_FARE = 80;
    private static final int LONG_FARE = 120;
    private static final int MAX_QTY = 10;

    private record Trip(Stop pickup, Stop drop, double km, int unitPrice) {
    }

    private final TicketRepository ticketRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final StopRepository stopRepository;
    private final RouteStopRepository routeStopRepository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;
    private final UserRepository userRepository;
    private final DemoPaymentService paymentService;

    public TicketService(TicketRepository ticketRepository,
                         BookingRepository bookingRepository,
                         PaymentRepository paymentRepository,
                         StopRepository stopRepository,
                         RouteStopRepository routeStopRepository,
                         BusRepository busRepository,
                         RouteRepository routeRepository,
                         UserRepository userRepository,
                         DemoPaymentService paymentService) {
        this.ticketRepository = ticketRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.stopRepository = stopRepository;
        this.routeStopRepository = routeStopRepository;
        this.busRepository = busRepository;
        this.routeRepository = routeRepository;
        this.userRepository = userRepository;
        this.paymentService = paymentService;
    }

    // ---------- USER ----------

    public QuoteDto getQuote(Long pickupStopId, Long dropStopId, int quantity) {
        checkQuantity(quantity);
        Trip trip = resolveTrip(pickupStopId, dropStopId);
        return new QuoteDto(trip.unitPrice(), trip.unitPrice() * quantity, trip.km(), quantity);
    }

    // booking + payment + tickets: sab ek transaction mein.
    // beech mein koi bhi step fail ho to sab kuch rollback (kuch bhi save nahi hota).
    @Transactional
    public List<TicketDto> book(User principal, BookRequest req) {

        Bus bus = busRepository.findById(req.getBusId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Bus not found"));

        if (bus.getRouteId() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This bus is not running on any route");
        }

        Trip trip = resolveTrip(req.getPickupStopId(), req.getDropStopId());

        boolean onRoute = routeStopRepository.existsByRouteIdAndStopId(bus.getRouteId(), trip.pickup().getStopId())
                && routeStopRepository.existsByRouteIdAndStopId(bus.getRouteId(), trip.drop().getStopId());
        if (!onRoute) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Selected stops do not belong to this bus's route");
        }

        Route route = routeRepository.findById(bus.getRouteId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Route not found"));

        int quantity = req.getQuantity();
        int total = trip.unitPrice() * quantity;
        Instant now = Instant.now().truncatedTo(ChronoUnit.MILLIS);

        // 1) payment (easypaisa demo: fail ho to yahin ruk jata hai, abhi tak kuch save nahi hua)
        String method = req.getPaymentMethod();
        String status = "pending";
        String transactionId = null;
        Instant paidAt = null;

        if ("easypaisa".equals(method)) {
            transactionId = paymentService.charge(req.getMobile(), req.getPin(), total);
            status = "paid";
            paidAt = now;
        }

        // 2) booking
        Booking booking = new Booking();
        booking.setUserId(principal.getUserId());
        booking.setBusId(bus.getBusId());
        booking.setPickupStopId(trip.pickup().getStopId());
        booking.setDropStopId(trip.drop().getStopId());
        booking.setBusNumber(bus.getBusNumber());
        booking.setRouteName(route.getRouteName());
        booking.setPickupName(trip.pickup().getStopName());
        booking.setDropName(trip.drop().getStopName());
        booking.setUnitPrice(trip.unitPrice());
        booking.setBookedAt(now);
        booking = bookingRepository.save(booking);

        // 3) payment record
        Payment payment = new Payment();
        payment.setBookingId(booking.getBookingId());
        payment.setPaymentMethod(method);
        payment.setPaymentStatus(status);
        payment.setAmount(total);
        payment.setTransactionId(transactionId);
        payment.setPaidAt(paidAt);
        paymentRepository.save(payment);

        // 4) tickets (har passenger ka ek)
        List<Ticket> created = new ArrayList<>();
        for (int i = 0; i < quantity; i++) {
            Ticket t = new Ticket();
            t.setBookingId(booking.getBookingId());
            created.add(ticketRepository.save(t));
        }

        return assemble(created);
    }

    public List<TicketDto> myTickets(User principal) {
        Set<Long> bookingIds = bookingRepository.findByUserId(principal.getUserId()).stream()
                .map(Booking::getBookingId)
                .collect(Collectors.toSet());

        if (bookingIds.isEmpty()) {
            return List.of();
        }
        return assemble(ticketRepository.findByBookingIdIn(bookingIds));
    }

    // ---------- ADMIN ----------

    public List<TicketDto> allTickets() {
        return assemble(ticketRepository.findAll());
    }

    @Transactional
    public List<TicketDto> markBookingPaid(Long bookingId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!"pending".equals(payment.getPaymentStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No pending tickets in this booking");
        }
        if (!"cash".equals(payment.getPaymentMethod())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only cash tickets can be marked paid");
        }

        payment.setPaymentStatus("paid");
        payment.setPaidAt(Instant.now().truncatedTo(ChronoUnit.MILLIS));
        paymentRepository.save(payment);

        return assemble(ticketRepository.findByBookingIdOrderByTicketId(bookingId));
    }

    // ---------- helpers ----------

    private void checkQuantity(int quantity) {
        if (quantity < 1 || quantity > MAX_QTY) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Quantity must be between 1 and 10");
        }
    }

    private Trip resolveTrip(Long pickupStopId, Long dropStopId) {
        Stop pickup = stopRepository.findById(pickupStopId)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Select pickup and drop stops"));
        Stop drop = stopRepository.findById(dropStopId)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Select pickup and drop stops"));

        if (pickup.getStopId().equals(drop.getStopId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Pickup and drop stop cannot be the same");
        }

        // dono stops kam az kam ek common route par hone chahiye
        Set<Long> pickupRoutes = routeStopRepository.findByStopId(pickupStopId).stream()
                .map(RouteStop::getRouteId)
                .collect(Collectors.toSet());
        boolean shareRoute = routeStopRepository.findByStopId(dropStopId).stream()
                .anyMatch(rs -> pickupRoutes.contains(rs.getRouteId()));
        if (!shareRoute) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Pickup and drop must be on the same route");
        }

        double km = GeoUtils.haversineKm(
                pickup.getLatitude(), pickup.getLongitude(),
                drop.getLatitude(), drop.getLongitude());

        int unitPrice = km <= SHORT_TRIP_KM ? SHORT_FARE : LONG_FARE;
        return new Trip(pickup, drop, km, unitPrice);
    }

    // tickets + bookings + payments + users ko jod kar frontend wali ek shakal banata hai (naye pehle)
    private List<TicketDto> assemble(List<Ticket> tickets) {
        if (tickets.isEmpty()) {
            return List.of();
        }

        Set<Long> bookingIds = tickets.stream().map(Ticket::getBookingId).collect(Collectors.toSet());

        Map<Long, Booking> bookings = bookingRepository.findAllById(bookingIds).stream()
                .collect(Collectors.toMap(Booking::getBookingId, Function.identity()));

        Map<Long, Payment> payments = paymentRepository.findByBookingIdIn(bookingIds).stream()
                .collect(Collectors.toMap(Payment::getBookingId, Function.identity()));

        Set<Integer> userIds = bookings.values().stream().map(Booking::getUserId).collect(Collectors.toSet());
        Map<Integer, String> names = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getUserId, User::getUserName));

        Comparator<Ticket> newestFirst = Comparator
                .comparing((Ticket t) -> bookings.get(t.getBookingId()).getBookedAt(), Comparator.reverseOrder())
                .thenComparing(Ticket::getTicketId, Comparator.reverseOrder());

        return tickets.stream()
                .sorted(newestFirst)
                .map(t -> {
                    Booking b = bookings.get(t.getBookingId());
                    Payment p = payments.get(t.getBookingId());
                    return new TicketDto(
                            t.getTicketId(),
                            b.getBookingId(),
                            b.getUserId(),
                            names.get(b.getUserId()),
                            b.getBusId(),
                            b.getBusNumber(),
                            b.getRouteName(),
                            b.getPickupStopId(),
                            b.getDropStopId(),
                            b.getPickupName(),
                            b.getDropName(),
                            b.getUnitPrice(),
                            p.getPaymentMethod(),
                            p.getPaymentStatus(),
                            p.getTransactionId(),
                            b.getBookedAt().toString());
                })
                .toList();
    }
}