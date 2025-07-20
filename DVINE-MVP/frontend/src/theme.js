import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#8d198f",
        },
        background: {
            default: "#fbf9f5",
        },
        text: {
            primary: "#000000",
            secondary: "#fbf9f5",
        },
    },
});

export const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#8d198f",
        },
        background: {
            default: "#212121",
        },
        text: {
            primary: "#fbf9f5",
            secondary: "#212121",
        },
    },
});
