package com.dvinedao.domain;

import lombok.Data;

@Data
public class UserQueryParam {
    private Long userId;
    private String email;
    private String phone;
    private String postcode;
    private String nickName;
    private String firstName;
    private String lastName;
    private String avatar;
    private Integer permission;
}
