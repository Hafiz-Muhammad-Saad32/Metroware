package net.original.metroware.Repository;

import net.original.metroware.Entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComplaintRepository
        extends JpaRepository<Complaint,Integer> {
}
