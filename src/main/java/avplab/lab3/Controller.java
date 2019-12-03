package avplab.lab3;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@org.springframework.stereotype.Controller
@RequestMapping("/")
public class Controller {
    WebSocketSession u1;
    WebSocketSession u2;

    @Autowired
    ObjectMapper objectMapper;

    @Bean
    WebSocketConfigurer webSocketConfigurer() {
        return new WebSocketConfigurer() {
            @Override
            public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
                registry.addHandler(new TextWebSocketHandler() {
                    @Override
                    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
                        if (u1 == null) {
                            u1 = session;
                            System.out.println("u1 " + u1 + " connected");
                        } else {
                            if (u2 == null) {
                                u2 = session;
                                System.out.println("u2 " + u2 + " connected");
                            }
                        }
                    }

                    @Override
                    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
                        if (session == u1) {
                            System.out.println("u1 " + u1 + " disconnected");
                            u1 = null;
                        } else {
                            if (session == u2) {
                                System.out.println("u2 " + u2 + " disconnected");
                                u2 = null;
                            }
                        }
                    }

                    @Override
                    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
                        String payload = message.getPayload();
                        Mes mes = objectMapper.readValue(payload, Mes.class);
                        if (mes.getType().equals("Ships")) {
                            if (session == u1) {
                                u2.sendMessage(new TextMessage(objectMapper.writeValueAsString(mes)));
                            } else {
                                if (session == u2) {
                                    u1.sendMessage(new TextMessage(objectMapper.writeValueAsString(mes)));
                                }
                            }
                        }
                        if (mes.getType().equals("WhoFirst")) {
                            if (session == u1) {
                                mes.setContent("0");
                                u1.sendMessage(new TextMessage(objectMapper.writeValueAsString(mes)));
                            }
                            if (session == u2) {
                                mes.setContent("1");
                                u2.sendMessage(new TextMessage(objectMapper.writeValueAsString(mes)));
                            }
                        }
                        if (mes.getType().equals("Shot")) {
                            System.out.println(mes);
                            if (session == u1) {
                                u2.sendMessage(new TextMessage(objectMapper.writeValueAsString(mes)));
                            }
                            if (session == u2) {
                                u1.sendMessage(new TextMessage(objectMapper.writeValueAsString(mes)));
                            }

                        }
                    }
                }, "/ws");
            }
        };
    }


    @GetMapping("/seabattle")
    public String seabattle() {
        return "seabattle";
    }

}

class Mes {
    String type;
    Object content;

    @Override
    public String toString() {
        return "{type='" + type + '\'' +
                ", content=" + content + "}";
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Object getContent() {
        return content;
    }

    public void setContent(Object content) {
        this.content = content;
    }
}