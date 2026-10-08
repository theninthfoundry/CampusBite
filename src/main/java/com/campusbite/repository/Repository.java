package com.campusbite.repository;
import com.campusbite.model.*;
import com.campusbite.service.CanteenException;
import java.sql.*;
import java.util.*;

/** All JDBC lives here; UI and services never touch SQL. */
public class Repository {
    private static CanteenException db(SQLException e) { return new CanteenException("Something went wrong with the database. Please try again.", e); }

    public User login(String id, String pw) {
        try (Connection c = Db.get(); PreparedStatement p = c.prepareStatement(
                "SELECT * FROM users WHERE (email=? OR student_id=?) AND password_hash=?")) {
            p.setString(1, id); p.setString(2, id); p.setString(3, Db.hash(pw));
            ResultSet r = p.executeQuery();
            if (!r.next()) return null;
            return "ADMIN".equals(r.getString("role"))
                ? new Admin(r.getLong("id"), r.getString("name"), r.getString("email"))
                : new Student(r.getLong("id"), r.getString("name"), r.getString("email"), r.getString("student_id"));
        } catch (SQLException e) { throw db(e); }
    }

    public List<FoodItem> foods() {
        List<FoodItem> list = new ArrayList<>();
        try (Connection c = Db.get(); Statement s = c.createStatement();
             ResultSet r = s.executeQuery("SELECT * FROM food_items ORDER BY category, name")) {
            while (r.next()) list.add(new FoodItem(r.getLong("id"), r.getString("name"), r.getString("description"),
                r.getDouble("price"), r.getString("category"), r.getBoolean("available"), r.getInt("prep_min")));
        } catch (SQLException e) { throw db(e); }
        return list;
    }

    public void setAvailable(long foodId, boolean on) { exec("UPDATE food_items SET available=? WHERE id=?", on, foodId); }
    public void addFood(String name, double price, String cat, int prep) {
        exec("INSERT INTO food_items(name,description,price,category,prep_min) VALUES(?,?,?,?,?)", name, "Made fresh today", price, cat, prep);
    }
    public void restock(long invId, double amount) {
        exec("UPDATE inventory SET qty=qty+? WHERE id=?", amount, invId);
        exec("UPDATE food_items SET available=TRUE WHERE ingredient_id IN (SELECT id FROM inventory WHERE qty>min_qty)");
    }
    public void advance(long orderId, OrderStatus next) { exec("UPDATE orders SET status=? WHERE id=?", next.name(), orderId); }

    /** One transaction: reserve stock, write order + items, auto-disable low-stock dishes. */
    public long placeOrder(User u, Cart cart, double total, int eta) {
        try (Connection c = Db.get()) {
            c.setAutoCommit(false);
            try {
                long oid;
                try (PreparedStatement p = c.prepareStatement("INSERT INTO orders(user_id,total,status,eta_min) VALUES(?,?,'NEW',?)", Statement.RETURN_GENERATED_KEYS)) {
                    p.setLong(1, u.getId()); p.setDouble(2, total); p.setInt(3, eta); p.executeUpdate();
                    ResultSet k = p.getGeneratedKeys(); k.next(); oid = k.getLong(1);
                }
                for (Cart.Item it : cart.items()) {
                    FoodItem f = it.getFood();
                    try (PreparedStatement p = c.prepareStatement("SELECT available, ingredient_id, per_serving FROM food_items WHERE id=?")) {
                        p.setLong(1, f.getId()); ResultSet r = p.executeQuery(); r.next();
                        if (!r.getBoolean(1)) throw new CanteenException(f.getName() + " is currently unavailable.");
                        long ing = r.getLong(2);
                        if (!r.wasNull()) try (PreparedStatement d = c.prepareStatement("UPDATE inventory SET qty=qty-? WHERE id=? AND qty>=?")) {
                            double need = r.getDouble(3) * it.getQty();
                            d.setDouble(1, need); d.setLong(2, ing); d.setDouble(3, need);
                            if (d.executeUpdate() == 0) throw new CanteenException("Sorry, " + f.getName() + " just ran out.");
                        }
                    }
                    try (PreparedStatement p = c.prepareStatement("INSERT INTO order_items(order_id,food_id,quantity,price) VALUES(?,?,?,?)")) {
                        p.setLong(1, oid); p.setLong(2, f.getId()); p.setInt(3, it.getQty()); p.setDouble(4, f.getPrice()); p.executeUpdate();
                    }
                }
                try (Statement s = c.createStatement()) {
                    s.executeUpdate("UPDATE food_items SET available=FALSE WHERE ingredient_id IN (SELECT id FROM inventory WHERE qty<=min_qty)");
                }
                c.commit(); return oid;
            } catch (RuntimeException | SQLException e) { c.rollback(); throw e; }
        } catch (SQLException e) { throw db(e); }
    }

