import {
    VictoryArea,
    VictoryAxis,
    VictoryChart,
    VictoryBrushContainer,
    VictoryZoomContainer,
} from "victory";
import {useEffect, useMemo, useState} from "react";
import {useLiveQuery} from "dexie-react-hooks";
import {db} from "./db";
import {Button, IconButton, Slider, Stack} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function Chart({openTime, data }) {
    // const motionSensorData = useLiveQuery(() => {
    //     return db.sensorData.where('time_stamp').between(openTime, closeTime, true, true).toArray();
    // }, [], []);
    
    let [zoomDomain, setZoomDomain] = useState();
    let [selectedDomain, setSelectedDomain] = useState();

    const dataToDisplay = useMemo(() => {
        let transformedData = data.map((element) => {
            return {x: new Date(element.time_stamp), y: element.sensor_output};
        });
        return transformedData;
    }, [data]);

    const lowDomain = useMemo(() => {
        let newLowDomain = dataToDisplay.length > 5 ? dataToDisplay[dataToDisplay.length - 5].x : 0;
        return newLowDomain;
    }, [data]);

    const highDomain = useMemo(() => {
        let newHighDomain = dataToDisplay.length > 1 ? dataToDisplay[dataToDisplay.length - 1].x : 0;
        return newHighDomain;
    }, [data]);

    useEffect(() => {
        setZoomDomain({x: [lowDomain, highDomain]});
    }, [])

    function handleZoom(domain) {
        setSelectedDomain(domain);
    }

    function handleBrush(domain) {
        setZoomDomain(domain)
    }

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
                    <VictoryZoomContainer
                        responsive={true}
                        zoomDimension="x"
                        allowPan={false}
                        allowZoom={false}
                        zoomDomain={zoomDomain}
                        onZoomDomainChange={(domain => handleZoom(domain))}
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
                        if (dataToDisplay?.length <= 1) {
                            return "";
                        }
                        return getTickLabel(t);
                    }}
                    tickCount={3}
                    label={"Time"}
                    style={{axisLabel: {padding: 30, fontSize: 16}}}
                />

                <VictoryAxis dependentAxis domain={{y: [0, 80]}}
                             label={"Motion Sensor Hits"}
                             style={{axisLabel: {padding: 35, fontSize: 16}}}
                />
            </VictoryChart>
            <VictoryChart
                height={70}
                padding={{top: 5, left: 50, right: 50, bottom: 30}}
                containerComponent={
                    <VictoryBrushContainer
                        responsive={true}
                        allowDrag={true}
                        allowResize={false}
                        brushDimension="x"
                        brushDomain={{x: [lowDomain, highDomain]}}
                        onBrushDomainChange={domain => handleBrush(domain)}
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
                    tickCount={4}
                    tickValues={dataToDisplay.map(i => i.x)}
                    tickFormat={(t) => {
                        if (dataToDisplay?.length <= 1) {
                            return "";
                        }
                        return getTickLabel(t);
                    }}
                />
                <VictoryAxis
                    dependentAxis
                    domain={{y: [0, 80]}}
                    tickFormat={(t) => {
                        return "";
                    }}
                />
            </VictoryChart>
        </div>)
}

export default Chart;