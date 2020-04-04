import "../css/bootstrap.min.css"
import "../css/popup.css";

import PopupContent from "./popup/popup_content.jsx";

import React from "react";
import {render} from "react-dom";

render(
    <PopupContent/>,
    window.document.getElementById("app-container")
);
