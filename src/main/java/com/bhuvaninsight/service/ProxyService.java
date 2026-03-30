package com.bhuvaninsight.service;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;


@Service
@RequiredArgsConstructor
public class ProxyService {
    private final CacheService cache;
    private final RestTemplate rest = new RestTemplate();

    @Value("${bhuvan.token}") private String bhuvanToken;
    @Value("${openaq.key}") private String openaqKey;
    @Value("${opensky.user}") private String openskyUser;
    @Value("${opensky.pass}") private String openskyPass;
    @Value("${n2yo.key}") private String n2yoKey;
    @Value("${railapi.key}") private String railKey;
    @Value("${datagovin.key}") private String datagovKey;
    @Value("${owm.key}") private String owmKey;

    public String bhuvanSearch(String q) {
        checkKey(bhuvanToken, "Bhuvan Search");
        return cache.getOrFetch("bhuvan-search-" + q,
            () -> rest.getForObject(
                "https://bhuvan-app1.nrsc.gov.in/api/search/place_search.php?place=" + q + "&token=" + bhuvanToken,
                String.class
            ));
    }

    public String lulcStats(String districtCode) {
        checkKey(bhuvanToken, "Bhuvan LULC");
        return cache.getOrFetch("lulc-" + districtCode,
            () -> rest.getForObject(
                "https://bhuvan-app1.nrsc.gov.in/api/lulc2/lulc_stat.php?district_id=" + districtCode + "&token=" + bhuvanToken,
                String.class
            ));
    }

    public String lulcAoi(String wkt) {
        checkKey(bhuvanToken, "Bhuvan LULC AOI");
        String url = "https://bhuvan-app1.nrsc.gov.in/api/lulc2/lulc_aoi.php"
            + "?wkt=" + wkt + "&token=" + bhuvanToken;
        return rest.getForObject(url, String.class);
    }

    public String reverseGeocode(double lat, double lon) {
        checkKey(bhuvanToken, "Bhuvan Reverse Geocode");
        String url = "https://bhuvan-app1.nrsc.gov.in/api/geocode/rev_geocode.php"
            + "?lat=" + lat + "&lon=" + lon + "&token=" + bhuvanToken;
        return rest.getForObject(url, String.class);
    }

    public String airQuality(double lat, double lon) {
        checkKey(openaqKey, "OpenAQ");
        return cache.getOrFetch("aq-" + lat + "-" + lon, () -> {
            HttpHeaders h = new HttpHeaders();
            h.set("X-API-Key", openaqKey);
            return rest.exchange(
                "https://api.openaq.org/v3/locations?coordinates=" + lat + "," + lon + "&radius=50000&limit=5",
                HttpMethod.GET,
                new HttpEntity<>(h),
                String.class
            ).getBody();
        });
    }

    public String weather(double lat, double lon) {
        return cache.getOrFetch("weather-" + Math.round(lat * 10) + "-" + Math.round(lon * 10), () ->
            rest.getForObject(
                "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon
                    + "&current=temperature_2m,precipitation,windspeed_10m,weathercode"
                    + "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Kolkata&forecast_days=7",
                String.class
            ));
    }

    public String flights() {
        checkKey(openskyUser, "OpenSky");
        return cache.getOrFetch("flights-india", () -> {
            String url = "https://" + openskyUser + ":" + openskyPass
                + "@opensky-network.org/api/states/all?lamin=6.5&lomin=68.1&lamax=35.7&lomax=97.4";
            return rest.getForObject(url, String.class);
        });
    }

    public String satellite(int noradId) {
        checkKey(n2yoKey, "N2YO");
        return cache.getOrFetch("sat-" + noradId, () ->
            rest.getForObject(
                "https://api.n2yo.com/rest/v1/satellite/positions/" + noradId + "/20.5937/78.9629/0/2/&apiKey=" + n2yoKey,
                String.class
            ));
    }

    public String rainfall() {
        checkKey(datagovKey, "Data.gov.in");
        return cache.getOrFetch("rainfall", () ->
            rest.getForObject(
                "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
                    + "?api-key=" + datagovKey + "&format=json&limit=50",
                String.class
            ));
    }

    public String trainStatus(String trainNo) {
        checkKey(railKey, "IndianRailAPI");
        return cache.getOrFetch("train-" + trainNo, () ->
            rest.getForObject(
                "https://indianrailapi.com/api/v2/livetrainstatus/apikey/" + railKey + "/trainnumber/" + trainNo + "/",
                String.class
            ));
    }

    private void checkKey(String key, String provider) {
        if (key == null || key.isBlank() || key.contains("FILL_ME")) {
            throw new org.springframework.web.server.ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "API Key for " + provider + " is missing or invalidated"
            );
        }
    }

    public void setBhuvanToken(String token) {
        this.bhuvanToken = token;
    }

    public String owmTileKey() {
        return "{\"key\":\"" + owmKey + "\"}";
    }
}
