import Dexie from 'dexie';

export const db = new Dexie('SensorData');

db.version(1).stores({
    sensorData: '++id, &time_stamp, sensor_type, location'
});