import React from 'react';
import {VictoryHistogram, VictoryAxis, VictoryChart, VictoryLabel, VictoryLine, VictoryBar} from "victory";
import {useLiveQuery} from "dexie-react-hooks";
import {db} from "./db";

function Histogram({openTime, closeTime}) {
    const motionSensorData = useLiveQuery(() => {
        return db.sensorData.where('time_stamp').between(openTime, closeTime, true, true).toArray();
    }, [], []);

    const dataToDisplay = motionSensorData.map((element) => {
        return {x: new Date(element.time_stamp), y: element.sensor_output};
    });

    let testData = [
        {x: "7AM-10AM", y: 243},
        {x: "11AM-2PM", y: 451},
        {x: "3PM-6PM", y: 572},
        {x: "7PM-10PM", y: 341},
    ]

    return (
        <div>
            <h2 style={{textAlign: "center"}}>Peak times for {openTime.getMonth() + 1}/{openTime.getDate()}/{openTime.getFullYear()}</h2>
            <VictoryChart>
                <VictoryBar data={testData} alignment={"start"} barRatio={.8}
                style={{
                    data: {
                        fill: "rgba(35, 64, 153, 0.5)"
                    },
                    parent: {border: "10px solid #ccc"}
                }}>
                </VictoryBar>
                <VictoryAxis dependentAxis domain={{y: [0, 600]}}
                             label={"Motion Sensor Hits"}
                             style={{axisLabel: {padding: 36, fontSize: 16}}}
                />
                <VictoryAxis
                    tickValues={dataToDisplay.map(i => i.x)}
                    tickFormat={(t) => {
                        if (motionSensorData?.length <= 1) {
                            return "";
                        }
                        return (t);
                    }}
                    tickCount={5}
                    label={"Time"}
                    style={{axisLabel: {padding: 35, fontSize: 16}}}
                />
            </VictoryChart>
        </div>
    );
}

export default Histogram;