package kr.yeotaeho.api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "spring.cloud.discovery.enabled=false")
class ApiApplicationTests {

	@Test
	void contextLoads() {
	}

}
