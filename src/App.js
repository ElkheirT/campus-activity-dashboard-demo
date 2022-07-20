import "./App.css";
import {Card, CardContent, Container, Grid, Paper, Stack, Typography} from "@mui/material";
import Chart from "./Chart";
import io from 'socket.io-client'
import {db} from './db'

import {useEffect, useState} from "react";

function App() {
    let startTime = new Date(2022, 6, 12, 6, 45);
    // let [motionSensorData, setMotionSensorData] = useState([{x: startTime, y: 0}]);

    useEffect(() => {
        const socket = io('localhost:5000')

        socket.emit('get_past_data', {
            startDate: "2022-7-12 7:00:00",
            endDate: "2022-7-12 22:00:00"
        });

        socket.emit('get_new_data')

        socket.on('past_data', (data) => {
            // data.forEach((element) => {
            //     addToDB(element);
            // })
        });

        socket.on('new_data', (data) => {
            addToDB(data);
        });
    }, []);

    async function addToDB(data) {
        try {
            const id = await db.sensorData.add(data);
        } catch (error) {
            console.log("Failed to add data: ", error);
        }
    }

    // useEffect(() => {
    //     // console.log(motionSensorData)
    // }, [motionSensorData]);

    return (<div className="App">
        <Container>
            <Grid container
                  spacing={0}
                  direction={"column"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  style={{minHeight: '100vh'}}
            >
                <Grid container>
                    <Grid item xs={8}>
                        <Chart></Chart>
                    </Grid>
                    <Stack direction={"column"} justifyContent={"center"} spacing={2}>
                        <Card variant={"outlined"} style={{height: "30%", textAlign: "center"}}>
                            <CardContent>
                                <Typography variant={"h5"}>
                                    Current Temperature
                                </Typography>
                            </CardContent>
                        </Card>
                        <Card variant={"outlined"} style={{height: "30%", textAlign: "center"}}>
                            <CardContent>
                                <Typography variant={"h5"}>
                                    Current Humidity
                                </Typography>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>
        </Container>
    </div>);
}

export default App;