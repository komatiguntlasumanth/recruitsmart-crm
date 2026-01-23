package com.recruitsmart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = {
    org.springframework.boot.autoconfigure.admin.SpringApplicationAdminJmxAutoConfiguration.class,
    org.springframework.boot.autoconfigure.jmx.JmxAutoConfiguration.class,
    org.springframework.boot.autoconfigure.thymeleaf.ThymeleafAutoConfiguration.class,
    org.springframework.boot.autoconfigure.freemarker.FreeMarkerAutoConfiguration.class,
    org.springframework.boot.autoconfigure.websocket.servlet.WebSocketServletAutoConfiguration.class,
    org.springframework.boot.autoconfigure.cache.CacheAutoConfiguration.class,
    org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchClientAutoConfiguration.class,
    org.springframework.boot.autoconfigure.data.elasticsearch.ElasticsearchDataAutoConfiguration.class
})
@EnableScheduling
public class RecruitSmartApplication {
    public static void main(String[] args) {
        SpringApplication.run(RecruitSmartApplication.class, args);
    }
}