    public int queueLength() {
        try (Connection c = Db.get(); Statement s = c.createStatement();
             ResultSet r = s.executeQuery("SELECT COUNT(*) FROM orders WHERE status IN ('NEW','PREPARING')")) { r.next(); return r.getInt(1); }
        catch (SQLException e) { throw db(e); }
    }

    private static final String ORDER_SQL = "SELECT o.*, u.name uname, (SELECT LISTAGG(f.name || ' x' || oi.quantity, ', ') FROM order_items oi JOIN food_items f ON f.id=oi.food_id WHERE oi.order_id=o.id) summary FROM orders o JOIN users u ON u.id=o.user_id ";
    public List<Order> orders(Long userId, boolean activeOnly) {
        String where = userId != null ? "WHERE o.user_id=" + userId.longValue() : activeOnly ? "WHERE o.status<>'COLLECTED'" : "";
        List<Order> list = new ArrayList<>();
        try (Connection c = Db.get(); Statement s = c.createStatement(); ResultSet r = s.executeQuery(ORDER_SQL + where + " ORDER BY o.id DESC")) {
            while (r.next()) list.add(new Order(r.getLong("id"), r.getString("uname"), r.getDouble("total"), OrderStatus.valueOf(r.getString("status")),
                r.getTimestamp("created").toLocalDateTime(), r.getInt("eta_min"), r.getString("summary")));
        } catch (SQLException e) { throw db(e); }
        return list;
    }

    /** Foods most often bought together with the user's favourite item. */
    public List<Long> coOrdered(long userId) {
        String q = "SELECT b.food_id FROM order_items b WHERE b.food_id<>? AND b.order_id IN (SELECT order_id FROM order_items WHERE food_id=?) GROUP BY b.food_id ORDER BY COUNT(*) DESC LIMIT 3";
        Long fav = favourite(userId);
        List<Long> ids = new ArrayList<>();
        if (fav == null) return ids;
        try (Connection c = Db.get(); PreparedStatement p = c.prepareStatement(q)) {
            p.setLong(1, fav); p.setLong(2, fav); ResultSet r = p.executeQuery();
            while (r.next()) ids.add(r.getLong(1));
        } catch (SQLException e) { throw db(e); }
        return ids;
    }
    public Long favourite(long userId) {
        try (Connection c = Db.get(); PreparedStatement p = c.prepareStatement(
                "SELECT oi.food_id FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.user_id=? GROUP BY oi.food_id ORDER BY SUM(oi.quantity) DESC LIMIT 1")) {
            p.setLong(1, userId); ResultSet r = p.executeQuery(); return r.next() ? r.getLong(1) : null;
        } catch (SQLException e) { throw db(e); }
    }

    /** rows: {id, ingredient, qty, unit, min} */
    public List<Object[]> inventory() {
        List<Object[]> l = new ArrayList<>();
        try (Connection c = Db.get(); Statement s = c.createStatement(); ResultSet r = s.executeQuery("SELECT * FROM inventory ORDER BY ingredient")) {
            while (r.next()) l.add(new Object[]{r.getLong("id"), r.getString("ingredient"), r.getDouble("qty"), r.getString("unit"), r.getDouble("min_qty")});
        } catch (SQLException e) { throw db(e); }
        return l;
    }

    public Map<String, Integer> popular() { return counts("SELECT f.name k, SUM(oi.quantity) v FROM order_items oi JOIN food_items f ON f.id=oi.food_id GROUP BY f.name ORDER BY v DESC LIMIT 5"); }
    public Map<String, Integer> peakHours() { return counts("SELECT CAST(HOUR(created) AS VARCHAR) || ':00' k, COUNT(*) v FROM orders GROUP BY HOUR(created) ORDER BY HOUR(created)"); }
    private Map<String, Integer> counts(String q) {
        Map<String, Integer> m = new LinkedHashMap<>();
        try (Connection c = Db.get(); Statement s = c.createStatement(); ResultSet r = s.executeQuery(q)) { while (r.next()) m.put(r.getString("k"), r.getInt("v")); }
        catch (SQLException e) { throw db(e); }
        return m;
    }
    /** {count, revenue} */
    public double[] totals(Long userId) {
        String q = "SELECT COUNT(*), COALESCE(SUM(total),0) FROM orders" + (userId != null ? " WHERE user_id=" + userId.longValue() : "");
        try (Connection c = Db.get(); Statement s = c.createStatement(); ResultSet r = s.executeQuery(q)) { r.next(); return new double[]{r.getInt(1), r.getDouble(2)}; }
        catch (SQLException e) { throw db(e); }
    }

    private void exec(String sql, Object... args) {
        try (Connection c = Db.get(); PreparedStatement p = c.prepareStatement(sql)) {
            for (int i = 0; i < args.length; i++) p.setObject(i + 1, args[i]);
            p.executeUpdate();
        } catch (SQLException e) { throw db(e); }
    }
}
