const io = require('socket.io-client')

export default function () {
  const socket = io.connect('http://localhost:3000')

  function registerHandler(onMessageReceived) {
    socket.on('message', onMessageReceived)
  }

  function unregisterHandler() {
    socket.off('message')
  }

  socket.on('error', function (err) {
    console.log('received socket error:')
    console.log(err)
  })

  function register(name, cb) {
    socket.emit('register', name, cb)
  }

  function join(chatroomName, cb) {
    socket.emit('join', chatroomName, cb)
  }

  function leave(chatroomName, cb) {
    socket.emit('leave', chatroomName, cb)
  }

  function message(chatroomName, msg, cb) {
    socket.emit('message', { chatroomName, message: msg }, cb)
  }

  function typing(chatroomName, typing, cb) {
    socket.emit('typing', { chatroomName, typing: typing }, cb)
  }

  function getChatrooms(cb) {
    socket.emit('chatrooms', null, cb)
  }

  function getAvailableUsers(cb) {
    socket.emit('availableUsers', null, cb)
  }

  function getAllOnlineUser(cb) {
    socket.emit('registeredUsers', null, cb)
  }

  function registeredUsers(cb) {
    socket.on('registeredUsers', cb)
  }


  function registerUserName(name) {
    socket.emit('setUsername', name)
  }

  function allUsers(onUserConnected) {
    socket.on('allUsers', onUserConnected)
  }

  function sendMessage(message, to) {
    socket.emit('send_message', message, to)
  }

  function messageHistory(userMessageHistory) {
    socket.on('send_message', userMessageHistory)
  }

  return {
    registerUserName,
    allUsers,
    sendMessage,
    messageHistory,
    register,
    registeredUsers,
    getAllOnlineUser,
    join,
    leave,
    message,
    typing,
    getChatrooms,
    getAvailableUsers,
    registerHandler,
    unregisterHandler
  }
}

