const dialog = document.querySelector('#joinDialog');
const nameInput = document.querySelector('#athleteName');
const toast = document.querySelector('#toast');
let athleteName = localStorage.getItem('sportx-name') || '';

function notify(message, bad = false) { toast.textContent = message; toast.className = `show${bad ? ' bad' : ''}`; setTimeout(() => toast.className = '', 3600); }
function openJoin() { nameInput.value = athleteName; dialog.showModal(); nameInput.focus(); }
document.querySelector('#openJoin').onclick = openJoin; document.querySelector('#ctaJoin').onclick = openJoin;
dialog.addEventListener('close', () => { if (dialog.returnValue === 'confirm' && nameInput.value.trim()) { athleteName = nameInput.value.trim(); localStorage.setItem('sportx-name', athleteName); notify(`Welcome to SportX, ${athleteName}! Choose an event to join.`); } });

async function load() {
  const [events, summary] = await Promise.all([fetch('/api/events').then(r => r.json()), fetch('/api/summary').then(r => r.json())]);
  document.querySelector('#athletes').textContent = summary.athletes.toLocaleString();
  document.querySelector('#activeEvents').textContent = summary.activeEvents;
  render(events);
}
function render(events) { document.querySelector('#eventGrid').innerHTML = events.map(e => `<article class="event-card"><div class="sport-icon" style="--accent:${e.accent}">${e.icon}</div><div class="event-top"><span>${e.sport}</span><span>${e.players}/${e.capacity} spots</span></div><h3>${e.title}</h3><p class="meta">${e.date} · ${e.time}<br>${e.place}</p><div class="progress"><i style="width:${e.players/e.capacity*100}%;background:${e.accent}"></i></div><button class="join-event" data-id="${e.id}">Join event <b>→</b></button></article>`).join('');
  document.querySelectorAll('.join-event').forEach(button => button.onclick = () => join(button.dataset.id)); }
async function join(id) { if (!athleteName) return openJoin(); const response = await fetch(`/api/events/${id}/join`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:athleteName}) }); const data = await response.json(); if (!response.ok) return notify(data.error, true); notify(data.message); load(); }
load().catch(() => notify('Could not reach the SportX server.', true));
