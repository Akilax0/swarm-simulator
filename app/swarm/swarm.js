// Base Models
const { Robot } = require('./robot');

// MQTT
const mqttClient = require('mqtt');
const mqttConfig = require('../config/mqtt.config');
const { mqttOptions } = require('../config/mqtt.config');
const { MQTTRouter } = require('../modules/mqtt-handler');

// MQTT Client module
const mqtt = mqttClient.connect(mqttConfig.HOST, mqttConfig.options);

// Localization System
const { SimpleLocalizationSystem } = require('../modules/localization');

// cron - currently not implemented
// const cron = require('../services/cron.js');

// Controllers
const { localizationRoutes, sensorRoutes, wrapper } = require('./controllers/mqtt/');
const { initRobots } = require('./robots/robots');

const SAMPLE_ROUTES = [
    {
        topic: 'v1/localization/info',
        handler: (mqtt, topic, msg) => {
            data = JSON.parse(msg);
            console.log('Localization info picked up the topic', data);
        }
    },
    {
        topic: 'v1/robot/msg/broadcast',
        handler: (mqtt, topic, msg) => {
            data = JSON.parse(msg);
            console.log('Broadcast picked up the topic', data);
        }
    },
    {
        topic: 'v1/sensor/distance',
        handler: (mqtt, topic, msg) => {
            data = JSON.parse(msg);
            console.log('Sensor picked up the topic', data);
        }
    }
];

class Swarm {
    constructor(setup) {
        const myRoutes = [
            {
                topic: 'v1/sensor/distance',
                handler: (mqtt, topic, msg) => {
                    var sensor = this.robots.list[msg.id].sensors.distance;

                    sensor.setReading(msg.distance);
                    console.log(sensor.value);

                    sensor.publishToRobot(mqtt, () => {
                        console.log('Echo back is success for distance sensor');
                    });
                },
                allowRetained: true
            },
            {
                topic: 'v1/gui/create',
                handler: (mqtt, topic, msg) => {
                    //console.log('Creating > id:',msg.id,'x:',msg.x,'y:',msg.y);
                    this.robots.addRobot(msg.id);
                },
                allowRetained: true
            }
        ];

        //console.log(wrapper(myRoutes, this.robots));

        this.loc_system = new SimpleLocalizationSystem();
        this.robots = initRobots();
        this.mqttRouter = new MQTTRouter(
            mqtt,
            myRoutes /*wrapper(myRoutes, this.robots),*/,
            mqttOptions,
            setup
        );
        this.mqttRouter.start();
        this.init();
    }

    /**
     * method for initializing the swarm
     */
    init = () => {
        //cron.begin(mqtt);
        // const robot = new Robot(1);
        // this.robots.push(robot);
        //console.log(this);
    };

    /**
     * method for adding a new Robot to the swarm
     * @param {id} robot_id
     * @param {created} created_time
     */
    addRobot = (id, created) => {
        const robot = new Robot(id);
    };
}

module.exports = { Swarm };
