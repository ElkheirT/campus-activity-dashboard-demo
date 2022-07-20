import {VictoryArea, VictoryAxis, VictoryChart, VictoryLabel, VictoryLine} from "victory";
import {useEffect, useState} from "react";
import {useLiveQuery} from "dexie-react-hooks";
import {db} from "./db";

function Chart() {

    const motionSensorData = useLiveQuery(() => {
        return db.sensorData.toArray();
    }, [], []);
    
    const dataToDisplay = motionSensorData.map((element) => {
        return {x: new Date(element.time_stamp), y: element.sensor_output};
    });

    function getTimeStringFromMsec(msec) {
        let dateObj = new Date(msec);
        let hours = dateObj.getHours();
        let period = "AM";

        if (hours > 12) {
            hours = hours % 12;
            period = "PM";
        }

        let timeString = `${hours}:${String(dateObj.getMinutes()).padStart(2, "0")}${period}`;
        return timeString;
    }

    return (<div>
        <svg style={{height: 0}}>
            <defs>
                <linearGradient id="myGradient" gradientTransform="rotate(90)">
                    <stop offset="0%" stopColor="#8884d8" stopOpacity={.8}/>
                    <stop offset="100%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
            </defs>
        </svg>
        <VictoryChart>
            <VictoryArea
                data={dataToDisplay}
                interpolation={"natural"}
                style={{
                    data: {
                        stroke: "#8884d8", fill: "url(#myGradient)"
                    }, parent: {border: "1px solid #ccc"}
                }}
                animate={{
                    duration: 800,
                    onEnter: {duration: 0},
                    onLoad: {duration: 0}
                }}
            />

            <VictoryAxis
                tickFormat={(t) => {
                    if (motionSensorData?.length <= 1) {
                        return "";
                    }
                    return getTimeStringFromMsec(t);
                }}
                tickCount={3}
                label={"Time"}
                style={{axisLabel: {padding: 35, fontSize: 16}}}
            />

            <VictoryAxis dependentAxis domain={{y: [0, 60]}}
                         label={"Motion Sensor Hits"}
                         style={{axisLabel: {padding: 35, fontSize: 16}}}
            />
        </VictoryChart>
    </div>)
}

export default Chart;