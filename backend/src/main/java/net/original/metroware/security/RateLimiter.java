package net.original.metroware.security;

import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class RateLimiter {

    private record Window(long start, long windowMs, int count) {
    }

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    public boolean allow(String key, int max, long windowMs) {
        long now = System.currentTimeMillis();
        boolean[] allowed = { false };

        windows.compute(key, (k, w) -> {
            if (w == null || now - w.start() >= windowMs) {
                allowed[0] = true;
                return new Window(now, windowMs, 1);
            }
            if (w.count() < max) {
                allowed[0] = true;
                return new Window(w.start(), windowMs, w.count() + 1);
            }
            return w;
        });

        cleanup(now);
        return allowed[0];
    }

    public boolean isLimited(String key, int max, long windowMs) {
        Window w = windows.get(key);
        return w != null
                && System.currentTimeMillis() - w.start() < windowMs
                && w.count() >= max;
    }

    public void record(String key, long windowMs) {
        long now = System.currentTimeMillis();
        windows.compute(key, (k, w) -> (w == null || now - w.start() >= windowMs)
                ? new Window(now, windowMs, 1)
                : new Window(w.start(), windowMs, w.count() + 1));
        cleanup(now);
    }

    public void reset(String key) {
        windows.remove(key);
    }

    private void cleanup(long now) {
        if (windows.size() > 10_000) {
            windows.entrySet().removeIf(e -> now - e.getValue().start() >= e.getValue().windowMs());
        }
    }
}