import React, { useEffect, useState } from 'react';
import axios from 'axios';
import $ from 'jquery';

import Switch from 'react-switch';
import { AiOutlineCopy } from 'react-icons/ai';
import { RiComputerLine } from 'react-icons/ri';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './styles/base.css';
import './styles/index.css';
import './styles/prettydiff.css';
import './utils/block-navigation';
import './utils/sorter';
import * as funcs from './utils/functions';

let bas = localStorage.getItem('fetch-ip');

if (!bas) {
  // bas = '127.0.0.1';
  bas = window.location.hostname;
}

console.log(bas);

let base1r = 'http://' + bas + ':1990/coverage/lcov-report';
let base2r = 'http://' + bas + ':1991/coverage/lcov-report';
let base1 = 'http://' + bas + ':1991';
let base2 = 'http://' + bas + ':1990';

setTimeout(() => {
  let pdiv = document.getElementById('prettydiff');
  let sourceDiv = document.getElementById('helpy1');
  let diffDiv = document.getElementById('helpy2');

  let output = '';
  let prettydiff = require('prettydiff');
  let options = prettydiff.options;
  if (document.querySelector('#render1 pre.prettyprint')) {
    let pre1 = funcs.stripHtml(
      document.querySelector('#render1 pre.prettyprint').innerHTML
    );
    let pre2 = funcs.stripHtml(
      document.querySelector('#render2 pre.prettyprint').innerHTML
    );

    pre1 = '// parse-ignore-start' + pre1 + '// parse-ignore-end';
    pre2 = '// parse-ignore-start' + pre2 + '// parse-ignore-end';

    // '// parse-ignore-start' + sourceDiv.innerHTML + '// parse-ignore-end';

    options.source = pre2;
    options.diff = pre1;
    options.api = 'dom';
    options.language = 'auto';
    options.lexer = 'script';
    options.mode = 'diff';
    options.diff_format = 'html';
    options.color = 'white';
    // options.braces = false;
    options.unformatted = true;
    options.never_flatten = true;
    options.end_comma = true;
    options.indent_size = 2;
    options.wrap = 120;
    options.preserve = 1;

    output = prettydiff();
    pdiv.innerHTML = output;
    funcs.obscure('clipboard1');
    funcs.obscure('clipboard2');
    // funcs.obscure('prettydiff');
    // cycle through li and parse dom

    let data = document.querySelectorAll('#prettydiff .diff-right ol.data li');
    let count = document.querySelectorAll(
      '#prettydiff .diff-right ol.count li'
    );
    let newLines = [];
    data = Array.prototype.slice.call(data);
    count = Array.prototype.slice.call(count);
    let z = 0;
    for (const item of data) {
      if (item.classList.contains('insert')) {
        newLines.push(count[z].innerHTML);
      }
      z++;
    }

    // now we have which lines are new.
    // need to add a box around the matching new lines to show they're new.

    let newCount = document.querySelectorAll(
      '#render1 .coverage .line-count a'
    );
    newCount = Array.prototype.slice.call(newCount);

    let a = 0;
    for (const mem of newCount) {
      if (newLines.indexOf(mem.innerHTML) !== -1) {
        mem.classList.add('indicate-new');
      }
      a++;
    }
  }
}, 300);

