package com.dvinedao.domain;

public final class PermissionLevel {
    public static final int REGULAR  = 0;
    public static final int PREMIUM  = 1;
    public static final int PARTNER  = 2;  // lowest admin
    public static final int MANAGER  = 3;
    public static final int OWNER    = 4;

    /** quick helper to validate */
    public static boolean isValid(int code) {
        return code >= REGULAR && code <= OWNER;
    }

    public static boolean isAdmin(Integer code) {
        return code != null && code >= PARTNER;
    }
    public static boolean isManager(Integer code) {
        return code == MANAGER;
    }
    public static boolean isOwner(Integer code) {
        return code == OWNER;
    }
}
