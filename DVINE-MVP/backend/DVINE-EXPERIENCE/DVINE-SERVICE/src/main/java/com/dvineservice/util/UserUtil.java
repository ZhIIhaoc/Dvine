package com.dvineservice.util;

public class UserUtil {
    private static final ThreadLocal<Long> currentUserId = new ThreadLocal<>();

    public static void setCurrentUserId(Long userId) {
        currentUserId.set(userId);
    }

    public static Long getCurrentUserId() {
        return currentUserId.get();
    }

    public static void clear() {
        currentUserId.remove();
    }
}
