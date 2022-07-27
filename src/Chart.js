import {
    VictoryArea,
    VictoryAxis,
    VictoryChart,
    VictoryBrushContainer,
    VictoryZoomContainer,
    VictoryLine
} from "victory";
import {useEffect, useState} from "react";
import {useLiveQuery} from "dexie-react-hooks";
import {db} from "./db";

function Chart({openTime, closeTime}) {
    const motionSensorData = useLiveQuery(() => {
        return db.sensorData.where('time_stamp').between(openTime, closeTime, true, true).toArray();
    }, [], []);

    const dataToDisplay = motionSensorData.map((element) => {
        return {x: new Date(element.time_stamp), y: element.sensor_output};
    });

    let lowDomain = dataToDisplay.length > 5 ? dataToDisplay[dataToDisplay.length - 5].x : openTime
    let highDomain = dataToDisplay.length > 1 ? dataToDisplay[dataToDisplay.length - 1].x : closeTime


    function getTickLabel(msec) {
        let date = new Date(msec);
        let hours = date.getHours();
        let period = "AM";

        if (hours > 12) {
            hours = hours % 12;
            period = "PM";
        }

        let tickLabel = `${hours}:${String(date.getMinutes()).padStart(2, "0")}${period}`;
        return tickLabel;
    }

    return (
        <div>
            <svg style={{height: 0}}>
                <defs>
                    <linearGradient id="myGradient" gradientTransform="rotate(90)">
                        <stop offset="0%" stopColor="#8884d8" stopOpacity={.8}/>
                        <stop offset="100%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                </defs>
            </svg>
            <h2 style={{textAlign: "center"}}>Activity data
                for {openTime.getMonth() + 1}/{openTime.getDate()}/{openTime.getFullYear()}</h2>
            <VictoryChart
                containerComponent={
                    <VictoryZoomContainer responsive={true}
                                          zoomDimension="x"
                                          allowPan={true}
                                          allowZoom={false}
                                          zoomDomain={{x: [lowDomain, highDomain]}}
                    />
                }
            >

                <VictoryArea
                    data={dataToDisplay}
                    interpolation={"natural"}
                    style={{
                        data: {
                            stroke: "#8884d8", fill: "url(#myGradient)"
                        }, parent: {border: "1px solid #ccc"}
                    }}

                    // animate={{
                    //     duration: 700,
                    //     onEnter: {duration: 0},
                    //     onLoad: {duration: 0}
                    // }}
                />

                <VictoryAxis
                    tickValues={dataToDisplay.map(i => i.x)}
                    tickFormat={(t) => {
                        if (motionSensorData?.length <= 1) {
                            return "";
                        }
                        return getTickLabel(t);
                    }}
                    tickCount={3}
                    label={"Time"}
                    style={{axisLabel: {padding: 35, fontSize: 16}}}
                />

                <VictoryAxis dependentAxis domain={{y: [0, 80]}}
                             label={"Motion Sensor Hits"}
                             style={{axisLabel: {padding: 35, fontSize: 16}}}
                />
            </VictoryChart>

            <VictoryChart
                height={60}
                padding={{top: 0, left: 50, right: 50, bottom: 30}}
                containerComponent={
                    <VictoryBrushContainer
                        responsive={true}
                        brushDimension="x"
                    />
                }
            >
                <VictoryArea
                    data={dataToDisplay}
                    interpolation={"natural"}
                    style={{
                        data: {
                            stroke: "#8884d8", fill: "url(#myGradient)"
                        }, parent: {border: "1px solid #ccc"}
                    }}
                />

                <VictoryAxis
                    tickValues={[]}
                    tickFormat={(x) => ""}
                />
            </VictoryChart>
        </div>)
}

export default Chart;