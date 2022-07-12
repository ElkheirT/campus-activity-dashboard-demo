import "./App.css";
import {Card, CardContent, Container, Grid, Paper, Stack, Typography} from "@mui/material";
import Chart from "./Chart";
import io from 'socket.io-client'
import {useEffect} from "react";


function App() {


    useEffect(() => {
        const socket = io('localhost:5000')
        socket.emit('get_data')

        socket.on('new_data', (data) => {
            console.log("got new data: ", data);
        })

    }, [])

    return (<div className="App">
        {/*<Container>*/}
        {/*    <Grid container*/}
        {/*          spacing={0}*/}
        {/*          direction={"column"}*/}
        {/*          alignItems={"center"}*/}
        {/*          justifyContent={"center"}*/}
        {/*          style={{minHeight: '100vh'}}*/}
        {/*    >*/}
        {/*        <Grid container>*/}
        {/*            <Grid item xs={8}>*/}
        {/*                <Chart></Chart>*/}
        {/*            </Grid>*/}
        {/*            <Stack direction={"column"} justifyContent={"center"} spacing={2}>*/}
        {/*                <Card variant={"outlined"} style={{height: "30%", textAlign: "center"}}>*/}
        {/*                    <CardContent>*/}
        {/*                        <Typography variant={"h5"}>*/}
        {/*                            Current Temperature*/}
        {/*                        </Typography>*/}
        {/*                    </CardContent>*/}
        {/*                </Card>*/}
        {/*                <Card variant={"outlined"} style={{height: "30%", textAlign: "center"}}>*/}
        {/*                    <CardContent>*/}
        {/*                        <Typography variant={"h5"}>*/}
        {/*                            Current Humidity*/}
        {/*                        </Typography>*/}
        {/*                    </CardContent>*/}
        {/*                </Card>*/}
        {/*            </Stack>*/}
        {/*        </Grid>*/}
        {/*    </Grid>*/}
        {/*</Container>*/}
    </div>);
}

export default App;