package com.dvineservice.exception;

import com.dvinedao.domain.ReturnResult;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
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
