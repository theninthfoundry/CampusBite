package com.campusbite.model;
public enum OrderStatus {
    NEW("ORDERED"), PREPARING("PREPARING"), READY("READY"), COLLECTED("COLLECTED");
    private final String label;
    OrderStatus(String label) { this.label = label; }
    public String label() { return label; }
    public OrderStatus next() { return this == COLLECTED ? this : values()[ordinal() + 1]; }
}
