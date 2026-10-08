package com.campusbite.service;
import com.campusbite.model.*;
import com.campusbite.repository.Repository;
import java.time.LocalDateTime;
import java.util.*;

/** Business rules: validation, ETA, recommendations. No SQL, no JavaFX. */
public class CanteenService {
    private final Repository repo;
    public CanteenService(Repository repo) { this.repo = repo; }
    public Repository data() { return repo; }

    public User login(String id, String pw) {
        if (id == null || id.isBlank() || pw == null || pw.isEmpty()) throw new CanteenException("Enter your ID and password.");
        User u = repo.login(id.trim(), pw);
        if (u == null) throw new CanteenException("Wrong ID or password.");
        return u;
    }

    /** Longest prep time in the cart + 2 min per order already in the queue. */
    public int estimate(Cart cart) {
        return cart.items().stream().mapToInt(i -> i.getFood().getPrepMin()).max().orElse(0) + 2 * repo.queueLength();
    }

    public Order placeOrder(User u, Cart cart) {
        if (cart.isEmpty()) throw new CanteenException("Your cart is empty.");
        int eta = estimate(cart); double total = cart.total();
        long id = repo.placeOrder(u, cart, total, eta);
        return new Order(id, u.getName(), total, OrderStatus.NEW, LocalDateTime.now(), eta, "");
    }

    public void advance(Order o) { repo.advance(o.getId(), o.getStatus().next()); }

    public List<FoodItem> recommend(long userId) {
        Map<Long, FoodItem> byId = new HashMap<>();
        repo.foods().forEach(f -> byId.put(f.getId(), f));
        List<FoodItem> out = new ArrayList<>();
        for (long id : repo.coOrdered(userId)) { FoodItem f = byId.get(id); if (f != null && f.isAvailable()) out.add(f); }
        return out;
    }
    public String favouriteName(long userId) {
        Long id = repo.favourite(userId);
        return id == null ? null : repo.foods().stream().filter(f -> f.getId() == id).map(FoodItem::getName).findFirst().orElse(null);
    }

    public void addFood(String name, String price, String cat, String prep) {
        try {
            double p = Double.parseDouble(price.trim()); int m = Integer.parseInt(prep.trim());
            if (name.isBlank() || p <= 0 || m <= 0) throw new NumberFormatException();
            repo.addFood(name.trim(), p, cat.trim().isEmpty() ? "Meals" : cat.trim(), m);
        } catch (NumberFormatException e) { throw new CanteenException("Enter a name, a positive price and prep minutes."); }
    }
}
