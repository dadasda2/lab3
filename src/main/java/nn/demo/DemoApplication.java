package nn.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.spring5.SpringTemplateEngine;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import javax.servlet.http.HttpServletRequest;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    @Bean
    A mkA() {
        return new A("bbb");
    }

//    @Bean
//    TemplateEngine templateEngine(){
//        TemplateEngine templateEngine = new SpringTemplateEngine();
//        ClassLoaderTemplateResolver templateResolver = new ClassLoaderTemplateResolver();
//        templateResolver.setPrefix("templates/");
//        templateResolver.setSuffix(".html");
//        templateEngine.addTemplateResolver(templateResolver);
//        return templateEngine;
//    }
}

class A {

    String f;

    public A(String f) {
        this.f = f;
    }

    String foo(){
        return f;
    }
}

