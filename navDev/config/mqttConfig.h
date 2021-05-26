#ifndef MQTT_CONFIG_H
#define MQTT_CONFIG_H

#ifdef __cplusplus
extern "C" {
#endif
    //#define CONFIG_MQTT_BROKER_URI                  "mqtt://test.mosquitto.org:1883" /* pending : to be defined, this should be moved to a config file*/
    #define CONFIG_MQTT_TOPIC_DATA                  "/topictest/macrssi_data"
    #define CONFIG_MQTT_TOPIC_BEACONSLIST           "/topictest/beacon_list"
    #define CONFIG_MQTT_MAXENTRIES_IN_TOPICDATA     ( 50 )

#ifndef CONFIG_MQTT_BROKER_URI
#error Set the MQTT Broker Uri in CONFIG_MQTT_BROKER_URI
#endif 

#ifdef __cplusplus
}
#endif 
#endif/*MQTT_CONFIG_H*/




