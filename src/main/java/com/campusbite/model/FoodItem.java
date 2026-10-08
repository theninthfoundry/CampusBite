package com.campusbite.model;
public class FoodItem {
    private final long id; private final String name, description, category;
    private final double price; private final boolean available; private final int prepMin;
    public FoodItem(long id, String name, String description, double price, String category, boolean available, int prepMin) {
        this.id = id; this.name = name; this.description = description; this.price = price;
        this.category = category; this.available = available; this.prepMin = prepMin;
    }
    public long getId() { return id; } public String getName() { return name; }
    public String getDescription() { return description; } public double getPrice() { return price; }
    public String getCategory() { return category; } public boolean isAvailable() { return available; }
    public int getPrepMin() { return prepMin; }
}
