export const doNothing = () => {
  // do nothing
};

export const reduceFraction = (val) => {
  const numerator = val.substr(0, val.indexOf('/'));
  const denominator = val.substr(val.indexOf('/') + 1, 10);
  return numerator / denominator;
};

export const parseValue = (val) => {
  // strip out the % sign
  val = val.replace(/% ?/g, '');
  // if is fraction, then parse
  if (val.includes('/')) {
    val = reduceFraction(val);
  }
  val = parseInt(val * 1000);
  val = val / 1000;
  return val;
};

export const getCorrespondingRow = (val) => {
  let rows = getRows('render2');
  for (const i in rows) {
    if (i === '0') {
      continue;
    }
    let firstCell = getFirstCell(rows[i]);
    let value = firstCell.dataset.value;
    if (value === val) {
      return rows[i];
    }
  }
};

export const getRows = (id) => {
  let grid = document.getElementById(id);
  let rows = grid.getElementsByTagName('tr');
  rows = Array.prototype.slice.call(rows);
  return rows;
};

export const getFirstCell = (row) => {
  if (row.querySelector('td')) {
    return row.querySelector('td');
  } else {
    return;
  }
};

export const getCells = (row) => {
  let cells = row.querySelectorAll('td');
  cells = Array.prototype.slice.call(cells);
  return cells;
};

export const toolTipListeners = (element) => {
  element.addEventListener('mouseenter', () => showToolTip(element));
  element.addEventListener('mouseleave', hideToolTip);
};

export const setValueData = (newcell, oldcell) => {
  let newvalue = newcell.innerHTML;
  let oldvalue = oldcell.innerHTML;
  newcell.dataset.newValue = newvalue;
  newcell.dataset.oldValue = oldvalue;
  oldcell.dataset.newValue = newvalue;
  oldcell.dataset.oldValue = oldvalue;
  newcell.dataset.isNew = true;
  oldcell.dataset.isNew = false;
};

export const showToolTip = (element) => {
  let tooltip = document.getElementById('tooltip');
  let tooltipTail = document.getElementById('tooltip-tail');
  let tooltipSymbol = tooltip.querySelector('#tooltip-symbol');
  let tooltipMessage = tooltip.querySelector('#tooltip-message');
  let tooltipOldValue = tooltip.querySelector('#tooltip-old-value');
  let tooltipMessage2 = tooltip.querySelector('#tooltip-message-2');
  let tooltipNewValue = tooltip.querySelector('#tooltip-new-value');
  let rect = element.getBoundingClientRect();

  reveal('tooltip');
  reveal('tooltip-tail');

  tooltipOldValue.innerHTML = element.dataset.oldValue;
  tooltipNewValue.innerHTML = element.dataset.newValue;

  if (element.classList.contains('coverage-increased')) {
    if (element.dataset.isNew === 'true') {
      tooltipSymbol.innerHTML = '&uarr;';
      tooltipSymbol.style.color = 'green';
      tooltipMessage.innerHTML = 'coverage increased from ';
    } else if (element.dataset.isNew === 'false') {
      tooltipSymbol.innerHTML = '&darr;';
      tooltipSymbol.style.color = 'red';
      tooltipMessage.innerHTML = 'coverage decreased from ';
    }
    tooltipMessage2.innerHTML = ' to ';
  } else if (element.classList.contains('coverage-decreased')) {
    if (element.dataset.isNew === 'true') {
      tooltipSymbol.innerHTML = '&darr;';
      tooltipSymbol.style.color = 'red';
      tooltipMessage.innerHTML = 'coverage decreased from ';
    } else if (element.dataset.isNew === 'false') {
      tooltipSymbol.innerHTML = '&uarr;';
      tooltipSymbol.style.color = 'green';
      tooltipMessage.innerHTML = 'coverage increased from ';
    }
    tooltipMessage2.innerHTML = ' to ';
  }

  tooltip.style.top = rect.top + window.scrollY - 35 + 'px';
  tooltipTail.style.top = rect.top + window.scrollY - 5 + 'px';
  let cellMiddle =
    rect.left + window.scrollX + (rect.right - rect.left) / 2 - 9;
  tooltipTail.style.left = cellMiddle + 'px';
  // if the width of the window minus the left is smaller than width of the tooltip
  if (visualViewport.width - rect.left < tooltip.clientWidth) {
    if (visualViewport.width - rect.left + 150 - tooltip.clientWidth > 0) {
      tooltip.style.right =
        visualViewport.width - window.scrollX - rect.right - 100 + 'px';
    } else {
      tooltip.style.right =
        visualViewport.width - window.scrollX - rect.right + 'px';
    }
    tooltip.style.left = '';
  } else {
    tooltip.style.left = rect.left + 'px';
    tooltip.style.right = '';
  }
  // place tooltip on screen using dimensions given
};

export const hideToolTip = () => {
  obscure('tooltip');
  obscure('tooltip-tail');
};

export const reveal = (id) => {
  let ele = document.getElementById(id);
  ele.classList.remove('obscure');
};

export const obscure = (id) => {
  let ele = document.getElementById(id);
  ele.classList.add('obscure');
};

export const stripHtml = (html) => {
  let tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};
