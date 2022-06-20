import "./App.css";
import {Card, CardContent, Container, Grid, Paper, Stack, Typography} from "@mui/material";
import Chart from "./Chart";

function App() {
    return (
        <div className="App">
            <Container>
                <Grid container
                      spacing={0}
                      direction={"column"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      style={{minHeight: '100vh'}}
                >
                    <Stack direction={"row"}>
                        <Chart></Chart>
                        <Stack direction={"column"} justifyContent={"center"} spacing={2}>
                            <Card variant={"outlined"} style={{height: "40%", textAlign: "center"}}>
                                <CardContent>
                                    <Typography>
                                        Current Temperature
                                    </Typography>
                                </CardContent>
                            </Card>
                            <Card variant={"outlined"} style={{height: "40%", textAlign: "center"}}>
                                <CardContent>
                                    <Typography>
                                        Current Humidity
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Stack>
                </Grid>
            </Container>
        </div>
    );
}

export default App;