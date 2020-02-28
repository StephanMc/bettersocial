import React from "react";
import {Badge, ListGroup, ListGroupItem} from 'reactstrap';
import Typography from '@material-ui/core/Typography';

import {hot} from "react-hot-loader";
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Util from "../Util"

const settingsManager = () => chrome.extension.getBackgroundPage().requireLoader.settingsManager();
const localize = Util.localize;

class GreetingComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            enableFacefont: settingsManager().getPreference("enableFacefont"),
            fontFamily: settingsManager().getPreference("fontFamily") || "",
            collapse: true,
            useNotif: !!settingsManager().getPreference("useNotif")
        };

        this.handleChangeFontFamily = this.handleChangeFontFamily.bind(this);
        this.handleChangeEnableFacefont = this.handleChangeEnableFacefont.bind(this);
    }

    handleChangeFontFamily = event => {
        const {name, value} = event.target;
        this.setState({[name]: value},
            () => settingsManager().setPreference(name, value));
    };


    handleChangeEnableFacefont = event => {

        const {checked} = event.target;

        this.setState({"enableFacefont": checked},
            () => settingsManager().setPreference("enableFacefont", !!checked));
    };

    render() {
        const backgroundPage = chrome.extension.getBackgroundPage().FacefontBg;
        const logo = require('../../img/icon-48.png');

        let notificationBadgeText = !this.state.useNotif ? "Disabled" : backgroundPage.getNotificationsManager().getNotificationCount();

        return (
            <div style={{width: 270, backgroundColor: 'whitesmoke', margin: 0, padding: 5}}>
                <div style={{
                    textAlign: 'center',
                    backgroundColor: 'hsla(210, 16%, 87%, 1)',
                    padding: 4,
                    borderRadius: 5
                }}>
                    <Typography variant="h6" color="inherit" style={{fontWeight: 300}}>
                        Better Social
                    </Typography>

                    <Typography variant="h6" color="inherit" style={{fontWeight: 300, fontSize: '1rem'}}>
                        {localize("label_ex_facefont")}
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
                        label={localize("label_enableFaceFont")}
                    />

                    <ListGroup>
                        {this.state.enableFacefont &&
                        <ListGroupItem>

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
                                <div style={{width: 55}}>
                                    <span style={{color: 'gray', fontSize: 11}}>{localize('label_font_size')}</span>
                                    <br/>
                                    <Input
                                        placeholder="Size"
                                        inputProps={{
                                            'aria-label': 'Description',
                                        }}
                                        type={"number"}
                                        onChange={(e) => {
                                            let value = e.target.value;
                                            settingsManager().setPreference("textSize", value)
                                        }}
                                        disabled={!this.state.enableFacefont}
                                        defaultValue={settingsManager().getPreference("textSize")}
                                    />
                                </div>
                            </div>
                            <div style={{fontSize: 11, marginTop: 19, color: '#8f8f8f'}}>
                                <em>{localize('popup_fonts_help')}</em>
                            </div>
                        </ListGroupItem>
                        }

                        {this.state.enableFacefont &&
                        <ListGroupItem
                            onClick={() => {
                                Util.openOrFocusPage(backgroundPage.getNotificationsManager().getNotificationClickUrl())
                            }}
                            tag="button"
                            action
                            style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                            <div>
                                <i className="material-icons"
                                   style={{
                                       float: 'left',
                                       fontSize: 18,
                                       marginTop: 3,
                                       marginRight: 5,
                                       color: 'lightsteelblue'
                                   }}>
                                    notification_important
                                </i>{" "}
                                Notifications
                            </div>
                            <div>
                                <Badge
                                    color={this.state.useNotif && notificationBadgeText > 0 ? "danger" : "light"}>{notificationBadgeText}</Badge>
                            </div>
                        </ListGroupItem>
                        }


                        <ListGroupItem tag="button" action
                                       onClick={() => {
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
                            {" "} Options</ListGroupItem>
                    </ListGroup>


                </div>
                <div style={{fontSize: 12, marginTop: 8}}><a
                    href='https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=A9SKZXCDEEASW'
                    target='_blank' style={{textDecoration: 'none', color: '#007bff'}}>

                    {localize("label_popup_make_donation")}
                </a>
                </div>

            </div>
        )
    }
}

export default hot(module)(GreetingComponent)
