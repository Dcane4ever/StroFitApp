/**
 * API base URL configuration.
 *
 * EMULATOR (default __DEV__):
 *   10.0.2.2 is the Android emulator's loopback alias to your host machine.
 *   Spring Boot on localhost:8080 → http://10.0.2.2:8080/api
 *
 * PHYSICAL DEVICE on same WiFi:
 *   Replace 10.0.2.2 with your machine's LAN IP.
 *   Find it: Windows → ipconfig → IPv4 Address (e.g. 192.168.1.42)
 *   Set: DEV_BASE_URL = 'http://192.168.1.42:8080/api'
 *
 * PRODUCTION:
 *   Set PROD_BASE_URL to your deployed API domain.
 */

export const DEV_BASE_URL = 'http://10.0.2.2:8080/api';

export const PROD_BASE_URL = 'https://api.strofit.app/api';

export const API_BASE_URL = __DEV__ ? DEV_BASE_URL : PROD_BASE_URL;
