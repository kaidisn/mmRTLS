#include "packetProcessor.h"
#include "wifiConfig.h"
#include "utils.h"
#include "esp_log.h"


#include <string.h>

static const char *TAG = "packetProcessor";

typedef struct {
    unsigned frame_ctrl:16;
    unsigned duration_id:16;
    uint8_t addr1[6]; /* receiver address */
    uint8_t addr2[6]; /* sender address */
    uint8_t addr3[6]; /* filtering address */
    unsigned sequence_ctrl:16;
    uint8_t addr4[6]; /* optional */
} __attribute__((packed)) wifi_ieee80211_mac_hdr_t;

typedef struct {
    wifi_ieee80211_mac_hdr_t hdr;
    uint8_t payload[0]; /* network data ended with 4 bytes csum (CRC32) */
} __attribute__((packed)) wifi_ieee80211_packet_t;

typedef enum {
    KNOWN_LIST_EMPTY = -2,
    KNOWN_LIST_NOT_FOUND = -1, 
}KnownListStatus_t;

static uint8_t knownNodes[ MAXKNOWN_NODES_LIST_SIZE ]= {0};
static bool knownChannels[ WIFI_CHANNEL_MAX ] = { 0 };

static int processCheckIfKnown( uint8_t *mac );

/*============================================================================*/
rssiData_t processWifiPacket(const wifi_pkt_rx_ctrl_t *crtPkt, const uint8_t *payload) {

#ifdef TARGET_ESP32 
    int len = crtPkt->sig_len;  // ESP32
#else 
    int len = crtPkt->sig_mode ? crtPkt->HT_length : crtPkt->legacy_length;  // ESP8266
#endif

    struct timeval tp;
    KnownListStatus_t ismacknonw = KNOWN_LIST_NOT_FOUND;
    rssiData_t rssiData = {
        
    };

    if (len < sizeof(wifi_ieee80211_mac_hdr_t)) {
        rssiData.isValid = false;
        return rssiData;
    }

    wifi_ieee80211_packet_t  *ipkt = (wifi_ieee80211_packet_t *) payload;
    wifi_ieee80211_mac_hdr_t *hdr = &ipkt->hdr;    

    gettimeofday( &tp, NULL );
    rssiData.rssi = crtPkt->rssi;
    rssiData.channel = crtPkt->channel;
    rssiData.timestamp = (((uint64_t)tp.tv_sec)*1000)+(tp.tv_usec/1000);
    memcpy( rssiData.mac, hdr->addr2, sizeof(rssiData.mac) );

    ismacknonw = processCheckIfKnown( rssiData.mac ); 
    rssiData.isValid = ( KNOWN_LIST_EMPTY == ismacknonw  || ( ismacknonw >= 0 ) );

    if ( ismacknonw >= 0 ) {
        knownChannels[ rssiData.channel ] = true;
    }
    else if ( KNOWN_LIST_EMPTY != ismacknonw ) {
        char macstr[18] = {0};
        utilsMAC2str( rssiData.mac, macstr, sizeof(macstr)  );
        ESP_LOGI( TAG, "%s ignored (not on the known list)\r\n", macstr );
    } 

    return rssiData;
}
/*============================================================================*/
static KnownListStatus_t processCheckIfKnown( uint8_t *mac ){
    int i;
    uint8_t nullentry[6] = { 0 };
    uint8_t *iEntry;
    for( i = 0; i < CONFIG_PROCESSOR_MAXKNOWN_NODES; ++i) {
        iEntry = &knownNodes[ i*6 ]; /*get mac entry from the list*/
        if ( 0 == memcmp( iEntry, nullentry, 6 ) ) { /*we reach the end of the list?*/
            return (i == 0)? KNOWN_LIST_EMPTY : KNOWN_LIST_NOT_FOUND;
        }
        if ( 0 == memcmp( iEntry, mac, 6 ) ) { 
            return i;
        }
  }
  return KNOWN_LIST_NOT_FOUND;
}
/*============================================================================*/
uint8_t* processGetListOfKnown( void ){
    return knownNodes;
}
/*============================================================================*/

    
