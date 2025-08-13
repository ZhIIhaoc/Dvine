package com.dvinedao.domain;

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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPostcode() {
        return postcode;
    }

    public void setPostcode(String postcode) {
        this.postcode = postcode;
    }

    public String getNickName() {
        return nickName;
    }

    public void setNickName(String nickName) {
        this.nickName = nickName;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public Integer getPermission() {
        return permission;
    }

    public void setPermission(Integer permission) {
        this.permission = permission;
    }

    public User toUser() {
        User user = new User();
        user.setUserId(this.userId);
        user.setEmail(this.email);
        user.setPhone(this.phone);
        user.setPostcode(this.postcode);
        user.setNickName(this.nickName);
        user.setFirstName(this.firstName);
        user.setLastName(this.lastName);
        user.setAvatar(this.avatar);
        user.setPermission(this.permission);
        return user;
    }
}
