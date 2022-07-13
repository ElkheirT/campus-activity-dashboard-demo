import {VictoryArea, VictoryAxis, VictoryChart, VictoryLabel, VictoryLine} from "victory";
import { useEffect, useState} from "react";

function Chart({motionSensorData}) {
    let startTime = new Date(0);

    let [data, setData] = useState([{x: startTime, y: 0}]);

    function getNewDataPoint() {
        let activityData = [...data];
        let lastDataPoint = activityData.slice(-1)[0];
        let lastDateObj = lastDataPoint.x;

        let newDateObj = new Date(lastDateObj.getTime() + 900000);
        let y = Math.random() * 50;
        activityData.push({x: newDateObj, y});
        setData(activityData);
    }

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

    // add 10 points to graph
    // useEffect(() => {
    //     if (data.length < 10) {
    //         setTimeout(() => {
    //             getNewDataPoint();
    //         }, 2000);
    //     }
    // });

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
            <VictoryArea data={motionSensorData}
                         interpolation={"natural"}
                         style={{
                             data: {
                                 stroke: "#8884d8", fill: "url(#myGradient)"
                             }, parent: {border: "1px solid #ccc"}
                         }}
                         animate={{
                             duration: 1000
                         }}
            />

            {/*<VictoryAxis*/}
            {/*    tickValues={data.map((i) => i.x.getTime())}*/}
            {/*    tickFormat={(t) => {*/}
            {/*        if (data.length <= 1) {*/}
            {/*            return "";*/}
            {/*        }*/}
            {/*        let dateObj = new Date(t)*/}
            {/*        return `${dateObj.getHours()}:${dateObj.getMinutes()}`*/}
            {/*    }}*/}
            {/*    tickCount={3}*/}
            {/*    label={"Time"}*/}
            {/*    style={ {axisLabel: {padding: 35, fontSize: 16}}}*/}
            {/*/>*/}

            {/*<VictoryAxis dependentAxis domain={{y: [0, 60]}}*/}
            {/*             label={"Motion Sensor Hits"}*/}
            {/*             style={ {axisLabel: {padding: 35, fontSize: 16}}}*/}
            {/*/>*/}
        </VictoryChart>
        <button onClick={() => {
            getNewDataPoint()
        }}>
            Add Data
        </button>
    </div>)
}

export default Chart;