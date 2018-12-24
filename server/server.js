const server = require('http').createServer()
const io = require('socket.io')(server)

const ClientManager = require('./ClientManager')
const ChatroomManager = require('./ChatroomManager')
const makeHandlers = require('./handlers')

const clientManager = ClientManager()
const chatroomManager = ChatroomManager()


users = [];
messageHistory = [];
var sockets = {};
io.on('connection', function (socket) {
  console.log('A user connected');

  if(users.length > 0){
    users.forEach(data => {
      sockets[data] = socket;
    });
  }

  socket.on('setUsername', function (data) {
    console.log('setUsername', data);
    if (users.indexOf(data) == -1) {
      console.log('setUsername', data);
      sockets[data] = socket;
      users.push(data);
      socket.emit('allUsers', users);
    } else {
      socket.emit('userExists', data + ' username is taken! Try some other username.');
    }
  })

  socket.emit('allUsers', users);


  socket.on('send_message', function (message, to) {
    console.log(message, to)
    messageHistory.push({ userId: socket.id, to_user: to, message: message })
    sockets[to].emit('send_message', { userId: socket.id, to_user: to, message: message });
  });

});



// io.on('connection', function (client) {
//   const {
//     handleRegister,
//     handleJoin,
//     handleLeave,
//     handleMessage,
//     handleGetChatrooms,
//     handleGetAvailableUsers,
//     handleDisconnect,
//     handleRegisteredUsers
//   } = makeHandlers(client, clientManager, chatroomManager)

//   console.log('client connected...', client.id)
//   clientManager.addClient(client)

//   client.on('register', handleRegister)

//   client.on('join', handleJoin)

//   client.on('leave', handleLeave)

//   client.on('message', handleMessage)

//   client.on('chatrooms', handleGetChatrooms)

//   client.on('availableUsers', handleGetAvailableUsers)

//   // get registerd user
//   client.on('registeredUsers', handleRegisteredUsers)

//   client.on('disconnect', function () {
//     console.log('client disconnect...', client.id)
//     handleDisconnect()
//   })

//   client.on('error', function (err) {
//     console.log('received error from client:', client.id)
//     console.log(err)
//   })
// })

server.listen(3000, function (err) {
  if (err) throw err
  console.log('listening on port 3000')
})
