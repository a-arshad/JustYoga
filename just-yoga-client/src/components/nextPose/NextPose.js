import { Typography } from "@material-ui/core";
import { ReactComponent as Pose } from "../poseTable/pose1.svg";
import { useStyles } from "./NextPose.styles";

const NextPose = (path) => {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <img src={path} style={{ height: "auto", width: "100%" }} />
      <p className={styles.name}>Pose Name</p>
    </div>
  );
};

export default NextPose;
