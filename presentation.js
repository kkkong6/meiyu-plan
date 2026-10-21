(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.slide')];
  const stage = document.getElementById('stage');
  const $ = id => document.getElementById(id);
  const gallery = [
    ['assets/image1.png', '原文：Code Arena WebDev 榜单截图，2026.10.08', '榜单截图'],
    ['assets/image2.jpeg', '原文：厂商去重排名', '厂商排名'],
    ['assets/image3.jpeg', '原文：See → Judge → Build → Refine 能力链路', '能力链路'],
    ['框架图.png', '总体建设框架 · 提供的原图', '建设框架'],
    ['assets/image5.jpeg', '原文：GA 版本改进流程', 'GA 流程'],
    ['对比图 step.png', 'Step · 对比截图 1', 'Step 截图 1'],
    ['对比图 gpt.png', 'GPT · 对比截图 1', 'GPT 截图 1'],
    ['对比图2 step.png', 'Step · 对比截图 2', 'Step 截图 2'],
    ['对比图2 gpt.png', 'GPT · 对比截图 2', 'GPT 截图 2']
  ];
  let current = 0;
  let toastTimer;
  const outlineGroups = [
    {title:'背景与目标',start:0,end:4},
    {title:'阶段进展',start:5,end:6},
    {title:'总体框架',start:7,end:7},
    {title:'短期执行',start:8,end:10},
    {title:'长期建设',start:11,end:17},
    {title:'进展与总结',start:18,end:19}
  ];

  function fit() {
    const fullscreen = Boolean(document.fullscreenElement);
    const sideMargin = fullscreen ? 0 : 8;
    const availableWidth = window.innerWidth - sideMargin * 2;
    const chromeHeight = 76;
    const availableHeight = window.innerHeight - chromeHeight - 16;
    const scale = Math.max(.1, Math.min(availableWidth / 1600, availableHeight / 900));
    stage.style.setProperty('--scale', scale);
    stage.style.setProperty('--stage-left', `${Math.max(0, (window.innerWidth - 1600 * scale) / 2)}px`);
    stage.style.setProperty('--stage-top', `${Math.max(0, (window.innerHeight - chromeHeight - 900 * scale) / 2)}px`);
  }

  function fromHash() {
    const match = /^#(\d+)$/.exec(location.hash);
    return match ? Math.min(slides.length - 1, Math.max(0, Number(match[1]) - 1)) : 0;
  }

  function render(index, updateHash = true) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => {
      slide.hidden = i !== current;
      slide.classList.toggle('active', i === current);
      if (i !== current) slide.querySelectorAll('video').forEach(video => video.pause());
    });
    const slide = slides[current];
    $('pageCount').textContent = `${String(current + 1).padStart(2, '0')} / ${slides.length}`;
    $('progressFill').style.width = `${((current + 1) / slides.length) * 100}%`;
    $('previousButton').disabled = current === 0;
    $('nextButton').disabled = current === slides.length - 1;
    document.querySelectorAll('[data-slide-index]').forEach(button => {
      const selected = Number(button.dataset.slideIndex) === current;
      button.classList.toggle('current', selected);
      if (selected) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    document.querySelectorAll('#chapterNavigation button').forEach(button => {
      const active = current >= Number(button.dataset.start) && current <= Number(button.dataset.end);
      button.classList.toggle('active-chapter', active);
      if (active) {
        button.setAttribute('aria-current','step');
        const nav = $('chapterNavigation');
        nav.scrollLeft = Math.max(0, button.offsetLeft - nav.offsetLeft - (nav.clientWidth - button.offsetWidth)/2);
      } else button.removeAttribute('aria-current');
    });
    if (updateHash && location.hash !== `#${current + 1}`) history.replaceState(null, '', `#${current + 1}`);
    document.title = `${current + 1}. ${slide.dataset.title} · 美育计划 2.0`;
    window.scrollTo(0, 0);
  }

  function notify(message) {
    clearTimeout(toastTimer);
    $('toast').textContent = message;
    $('toast').hidden = false;
    toastTimer = setTimeout(() => { $('toast').hidden = true; }, 3500);
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else notify('请使用浏览器菜单进入全屏。');
    } catch { notify('请使用浏览器菜单进入全屏。'); }
  }

  function showImage(path, caption) {
    $('sourceImage').src = path;
    $('sourceImage').alt = caption;
    $('imageCaption').textContent = caption;
    document.querySelectorAll('[data-gallery-path]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.galleryPath === path));
    });
    if (!$('imageDialog').open) $('imageDialog').showModal();
    document.querySelector('.image-scroll').scrollTop = 0;
  }

  $('contentsList').style.setProperty('--contents-rows', Math.ceil(slides.length / 2));
  outlineGroups.forEach(group => {
    const button = document.createElement('button');
    button.dataset.start = group.start;
    button.dataset.end = group.end;
    button.textContent = group.title;
    button.title = `第 ${group.start+1}${group.end!==group.start ? '–'+(group.end+1) : ''} 页`;
    button.addEventListener('click',()=>render(group.start));
    $('chapterNavigation').append(button);
  });
  slides.forEach((slide, index) => {
    const button = document.createElement('button');
    button.dataset.slideIndex = index;
    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');
    button.append(number, document.createTextNode(slide.dataset.title));
    button.addEventListener('click', () => { $('contentsDialog').close(); render(index); });
    $('contentsList').append(button);
  });

  gallery.forEach(([path, caption, label]) => {
    const button = document.createElement('button');
    button.dataset.galleryPath = path;
    button.textContent = label;
    button.addEventListener('click', () => showImage(path, caption));
    $('imageTabs').append(button);
  });

  document.querySelectorAll('[data-image]').forEach(button => {
    button.addEventListener('click', () => showImage(button.dataset.image, button.dataset.caption));
  });
  document.querySelectorAll('[data-close-dialog]').forEach(button => {
    button.addEventListener('click', () => button.closest('dialog').close());
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
  });

  $('previousButton').addEventListener('click', () => render(current - 1));
  function showShowcaseMode(panelId) {
    document.querySelectorAll('.showcase-switch button').forEach(button => {
      const selected = button.getAttribute('aria-controls') === panelId;
      button.setAttribute('aria-pressed', String(selected));
      $(button.getAttribute('aria-controls')).hidden = !selected;
    });
    if (panelId !== 'showcaseVideoPanel') $('showcase').pause();
  }
  document.querySelectorAll('.showcase-switch button').forEach(button => {
    button.addEventListener('click', () => showShowcaseMode(button.getAttribute('aria-controls')));
  });
  $('nextButton').addEventListener('click', () => render(current + 1));
  $('contentsButton').addEventListener('click', () => $('contentsDialog').showModal());
  $('fullscreenButton').addEventListener('click', toggleFullscreen);
  $('showcase').addEventListener('error', () => notify('此浏览器无法解码 MOV，请点击“单独打开视频”。'));
  document.addEventListener('fullscreenchange', () => {
    $('fullscreenButton').innerHTML = `${document.fullscreenElement ? '退出全屏' : '全屏'} <kbd>F</kbd>`;
    fit();
  });

  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input, textarea, select, [contenteditable="true"], video')) return;
    if (document.querySelector('dialog[open]')) return;
    const key = event.key.toLowerCase();
    const focusedControl = event.target.closest('button, a');
    if (key === ' ' && focusedControl) return;
    const actions = {
      arrowright: () => render(current + 1), pagedown: () => render(current + 1), ' ': () => render(current + 1),
      arrowleft: () => render(current - 1), pageup: () => render(current - 1),
      home: () => render(0), end: () => render(slides.length - 1),
      m: () => $('contentsDialog').showModal(), f: toggleFullscreen
    };
    if (actions[key]) { event.preventDefault(); actions[key](); }
  });

  let touchStart;
  stage.addEventListener('touchstart', event => {
    if (event.target.closest('video, button, a') || event.touches.length !== 1) { touchStart = null; return; }
    touchStart = {x: event.touches[0].clientX, y: event.touches[0].clientY};
  }, {passive: true});
  stage.addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 85 && Math.abs(dx) > Math.abs(dy) * 2) render(current + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, {passive: true});
  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', () => render(fromHash(), false));
  fit();
  render(fromHash());
})();
