package com.campusbite.model;
import java.util.*;
/** Composition: a Cart owns its Items. */
public class Cart {
    public static class Item {
        private final FoodItem food; private int qty;
        Item(FoodItem f) { food = f; }
        public FoodItem getFood() { return food; } public int getQty() { return qty; }
    }
    private final Map<Long, Item> items = new LinkedHashMap<>();
    public void add(FoodItem f) {
        Item i = items.computeIfAbsent(f.getId(), k -> new Item(f));
        if (i.qty < 10) i.qty++;
    }
    public void remove(FoodItem f) {
        Item i = items.get(f.getId());
        if (i != null && --i.qty <= 0) items.remove(f.getId());
    }
    public Collection<Item> items() { return items.values(); }
    public boolean isEmpty() { return items.isEmpty(); }
    public void clear() { items.clear(); }
    public double total() { return items.values().stream().mapToDouble(i -> i.food.getPrice() * i.qty).sum(); }
}
