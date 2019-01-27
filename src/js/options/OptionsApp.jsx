import React from "react";
import {hot} from "react-hot-loader";
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Icon from '@material-ui/core/Icon';

const settingsManager = () => chrome.extension.getBackgroundPage().requireLoader.settingsManager()
const notificationManager = () => chrome.extension.getBackgroundPage().requireLoader.notificationsManager()
const appVersion = chrome.runtime.getManifest().version;

class OptionsApp extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            enableFacefont: settingsManager().getPreference("enableFacefont"),
            fontFamily: settingsManager().getPreference("fontFamily") || "",
            collapse: true,
            textSize: settingsManager().getPreference("textSize") || 14,
            useNotif: !!settingsManager().getPreference("useNotif"),
            enableAudio: !!settingsManager().getPreference("enableAudio")
        }
    }

    handleChangeFontFamily = event => {
        const {name, value} = event.target;

        this.setState({[event.target.name]: event.target.value},
            () => settingsManager().setPreference(name, value));
    };

    handleChangeEnableFacefont = event => {

        const {checked} = event.target;

        this.setState({"enableFacefont": checked},
            () => settingsManager().setPreference("enableFacefont", !!checked));
    };


    handleChangeNotification = event => {

        const {checked} = event.target;

        this.setState({"useNotif": checked},
            () => settingsManager().setPreference("useNotif", !!checked));
    };

    handleChangeNotificationAudio = event => {

        const {checked} = event.target;

        // Play audio if
        // if (checked) {
        //     notificationManager().doPlay();
        // }

        this.setState({"enableAudio": checked},
            () => settingsManager().setPreference("enableAudio", !!checked));
    };


    render() {

        window.__state = this.state
        const stylePreview = {
            backgroundColor: '#f9f9f9',
            padding: 10,
            width: 'fit-content',
            borderRadius: 10,
            fontFamily: this.state.fontFamily,
            fontSize: this.state.textSize + "px"
        };

        const logo = require('../../img/icon-48.png')
        return (
            <div>
                <main role="main" className="container" style={{maxWidth: 800}}>

                    <div className="jumbotron text-center">
                        <h1 className="display-5">
                            Facefont
                        </h1>
                        <p className="lead">
                            Give a style to your Facebook posts, receive your Facebook notifications instantly in your
                            browser, and more. <br/>

                        </p>
                    </div>


                    <h3 className="mt-5">
                        <span style={{marginRight: 10}}>Settings</span>
                    </h3>
                    <div className="card">
                        <div className="card-body">
                            <div>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={this.state.enableFacefont}
                                            onChange={this.handleChangeEnableFacefont}
                                            value="enableFacefont"
                                        />
                                    }
                                    label={<h6 style={{marginTop: 9}}>Enable Facefont</h6>}
                                />
                            </div>


                            <h6>Facebook posts</h6>
                            <div className="ml-4">
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                                    <div style={{marginRight: '0px', width: '90%'}}>

                                <span
                                    style={{color: 'gray', fontSize: 11}}>Font Theme</span><br/>
                                        <FormControl style={{width: 'inherit'}}>
                                            <Select
                                                value={this.state.fontFamily}
                                                disabled={!this.state.enableFacefont}
                                                onChange={this.handleChangeFontFamily}
                                                displayEmpty
                                                name="fontFamily"
                                            >
                                                <MenuItem value="">
                                                    <em>By default</em>
                                                </MenuItem>
                                                {settingsManager().getSafeWebFonts().map((font, index) =>
                                                    <MenuItem key={"font" + index} value={font.family}
                                                              style={{fontFamily: font.family}}>{font.title}</MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <div style={{width: 111}}>
                                        <span style={{color: 'gray', fontSize: 11}}>Size (default is 14)</span>
                                        <br/>
                                        <Input
                                            placeholder="Size"
                                            inputProps={{
                                                'aria-label': 'Description',
                                            }}
                                            type={"number"}
                                            onChange={(e) => {
                                                let value = e.target.value;
                                                this.setState({
                                                    textSize: value
                                                })
                                                settingsManager().setPreference("textSize", value)
                                            }}
                                            disabled={!this.state.enableFacefont}
                                            defaultValue={settingsManager().getPreference("textSize")}
                                        />
                                    </div>
                                </div>
                                <br/>
                                <small>Preview:</small>
                                <br/>
                                <div className="ml-4">

                                    <div style={stylePreview}>
                                        Don't trust anything you see. Even salt look like sugar
                                    </div>

                                </div>
                            </div>

                            <br/><br/>
                            <h6>Notifications</h6>
                            <div className="ml-4">
                                <div>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                defaultChecked={this.state.useNotif}
                                                onChange={this.handleChangeNotification}
                                                disabled={!this.state.enableFacefont}
                                                value="useNotif"
                                            />
                                        }
                                        label={"Enable Facebook notifications"}
                                    />
                                </div>
                                <div>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                defaultChecked={this.state.enableAudio}
                                                onChange={this.handleChangeNotificationAudio}
                                                disabled={!this.state.enableFacefont}
                                                value="useNotif"
                                            />
                                        }
                                        label={"Play a sound when a new notification arrive"}
                                    />
                                    <Button size={"small"}
                                            variant={"outlined"}
                                            color="secondary"
                                            style={{padding: '3px 7px', marginTop: -10}}
                                            disabled={!this.state.enableFacefont}
                                            onClick={() => notificationManager().doPlay()}

                                    >
                                        <Icon style={{fontSize: 25}}>play_arrow_icon</Icon> Preview
                                    </Button>

                                </div>
                            </div>

                        </div>
                    </div>

                    <h3 className="mt-5">
                        <span style={{marginRight: 10}}>About</span>
                    </h3>
                    <div className="card">
                        <div className="card-body">
                            <div className="ml-4">
                                Facefont is made with ❤, with the hope to make better your daily usage of Facebook.<br/>
                                <br/>

                                For any question or bug report, feel free to contact me: <a
                                href={"mailto:stephan.kouadio@gmail.com"}>stephan.kouadio@gmail.com</a>

                                <hr/>
                                <br/>
                                If you like my work and want to encourage me, your donation will be very appreciated
                                😍<br/>
                                <a href='http://bit.ly/donate-stephanmc'
                                   target='_blank' style={{textDecoration: 'none'}}>
                                    <Button style={{textTransform: 'none'}} color={"secondary"}>Make a donation
                                        💛 </Button>
                                </a>
                            </div>


                        </div>
                    </div>

                    <br/><br/><br/><br/>
                </main>

                <footer className="footer">
                    <div className="container">
                        <img src={logo}/> {" "} <span className="text-muted">Facefont {appVersion}</span>
                    </div>
                </footer>
            </div>
        )
    }
}


export default hot(module)(OptionsApp)
