package com.campusbite.ui;
import javafx.scene.control.*;

/** Tiny factory so screens never hard-code styling. */
final class Ui {
    private Ui() {}
    static Label label(String text, String style) { Label l = new Label(text); l.getStyleClass().add(style); l.setWrapText(true); return l; }
    static Button button(String text, String style, Runnable r) { Button b = new Button(text); b.getStyleClass().add(style); b.setOnAction(e -> r.run()); return b; }
    static void alert(String head, String msg) {
        Alert a = new Alert(Alert.AlertType.INFORMATION); a.setHeaderText(head); a.setContentText(msg); a.showAndWait();
    }
    static String rupee(double v) { return "₹" + (v == Math.rint(v) ? String.valueOf((long) v) : String.format("%.2f", v)); }
}
