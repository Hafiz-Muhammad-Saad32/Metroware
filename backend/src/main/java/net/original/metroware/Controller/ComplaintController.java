package net.original.metroware.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import net.original.metroware.Entity.User;
import net.original.metroware.Service.ComplaintService;
import net.original.metroware.dto.ComplaintDto;
import net.original.metroware.dto.ComplaintRequest;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping
    public List<ComplaintDto> getAll() {
        return complaintService.getAll();
    }

    @PostMapping
    public ComplaintDto create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ComplaintRequest request) {
        return complaintService.create(user, request);
    }

    @PutMapping("/{id}")
    public ComplaintDto update(
            @PathVariable("id") Integer id,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ComplaintRequest request) {
        return complaintService.update(id, user, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable("id") Integer id,
            @AuthenticationPrincipal User user) {
        complaintService.delete(id, user);
        return ResponseEntity.noContent().build();
    }
}