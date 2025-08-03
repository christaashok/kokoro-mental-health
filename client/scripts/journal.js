document.addEventListener('DOMContentLoaded', () => {
  const journalLog = document.getElementById('journal-log');
  const journalInput = document.getElementById('journal-input');
  const addEntryBtn = document.getElementById('add-entry-btn');

  addEntryBtn.addEventListener('click', () => {
    const text = journalInput.value.trim();

    if (text === '') {
      alert('Please write something before adding!');
      return;
    }

    const entry = document.createElement('div');
    entry.classList.add('journal-entry');

    // Add timestamp and text
    const timestamp = new Date().toLocaleString();
    entry.innerHTML = `<strong>${timestamp}</strong><br>${text}`;

    journalLog.appendChild(entry);
    journalInput.value = '';
    journalLog.scrollTop = journalLog.scrollHeight;
  });
});
