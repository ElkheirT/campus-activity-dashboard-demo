import "./App.css";
import temperatureIcon from './images/thermometer.svg'
import humidityIcon from './images/humidity.svg'
import RefreshIcon from '@mui/icons-material/Refresh';
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
import io from 'socket.io-client'
import {db} from './db'
import {useEffect, useState} from "react";
import InfoCard from "./InfoCard";
import Histogram from "./Histogram";
import {DesktopDatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterLuxon} from '@mui/x-date-pickers/AdapterLuxon';
import {data} from "./data";

function App() {
    let currentTime = new Date();
    // assume library is open from 7AM to 10PM
    let openTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), 7, 0, 0);
    let closeTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), 22, 0, 0);

    let prevOpenTime = new Date(openTime.getTime());
    let prevCloseTime = new Date(closeTime.getTime());

    prevOpenTime.setDate(prevOpenTime.getDate() - 1);
    prevCloseTime.setDate(prevCloseTime.getDate() - 1);

    const socket = io('localhost:5000');

    const [histogramDate, setHistogramDate] = useState(prevOpenTime);
    const [histogramData, setHistogramData] = useState([]);

    const [temp, setTemp] = useState(70);
    const [humidity, setHumidity] = useState(67);


    const handleDateChange = (newDate) => {
        let newJSDate = newDate.toJSDate();
        setHistogramDate(newJSDate);
        let queryString = `${newJSDate.getFullYear()}-${newJSDate.getMonth() + 1}-${newJSDate.getDate()}`;
        socket.emit('get_binned_data', queryString);
    };

    const handleHistogramDataChange = (newData) => {
        let dataAsJSON = JSON.parse(newData);
        let dataAsArray = [];
        let keys = Object.keys(dataAsJSON);
        for (const key of keys) {
            let entry = dataAsJSON[key];
            dataAsArray.push({x: key, y: entry});
        }
        setHistogramData(dataAsArray);
    }

    useEffect(() => {
        if (!localStorage.getItem('lastFetchTime')) {
            localStorage.setItem('lastFetchTime', openTime.toString());
        }

        getLatestData();

        let queryString = `${prevOpenTime.getFullYear()}-${prevOpenTime.getMonth() + 1}-${prevOpenTime.getDate()}`;
        socket.emit('get_binned_data', queryString);

        socket.emit('get_data_stream');

        socket.on('binned_data', (data) => {
            handleHistogramDataChange(data);
        });

        socket.on('past_data', (data) => {
            console.log('got past data', data);
            if (data.length > 0) {
                data.forEach((element) => {
                    addToDB(element);
                });
                let mostRecentFetch = data[data.length - 1].time_stamp;
                localStorage.setItem('lastFetchTime', mostRecentFetch);
            }
        });

        socket.on('new_data_point', (data) => {
            if (data.sensor_type === "motion") {
                addToDB(data);
            } else if (data.sensor_type === "temp") {
                setTemp(data.sensor_output);
            } else if (data.sensor_type === "humidity") {
                setHumidity(data.sensor_output);
            }
            let mostRecentFetch = data.time_stamp;
            localStorage.setItem('lastFetchTime', mostRecentFetch);
        });
    }, []);

    function getLatestData() {
        let lastFetchTime = localStorage.getItem('lastFetchTime');
        getDataInRange(new Date(lastFetchTime), closeTime);
    }

    function getDataInRange(startDate, endDate) {
        socket.emit('get_data_in_range', {
            startDate: dateToString(startDate),
            endDate: dateToString(endDate)
        });
    }

    function dateToString(date) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    }

    async function addToDB(data) {
        try {
            /* store data.time_stamp as a JS Date object,
            so we can run date queries using dexie.js */
            let timeStamp = data.time_stamp;
            data.time_stamp = new Date(timeStamp);
            const id = await db.sensorData.add(data);
        } catch (error) {
            console.log("Failed to add data: ", error);
        }
    }

    return (
        <LocalizationProvider dateAdapter={AdapterLuxon}>
            <div className="App">
                <Box>
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
                        <Grid container justifyContent={"center"} spacing={5}>
                            <Grid item lg={6} md={8} sm={10}>
                                <Chart openTime={openTime} data={data}/>
                            </Grid>
                            <Grid item lg={6} md={8} sm={10} textAlign={'center'}>
                                <Histogram date={histogramDate} data={histogramData}/>
                                <DesktopDatePicker
                                    label="Date for peak times chart"
                                    inputFormat="MM/dd/yyyy"
                                    value={histogramDate}
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