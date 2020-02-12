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
import Util from "../Util";
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import TermsOfUse from "./TermsOfUse";

const settingsManager = () => chrome.extension.getBackgroundPage().requireLoader.settingsManager();
const notificationManager = () => chrome.extension.getBackgroundPage().requireLoader.notificationsManager();
const appVersion = chrome.runtime.getManifest().version;
const localize = Util.localize;

class SettingsView extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            enableFacefont: settingsManager().getPreference("enableFacefont"),
            fontFamily: settingsManager().getPreference("fontFamily") || "",
            collapse: true,
            textSize: settingsManager().getPreference("textSize") || 14,
            useNotif: !!settingsManager().getPreference("useNotif"),
            enableAudio: !!settingsManager().getPreference("enableAudio"),

            modal: false
        }
    }

    toggle = () => {
        this.setState({
            modal: !this.state.modal
        });
    };

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

        const stylePreview = {
            backgroundColor: '#f9f9f9',
            padding: 10,
            width: 'fit-content',
            borderRadius: 10,
            fontFamily: this.state.fontFamily,
            fontSize: this.state.textSize + "px"
        };

        const logo = require('../../img/icon-48.png');
        return (
            <div>
                <main role="main" className="container" style={{maxWidth: 800}}>

                    <div className="jumbotron text-center">
                        <h1 className="display-5">
                            Better Social
                        </h1>
                        <p className="lead">
                            {localize("extension_brief_description")}<br/>

                        </p>
                    </div>


                    <h3 className="mt-5">
                        <span style={{marginRight: 10}}>{localize("label_ff_options")}</span>
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
                                    label={<h6 style={{marginTop: 9}}>{localize("label_enableFaceFont")}</h6>}
                                />
                            </div>


                            <h6>{localize("label_facebook_posts")}</h6>
                            <div className="ml-4">
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                                    <div style={{marginRight: '0px', width: '90%'}}>

                                <span
                                    style={{color: 'gray', fontSize: 11}}>{localize("label_font_theme")}</span><br/>
                                        <FormControl style={{width: 'inherit'}}>
                                            <Select
                                                value={this.state.fontFamily}
                                                disabled={!this.state.enableFacefont}
                                                onChange={this.handleChangeFontFamily}
                                                displayEmpty
                                                name="fontFamily"
                                            >
                                                <MenuItem value="">
                                                    <em>{localize("label_font_by_default")}</em>
                                                </MenuItem>
                                                {settingsManager().getSafeWebFonts().map((font, index) =>
                                                    <MenuItem key={"font" + index} value={font.family}
                                                              style={{fontFamily: font.family}}>{font.title}</MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <div style={{width: 111}}>
                                        <span style={{
                                            color: 'gray',
                                            fontSize: 11
                                        }}>{localize("label_font_size")} {localize("label_font_size_default")}</span>
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
                                <small>{localize("label_preview")}</small>
                                <br/>
                                <div className="ml-4">

                                    <div style={stylePreview}>
                                        {localize("label_textpreview")}
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
                                        label={localize("label_enableNotifications")}
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
                                            onClick={() => notificationManager().doPlay()}>
                                        <Icon
                                            style={{fontSize: 25}}>play_arrow_icon</Icon> {localize("label_play_button")}
                                    </Button>

                                </div>
                            </div>

                        </div>
                    </div>

                    <h3 className="mt-5">
                        <span style={{marginRight: 10}}>{localize("about_title")}</span>
                    </h3>
                    <div className="card">
                        <div className="card-body">
                            <div className="ml-4">
                                {localize("about_description")}<br/>

                            </div>
                            <br/>

                            <h6>{localize("label_donations")}</h6>
                            <div className="ml-4">
                                {localize("make_donation")} 😍
                                <br/>
                                <a href='https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=A9SKZXCDEEASW'
                                   target='_blank' style={{textDecoration: 'none'}}>
                                    <Button variant={"contained"} style={{textTransform: 'none'}}
                                            color={"secondary"}>{localize("label_button_donate")}
                                        {" "} 💛 </Button>
                                </a>

                            </div>

                            <br/>
                            <hr/>
                            <h6>{localize("label_questions")}</h6>
                            <div className="ml-4">
                                {localize("text_questions")}<a
                                href={"mailto:stephan.kouadio@gmail.com"}>stephan.kouadio@gmail.com</a>

                            </div>
                            <br/>

                            <h6>{localize("label_privacy")}</h6>
                            <div className="ml-4">
                                <Button variant={"text"} onClick={this.toggle}>{localize("text_privacy_button")}</Button>
                                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                                    <ModalHeader toggle={this.toggle}>Privacy</ModalHeader>
                                    <ModalBody >
                                        <TermsOfUse/>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color="primary" onClick={this.toggle}>Close</Button>{' '}
                                    </ModalFooter>
                                </Modal>
                            </div>

                        </div>
                    </div>

                    <br/>
                </main>

                <footer className="footer">
                    <div className="container">
                        <img src={logo}/> {" "} <span className="text-muted">Better Social {appVersion}</span>
                    </div>
                </footer>
            </div>
        )
    }
}


export default hot(module)(SettingsView)
