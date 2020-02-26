import "../css/bootstrap.min.css"
import "../css/options.css";


import React from "react";
import {render} from "react-dom";
import OptionsApp from "./options/SettingsView";

render(
    <OptionsApp/>,
    window.document.getElementById("options-app-container")
);
