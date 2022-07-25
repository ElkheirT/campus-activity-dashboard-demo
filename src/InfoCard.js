import React from 'react';
import {Card, CardContent, CardMedia, Typography} from "@mui/material";

function InfoCard({icon, title, text}) {
    return (
        <Card sx={{display: "flex", justifyContent: "space-evenly", alignItems: "center", minWidth: "220px"}}>
            <CardMedia
                component="img"
                sx={{width: 80, height: 80}}
                src={icon}
            />
            <CardContent>
                <Typography variant="h5" fontWeight={"700"}>
                    {title}
                </Typography>
                <Typography variant="h4" fontWeight={"300"}>
                    {text}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default InfoCard;