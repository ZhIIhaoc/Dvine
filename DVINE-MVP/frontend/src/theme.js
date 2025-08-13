import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#8d198f",
        },
        background: {
            default: "#fbf9f5",
            secondary: "#EDE9E3",
        },
        text: {
            primary: "#000000",
            secondary: "#fbf9f5",
            tertiary: "#8d198f",
        },
        header: { main: "rgba(251, 249, 245, 0.8)" },
    },
});

export const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#8d198f",
        },
        background: {
            default: "#303030",
            secondary: "#212121",
        },
        text: {
            primary: "#fbf9f5",
            secondary: "#303030",
            // tertiary: "#c828caff",
            tertiary: "#E366E5",
        },
        header: { main: "rgba(48, 48, 48, 0.8)" },
    },
});
