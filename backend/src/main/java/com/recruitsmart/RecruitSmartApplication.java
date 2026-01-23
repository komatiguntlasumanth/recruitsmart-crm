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
    org.springframework.boot.autoconfigure.data.elasticsearch.ElasticsearchDataAutoConfiguration.class,
    org.springframework.boot.autoconfigure.transaction.TransactionHealthContributorAutoConfiguration.class,
    org.springframework.boot.autoconfigure.jdbc.DataSourceHealthContributorAutoConfiguration.class,
    org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration.class,
    org.springframework.boot.autoconfigure.jms.JmsAutoConfiguration.class,
    org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration.class,
    org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration.class,
    org.springframework.boot.autoconfigure.data.cassandra.CassandraDataAutoConfiguration.class,
    org.springframework.boot.autoconfigure.data.couchbase.CouchbaseDataAutoConfiguration.class,
    org.springframework.boot.autoconfigure.data.ldap.LdapDataAutoConfiguration.class,
    org.springframework.boot.autoconfigure.data.neo4j.Neo4jDataAutoConfiguration.class,
    org.springframework.boot.autoconfigure.quartz.QuartzAutoConfiguration.class,
    org.springframework.boot.autoconfigure.webservices.WebServicesAutoConfiguration.class,
    org.springframework.boot.autoconfigure.mail.MailHealthContributorAutoConfiguration.class
})
@EnableScheduling
public class RecruitSmartApplication {
    public static void main(String[] args) {
        SpringApplication.run(RecruitSmartApplication.class, args);
    }
}
