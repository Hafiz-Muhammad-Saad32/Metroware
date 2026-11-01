package net.original.metroware.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.original.metroware.Entity.Bus;
import net.original.metroware.Service.BusService;

@RestController
@RequestMapping("/api/buses")
public class BusController {

    private final BusService busService;

    public BusController(BusService busService) {
        this.busService = busService;
    }

    @GetMapping
    public List<Bus> getBuses() {
        return busService.getAllBuses();
    }

    // sirf admin: aisi bus hatane ke liye jo kisi route par nahi (route delete ke baad)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBus(@PathVariable("id") Long id) {
        busService.deleteBus(id);
        return ResponseEntity.noContent().build();
    }
}