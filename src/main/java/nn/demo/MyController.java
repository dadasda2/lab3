package nn.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
public class MyController {

    List<SseEmitter> sseEmitters = Collections.synchronizedList(new ArrayList<>());
    @GetMapping("/seab")
    public String seab(){
        return "seab";
    }

    @GetMapping("/events")
    public Object hello() {
        SseEmitter sseEmitter = new SseEmitter();
        sseEmitters.add(sseEmitter);
        sseEmitter.onCompletion(() -> {
            sseEmitters.remove(sseEmitter);
        });
        return sseEmitter;
    }

    @GetMapping("/listProducts")
    public List<Product> listProducts() {
        return products;
    }

    List<Product> products = Collections.synchronizedList(new ArrayList<>());

    {
        products.add(new Product("Product1", 1, true));
        products.add(new Product("Product2", 10, true));
        products.add(new Product("Product3", 100, false));
    }

    @PostMapping("/postForm")
    public List<Product> processForm(@RequestBody Product product) throws IOException {
//        System.out.println("name =" + name + " price = " + price + " model = " + model.asMap());
        System.out.println("product =" + product);
        products.add(product);
        for (SseEmitter sseEmitter : sseEmitters) {
            sseEmitter.send("update");
        }
        return products;
    }

}

class Product {

    private String name;
    private int price;
    private boolean inStock;

    public Product(String name, int price, boolean inStock) {
        this.name = name;
        this.price = price;
        this.inStock = inStock;
    }

    public Product() {
    }

    @Override
    public String toString() {
        return "Product{" +
                "name='" + name + '\'' +
                ", price=" + price +
                ", inStock=" + inStock +
                '}';
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getPrice() {
        return price;
    }

    public void setPrice(int price) {
        this.price = price;
    }

    public boolean isInStock() {
        return inStock;
    }

    public void setInStock(boolean inStock) {
        this.inStock = inStock;
    }
}
