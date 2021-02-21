import { Typography } from '@material-ui/core';
import { ReactComponent as Pose } from '../poseTable/pose1.svg';

const NextPose = () => {
    return(
        <div>
            <Pose />
            <Typography>
                Pose Name
            </Typography>
        </div>
    );
}

export default NextPose;