const App = () => {
  let [branch1, setBranch1] = useState(null);
  let [branch2, setBranch2] = useState(null);
  let [showBoth, setShowBoth] = useState(false);
  axios
    .get(base1r + '/src/branch.html')
    .then((response) => setBranch1(response.data));
  axios
    .get(base2r + '/src/branch.html')
    .then((response) => setBranch2(response.data));

  const handleSwitch = () => {
    localStorage.setItem('showBoth', !showBoth);
    setShowBoth(!showBoth);
    funcs.getCorrespondingRow('src/components');
  };

  const notify = () =>
    toast('Copied!', {
      position: 'bottom-left',
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      type: 'success',
      theme: 'colored',
    });

  const comparePaths = () => {
    let path = window.location.pathname;
    let pth;
    if (path.includes('.js')) {
      pth = path.substring(0, path.length - 5);
    } else {
      pth = path.substring(0, path.length - 11);
    }

    let url1 = base1r + path;
    let url2 = base2r + path;
    let srcUrl = base1 + pth;
    let diffUrl = base2 + pth;
    axios.get(url1).then((response) => {
      let target1 = document.getElementById('render1');
      target1.innerHTML = response.data;
    });
    axios.get(url2).then((caribou) => {
      let target2 = document.getElementById('render2');
      target2.innerHTML = caribou.data;
    });
    axios.get(srcUrl).then((cent) => {
      let sourceDiv = document.getElementById('helpy1');
      sourceDiv.innerHTML = cent.data;
    });
    axios.get(diffUrl).then((deci) => {
      let diffDiv = document.getElementById('helpy2');
      diffDiv.innerHTML = deci.data;
    });

    funcs.obscure('helpy1');
    funcs.obscure('helpy2');

    setTimeout(() => {
      let grid1 = document.getElementById('render1').getElementsByTagName('td');
      let grid2 = document.getElementById('render2').getElementsByTagName('td');

      let newRows = funcs.getRows('render1');
      for (const i in newRows) {
        if (i === '0') {
          continue;
        }
        let key = funcs.getFirstCell(newRows[i]);
        key = key.dataset.value;
        let oldRow = funcs.getCorrespondingRow(key);
        if (!oldRow) {
          continue;
        }
        let oldCells = funcs.getCells(oldRow);
        let newCells = funcs.getCells(newRows[i]);
        for (const z in newCells) {
          if (
            funcs.parseValue(newCells[z].innerHTML) >
            funcs.parseValue(oldCells[z].innerHTML)
          ) {
            newCells[z].classList.add('coverage-increased');
            oldCells[z].classList.add('coverage-decreased');

            funcs.toolTipListeners(newCells[z]);
            funcs.toolTipListeners(oldCells[z]);

            funcs.setValueData(newCells[z], oldCells[z]);
          } else if (
            funcs.parseValue(newCells[z].innerHTML) <
            funcs.parseValue(oldCells[z].innerHTML)
          ) {
            newCells[z].classList.add('coverage-decreased');
            oldCells[z].classList.add('coverage-increased');

            funcs.toolTipListeners(newCells[z]);
            funcs.toolTipListeners(oldCells[z]);

            funcs.setValueData(newCells[z], oldCells[z]);
          }
        }
      }
    }, 500);
  };

  const filterListener = (e) => {
    let filt = document.getElementById('fileSearch');
    setTimeout(() => {
      if (filt.value.length > 0) {
        funcs.obscure('clipboard2');
      } else {
        funcs.reveal('clipboard2');
      }
    }, 20);
  };

  const promptIp = () => {
    let ip = prompt(
      'please specify IP address to fetch report.',
      window.location.hostname
    );
    if (ip === null) {
      return;
    } else {
      localStorage.setItem('fetch-ip', ip);
    }
  };

  useEffect(() => {
    comparePaths();
    let lc = localStorage.getItem('showBoth');
    setShowBoth(lc === 'true');

    setTimeout(() => {
      // put the clipboard in the right fucking place
      let clip1 = document.getElementById('clipboard1');
      let rct = document.getElementById('branch1').getBoundingClientRect();

      clip1.style.top = rct.top + window.scrollY + 'px';
      clip1.style.left = rct.right + window.scrollX + 5 + 'px';
      clip1.classList.remove('hidden');

      let clip2 = document.getElementById('clipboard2');
      let rct2 = document.getElementById('branch2').getBoundingClientRect();
      clip2.style.top = rct2.top + window.scrollY + 'px';
      clip2.style.left = rct2.right + window.scrollX + 5 + 'px';
      clip2.classList.remove('hidden');

      if (document.getElementById('fileSearch')) {
        let filt = document.getElementById('fileSearch');
        filt.addEventListener('keydown', filterListener);
      }
    }, 666);
  }, []);

  useEffect(() => {
    if (showBoth) {
      funcs.reveal('render2');
    } else {
      funcs.obscure('render2');
    }
  }, [showBoth]);

  useEffect(() => {
    setTimeout(() => {
      if (document.querySelector('.pad1 h1')) {
        const node = document.createElement('span');
        if (branch1) {
          const textnode = document.createTextNode('>> ' + branch1);
          node.appendChild(textnode);
          node.id = 'branch1';
          node.className = 'branch-name';
          if (node.innerHTML !== '>> ') {
            document.querySelectorAll('.pad1 h1')[0].after(node);
          }
        }

        if (branch2) {
          const node1 = document.createElement('span');
          const textnode1 = document.createTextNode('>> ' + branch2);
          node1.appendChild(textnode1);
          node1.id = 'branch2';
          node1.className = 'branch-name';
          if (node1.innerHTML !== '>> ') {
            document.querySelectorAll('.pad1 h1')[1].after(node1);
          }
        }

        // move header elements into fixed header
        let hdr = document.querySelector('.pad1 h1');
        let top = document.querySelector('#dynamic-header');
        let hdr2 = hdr.cloneNode(true);
        if (top.innerHTML === '') {
          top.appendChild(hdr2);
          top.className = 'pad3';
        }
      }
    }, 200);
    setTimeout(() => {
      if (document.querySelector('.diff-left')) {
        // rename the report comparison
        let title1 = document.querySelector('.diff-left h3.texttitle');
        let title2 = document.querySelector('.diff-right h3.texttitle');
        title1.innerHTML = branch2;
        title2.innerHTML = branch1;
      }
    }, 300);
  }, [branch1, branch2]);

  return (
    <div className="App">
      <div className="topBanner">
        <h1>
          {branch1} <span>&gt;&gt;</span> {branch2}
        </h1>
        <div className="buttons-container">
          <span id="computer" onClick={promptIp}>
            <RiComputerLine />
          </span>
          <div onClick={handleSwitch} className="switch-container">
            <span>show both grids</span>
            <Switch onChange={funcs.doNothing} checked={showBoth} />
          </div>
        </div>
        <div id="dynamic-header"></div>
      </div>
      <CopyToClipboard text={branch1} onCopy={() => notify()}>
        <button className="clipboard hidden" id="clipboard1">
          <AiOutlineCopy />
        </button>
      </CopyToClipboard>
      <div id="render-container">
        <div id="render1"></div>
        <div id="render2"></div>
        <div id="prettydiff" className="white prettydiff-addition"></div>
      </div>
      <CopyToClipboard text={branch2} onCopy={() => notify()}>
        <button
          className="clipboard hidden"
          id="clipboard2"
          style={showBoth ? {} : { opacity: 0 }}
        >
          <AiOutlineCopy />
        </button>
      </CopyToClipboard>
      <ToastContainer />
      <span id="tooltip" className="obscure">
        <span id="tooltip-symbol"></span>
        <span id="tooltip-message"></span>
        <span id="tooltip-old-value"></span>
        <span id="tooltip-message-2"></span>
        <span id="tooltip-new-value"></span>
      </span>
      <span id="tooltip-tail" className="obscure"></span>
      <div id="helpy1"></div>
      <div id="helpy2"></div>
    </div>
  );
};

export default App;
