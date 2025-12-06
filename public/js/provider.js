const providerId = window.location.pathname.split('/').pop();

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function load() {
  const [resP, resIssues] = await Promise.all([
    fetch(`/api/providers/${providerId}`),
    fetch(`/api/providers/${providerId}/issues`)
  ]);

  const p = await resP.json();
  const issuesJson = await resIssues.json();

  const detailsTbl = document.getElementById('providerDetailsTbl');
  const tbody = detailsTbl.querySelector('tbody');
  tbody.innerHTML = '';

  const rows = [
    ['Name', p.name],
    ['Phone', p.phone],
    ['Email', p.email],
    ['Address', p.address_line1],
    ['City', p.city],
    ['State', p.state],
    ['Zip', p.zip],
    ['Speciality', p.speciality],
    ['License', p.license_number]
  ];

  for (const r of rows) {
    const tr = document.createElement('tr');
    const tdk = document.createElement('td');
    tdk.innerHTML = `<strong>${escapeHtml(r[0])}</strong>`;
    const tdv = document.createElement('td');
    tdv.innerText = r[1] ?? '';
    tr.appendChild(tdk);
    tr.appendChild(tdv);
    tbody.appendChild(tr);
  }

  // populate issues
  const issuesTbl = document.getElementById('providerIssuesTbl');
  const issuesTbody = issuesTbl.querySelector('tbody');
  issuesTbody.innerHTML = '';
  const issues = issuesJson.issues || [];
  if (issues.length === 0) {
    issuesTbody.innerHTML = '<tr><td colspan="7">No issues</td></tr>';
  } else {
    for (const it of issues) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(it.id)}</td>
        <td>${escapeHtml(it.field_name)}</td>
        <td>${escapeHtml(it.old_value)}</td>
        <td>${escapeHtml(it.suggested_value)}</td>
        <td>${escapeHtml(it.confidence)}</td>
        <td>${escapeHtml(it.severity)}</td>
        <td>${escapeHtml(it.status)}</td>
      `;
      issuesTbody.appendChild(tr);
    }
  }
}

load();
