package com.dvinedao.domain;

import lombok.Data;

@Data
public class User {
    private Long userId;
    private String password;
    private String email;
    private String phone;
    private String postcode;
    private String nickName;
    private String firstName;
    private String lastName;
    private String avatar;
    private Integer permission;
}
