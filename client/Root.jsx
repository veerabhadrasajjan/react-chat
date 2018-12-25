import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import MainLayout from './MainLayout';
import Home from './Home';
import Loader from './Loader';
import UserSelection from './UserSelection';
import Chatroom from './Chatroom';
import socket from './socket';

injectTapEventPlugin()

export default class Root extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.state = {
      user: null,
      isRegisterInProcess: false,
      client: socket(),
      chatrooms: null,
      chatHistory: []
    }

    this.onEnterChatroom = this.onEnterChatroom.bind(this)
    this.onLeaveChatroom = this.onLeaveChatroom.bind(this)
    this.getChatrooms = this.getChatrooms.bind(this)
    this.register = this.register.bind(this)
    this.renderUserSelectionOrRedirect = this.renderUserSelectionOrRedirect.bind(this)
    this.registeredUsers = this.registeredUsers.bind(this)
    this.getAllOnlineUser = this.getAllOnlineUser.bind(this)
    this.getChatrooms();
    this.getAllOnlineUser()
  }

  onEnterChatroom(user) {

    if (!this.state.user)
      return alert('Please register your self')

    let chatroomName = user + "_" + this.state.user.name;
    this.setState({ selectedUser: user, selectedRoom: chatroomName })
    return this.state.client.join(chatroomName, (err, chatHistory) => {
      if (err)
        return console.error(err)
      this.setState({ chatHistory: chatHistory })
    })
  }

  onLeaveChatroom(chatroomName, onLeaveSuccess) {
    this.state.client.leave(chatroomName, (err) => {
      if (err)
        return console.error(err)
      return onLeaveSuccess()
    })
  }

  getChatrooms() {
    this.state.client.getChatrooms((err, chatrooms) => {
      this.setState({ chatrooms })
    })
  }



  register(name) {
    const onRegisterResponse = user => this.setState({ isRegisterInProcess: false, user })
    this.setState({ isRegisterInProcess: true })
    this.state.client.register(name, (err, user) => {
      if (err) return onRegisterResponse(null)
      return onRegisterResponse(user)
    })
  }

  getAllOnlineUser() {
    this.state.client.getAllOnlineUser((err, users) => {
      this.setState({ OnlineUsers: users })
    })
  }

  componentDidMount() {
    this.state.client.registeredUsers(this.registeredUsers);
  }

  registeredUsers(users) {
    this.setState({ OnlineUsers: users })
  }

  renderUserSelectionOrRedirect(renderUserSelection) {
    if (this.state.user) {
      return <Redirect to="/" />
    }

    return this.state.isRegisterInProcess
      ? <Loader />
      : renderUserSelection()
  }

  renderChatroomOrRedirect(chatroom) {
    if (!this.state.user) {
      return <Redirect to="/" />
    }

    const { chatHistory } = this.state

    return (
      <Chatroom
        chatroom={chatroom}
        chatHistory={chatHistory}
        user={this.state.user}
        onLeave={
          () => this.onLeaveChatroom(
            chatroom.name,
            () => this.setState({ selectedUser: null })
          )
        }
        onSendMessage={
          (message, cb) => this.state.client.message(
            chatroom.name,
            message,
            cb
          )
        }
        registerHandler={this.state.client.registerHandler}
        unregisterHandler={this.state.client.unregisterHandler}
      />
    )
  }

  render() {
    return (
      <BrowserRouter>
        <MuiThemeProvider>
          <MainLayout
            user={this.state.user}
          >


            <div>
              {
                this.state.OnlineUsers && this.state.OnlineUsers.map((user, index) => {
                  return <div className="user-list" key={index} onClick={(e) => { this.onEnterChatroom(user) }}>{user}</div>
                })
              }
            </div>

            {
              <Switch>
                <Route
                  exact
                  path="/user"
                  render={
                    (props) => {
                      const toHome = () => props.history.push('/')
                      return this.renderUserSelectionOrRedirect(() => (
                        <UserSelection
                          getAvailableUsers={this.state.client.getAvailableUsers}
                          close={toHome}
                          register={name => this.register(name, toHome)}
                        />
                      ))
                    }
                  }
                />
              </Switch>
            }

            {
              this.state.selectedUser && this.renderChatroomOrRedirect({ name: this.state.selectedRoom })
            }


          </MainLayout>
        </MuiThemeProvider>
      </BrowserRouter>
    )
  }
}