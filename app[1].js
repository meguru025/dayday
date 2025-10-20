// 最小のバニラJS。cookieで保存/復元し、DOMに追加/削除/更新します。
let events = [];

// cookie ユーティリティ
function setCookie(name, value, days=30) {
  const expires = new Date(Date.now() + days*24*60*60*1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}
function getCookie(name) {
  const m = document.cookie.match(new RegExp(`${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function save() {
  try { setCookie("planner_events", JSON.stringify(events)); } catch(e) {}
}

function load() {
  const raw = getCookie("planner_events");
  if (raw) {
    try { events = JSON.parse(raw) || []; } catch(e) { events = []; }
  }
  render();
}

function render() {
  const tbody = document.querySelector('#eventTable tbody');
  tbody.innerHTML = '';
  events.forEach((ev, i) => {
    const tr = document.createElement('tr');
    if (ev.done) tr.classList.add('done');
    tr.innerHTML = `
      <td>${escapeHTML(ev.title)}</td>
      <td>${ev.date}</td>
      <td>${ev.category}</td>
      <td class="actions">
        <button data-act="done" data-i="${i}">完了</button>
        <button data-act="del" data-i="${i}">削除</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function addEvent() {
  const title = document.getElementById('title').value.trim();
  const date = document.getElementById('date').value;
  const category = document.getElementById('category').value;
  if (!title || !date) { alert('タイトルと日付を入力してください'); return; }
  events.push({ title, date, category, done:false });
  save(); render();
  document.getElementById('title').value = '';
  document.getElementById('date').value = '';
}

function toggleDone(i) {
  events[i].done = !events[i].done;
  save(); render();
}

function removeEvent(i) {
  if (!confirm('削除してよろしいですか？')) return;
  events.splice(i, 1);
  save(); render();
}

// XSS対策の最小関数
function escapeHTML(s){ return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',\"'\":'&#39;'}[c])); }

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('addBtn').addEventListener('click', addEvent);
  document.querySelector('#eventTable').addEventListener('click', (e) => {
    const btn = e.target.closest('button'); if (!btn) return;
    const i = Number(btn.dataset.i);
    if (btn.dataset.act === 'done') toggleDone(i);
    if (btn.dataset.act === 'del') removeEvent(i);
  });
  load();
});
