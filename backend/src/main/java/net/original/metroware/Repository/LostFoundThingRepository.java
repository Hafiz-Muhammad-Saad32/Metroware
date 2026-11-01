package net.original.metroware.Repository;


import net.original.metroware.Entity.LostFoundThing;
import org.springframework.data.jpa.repository.JpaRepository;
public interface LostFoundThingRepository
        extends JpaRepository<LostFoundThing,Integer> {
}