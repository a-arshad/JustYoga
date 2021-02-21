const { makeStyles } = require("@material-ui/core");

export const useStyles = makeStyles({
    root: {
        height: "100vh",
        display: "flex",
        flexDirection: "column",
    },
    title: {
        fontWeight: 700,
        fontSize: 25,
        flexShrink: "1",

    },
    mainPose: {
        flexShrink: "1",
    },
    nextPoses: {
        display: "flex",
        flexDirection: "row",
        flexShrink: "2",
    },
});