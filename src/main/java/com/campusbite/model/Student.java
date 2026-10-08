package com.campusbite.model;
public class Student extends User {
    private final String studentId;
    public Student(long id, String name, String email, String studentId) { super(id, name, email); this.studentId = studentId; }
    public String getStudentId() { return studentId; }
    @Override public String homeTitle() { return "WHAT'S FOR LUNCH?"; }
}
