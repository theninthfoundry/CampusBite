package com.campusbite.service;
/** Human-readable error; the UI never shows raw SQL/NPE messages. */
public class CanteenException extends RuntimeException {
    public CanteenException(String msg) { super(msg); }
    public CanteenException(String msg, Throwable cause) { super(msg, cause); }
}
