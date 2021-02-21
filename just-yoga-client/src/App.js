import React, { Component } from "react";
import Video from "./components/video";
import "./App.css";
// import "./styles/video.css";
import { BrowserRouter, Route } from "react-router-dom";
import { GoToRoomInput } from "./components/GoToRoomInput";
class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          <Route path="/" exact component={GoToRoomInput} />
          <Route path="/:roomId" exact component={Video} />
        </React.Fragment>
      </BrowserRouter>
    );
  }
}

export default App;
