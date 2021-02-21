import { Typography } from "@material-ui/core";
import NextPose from "../nextPose/NextPose";
import { useStyles } from "./PoseTable.styles";

const PoseTable = (poses) => {
  const styles = useStyles();

  console.log(poses);
  
  let mainId = poses.poses[0].id

  return (
    <div className={styles.root}>
      <Typography className={styles.title}>Just Yoga!</Typography>
      <div className={styles.container}>
        <Typography style={{ fontWeight: 700, fontSize: "2.5em" }}>
          Downward-Facing Dog
        </Typography>
        <div className={styles.posesContainer}>
          <div className={styles.mainPoseContainer}>
            <img src={poses.poses[0].path} style={{ width: "100%", height: "auto" }} />
          </div>
          <Typography style={{ fontWeight: 700, fontSize: "1em" }}>
            Up Next:
          </Typography>
          <div className={styles.nextPoses}>
            {Object.entries(poses.poses).map(([key, pose]) => {
                return (pose.id !== mainId ? <NextPose path={pose.path} /> : null);
              })}
          </div>
        </div>
        <div className={styles.container}></div>
      </div>
    </div>
  );
};

export default PoseTable;
