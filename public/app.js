const setupEl = document.getElementById('setup');
const chatEl = document.getElementById('chat');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');
const userLabel = document.getElementById('user-label');
const messagesEl = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

let username = '';
let socket = null;

function addMessage(data) {
  const li = document.createElement('li');
  const name = document.createElement('strong');
  name.textContent = data.username + ':';
  li.appendChild(name);
  li.appendChild(document.createTextNode(' ' + data.message));
  messagesEl.appendChild(li);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function connect() {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  socket = new WebSocket(`${protocol}//${location.host}`);

  socket.onmessage = (event) => {
    try {
      addMessage(JSON.parse(event.data));
    } catch {
      // ignore malformed messages
    }
  };

  socket.onclose = () => {
    const li = document.createElement('li');
    li.textContent = 'Disconnected from server.';
    li.style.color = '#dc2626';
    messagesEl.appendChild(li);
  };
}

function join() {
  const name = usernameInput.value.trim();
  if (!name) return;

  username = name;
  setupEl.classList.add('hidden');
  chatEl.classList.remove('hidden');
  userLabel.textContent = `You: ${username}`;
  connect();
  messageInput.focus();
}

joinBtn.addEventListener('click', join);
usernameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') join();
});

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text || !socket || socket.readyState !== WebSocket.OPEN) return;

  socket.send(JSON.stringify({ username, message: text }));
  messageInput.value = '';
});
