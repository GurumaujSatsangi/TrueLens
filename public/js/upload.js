document.getElementById('uploadForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const file = form.querySelector('input[type=file]').files[0];
  if (!file) return alert('Select a CSV file');

  const fd = new FormData();
  fd.append('file', file);

  const res = await fetch('/api/upload/providers', { method: 'POST', body: fd });
  const json = await res.json();
  document.getElementById('uploadResult').innerText = JSON.stringify(json);
});
