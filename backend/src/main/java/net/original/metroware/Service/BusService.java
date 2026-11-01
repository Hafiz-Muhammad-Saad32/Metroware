package net.original.metroware.Service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import net.original.metroware.Entity.Bus;
import net.original.metroware.Repository.BusRepository;
import net.original.metroware.exception.ApiException;

@Service
public class BusService {

    private final BusRepository busRepository;

    public BusService(BusRepository busRepository) {
        this.busRepository = busRepository;
    }

    public List<Bus> getAllBuses() {
        return busRepository.findAll(Sort.by("busId"));
    }

    public void deleteBus(Long id) {
        if (!busRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Bus not found");
        }
        busRepository.deleteById(id);
    }
}