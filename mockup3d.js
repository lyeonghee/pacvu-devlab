(function () {
  'use strict';

  const legacyButtonIds = ['m0013dBtn', 'm0023dBtn', 'm0033dBtn', 't001-3d-btn', 't003-3d-btn', 't004-3d-btn', 't005-3d-btn', 'ga001-3d-btn', 'b001-3d-btn', 'b002-3d-btn', 'c001-3d-btn', 'r001-3d-btn', 'r002-3d-btn', 'r003-3d-btn', 'r004-3d-btn', 'tr001-3d-btn', 'tr002-3d-btn', 'tr003-3d-btn', 's001-3d-btn'];
  const mockupButtonByEngine = {
    gbox: 'm0013dBtn',
    gbox2: 'm0023dBtn',
    gbox3: 'm0033dBtn',
    bbox: 't001-3d-btn',
    bbox2: 't002-3d-btn',
    bbox3: 't003-3d-btn',
    bbox4: 't004-3d-btn',
    bbox5: 't005-3d-btn',
    gable1: 'ga001-3d-btn',
    b001: 'b001-3d-btn',
    b002: 'b002-3d-btn',
    c001: 'c001-3d-btn',
    rbox: 'r001-3d-btn',
    rbox2: 'r002-3d-btn',
    rbox3: 'r003-3d-btn',
    rbox4: 'r004-3d-btn',
    tr001: 'tr001-3d-btn',
    tr002: 'tr002-3d-btn',
    tr003: 'tr003-3d-btn',
    sSeries: 's001-3d-btn',
  };
  const mockupPlannedEngines = new Set(['rbox', 'rbox2', 'rbox3', 'rbox4']);

  function getSelectedEngineKey() {
    return typeof selectedBoxMeta !== 'undefined'
      ? selectedBoxMeta.engineKey
      : null;
  }

  function syncMockupButton() {
    const button = document.getElementById('mockup3dBtn');
    if (!button) return;
    const engineKey = getSelectedEngineKey();
    const isReady = Boolean(mockupButtonByEngine[engineKey]);
    const isPlanned = mockupPlannedEngines.has(engineKey);
    button.hidden = !(isReady || isPlanned);
    button.style.display = isReady || isPlanned ? '' : 'none';
    button.textContent = '3D MOCKUP viewer';
    button.classList.toggle('is-preparing', !isReady);
    button.disabled = !isReady;
    button.setAttribute('aria-disabled', String(!isReady));
    const infoButton = document.getElementById('pacvuInfoMockup3dBtn');
    if (infoButton) {
      infoButton.hidden = false;
      infoButton.textContent = button.textContent;
      infoButton.classList.toggle('is-preparing', !isReady);
      infoButton.disabled = !isReady;
      infoButton.setAttribute('aria-disabled', String(!isReady));
    }
    button.title = isReady
      ? '3D Mockup Viewer를 엽니다.'
      : (engineKey && engineKey.startsWith('tr')
        ? 'Tray Box 3D Mockup Viewer는 다음 작업에서 연결됩니다.'
        : '3D Mockup Viewer는 준비 중입니다.');
  }

  function installMockupButton() {
    const toolbar = document.querySelector('.toolbar');
    if (!toolbar || document.getElementById('mockup3dBtn')) return;

    const style = document.createElement('style');
    style.textContent = legacyButtonIds
      .map((id) => `#${id}`)
      .join(',') + '{display:none!important;}';
    document.head.appendChild(style);

    legacyButtonIds.forEach((id) => {
      const button = document.getElementById(id);
      if (!button) return;
      button.setAttribute('aria-hidden', 'true');
      button.tabIndex = -1;
    });

    const button = document.createElement('button');
    button.id = 'mockup3dBtn';
    button.type = 'button';
    button.className = 'btn m001-3d-button';
    button.textContent = '3D MOCKUP viewer';
    button.addEventListener('click', () => {
      const engineKey = getSelectedEngineKey();
      const targetId = mockupButtonByEngine[engineKey];
      const targetButton = targetId && document.getElementById(targetId);

      if (!targetButton) return;

      targetButton.click();
    });

    toolbar.appendChild(button);
    syncMockupButton();

    ['boxCategory', 'boxType'].forEach((id) => {
      document.getElementById(id)?.addEventListener('change', () => {
        window.setTimeout(syncMockupButton, 0);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installMockupButton);
  } else {
    installMockupButton();
  }
  window.PacVuSyncMockupButtons = syncMockupButton;
})();
