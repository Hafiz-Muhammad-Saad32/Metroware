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

import net.original.metroware.Entity.ItemType;
import net.original.metroware.Entity.LostFoundThing;
import net.original.metroware.Entity.User;
import net.original.metroware.Repository.LostFoundThingRepository;
import net.original.metroware.Repository.UserRepository;
import net.original.metroware.dto.LostFoundDto;
import net.original.metroware.dto.LostFoundRequest;
import net.original.metroware.exception.ApiException;

@Service
public class LostFoundService {

    private final LostFoundThingRepository repository;
    private final UserRepository userRepository;

    public LostFoundService(LostFoundThingRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    public List<LostFoundDto> getAll() {
        List<LostFoundThing> list = repository
                .findAll(Sort.by(Sort.Direction.DESC, "date", "itemId"));

        Set<Integer> ids = list.stream().map(LostFoundThing::getUserId).collect(Collectors.toSet());
        Map<Integer, String> names = userRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(User::getUserId, User::getUserName));

        return list.stream().map(i -> toDto(i, names.get(i.getUserId()))).toList();
    }

    @Transactional
    public LostFoundDto create(User principal, LostFoundRequest req) {
        LostFoundThing item = new LostFoundThing();
        item.setUserId(principal.getUserId());
        item.setDate(Instant.now().truncatedTo(ChronoUnit.MILLIS));
        apply(item, req);

        return toDto(repository.save(item), principal.getUserName());
    }

    @Transactional
    public LostFoundDto update(Integer id, User principal, LostFoundRequest req) {
        LostFoundThing item = find(id);

        if (!item.getUserId().equals(principal.getUserId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only edit your own post");
        }

        apply(item, req);
        return toDto(repository.save(item), principal.getUserName());
    }

    @Transactional
    public void delete(Integer id, User principal) {
        LostFoundThing item = find(id);

        boolean isAdmin = "admin".equals(principal.getUserRole());
        if (!isAdmin && !item.getUserId().equals(principal.getUserId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only delete your own post");
        }

        repository.delete(item);
    }

    private void apply(LostFoundThing item, LostFoundRequest req) {
        item.setItemName(req.getItemName().trim());
        item.setDescription(req.getDescription().trim());
        item.setItemType(ItemType.valueOf(req.getItemType().toUpperCase()));
    }

    private LostFoundThing find(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Post not found"));
    }

    private LostFoundDto toDto(LostFoundThing i, String userName) {
        return new LostFoundDto(
                i.getItemId(),
                i.getUserId(),
                userName,
                i.getItemName(),
                i.getDescription(),
                i.getItemType().name().toLowerCase(),
                i.getDate().toString());
    }
}