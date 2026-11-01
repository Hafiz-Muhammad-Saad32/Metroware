package net.original.metroware.Repository;

import net.original.metroware.Entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserRepository
        extends JpaRepository<User,Integer> {

    Optional<User> findByUserEmail(String email);
}
