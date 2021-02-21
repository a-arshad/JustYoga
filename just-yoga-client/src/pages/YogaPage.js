import React from "react";
import PoseTable from "../components/poseTable/PoseTable";
import { useStyles } from "./YogaPage.styles";
import Video from "../components/video/Video";

export const YogaPage = (props) => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <PoseTable />
      <Video roomId={props.match.params}></Video>
    </div>
  );
};
