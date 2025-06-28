package com.dvinedao.domain;


/**
 * A utility class that represents the standardized return format for API responses.
 * Provides methods to create success and error responses.
 */
public class ReturnResult {
    private Integer code; // 0 is for success ，1 is for fail
    private String msg; // wrong message
    private Object data; // return data

    /**
     * Creates a success response with no data.
     *
     * @return A ReturnResult object with code 1 and success message
     */
    public static ReturnResult success() {
        ReturnResult result = new ReturnResult();
        result.code = 0;
        result.msg = "success";
        return result;
    }

    /**
     * Creates a success response containing data.
     *
     * @param object The data to be included in the response
     * @return A ReturnResult object with code 1, success message, and the provided data
     */
    public static ReturnResult success(Object object) {
        ReturnResult result = new ReturnResult();
        result.data = object;
        result.code = 0;
        result.msg = "success";
        return result;
    }

    /**
     * Creates an error response with a custom message.
     *
     * @param msg The error message
     * @return A ReturnResult object with code 0 and the specified error message
     */
    public static ReturnResult error(String msg) {
        ReturnResult result = new ReturnResult();
        result.msg = msg;
        result.code = 1;
        return result;
    }

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }
}
