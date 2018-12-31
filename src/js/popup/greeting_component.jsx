import React from "react";
import {Badge, ListGroup, ListGroupItem} from 'reactstrap';
// import Paper from '@material-ui/core/Paper';
// import AppBar from '@material-ui/core/AppBar';
// import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import {hot} from "react-hot-loader";
// import FormControl from "@material-ui/core/FormControl";
// import InputLabel from "@material-ui/core/InputLabel";
// import Select from "@material-ui/core/Select";
// import MenuItem from "@material-ui/core/MenuItem";
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Util from "../Util"

const settingsManager = () => chrome.extension.getBackgroundPage().requireLoader.settingsManager()

class GreetingComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            enableFacefont: settingsManager().getPreference("enableFacefont"),
            fontFamily: settingsManager().getPreference("fontFamily") || "",
            collapse: true
        }

        this.handleChangeFontFamily = this.handleChangeFontFamily.bind(this)
        this.handleChangeEnableFacefont = this.handleChangeEnableFacefont.bind(this)
    }

    handleChangeFontFamily = event => {
        const {name, value} = event.target;

        console.log({name, value})
        this.setState({[event.target.name]: event.target.value},
            () => settingsManager().setPreference(name, value));
    };


    handleChangeEnableFacefont = event => {

        const {checked} = event.target;

        this.setState({"enableFacefont": checked},
            () => settingsManager().setPreference("enableFacefont", !!checked));
    };

    render() {
        const backgroundPage = chrome.extension.getBackgroundPage().FacefontBg;

        return (
            <div style={{width: 295, backgroundColor: 'ghostwhite', margin: 0, padding: 13}}>
                <div style={{textAlign: 'center', backgroundColor: '#00000055', padding: 10}}>
                    <Typography variant="h6" color="inherit">
                        Facefont
                    </Typography>

                </div>

                <div>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={this.state.enableFacefont}
                                onChange={this.handleChangeEnableFacefont}
                                value="enableFacefont"
                            />
                        }
                        label="Enable Facefont"
                    />

                    <ListGroup>
                        {this.state.enableFacefont &&
                        <ListGroupItem>

                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                                <div style={{marginRight: '0px', width: '83%'}}>
                                <span
                                    style={{color: 'gray', fontSize: 11}}>Font theme</span><br/>
                                    <FormControl style={{width: 'inherit'}}>
                                        <Select
                                            value={this.state.fontFamily}
                                            disabled={!this.state.enableFacefont}
                                            onChange={this.handleChangeFontFamily}
                                            displayEmpty
                                            name="fontFamily"
                                        >
                                            <MenuItem value="">
                                                <em>Facebook</em>
                                            </MenuItem>
                                            {settingsManager().getSafeWebFonts().map((font, index) =>
                                                <MenuItem key={"font" + index} value={font.family}
                                                          style={{fontFamily: font.family}}>{font.title}</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                </div>
                                <div style={{width: 90}}>
                                    <span style={{color: 'gray', fontSize: 11}}>Font size</span>
                                    <br/>
                                    <Input
                                        placeholder="Size"
                                        inputProps={{
                                            'aria-label': 'Description',
                                        }}
                                        type={"number"}
                                        onChange={(e) => {
                                            console.log(e.target.value)
                                        }}
                                        disabled={!this.state.enableFacefont}
                                        defaultValue={15}
                                    />
                                </div>
                            </div>
                            <div style={{fontSize: 11, marginTop: 19, color: '#8f8f8f'}}>
                                <em>These will be applied to Facebook posts</em>
                            </div>
                        </ListGroupItem>
                        }

                        {this.state.enableFacefont &&
                        <ListGroupItem
                            onClick={() => {
                                Util.openOrFocusPage(backgroundPage.getNotificationsManager().getNotificationClickUrl())
                            }}
                            tag="button" action
                            style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                            <div> Notifications</div>
                            <div>
                                <Badge
                                    color="danger">{backgroundPage.getNotificationsManager().getNotificationCount()}</Badge>
                            </div>
                        </ListGroupItem>
                        }


                        {/*<ListGroupItem*/}
                        {/*className="justify-content-between">*/}
                        {/*Notifications <Badge*/}
                        {/*color="danger">{backgroundPage.getNotificationsManager().getNotificationCount()}</Badge>*/}
                        {/*</ListGroupItem>*/}


                        <ListGroupItem tag="button" action
                                       onClick={() => {
                                           console.log('you clickec settings');
                                           Util.openOrFocusPage(chrome.extension.getURL("options.html"))
                                       }}>
                            <i className="material-icons"
                               style={{
                                   float: 'left',
                                   fontSize: 18,
                                   marginTop: 3,
                                   marginRight: 5,
                                   color: 'lightsteelblue'
                               }}>
                                settings
                            </i>
                            {" "} Settings</ListGroupItem>
                    </ListGroup>


                </div>
                <div style={{fontSize: 12, color: '#323232'}}>
                    You like the addon ? Buy a coffee to the developer
                </div>
                {/*<AppBar  color="primary" position={"fixed"}>*/}
                {/*<Toolbar>*/}
                {/*<Typography variant="h6" color="inherit">*/}
                {/*Facefont title*/}
                {/*</Typography>*/}
                {/*</Toolbar>*/}
                {/*</AppBar>*/}

                {/*<FormControl className={classes.formControl}>*/}
                {/*<InputLabel htmlFor="age-simple">Age</InputLabel>*/}
                {/*<Select*/}
                {/*inputProps={{*/}
                {/*name: 'age',*/}
                {/*id: 'age-simple',*/}
                {/*}}*/}
                {/*>*/}
                {/*<MenuItem value="">*/}
                {/*<em>None</em>*/}
                {/*</MenuItem>*/}
                {/*<MenuItem value={10}>Ten</MenuItem>*/}
                {/*<MenuItem value={20}>Twenty</MenuItem>*/}
                {/*<MenuItem value={30}>Thirty</MenuItem>*/}
                {/*</Select>*/}
                {/*</FormControl>*/}
            </div>
        )
    }
};

console.log(Util.counter++ )

export default hot(module)(GreetingComponent)
