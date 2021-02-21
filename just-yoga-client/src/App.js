// import "./App.css";
import { ThemeProvider } from "@material-ui/core";
import PoseTable from "./components/poseTable/PoseTable";
import theme from "./theme/Theme";
import useStyles from "./App.styles";
import { Webcam } from "./components/webcam/Webcam";

function App() {
  const styles = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <div className={styles.root}>
        <PoseTable />
        <Webcam></Webcam>
      </div>
    </ThemeProvider>
  );

  // import React, { Component } from "react";
  // import Video from "./components/video/Video";
  // import "./App.css";
  // // import "./styles/video.css";
  // import { BrowserRouter, Route } from "react-router-dom";
  // import { GoToRoomInput } from "./components/goToRoomInput/GoToRoomInput";
  // class App extends Component {
  //   render() {
  //     return (
  //       <BrowserRouter>
  //         <React.Fragment>
  //           <Route path="/" exact component={GoToRoomInput} />
  //           <Route path="/:roomId" exact component={Video} />
  //         </React.Fragment>
  //       </BrowserRouter>
  //     );
  //   }
}

export default App;
