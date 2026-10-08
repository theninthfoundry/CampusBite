package com.campusbite.repository;
import java.security.MessageDigest;
import java.sql.*;
import java.util.HexFormat;

/** Embedded H2 database (file ./campusbite). Zero setup; same JDBC code works on MySQL. */
public final class Db {
    private Db() {}
    public static Connection get() throws SQLException { return DriverManager.getConnection("jdbc:h2:./campusbite", "sa", ""); }
    public static String hash(String s) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(s.getBytes())); }
        catch (Exception e) { throw new IllegalStateException(e); }
    }
    public static void init() {
        try (Connection c = get(); Statement s = c.createStatement()) {
            s.execute("CREATE TABLE IF NOT EXISTS users(id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(64), student_id VARCHAR(16), email VARCHAR(120) UNIQUE, password_hash VARCHAR(80), role VARCHAR(10))");
            s.execute("CREATE TABLE IF NOT EXISTS inventory(id BIGINT AUTO_INCREMENT PRIMARY KEY, ingredient VARCHAR(60), qty DOUBLE, unit VARCHAR(10), min_qty DOUBLE)");
            s.execute("CREATE TABLE IF NOT EXISTS food_items(id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(80), description VARCHAR(255), price DOUBLE, category VARCHAR(20), available BOOLEAN DEFAULT TRUE, prep_min INT, ingredient_id BIGINT, per_serving DOUBLE DEFAULT 0)");
            s.execute("CREATE TABLE IF NOT EXISTS orders(id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id BIGINT, total DOUBLE, status VARCHAR(12), created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, eta_min INT)");
            s.execute("CREATE TABLE IF NOT EXISTS order_items(id BIGINT AUTO_INCREMENT PRIMARY KEY, order_id BIGINT, food_id BIGINT, quantity INT, price DOUBLE)");
            ResultSet r = s.executeQuery("SELECT COUNT(*) FROM users"); r.next();
            if (r.getInt(1) == 0) seed(c);
        } catch (SQLException e) { throw new RuntimeException("Could not start database", e); }
    }
    private static void seed(Connection c) throws SQLException {
        String[][] users = {{"Canteen Admin", null, "admin@campus.edu", "admin123", "ADMIN"},
            {"Sreeshanth", "25R11A0501", "demo@campus.edu", "student123", "STUDENT"},
            {"Chandrashekar", "25R11A0522", "chandrashekar@campus.edu", "student123", "STUDENT"}};
        try (PreparedStatement p = c.prepareStatement("INSERT INTO users(name,student_id,email,password_hash,role) VALUES(?,?,?,?,?)")) {
            for (String[] u : users) { p.setString(1, u[0]); p.setString(2, u[1]); p.setString(3, u[2]); p.setString(4, hash(u[3])); p.setString(5, u[4]); p.executeUpdate(); }
        }
        Object[][] inv = {{"Rice", 18, "kg", 3}, {"Chicken", 6, "kg", 1.5}, {"Paneer", 2, "kg", 1.5}, {"Bread", 12, "packs", 2}, {"Oil", 8, "L", 1}, {"Milk", 10, "L", 2}};
        try (PreparedStatement p = c.prepareStatement("INSERT INTO inventory(ingredient,qty,unit,min_qty) VALUES(?,?,?,?)")) {
            for (Object[] i : inv) { for (int k = 0; k < 4; k++) p.setObject(k + 1, i[k]); p.executeUpdate(); }
        }
        // name, description, price, category, prep, ingredient_id (null = none), per-serving use
        Object[][] food = {
            {"Chicken Biryani", "Spiced basmati rice, chicken & house masala", 120, "Meals", 12, 2, 0.25},
            {"Veg Biryani", "Basmati, seasonal vegetables, whole spices", 90, "Meals", 10, 1, 0.2},
            {"Paneer Rice", "Wok-tossed rice with paneer cubes", 100, "Meals", 10, 3, 0.25},
            {"Veg Pizza", "Thin crust, mozzarella, roasted vegetables", 90, "Snacks", 14, 4, 1},
            {"Chicken Burger", "Crisp chicken patty, house sauce", 80, "Snacks", 8, 2, 0.15},
            {"Masala Dosa", "Crisp dosa, potato masala, chutneys", 60, "Meals", 8, 1, 0.15},
            {"Samosa", "Two pieces, mint chutney", 25, "Snacks", 3, 5, 0.1},
            {"French Fries", "Salted, crisp", 50, "Snacks", 6, 5, 0.1},
            {"Masala Coke", "Fizzy, lime, chaat masala", 40, "Drinks", 2, null, 0},
            {"Cold Coffee", "Chilled, milky, lightly sweet", 60, "Drinks", 4, 6, 0.2},
            {"Lemon Tea", "Hot, black, fresh lemon", 20, "Drinks", 3, null, 0},
            {"Gulab Jamun", "Two pieces, warm syrup", 40, "Desserts", 2, null, 0},
            {"Ice Cream", "Vanilla scoop", 35, "Desserts", 1, null, 0}};
        try (PreparedStatement p = c.prepareStatement("INSERT INTO food_items(name,description,price,category,prep_min,ingredient_id,per_serving) VALUES(?,?,?,?,?,?,?)")) {
            for (Object[] f : food) { for (int k = 0; k < 7; k++) p.setObject(k + 1, f[k]); p.executeUpdate(); }
        }
        // past orders so recommendations work on first run
        int[][] past = {{3, 1, 9, 12}, {3, 1, 9}, {3, 4, 8}, {2, 1}};
        for (int[] o : past) {
            try (Statement s = c.createStatement()) {
                s.executeUpdate("INSERT INTO orders(user_id,total,status,eta_min) VALUES(" + o[0] + ",100,'COLLECTED',10)");
                ResultSet r = s.executeQuery("SELECT MAX(id) FROM orders"); r.next(); long oid = r.getLong(1);
                for (int k = 1; k < o.length; k++) s.executeUpdate("INSERT INTO order_items(order_id,food_id,quantity,price) VALUES(" + oid + "," + o[k] + ",1,50)");
            }
        }
    }
}
