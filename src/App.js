import "./App.css";
import temperatureIcon from './images/thermometer.svg'
import humidityIcon from './images/humidity.svg'
import {
    AppBar,
    Box, Button,
    Container,
    Grid,
    Stack, TextField,
    Toolbar,
    Typography
} from "@mui/material";
import Chart from "./Chart";
import {useEffect, useState} from "react";
import InfoCard from "./InfoCard";
import Histogram from "./Histogram";
import {DesktopDatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterLuxon} from '@mui/x-date-pickers/AdapterLuxon';
import {data} from "./data";

function App() {
    let currentDay = new Date();
    let previousDay = new Date();
    previousDay.setDate(currentDay.getDate() - 1);

    const [histogramDate, setHistogramDate] = useState(previousDay);
    const [histogramData, setHistogramData] = useState([]);

    const [temp, setTemp] = useState(70);
    const [humidity, setHumidity] = useState(67);

    const getRandomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min) + min);
    }

    const generateNewHistogramData = () => {
        let newData = [
            {x: "7AM-10AM", y: getRandomInt(200, 300)},
            {x: "11AM-2PM", y: getRandomInt(300, 400)},
            {x: "3PM-6PM", y: getRandomInt(350, 450)},
            {x: "7PM-10PM", y: getRandomInt(200, 300)},
        ];
        return newData;
    }

    const handleDateChange = (newDate) => {
        let dateString = newDate.toLocaleString();
        if (localStorage.getItem(dateString) === null) {
            let newData = generateNewHistogramData();
            localStorage.setItem(dateString, JSON.stringify(newData));
        }
        let histogramData = JSON.parse(localStorage.getItem(dateString));
        setHistogramDate(newDate.toJSDate());
        setHistogramData(histogramData);
    }

    useEffect(() => {
        setHistogramDate(previousDay);
        setHistogramData(generateNewHistogramData());
    }, []);

    function dateToString(date) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    }

    return (
        <LocalizationProvider dateAdapter={AdapterLuxon}>
            <div className="App">
                <Box mb={2}>
                    <AppBar position={"static"}>
                        <Toolbar>
                            <Typography variant={"h6"}>
                                Campus Activity Dashboard
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    <Container maxWidth={"xl"}>
                        <Stack direction={"row"} justifyContent={"center"} spacing={2} sx={{m: 4}}>
                            <InfoCard
                                icon={temperatureIcon}
                                title={"Temp"}
                                text={temp}
                            />
                            <InfoCard
                                icon={humidityIcon}
                                title={"Humidity"}
                                text={humidity}
                            />
                        </Stack>
                        <Grid container justifyContent={"center"} alignItems={"flex-start"} spacing={5}>
                            <Grid item lg={6} md={8} sm={10}>
                                <Chart openTime={currentDay} data={data}/>
                            </Grid>
                            <Grid item lg={6} md={8} sm={10} textAlign={'center'}>
                                <Histogram date={histogramDate} data={histogramData}/>
                                <DesktopDatePicker
                                    label="Date for peak times chart"
                                    inputFormat="MM/dd/yyyy"
                                    value={histogramDate}
                                    disableFuture={true}
                                    onChange={handleDateChange}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </Grid>
                        </Grid>
                    </Container>
                </Box>
            </div>
        </LocalizationProvider>
    );
}

export default App;