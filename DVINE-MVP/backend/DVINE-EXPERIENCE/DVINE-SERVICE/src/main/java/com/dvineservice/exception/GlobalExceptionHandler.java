package com.dvineservice.exception;

import com.dvinedao.domain.ReturnResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler
    public ReturnResult handleException(Exception e) {
        log.error("An error occurred:", e);
        return ReturnResult.error(e.getMessage());
    }

    /**
     * it will catch the exception when the key is duplicated e.g. when the email is duplicated
     * @param e
     * @return error result
     */
    @ExceptionHandler
    public ReturnResult handleDuplicateKeyException(DuplicateKeyException e) {
        log.error("Duplicate key error:", e);
        String message = e.getMessage();
        int i = message.indexOf("Duplicate entry");
        String errMsg = message.substring(i);
        String[] arr = errMsg.split(" ");
        return ReturnResult.error(arr[2] + " already exists");
    }
}
