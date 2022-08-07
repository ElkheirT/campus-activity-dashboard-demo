import React from 'react';
import {VictoryHistogram, VictoryAxis, VictoryChart, VictoryLabel, VictoryLine, VictoryBar} from "victory";
import {useLiveQuery} from "dexie-react-hooks";
import {db} from "./db";

function Histogram({date, data}) {
    let testData = [
        {x: "7AM-10AM", y: 243},
        {x: "11AM-2PM", y: 451},
        {x: "3PM-6PM", y: 572},
        {x: "7PM-10PM", y: 341},
    ]

    return (
        <div>
            <h2 style={{textAlign: "center"}}>Peak times
                for {date.getMonth() + 1}/{date.getDate()}/{date.getFullYear()}</h2>
            <VictoryChart>
                <VictoryBar data={data} alignment={"start"} barRatio={.8}
                            style={{
                                data: {
                                    fill: "rgba(35, 64, 153, 0.5)"
                                },
                                parent: {border: "10px solid #ccc"}
                            }}>
                </VictoryBar>
            </VictoryChart>
        </div>
    );
}

export default Histogram;