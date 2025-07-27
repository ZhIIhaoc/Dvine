package com.dvinedao.domain;

public final class PermissionLevel {
    public static final int GUEST    = -1; // guest users (not authenticated)
    public static final int REGULAR  = 0;
    public static final int PREMIUM  = 1;
    public static final int PARTNER  = 2;  // lowest admin
    public static final int MANAGER  = 3;
    public static final int OWNER    = 4;

    public static final int ADMIN    = 2;  // this one only used for admin check, not a real permission level

    /** quick helper to validate */
    public static boolean isValidToUpdate(int code) {
        return code >= REGULAR && code <= OWNER;
    }

    public static boolean isGuest(Integer code) {
        return code == GUEST;
    }
    public static boolean isPartner(Integer code) {
        return code == PARTNER ;
    }
    public static boolean isManager(Integer code) {
        return code == MANAGER;
    }
    public static boolean isOwner(Integer code) {
        return code == OWNER;
    }


}
