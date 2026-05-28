function showRowsByClass(clsName, id) {
  const table = document.getElementById('pubs');
  const rows = table.querySelectorAll('tr');
  var rowId = 0;

  rows.forEach((row, index) => {
    if (row.classList[0] == clsName) {
      row.classList.remove('hidden');
      if (rowId % 2 == 0) {
        row.style.backgroundColor = 'rgba(144, 144, 144, 0.075)';
      } else {
        row.style.backgroundColor = 'rgba(0, 0, 0, 0)';
      }
      rowId++;
    } else {
      row.classList.add('hidden');
    }
  });

  ['c1', 'c2', 'c3', 'c4'].forEach((c) => {
    if (id == c) document.getElementById(c).style.color = 'rgba(28, 155, 21, 1)';
    else document.getElementById(c).style.color = 'rgba(144, 144, 144, 0.75)';
  });
}

function showAllRows() {
  const table = document.getElementById('pubs');
  const rows = table.querySelectorAll('tr');
  var rowId = 0;

  rows.forEach((row, index) => {
    row.classList.remove('hidden');
    if (rowId % 2 == 0) {
      row.style.backgroundColor = 'rgba(144, 144, 144, 0.075)';
    } else {
      row.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    }
    rowId++;
  });

  ['c1', 'c2', 'c3', 'c4'].forEach((c) => {
    if (c == 'c4') document.getElementById(c).style.color = 'rgba(28, 155, 21, 1)';
    else document.getElementById(c).style.color = 'rgba(144, 144, 144, 0.75)';
  });
}
