document.addEventListener('DOMContentLoaded', () => {
  const journalLog = document.getElementById('journal-log');
  const journalInput = document.getElementById('journal-input');
  const addEntryBtn = document.getElementById('add-entry-btn');
  const clearBtn = document.getElementById('clear-entries-btn');

  function loadJournalEntries() {
    const savedEntries = JSON.parse(localStorage.getItem('journalEntries')) || [];
    savedEntries.forEach(entry => {
      const entryDiv = document.createElement('div');
      entryDiv.classList.add('journal-entry');
      entryDiv.innerHTML = `<strong>${entry.timestamp}</strong><br>${entry.text}`;
      journalLog.appendChild(entryDiv);
    });
    journalLog.scrollTop = journalLog.scrollHeight;
  }

  function addJournalEntry() {
    const text = journalInput.value.trim();
    if (text === '') return alert('Please write something before adding!');

    const timestamp = new Date().toLocaleString();
    const entry = { timestamp, text };

    const entryDiv = document.createElement('div');
    entryDiv.classList.add('journal-entry');
    entryDiv.innerHTML = `<strong>${timestamp}</strong><br>${text}`;
    journalLog.appendChild(entryDiv);

    const currentEntries = JSON.parse(localStorage.getItem('journalEntries')) || [];
    currentEntries.push(entry);
    localStorage.setItem('journalEntries', JSON.stringify(currentEntries));

    journalInput.value = '';
    journalLog.scrollTop = journalLog.scrollHeight;
  }

  function clearJournalEntries() {
    localStorage.removeItem('journalEntries');
    journalLog.innerHTML = '';
  }

  loadJournalEntries();
  addEntryBtn.addEventListener('click', addJournalEntry);
  journalInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      addJournalEntry();
    }
  });
  clearBtn.addEventListener('click', clearJournalEntries);
});
