async function loadRuns(){
  const res = await fetch('/api/validation-runs');
  const json = await res.json();
  const table = document.getElementById('runsTbl');
  const tbody = table.querySelector('tbody');
  if (!json.runs || json.runs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7">No runs yet.</td></tr>';
    return;
  }

  const rows = json.runs.map(r => `
    <tr>
      <td>${escapeHtml(String(r.id))}</td>
      <td>${r.started_at ? escapeHtml(new Date(r.started_at).toLocaleString()) : ''}</td>
      <td>${r.total_providers ?? ''}</td>
      <td>${r.processed ?? ''}</td>
      <td>${r.success_count ?? ''}</td>
      <td>${r.needs_review_count ?? ''}</td>
      <td>${r.completed_at ? escapeHtml(new Date(r.completed_at).toLocaleString()) : ''}</td>
      <td><button class="viewRunIssues" data-id="${escapeHtml(String(r.id))}">View Issues</button></td>
    </tr>`).join('');

  tbody.innerHTML = rows;
}

document.getElementById('startRun')?.addEventListener('click', async () => {
  try {
    // Show SweetAlert spinner modal while the run executes
    Swal.fire({
      title: 'Starting validation run',
      html: 'Please wait — validating providers...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const res = await fetch('/api/validation-runs', { method: 'POST' });
    const json = await res.json();

    // Close spinner
    Swal.close();

    if (!res.ok) {
      Swal.fire({ icon: 'error', title: 'Run failed', text: json?.error || 'Unknown error' });
      return;
    }

    // Refresh runs list after starting
    await loadRuns();

    Swal.fire({ icon: 'success', title: 'Validation run complete', text: `Run ID: ${json.runId || json.id || ''}` });
  } catch (err) {
    Swal.close();
    Swal.fire({ icon: 'error', title: 'Error', text: err?.message || String(err) });
  }
});

loadRuns();

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// handle clicking View Issues for a run using event delegation
document.addEventListener('click', async (ev) => {
  const btn = ev.target.closest('.viewRunIssues');
  if (!btn) return;
  const runId = btn.dataset.id;
  try {
    Swal.fire({ title: 'Loading issues...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
    const res = await fetch(`/api/validation-runs/${runId}/issues`);
    const json = await res.json();
    Swal.close();
    const issues = json.issues || [];
    if (issues.length === 0) {
      Swal.fire('No issues', 'No validation issues found for this run', 'info');
      return;
    }

    // build HTML table
    let html = '<table border="1" cellpadding="6" cellspacing="0" style="width:100%;text-align:left"><thead><tr><th>ID</th><th>Provider</th><th>Field</th><th>Old</th><th>Suggested</th><th>Confidence</th><th>Severity</th><th>Status</th></tr></thead><tbody>';
    for (const it of issues) {
      const providerName = (it.providers && it.providers.name) ? escapeHtml(it.providers.name) : '';
      html += `<tr><td>${escapeHtml(it.id)}</td><td>${providerName}</td><td>${escapeHtml(it.field_name)}</td><td>${escapeHtml(it.old_value)}</td><td>${escapeHtml(it.suggested_value)}</td><td>${escapeHtml(it.confidence)}</td><td>${escapeHtml(it.severity)}</td><td>${escapeHtml(it.status)}</td></tr>`;
    }
    html += '</tbody></table>';

    Swal.fire({ title: `Issues for run ${escapeHtml(String(runId))}`, html, width: '80%', confirmButtonText: 'Close' });
  } catch (err) {
    Swal.close();
    Swal.fire('Error', err?.message || String(err), 'error');
  }
});
