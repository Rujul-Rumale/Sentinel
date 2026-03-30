package com.bhuvaninsight.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;

@Slf4j
@Service
@RequiredArgsConstructor
public class AisRelayService {

    @Value("${aisstream.key}")
    private String aisKey;

    private final SimpMessagingTemplate broker;
    private final ObjectMapper objectMapper;

    private volatile boolean connected = false;
    private volatile String lastMessage = "{}";
    private WebSocketSession activeSession = null;
    private final AtomicBoolean connecting = new AtomicBoolean(false);
    private final AtomicLong messageCount = new AtomicLong(0);
    private final Map<String, Map<String, Object>> vessels = new ConcurrentHashMap<>();

    @PostConstruct
    public void connect() {
        if (connected || !connecting.compareAndSet(false, true)) {
            return;
        }

        try {
            var client = new StandardWebSocketClient();
            client.execute(new AbstractWebSocketHandler() {

                @Override
                public void afterConnectionEstablished(WebSocketSession session) throws Exception {
                    activeSession = session;
                    connected = true;
                    connecting.set(false);

                    String subscription = "{"
                        + "\"APIKey\":\"" + aisKey + "\","
                        + "\"BoundingBoxes\":[[[-50,20],[35,147]]],"
                        + "\"FilterMessageTypes\":["
                        + "\"PositionReport\","
                        + "\"StandardClassBPositionReport\","
                        + "\"ExtendedClassBPositionReport\","
                        + "\"ShipStaticData\","
                        + "\"StaticDataReport\""
                        + "]"
                        + "}";

                    session.sendMessage(new TextMessage(subscription));
                    log.info("AIS connected and subscribed for the Indian Ocean and surrounding regions");
                }

                @Override
                protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                    relay(message.getPayload());
                }

                @Override
                protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) {
                    relay(StandardCharsets.UTF_8.decode(message.getPayload()).toString());
                }

                @Override
                public void handleTransportError(WebSocketSession session, Throwable exception) {
                    log.warn("AIS transport error: {}", exception.getMessage());
                    connected = false;
                    connecting.set(false);
                }

                @Override
                public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
                    log.info("AIS closed - status: {}", status);
                    connected = false;
                    activeSession = null;
                    connecting.set(false);
                }
            }, "wss://stream.aisstream.io/v0/stream");
        } catch (Exception e) {
            log.warn("AIS connect failed: {}", e.getMessage());
            connected = false;
            connecting.set(false);
        }
    }

    @Scheduled(fixedDelay = 120000)
    public void reconnectIfNeeded() {
        if (!connected) {
            log.info("AIS reconnecting...");
            connect();
        }
    }

    @Scheduled(fixedDelay = 30000)
    public void heartbeat() {
        broker.convertAndSend("/topic/ais-ping", "{\"alive\":true}");
    }

    public String getLast() {
        return lastMessage;
    }

    public List<Map<String, Object>> getVessels() {
        List<Map<String, Object>> snapshot = new ArrayList<>(vessels.values());
        snapshot.sort(Comparator.comparing(v -> (String) v.get("updatedAt"), Comparator.nullsLast(Comparator.reverseOrder())));
        return snapshot;
    }

    private void relay(String payload) {
        lastMessage = payload;
        updateSnapshot(payload);
        long count = messageCount.incrementAndGet();
        if (count == 1 || count % 100 == 0) {
            log.info("AIS relayed {} messages", count);
        }
        broker.convertAndSend("/topic/ais", lastMessage);
    }

    private void updateSnapshot(String payload) {
        try {
            JsonNode root = objectMapper.readTree(payload);
            JsonNode metaData = root.path("MetaData");
            JsonNode message = root.path("Message");
            String mmsi = textValue(metaData.get("MMSI"));
            if (mmsi == null || mmsi.isBlank()) {
                return;
            }

            JsonNode position = firstNonMissing(
                message.get("PositionReport"),
                message.get("StandardClassBPositionReport"),
                message.get("ExtendedClassBPositionReport"),
                message.get("LongRangeAisBroadcastMessage")
            );
            JsonNode staticData = firstNonMissing(
                message.get("ShipStaticData"),
                message.get("StaticDataReport"),
                message.get("StaticAndVoyageRelatedData")
            );

            Map<String, Object> existing = vessels.get(mmsi);
            Map<String, Object> vessel = new LinkedHashMap<>();
            vessel.put("mmsi", mmsi);
            vessel.put("name", firstText(metaData.get("ShipName"), staticData.get("Name"), existing == null ? null : existing.get("name"), "Unknown"));
            vessel.put("lat", firstNumber(metaData.get("latitude"), position.get("Latitude"), existing == null ? null : existing.get("lat")));
            vessel.put("lon", firstNumber(metaData.get("longitude"), position.get("Longitude"), existing == null ? null : existing.get("lon")));
            vessel.put("speed", firstNumber(position.get("Sog"), existing == null ? null : existing.get("speed"), null));
            vessel.put("heading", firstNumber(position.get("TrueHeading"), position.get("Cog"), existing == null ? null : existing.get("heading")));
            vessel.put("shipType", firstText(staticData.get("TypeOfShipAndCargoType"), existing == null ? null : existing.get("shipType"), null, null));
            vessel.put("destination", firstText(staticData.get("Destination"), existing == null ? null : existing.get("destination"), null, null));
            vessel.put("flag", firstText(metaData.get("MMSI_CountryCode"), existing == null ? null : existing.get("flag"), null, null));
            vessel.put("updatedAt", textValue(metaData.get("time_utc")) != null ? textValue(metaData.get("time_utc")) : String.valueOf(System.currentTimeMillis()));
            vessels.put(mmsi, vessel);
        } catch (Exception e) {
            log.debug("AIS snapshot parse skipped: {}", e.getMessage());
        }
    }

    private JsonNode firstNonMissing(JsonNode... nodes) {
        for (JsonNode node : nodes) {
            if (node != null && !node.isMissingNode() && !node.isNull()) {
                return node;
            }
        }
        return objectMapper.nullNode();
    }

    private String firstText(Object first, Object second, Object third, String fallback) {
        for (Object value : new Object[] { first, second, third }) {
            String text = textValue(value);
            if (text != null && !text.isBlank()) {
                return text.trim();
            }
        }
        return fallback;
    }

    private Double firstNumber(Object first, Object second, Object third) {
        for (Object value : new Object[] { first, second, third }) {
            Double number = numberValue(value);
            if (number != null) {
                return number;
            }
        }
        return null;
    }

    private String textValue(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof JsonNode node) {
            return node.isMissingNode() || node.isNull() ? null : node.asText();
        }
        return String.valueOf(value);
    }

    private Double numberValue(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        if (value instanceof JsonNode node) {
            return node.isNumber() ? node.asDouble() : null;
        }
        try {
            return Double.parseDouble(String.valueOf(value));
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
