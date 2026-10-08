package com.campusbite.ui;
import com.campusbite.model.*;
import com.campusbite.service.CanteenException;
import javafx.animation.*;
import javafx.geometry.*;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.util.Duration;
import java.util.List;

class StudentView {
    private final Student me; private final Cart cart = new Cart();
    private final BorderPane root = new BorderPane(); private final VBox cartBox = new VBox(10);
    private Timeline poll;
    StudentView(Student s) { me = s; }

    Parent build() {
        HBox nav = new HBox(24, Ui.label("CAMPUSBITE", "brand"), Ui.button("MENU / 01", "nav", () -> open(menu())),
            Ui.button("ORDERS / 02", "nav", () -> open(orders())), Ui.button("PROFILE / 03", "nav", () -> open(profile())));
        nav.setPadding(new Insets(20, 40, 20, 40)); nav.setAlignment(Pos.CENTER_LEFT);
        ScrollPane cartPane = new ScrollPane(cartBox); cartPane.setFitToWidth(true); cartPane.setPrefWidth(300);
        cartBox.setPadding(new Insets(24)); cartPane.getStyleClass().add("panel");
        root.setTop(nav); root.setRight(cartPane); root.getStyleClass().add("root-paper");
        open(menu()); refreshCart(); return root;
    }
    private void open(Node n) { if (poll != null) poll.stop(); root.setCenter(n); }

    // ---------- menu ----------
    private Node menu() {
        String[] cat = {"All"};
        TextField search = new TextField(); search.setPromptText("Search dishes, snacks, drinks...");
        FlowPane grid = new FlowPane(16, 16); grid.setPadding(new Insets(8, 0, 24, 0));
        HBox cats = new HBox(8); VBox rec = new VBox(8);
        Runnable render = () -> {
            grid.getChildren().clear();
            for (FoodItem f : Main.svc.data().foods())
                if ((cat[0].equals("All") || f.getCategory().equals(cat[0])) && f.getName().toLowerCase().contains(search.getText().toLowerCase().trim()))
                    grid.getChildren().add(card(f));
            if (grid.getChildren().isEmpty()) grid.getChildren().add(Ui.label("NOTHING FOUND. Try another search.", "h2"));
        };
        for (String c : List.of("All", "Meals", "Snacks", "Drinks", "Desserts"))
            cats.getChildren().add(Ui.button(c.toUpperCase(), "chip", () -> { cat[0] = c; render.run(); }));
        search.textProperty().addListener((o, a, b) -> render.run());
        List<FoodItem> picks = Main.svc.recommend(me.getId());
        if (!picks.isEmpty()) {
            HBox row = new HBox(12); picks.forEach(f -> row.getChildren().add(card(f)));
            rec.getChildren().addAll(Ui.label("BECAUSE YOU ORDERED " + Main.svc.favouriteName(me.getId()).toUpperCase() + "...", "micro"), row);
        }
        render.run();
        VBox v = new VBox(16, Ui.label("GOOD DAY, " + me.getName().toUpperCase() + ".", "micro"), Ui.label(me.homeTitle(), "display"), search, cats, rec, grid);
        v.setPadding(new Insets(8, 40, 24, 40));
        ScrollPane sp = new ScrollPane(v); sp.setFitToWidth(true); return sp;
    }
    private Node card(FoodItem f) {
        Button add = Ui.button(f.isAvailable() ? "+ ADD" : "SOLD OUT", "primary", () -> { cart.add(f); refreshCart(); });
        add.setDisable(!f.isAvailable());
        VBox c = new VBox(6, Ui.label(f.getCategory().toUpperCase(), "micro"), Ui.label(f.getName(), "h3"), Ui.label(f.getDescription(), "muted"),
            Ui.label(Ui.rupee(f.getPrice()) + "  ·  " + f.getPrepMin() + " min", "price"), add);
        c.getStyleClass().add("card"); c.setPrefWidth(220); c.setOpacity(f.isAvailable() ? 1 : 0.5); return c;
    }

    // ---------- cart ----------
    private void refreshCart() {
        cartBox.getChildren().setAll(Ui.label("YOUR CART", "micro"));
        if (cart.isEmpty()) { cartBox.getChildren().add(Ui.label("YOUR CART IS EMPTY.\nFind something good.", "muted")); return; }
        for (Cart.Item i : cart.items()) {
            HBox r = new HBox(8, Ui.label(i.getFood().getName(), "h3"), Ui.button("−", "chip", () -> { cart.remove(i.getFood()); refreshCart(); }),
                Ui.label(String.valueOf(i.getQty()), "h3"), Ui.button("+", "chip", () -> { cart.add(i.getFood()); refreshCart(); }));
            cartBox.getChildren().add(r);
        }
        cartBox.getChildren().addAll(new Separator(), Ui.label("TOTAL  " + Ui.rupee(cart.total()), "h2"),
            Ui.label("Pickup: Main Canteen · Cash at counter\nEstimated " + Main.svc.estimate(cart) + " min", "muted"),
            Ui.button("PLACE ORDER", "primary", () -> {
                try {
                    Order o = Main.svc.placeOrder(me, cart); cart.clear(); refreshCart();
                    Ui.alert("ORDER CONFIRMED.", "#" + o.getId() + "  ·  ready in about " + o.getEtaMin() + " min"); open(orders());
                } catch (CanteenException e) { Ui.alert("Couldn't place order", e.getMessage()); refreshCart(); }
            }));
    }

    // ---------- orders / profile ----------
    private Node orders() {
        VBox list = new VBox(12); list.setPadding(new Insets(8, 40, 24, 40));
        Runnable render = () -> {
            list.getChildren().setAll(Ui.label("ORDERS", "display"));
            List<Order> os = Main.svc.data().orders(me.getId(), false);
            if (os.isEmpty()) list.getChildren().add(Ui.label("NO ORDERS YET. Your next meal is waiting.", "h2"));
            for (Order o : os) {
                StringBuilder t = new StringBuilder();
                for (OrderStatus s : OrderStatus.values())
                    t.append(s.ordinal() < o.getStatus().ordinal() || o.getStatus() == OrderStatus.COLLECTED ? "✓ " : s == o.getStatus() ? "● " : "○ ").append(s.label()).append("   ");
                VBox c = new VBox(4, Ui.label("#" + o.getId() + "  ·  " + Ui.rupee(o.getTotal()), "h3"), Ui.label(o.getSummary(), "muted"), Ui.label(t.toString(), "status"));
                c.getStyleClass().add("card"); list.getChildren().add(c);
            }
        };
        render.run();
        poll = new Timeline(new KeyFrame(Duration.seconds(4), e -> render.run())); poll.setCycleCount(Animation.INDEFINITE); poll.play();
        ScrollPane sp = new ScrollPane(list); sp.setFitToWidth(true); return sp;
    }
    private Node profile() {
        double[] t = Main.svc.data().totals(me.getId()); String fav = Main.svc.favouriteName(me.getId());
        VBox v = new VBox(12, Ui.label(me.getName().toUpperCase(), "display"), Ui.label(me.getStudentId() + "  ·  " + me.getEmail(), "muted"),
            Ui.label("ORDERS  " + (int) t[0] + "     SPENT  " + Ui.rupee(t[1]) + "     FAVOURITE  " + (fav == null ? "—" : fav), "h3"),
            Ui.button("LOGOUT", "ghost", () -> { if (poll != null) poll.stop(); Main.show(new LoginView().build()); }));
        v.setPadding(new Insets(8, 40, 24, 40)); return v;
    }
}
