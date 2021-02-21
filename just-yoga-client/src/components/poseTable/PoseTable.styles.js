import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles({
  root: {
    // height: "98vh",
    // display: "flex",
    // flexDirection: "column",
    // padding: "2%",
    padding: "2%",
    flex: "1",
  },
  title: {
    fontWeight: 700,
    fontSize: "1em",
    flexShrink: "1",
  },
  container: {
    flexShrink: "1",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  posesContainer: {
    width: "calc(48vh - 74px)",
    display: "flex",
    flexDirection: "column",
  },
  mainPoseContainer: {
    marginBottom: "8%",
  },
  nextPoses: {
    display: "flex",
    flexDirection: "row",
    flexShrink: "2",
  },
});