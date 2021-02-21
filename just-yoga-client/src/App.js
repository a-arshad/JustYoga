import './App.css';
import { ThemeProvider } from '@material-ui/core';
import PoseTable from "./components/poseTable/PoseTable";
import theme from './theme/Theme';
import useStyles from './App.styles';

function App() {
  const styles = useStyles();

  return (
      <ThemeProvider theme={theme}>
        <div styles={styles.root}>
          <PoseTable />
        </div>
      </ThemeProvider>
  );
}

export default App;
