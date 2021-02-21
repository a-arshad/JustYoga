import { Typography } from '@material-ui/core';
import NextPose from '../nextPose/NextPose';
import { ReactComponent as MainPose } from './pose1.svg';
import { useStyles } from './PoseTable.styles'


const PoseTable = () => {
    const styles = useStyles();

    return(
        <div className={styles.root}>
            <Typography className={styles.title}>
                Just Yoga!
            </Typography>
            <div className={styles.mainPose}>
                <Typography style={{fontWeight: 700, fontSize: 50}}>
                    Downwards Dog
                </Typography>
                <MainPose />
            </div>
            <div className={styles.nextPoses}>
                <NextPose />
                <NextPose />
                <NextPose />
            </div>
        </div>
    );
}

export default PoseTable;