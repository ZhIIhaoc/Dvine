package com.dvinedao.domain;

public final class PermissionLevel {
    public static final int GUEST         = -1; // guest users (not authenticated)
    public static final int REGULAR       = 0;
    public static final int PREMIUM       = 1;
    public static final int PARTNER_UNPAID = 2;  // partner with lapsed subscription
    public static final int PARTNER       = 3;  // paid partner (lowest admin)
    public static final int MANAGER       = 4;
    public static final int OWNER         = 5;

    public static final int ADMIN         = 3;  // this one only used for admin check, not a real permission level

    /** quick helper to validate */
    public static boolean isValidToUpdate(int code) {
        return code >= REGULAR && code <= OWNER;
    }

    public static boolean isGuest(Integer code) {
        return code == GUEST;
    }
    
    public static boolean isPartnerUnpaid(Integer code) {
        return code == PARTNER_UNPAID;
    }
    
    public static boolean isPartner(Integer code) {
        return code == PARTNER;
    }
    
    public static boolean isManager(Integer code) {
        return code == MANAGER;
    }
    
    public static boolean isOwner(Integer code) {
        return code == OWNER;
    }
    
    /**
     * Check if user has any partner level (paid or unpaid)
     */
    public static boolean isAnyPartner(Integer code) {
        return code == PARTNER_UNPAID || code == PARTNER;
    }
    
    /**
     * Check if user has admin privileges (paid partner or higher)
     */
    public static boolean hasAdminPrivileges(Integer code) {
        return code >= PARTNER;
    }


}
