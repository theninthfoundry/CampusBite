package com.campusbite.model;
import java.time.LocalDateTime;
public class Order {
    private final long id; private final String customer, summary; private final double total;
    private final OrderStatus status; private final LocalDateTime created; private final int etaMin;
    public Order(long id, String customer, double total, OrderStatus status, LocalDateTime created, int etaMin, String summary) {
        this.id = id; this.customer = customer; this.total = total; this.status = status;
        this.created = created; this.etaMin = etaMin; this.summary = summary;
    }
    public long getId() { return id; } public String getCustomer() { return customer; }
    public double getTotal() { return total; } public OrderStatus getStatus() { return status; }
    public LocalDateTime getCreated() { return created; } public int getEtaMin() { return etaMin; }
    public String getSummary() { return summary; }
}
