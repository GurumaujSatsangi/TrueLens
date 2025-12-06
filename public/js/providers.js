async function loadProviders(){
  const res = await fetch('/api/providers');
  const json = await res.json();
  const table = document.getElementById('providersTbl');
  const tbody = table.querySelector('tbody');
  if (!json.providers || json.providers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">No providers found.</td></tr>';
    return;
  }

  const rows = json.providers.map(p => {
    const nameText = escapeHtml(p.name || '');
    return `
      <tr>
        <td><a href="/provider/${p.id}">${nameText}</a></td>
        <td>${escapeHtml(p.phone || '')}</td>
        <td>${escapeHtml(p.email || '')}</td>
        <td>${escapeHtml(p.city || '')}</td>
        <td>${escapeHtml(p.state || '')}</td>
        <td>${p.issues_count ?? 0}</td>
        <td><button class="viewProvider" data-id="${p.id}">View</button></td>
      </tr>`;
  }).join('');

  tbody.innerHTML = rows;
}

loadProviders();

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// delegate click for view buttons
document.addEventListener('click', (ev) => {
  const btn = ev.target.closest('.viewProvider');
  if (!btn) return;
  const id = btn.dataset.id;
  window.location.href = `/provider/${id}`;
});
