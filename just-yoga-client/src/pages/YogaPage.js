import React, { useState, useEffect } from "react";
import PoseTable from "../components/poseTable/PoseTable";
import { useStyles } from "./YogaPage.styles";
import Video from "../components/video/Video";
import { posesPics } from "./poses";

export const YogaPage = (props) => {
  const styles = useStyles();
  const [poses, setPoses] = useState(posesPics);

  const posesCallback = () => {
    console.log("posesCallBack");
    poses.shift();
    setPoses(poses);
  }
  // initial get poses
  useEffect(async () => {}, []);

  console.log(poses);

  return (
    <div className={styles.root}>
      <PoseTable poses={poses} />
      <Video
        posesCallback={posesCallback}
        roomId={props.match.params}
        location={props.location.search}
      ></Video>
    </div>
  );
};
