import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import MainLayout from './MainLayout';
import socket from './socket';

import styled from 'styled-components'
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import FontIcon from 'material-ui/FontIcon';
import Avatar from 'material-ui/Avatar';
import Divider from 'material-ui/Divider';
import { List, ListItem } from 'material-ui/List';

import Overlay from './Overlay';

const ChatWindow = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  width: 420px;
  box-sizing: border-box;
`
const ChatPanel = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  z-index: 1;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 20px ;
  z-index: 1;
  color: #fafafa !important;
  border-bottom: 1px solid;
`

const Title = styled.p`
  text-align: center;
  font-size: 24px;
`

const NoDots = styled.div`
  hr {
    visibility: hidden;
  }
`

const OutputText = styled.div`
  white-space: normal !important;
  word-break: break-all !important;
  overflow: initial !important;
  width: 100%;
  height: auto !important;
  color: #fafafa !important;
`

const InputPanel = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  align-self: center;
  border-top: 1px solid #fafafa;
`

const ChatroomImage = styled.img`
  position: absolute;
  top: 0;
  width: 100%;
`

const Scrollable = styled.div`
  height: 100%;
  overflow: auto;
`

injectTapEventPlugin()

export default class Root extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.state = {
      user: null,
      isRegisterInProcess: false,
      client: socket(),
      chatrooms: null,
      messages:[]
    }
    this.onUserConnected = this.onUserConnected.bind(this)
    this.onHandalInput = this.onHandalInput.bind(this)
    this.userMessageHistory = this.userMessageHistory.bind(this)
    this.selectedUser = this.selectedUser.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
    this.onInput = this.onInput.bind(this)


  }

  componentDidMount() {
    this.state.client.allUsers(this.onUserConnected);
    this.state.client.messageHistory(this.userMessageHistory)
  }

  onHandalInput(e) {
    if (e.target.value) {
      this.setState({ userName: e.target.value });
      localStorage.setItem("userName", e.target.value)
    }
  }

  registerUserName() {
    if (this.state.userName) {
      this.state.client.registerUserName(this.state.userName)
    }
  }


  onUserConnected(user) {
    console.log('onUserConnected:', user)
    this.setState({ allUsers: user })
  }
  
  selectedUser(user){
    this.setState({ selectedUser: user })
  }

  userMessageHistory(message) {
    console.log('message:', message)
    let messages = this.state.messages;
    messages.push(message)
    this.setState({ messages: messages })
  }

  onInput(e) {
    this.setState({
      input: e.target.value
    })
  }
  
  sendMessage(){
    if (!this.state.input)
      return
    this.state.client.sendMessage(this.state.input , this.state.selectedUser);
    let messages = this.state.messages;
    messages.push({ userId: this.state.client.id, to_user: this.state.selectedUser, message: this.state.input })
    this.setState({ messages: messages, input:'' })
    
  }

  render() {
    return (
      <BrowserRouter>
        <MuiThemeProvider>
          <MainLayout
            user={this.state.user}
          >
            <div>
              <input type="text" onChange={(e) => { this.onHandalInput(e) }} />
              <button type="button" name="button" onClick={(e) => { this.registerUserName(e) }}>
                Let me chat!
              </button>
            </div>


            <div>
              {
                this.state.allUsers && this.state.allUsers.map((user, index) => {
                  return <div className="user-list" key={index} onClick={(e)=>{this.selectedUser(user)}}>{user}</div>
                })
              }
            </div>



            <div style={{ height: '100%' }}>
              <ChatWindow>
                <Header>
                  <Title>
                    {this.state.selectedUser}
                  </Title>
                  <RaisedButton
                    primary
                    icon={
                      <FontIcon
                        style={{ fontSize: 24 }}
                        className="material-icons"
                      >
                        {'close'}
                      </FontIcon>
                    }
                    onClick={(e)=>{this.selectedUser('')}}
                  />
                </Header>
                <ChatroomImage
                  src={this.props.image}
                  alt=""
                />
                <ChatPanel>
                  <Scrollable innerRef={(panel) => { this.panel = panel; }}>
                    <List>
                      {
                        this.state.messages && this.state.messages.map(
                          ({ image, to_user, message, event }, i) => [
                            <NoDots>
                              <ListItem
                                key={i}
                                style={{ color: '#fafafa' }}
                                leftAvatar={<Avatar src={image} />}
                                primaryText={`${to_user} ${event || ''}`}
                                secondaryText={
                                  message &&
                                  <OutputText>
                                    {message}
                                  </OutputText>
                                }
                              />
                            </NoDots>,
                            <Divider inset />
                          ]
                        )
                      }
                    </List>
                  </Scrollable>
                  <InputPanel>
                    <TextField
                      textareaStyle={{ color: '#fafafa' }}
                      hintStyle={{ color: '#fafafa' }}
                      floatingLabelStyle={{ color: '#fafafa' }}
                      hintText="Enter a message."
                      floatingLabelText="Enter a message."
                      multiLine
                      rows={4}
                      rowsMax={4}
                      onChange={this.onInput}
                      value={this.state.input}
                      onKeyPress={e => (e.key === 'Enter' ? this.sendMessage() : null)}
                    />
                    <FloatingActionButton
                      onClick={this.sendMessage}
                      style={{ marginLeft: 20 }}
                    >
                      <FontIcon
                        style={{ fontSize: 32 }}
                        className="material-icons"
                      >
                        {'chat_bubble_outline'}
                      </FontIcon>
                    </FloatingActionButton>
                  </InputPanel>
                </ChatPanel>
                <Overlay
                  opacity={0.6}
                  background="#111111"
                />
              </ChatWindow>
            </div>



          </MainLayout>
        </MuiThemeProvider>
      </BrowserRouter>
    )
  }
}
