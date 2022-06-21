import {Card, CardContent, CardMedia, Icon, Typography} from "@mui/material";
import WbSunnyIcon from '@mui/icons-material/WbSunny';

function InfoCard({variant, style, textContent, title}) {
    return (<Card variant={"outlined"}
                  style={style}
                  sx={{textAlign: "center"}}
    >
            <CardContent>
                <Typography>
                    {textContent}
                </Typography>
            </CardContent>
    </Card>);
}

export default InfoCard;