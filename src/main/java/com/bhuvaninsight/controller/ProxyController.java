package com.bhuvaninsight.controller;
import com.bhuvaninsight.service.AisRelayService;
import com.bhuvaninsight.service.ProxyService;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProxyController {
    private final ProxyService proxy;
    private final AisRelayService aisRelay;

    @GetMapping("/search") public String search(@RequestParam String q){ return proxy.bhuvanSearch(q); }
    @GetMapping("/lulc")   public String lulc(@RequestParam String district){ return proxy.lulcStats(district); }
    @GetMapping("/air")    public String air(@RequestParam double lat, @RequestParam double lon){ return proxy.airQuality(lat,lon); }
    @GetMapping("/weather")public String weather(@RequestParam double lat, @RequestParam double lon){ return proxy.weather(lat,lon); }
    @GetMapping("/flights")public String flights(){ return proxy.flights(); }
    @GetMapping("/satellite") public String satellite(@RequestParam int norad){ return proxy.satellite(norad); }
    @GetMapping("/rainfall")  public String rainfall(){ return proxy.rainfall(); }
    @GetMapping("/train")  public String train(@RequestParam String no){ return proxy.trainStatus(no); }
    @GetMapping("/vessels") public List<Map<String, Object>> vessels(){ return aisRelay.getVessels(); }

    @GetMapping("/reverse-geocode")
    public String reverseGeocode(@RequestParam double lat, @RequestParam double lon){
        return proxy.reverseGeocode(lat, lon);
    }

    @GetMapping("/lulc-aoi")
    public String lulcAoi(@RequestParam String wkt){
        return proxy.lulcAoi(wkt);
    }

    @PostMapping("/token/bhuvan")
    public String updateBhuvanToken(@RequestParam String token){
        proxy.setBhuvanToken(token);
        return "{\"status\":\"updated\"}";
    }

    @GetMapping("/owm-key")
    public String owmKey(){ return proxy.owmTileKey(); }
}
