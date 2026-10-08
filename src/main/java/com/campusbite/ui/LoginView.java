package com.campusbite.ui;
import com.campusbite.model.*;
import com.campusbite.service.CanteenException;
import javafx.geometry.*;
import javafx.scene.Parent;
import javafx.scene.control.*;
import javafx.scene.layout.*;

class LoginView {
    Parent build() {
        VBox left = new VBox(8, Ui.label("CAMPUSBITE", "micro"), Ui.label("GOOD FOOD.\nLESS WAITING.", "display"),
            Ui.label("Your campus canteen, without the queue.", "muted"));
        left.setAlignment(Pos.CENTER_LEFT); left.setPadding(new Insets(0, 0, 0, 72)); HBox.setHgrow(left, Priority.ALWAYS);
        TextField id = new TextField(); id.setPromptText("Student ID / Email");
        PasswordField pw = new PasswordField(); pw.setPromptText("Password");
        Label err = Ui.label("", "error");
        Runnable go = () -> {
            try {
                User u = Main.svc.login(id.getText(), pw.getText());
                Main.show(u instanceof Admin a ? new AdminView(a).build() : new StudentView((Student) u).build());
            } catch (CanteenException e) { err.setText(e.getMessage()); }
        };
        pw.setOnAction(e -> go.run());
        VBox form = new VBox(14, Ui.label("Welcome back.", "h2"), id, pw, err, Ui.button("LOGIN", "primary", go),
            new Separator(), Ui.label("DEMO ACCOUNTS", "micro"),
            Ui.button("Student  ·  demo@campus.edu", "ghost", () -> { id.setText("demo@campus.edu"); pw.setText("student123"); }),
            Ui.button("Admin  ·  admin@campus.edu", "ghost", () -> { id.setText("admin@campus.edu"); pw.setText("admin123"); }));
        form.setMaxWidth(340); form.setPadding(new Insets(40));
        StackPane right = new StackPane(form); right.setPrefWidth(520); right.getStyleClass().add("panel");
        HBox root = new HBox(left, right); root.getStyleClass().add("root-paper"); return root;
    }
}
