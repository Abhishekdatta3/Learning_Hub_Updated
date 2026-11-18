const chatSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('joinRoom', ({ roomId, userName }) => {
      socket.join(roomId);
      socket.to(roomId).emit('userJoined', { userName });
    });
    socket.on('sendMessage', ({ roomId, message, sender }) => {
      io.to(roomId).emit('receiveMessage', { sender, message, timestamp: new Date().toISOString() });
    });
    socket.on('leaveRoom', ({ roomId, userName }) => {
      socket.leave(roomId);
      socket.to(roomId).emit('userLeft', { userName });
    });
  });
};
module.exports = chatSocket;
