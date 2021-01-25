const { abs, round, cos, sin } = require('mathjs');
const {
    VirtualDistanceRelayModule,
    ArenaType,
    AbstractObstacleBuilder
} = require('../../../../dist/pera-swarm');

/* ------------------------------------------------------
Arena coordinate system (top view)

P1   L4  P2
┍━━━┑
L3 ┃   ┃ L1
┕━━━┛
P3  L2  P4

Axises: ↑ Y, → X
------------------------------------------------------ */

class DistanceRelayModule extends VirtualDistanceRelayModule {
    _obstacleController;
    /**
     * DistanceRelayModule
     * @param {ArenaType} arena arena config
     * @param {Function} mqttPublish mqtt publish function
     * @param {AbstractObstacleBuilder | undefined} obstacleController (optional) obstacle controller
     */
    constructor(arena, mqttPublish, obstacleController = undefined) {
        super(null, arena, mqttPublish);
        this._obstacleController = obstacleController;
    }

    /*
     getReadings = (robot: VRobot, suffix: string, callback: Function) => {
        const { x, y, heading } = robot.coordinates;
        robot.updateHeartbeat();
        let dist = round(this._getBorderDistance(x, y, heading) * 10) / 10;
        this.publish(dist, suffix);
        // this.setReading(dist);
        if (callback != undefined) callback(dist);
    };

    viewReading = (robot: { getData: (arg0: string) => any } | undefined) => {
        if (robot === undefined) throw new TypeError('robot unspecified');
        const dist = robot.getData('distance');
        return dist != undefined ? dist : NaN;
    };
     */

    getReading = (robot, callback) => {
        const { x, y, heading } = robot.getCoordinates();
        robot.updateHeartbeat();
        console.log(x, y, heading);
        let dist = round(this._getBorderDistance(x, y, heading) * 10); // return in mm

        this.publish(`sensor/distance/${robot.id}`, dist);
        this.setReading(robot, dist);

        if (callback != undefined) callback(dist);
    };

    setReading = (robot, value) => {
        if (robot === undefined) throw new TypeError('robot unspecified');
        if (value === undefined) throw new TypeError('value unspecified');
        return robot.setData('distance', Number(value));
    };

    defaultSubscriptions = () => {
        return [
            {
                topic: 'sensor/distance',
                type: 'JSON',
                allowRetained: false,
                subscribe: true,
                publish: false,
                handler: (msg, swarm) => {
                    // Robots can request virtual dist. sensor reading through this
                    console.log('MQTT.Dist: sensor/distance', msg);
                    // TODO: publish the virtual distance reading to
                    // sensor/distance/{robotId}
                }
            }
        ];
    };
}

module.exports = { DistanceRelayModule };
