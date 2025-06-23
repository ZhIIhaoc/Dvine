package com.dvineapi;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {
        "com.dvineapi",        // Your controllers
        "com.dvineservice"     // Your services
})
@MapperScan(basePackages = "com.dvinedao.mapper")  // mapper!
public class DvineApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(DvineApiApplication.class, args);
    }

}
