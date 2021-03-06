const userTemplates = require('../config/users')

module.exports = function () {
  // mapping of all connected clients
  const clients = new Map()

  function broadcastMessage() {
    const usersTaken = Array.from(clients.values())
    .filter(c => c.user)
    .map(c => c.user.name)

    clients.forEach(m => {
      m.client.emit('registeredUsers', usersTaken)
    })
  }

  function addClient(client) {
    clients.set(client.id, { client })
  }

  function registerClient(client, user) {
    clients.set(client.id, { client, user })
  }

  function removeClient(client) {
    clients.delete(client.id)
  }

  function getAvailableUsers() {
    const usersTaken = new Set(
      Array.from(clients.values())
        .filter(c => c.user)
        .map(c => c.user.name)
    )
    return userTemplates
      .filter(u => !usersTaken.has(u.name))
  }

  function handleRegisteredUsers() {
    const usersTaken = Array.from(clients.values())
      .filter(c => c.user)
      .map(c => c.user.name)
    return usersTaken;
  }

  function isUserAvailable(userName) {
    return getAvailableUsers().some(u => u.name === userName)
  }

  function getUserByName(userName) {
    return userTemplates.find(u => u.name === userName)
  }

  function getUserByClientId(clientId) {
    return (clients.get(clientId) || {}).user
  }

  return {
    addClient,
    broadcastMessage,
    registerClient,
    removeClient,
    getAvailableUsers,
    isUserAvailable,
    getUserByName,
    getUserByClientId,
    handleRegisteredUsers
  }
}
