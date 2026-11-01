package net.original.metroware.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.original.metroware.Entity.Complaint;
import net.original.metroware.Entity.User;
import net.original.metroware.Repository.ComplaintRepository;
import net.original.metroware.Repository.UserRepository;
import net.original.metroware.dto.ComplaintDto;
import net.original.metroware.dto.ComplaintRequest;
import net.original.metroware.exception.ApiException;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public ComplaintService(ComplaintRepository complaintRepository,
                            UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
    }

    public List<ComplaintDto> getAll() {
        List<Complaint> list = complaintRepository
                .findAll(Sort.by(Sort.Direction.DESC, "complaintDate", "complaintId"));

        Set<Integer> ids = list.stream().map(Complaint::getUserId).collect(Collectors.toSet());
        Map<Integer, String> names = userRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(User::getUserId, User::getUserName));

        return list.stream().map(c -> toDto(c, names.get(c.getUserId()))).toList();
    }

    @Transactional
    public ComplaintDto create(User principal, ComplaintRequest req) {
        Complaint c = new Complaint();
        c.setUserId(principal.getUserId());
        c.setComplaintText(req.getComplaintText().trim());
        c.setComplaintDate(Instant.now().truncatedTo(ChronoUnit.MILLIS));

        return toDto(complaintRepository.save(c), principal.getUserName());
    }

    @Transactional
    public ComplaintDto update(Integer id, User principal, ComplaintRequest req) {
        Complaint c = find(id);

        // sirf apni complaint edit ho sakti hai
        if (!c.getUserId().equals(principal.getUserId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only edit your own complaint");
        }

        c.setComplaintText(req.getComplaintText().trim());
        return toDto(complaintRepository.save(c), principal.getUserName());
    }

    @Transactional
    public void delete(Integer id, User principal) {
        Complaint c = find(id);

        boolean isAdmin = "admin".equals(principal.getUserRole());
        if (!isAdmin && !c.getUserId().equals(principal.getUserId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only delete your own complaint");
        }

        complaintRepository.delete(c);
    }

    private Complaint find(Integer id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Complaint not found"));
    }

    private ComplaintDto toDto(Complaint c, String userName) {
        return new ComplaintDto(
                c.getComplaintId(),
                c.getUserId(),
                userName,
                c.getComplaintText(),
                c.getComplaintDate().toString());
    }
}