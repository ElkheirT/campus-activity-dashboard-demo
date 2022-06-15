import Plot from 'react-plotly.js';
import usePlotly from "./usePlotly";
import Plotly from "react-plotly.js";


function Chart(props) {


    let x = [...Array(5).keys()];
    let y = x.map((val) => (val * val));

    let state = {data: [x, y], layout: { datarevision: 0 }, revision: 0, frames: [], config: {}}

    return (
        <div>
            <Plot
                data={[
                    {
                        x,
                        y,
                        type: "line",
                        mode: 'lines+markers'
                    }
                ]}
                layout={{height: 400, width: 600, title: "Campus Activity"}}
            />
        </div>
    )
}

export default Chart;