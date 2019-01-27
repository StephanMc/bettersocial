import "../css/bootstrap.min.css"
import "../css/options.css";


import React from "react";
import {render} from "react-dom";
import OptionsApp from "./options/OptionsApp";
render(
    <OptionsApp/>,
    window.document.getElementById("options-app-container")
);
