package com.campusbite.ui;
import com.campusbite.repository.*;
import com.campusbite.service.*;
import javafx.application.Application;
import javafx.scene.*;
import javafx.stage.Stage;

public class Main extends Application {
    static final CanteenService svc = new CanteenService(new Repository());
    private static Stage stage;
    @Override public void start(Stage s) {
        Db.init(); stage = s; s.setTitle("CampusBite");
        show(new LoginView().build()); s.show();
    }
    static void show(Parent p) {
        Scene sc = new Scene(p, 1120, 740);
        sc.getStylesheets().add(Main.class.getResource("/styles.css").toExternalForm());
        stage.setScene(sc);
    }
    public static void main(String[] a) { launch(a); }
}
