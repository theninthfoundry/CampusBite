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
import java.time.format.DateTimeFormatter;
import java.util.Map;

class AdminView {
    private final Admin me; private Timeline poll;
    AdminView(Admin a) { me = a; }

    Parent build() {
        TabPane tabs = new TabPane(tab("LIVE ORDERS", live()), tab("MENU", menu()), tab("INVENTORY", inventory()), tab("ANALYTICS", analytics()));
        tabs.setTabClosingPolicy(TabPane.TabClosingPolicy.UNAVAILABLE);
        tabs.getSelectionModel().selectedItemProperty().addListener((o, a, b) -> { if (b != null) b.setContent(rebuild(b.getText())); });
        Button out = Ui.button("LOGOUT", "ghost", () -> { if (poll != null) poll.stop(); Main.show(new LoginView().build()); });
        HBox top = new HBox(24, Ui.label("CAMPUSBITE / " + me.getName().toUpperCase(), "brand"), out); top.setPadding(new Insets(20, 40, 12, 40)); top.setAlignment(Pos.CENTER_LEFT);
        BorderPane root = new BorderPane(tabs); root.setTop(top); root.getStyleClass().add("root-paper"); return root;
    }
    private Tab tab(String t, Node n) { Tab x = new Tab(t, n); return x; }
    private Node rebuild(String t) {
        if (poll != null) poll.stop();
        return switch (t) { case "LIVE ORDERS" -> live(); case "MENU" -> menu(); case "INVENTORY" -> inventory(); default -> analytics(); };
    }

    private Node live() {
        HBox board = new HBox(16); board.setPadding(new Insets(24, 40, 24, 40));
        Runnable render = () -> {
            board.getChildren().clear();
            for (OrderStatus s : new OrderStatus[]{OrderStatus.NEW, OrderStatus.PREPARING, OrderStatus.READY}) {
                VBox col = new VBox(10, Ui.label(s.label(), "micro")); col.setPrefWidth(300); col.getStyleClass().add("panel"); col.setPadding(new Insets(16));
                for (Order o : Main.svc.data().orders(null, true)) if (o.getStatus() == s) {
                    String btn = switch (s) { case NEW -> "ACCEPT & START"; case PREPARING -> "MARK READY"; default -> "COLLECTED"; };
                    VBox c = new VBox(4, Ui.label("#" + o.getId() + "  ·  " + o.getCustomer(), "h3"), Ui.label(o.getSummary(), "muted"),
                        Ui.label(Ui.rupee(o.getTotal()) + "  ·  " + o.getCreated().format(DateTimeFormatter.ofPattern("h:mm a")), "price"),
                        Ui.button(btn, "primary", () -> { Main.svc.advance(o); }));
                    c.getStyleClass().add("card"); col.getChildren().add(c);
                }
                board.getChildren().add(col);
            }
        };
        render.run();
        poll = new Timeline(new KeyFrame(Duration.seconds(3), e -> render.run())); poll.setCycleCount(Animation.INDEFINITE); poll.play();
        ScrollPane sp = new ScrollPane(board); sp.setFitToHeight(true); return sp;
    }

    private Node menu() {
        VBox list = new VBox(8); list.setPadding(new Insets(24, 40, 24, 40));
        TextField n = new TextField(), p = new TextField(), c = new TextField(), m = new TextField();
        n.setPromptText("Name"); p.setPromptText("Price"); c.setPromptText("Category"); m.setPromptText("Prep min");
        Runnable[] render = new Runnable[1];
        render[0] = () -> {
            list.getChildren().setAll(Ui.label("MENU", "display"), new HBox(8, n, p, c, m, Ui.button("+ ADD ITEM", "primary", () -> {
                try { Main.svc.addFood(n.getText(), p.getText(), c.getText(), m.getText()); n.clear(); p.clear(); c.clear(); m.clear(); render[0].run(); }
                catch (CanteenException e) { Ui.alert("Check the form", e.getMessage()); }
            })));
            for (FoodItem f : Main.svc.data().foods())
                list.getChildren().add(new HBox(16, Ui.label(f.getName() + "  ·  " + Ui.rupee(f.getPrice()), "h3"),
                    Ui.label(f.isAvailable() ? "● AVAILABLE" : "○ OUT OF STOCK", "status"),
                    Ui.button(f.isAvailable() ? "DISABLE" : "ENABLE", "chip", () -> { Main.svc.data().setAvailable(f.getId(), !f.isAvailable()); render[0].run(); })));
        };
        render[0].run(); ScrollPane sp = new ScrollPane(list); sp.setFitToWidth(true); return sp;
    }

    private Node inventory() {
        VBox list = new VBox(8); list.setPadding(new Insets(24, 40, 24, 40));
        Runnable[] render = new Runnable[1];
        render[0] = () -> {
            list.getChildren().setAll(Ui.label("INVENTORY", "display"));
            for (Object[] r : Main.svc.data().inventory()) {
                double q = (double) r[2], min = (double) r[4];
                String st = q <= 0 ? "✕ OUT OF STOCK" : q <= min ? "⚠ LOW STOCK — dishes disabled" : "● GOOD";
                list.getChildren().add(new HBox(16, Ui.label(r[1] + "  " + String.format("%.2f", q) + " " + r[3], "h3"), Ui.label(st, "status"),
                    Ui.button("RESTOCK +10", "chip", () -> { Main.svc.data().restock((long) r[0], 10); render[0].run(); })));
            }
        };
        render[0].run(); ScrollPane sp = new ScrollPane(list); sp.setFitToWidth(true); return sp;
    }

    private Node analytics() {
        double[] t = Main.svc.data().totals(null);
        VBox v = new VBox(10, Ui.label("ANALYTICS", "display"),
            Ui.label("ORDERS  " + (int) t[0] + "     REVENUE  " + Ui.rupee(t[1]) + "     AVG ORDER  " + (t[0] == 0 ? "—" : Ui.rupee(t[1] / t[0])), "h2"),
            Ui.label("POPULAR ITEMS", "micro"));
        bars(v, Main.svc.data().popular()); v.getChildren().add(Ui.label("PEAK HOURS", "micro")); bars(v, Main.svc.data().peakHours());
        v.setPadding(new Insets(24, 40, 24, 40)); ScrollPane sp = new ScrollPane(v); sp.setFitToWidth(true); return sp;
    }
    private void bars(VBox v, Map<String, Integer> m) {
        m.forEach((k, n) -> v.getChildren().add(Ui.label(String.format("%-18s", k) + "█".repeat(Math.max(1, n)) + "  " + n, "mono")));
    }
}
