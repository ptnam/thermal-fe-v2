<script setup>
const emit = defineEmits(['close'])
const  changeGrid = (cells, btn) =>{
  // Update active state in toolbar
  document.querySelectorAll('.grid-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.grid-btn').forEach(b => { if (b.textContent == cells) b.classList.add('active'); });

  // Update active state in drawer
  document.querySelectorAll('.layout-option').forEach(opt => opt.classList.remove('active'));
  if (btn && btn.classList.contains('layout-option')) btn.classList.add('active');

  // Apply grid
  const grid = document.getElementById('mainCamGrid');
  const cols = Math.sqrt(cells);
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.style.alignContent = 'start';
}
</script>
<template>
  <div class="drawer drawer-md" id="settingsDrawer">
    <div class="drawer-header">
      <h3>Thiết lập hiển thị</h3>
      <button class="close-drawer" @click="()=>emit('emit')">×</button>
    </div>
    <div class="drawer-body">
      <div class="settings-section">
        <div class="settings-title">KHU VỰC</div>
        <div class="settings-tree">
          <div class="st-item"><label class="st-label"><input type="checkbox" checked=""><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 7l-7 5 7 5V7z"></path>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg><span>Camera cột 149</span></label></div>
          <div class="st-item"><label class="st-label"><input type="checkbox" checked=""><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 7l-7 5 7 5V7z"></path>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg><span>Camera cột 145</span></label></div>
          <div class="st-group">
            <div class="st-item">
              <label class="st-label">
                <input type="checkbox" checked="">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z">
                  </path>
                </svg>
                <span>Công ty</span>
              </label>
            </div>
            <div class="st-children" style="padding-left: 20px; display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
              <div class="st-item"><label class="st-label"><input type="checkbox" checked=""><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 7l-7 5 7 5V7z"></path>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg><span>Dome - Nhiệt - Cty</span></label></div>
              <div class="st-item"><label class="st-label"><input type="checkbox" checked=""><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 7l-7 5 7 5V7z"></path>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg><span>Dome - Thường - Cty</span></label></div>
            </div>
          </div>
          <div class="st-group" style="margin-top: 8px;">
            <div class="st-item">
              <label class="st-label">
                <input type="checkbox" checked="">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z">
                  </path>
                </svg>
                <span>Phú Quốc</span>
              </label>
            </div>
            <div class="st-children">
              <div class="st-group">
                <div class="st-item">
                  <label class="st-label">
                    <input type="checkbox" checked="">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                      <line x1="12" y1="18" x2="12.01" y2="18"></line>
                    </svg>
                    <span>Trạm 110kV Nam Phú Quốc</span>
                  </label>
                </div>
                <div class="st-children" style="padding-left: 20px; display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
                  <div class="st-item"><label class="st-label"><input type="checkbox" checked=""><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 7l-7 5 7 5V7z"></path>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg><span>Cam thường cố định</span></label></div>
                  <div class="st-item"><label class="st-label"><input type="checkbox" checked=""><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 7l-7 5 7 5V7z"></path>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg><span>Cam nhiệt cố định</span></label></div>
                  <div class="st-item"><label class="st-label"><input type="checkbox" checked=""><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 7l-7 5 7 5V7z"></path>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg><span>Cam thường quay quét</span></label></div>
                  <div class="st-item"><label class="st-label"><input type="checkbox" checked=""><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 7l-7 5 7 5V7z"></path>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg><span>Cam nhiệt quay quét</span></label></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr class="drawer-divider">
      <div class="settings-section">
        <div class="settings-title">KIỂU BỐ CỤC</div>
        <div class="layout-picker">
          <div class="layout-option" @click="()=>changeGrid(1, this)">
            <div class="grid-icon" style="width:24px; height:18px; border:1.5px solid currentColor; border-radius:3px; opacity:0.6;">
            </div>
          </div>
          <div class="layout-option" @click="()=>changeGrid(2, this)">
            <div class="grid-icon" style="display:flex; gap:3px;">
              <div style="width:11px; height:18px; border:1.5px solid currentColor; border-radius:2px; opacity:0.6;">
              </div>
              <div style="width:11px; height:18px; border:1.5px solid currentColor; border-radius:2px; opacity:0.6;">
              </div>
            </div>
          </div>
          <div class="layout-option" @click="()=>changeGrid(4, this)">
            <div class="grid-icon" style="display:grid; grid-template-columns:1fr 1fr; gap:3px;">
              <div style="width:11px; height:8px; border:1.5px solid currentColor; border-radius:2px;">
              </div>
              <div style="width:11px; height:8px; border:1.5px solid currentColor; border-radius:2px;">
              </div>
              <div style="width:11px; height:8px; border:1.5px solid currentColor; border-radius:2px;">
              </div>
              <div style="width:11px; height:8px; border:1.5px solid currentColor; border-radius:2px;">
              </div>
            </div>
          </div>
          <div class="layout-option active" @click="()=>changeGrid(9, this)">
            <div class="grid-icon" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:2px;">
              <div style="width:7px; height:5px; border:1px solid currentColor; border-radius:1px; opacity:0.6;">
              </div>
              <div style="width:7px; height:5px; border:1px solid currentColor; border-radius:1px; opacity:0.6;">
              </div>
              <div style="width:7px; height:5px; border:1px solid currentColor; border-radius:1px; opacity:0.6;">
              </div>
              <div style="width:7px; height:5px; border:1px solid currentColor; border-radius:1px; opacity:0.6;">
              </div>
              <div style="width:7px; height:5px; border:1px solid currentColor; border-radius:1px; opacity:0.6;">
              </div>
              <div style="width:7px; height:5px; border:1px solid currentColor; border-radius:1px; opacity:0.6;">
              </div>
              <div style="width:7px; height:5px; border:1px solid currentColor; border-radius:1px; opacity:0.6;">
              </div>
              <div style="width:7px; height:5px; border:1px solid currentColor; border-radius:1px; opacity:0.6;">
              </div>
              <div style="width:7px; height:5px; border:1px solid currentColor; border-radius:1px; opacity:0.6;">
              </div>
            </div>
          </div>
        </div>

        <div class="settings-title" style="margin-top: 30px;">THỨ TỰ CAMERA (KÉO ĐỂ ĐỔI)</div>
        <div class="cam-order-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="cam-order-item" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 10px; font-size: 13px; cursor: grab; transition: 0.2s; border: 1px solid var(--border);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 7l-7 5 7 5V7z"></path>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg><span>Cam nhiệt cố định</span>
          </div>
          <div class="cam-order-item" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 10px; font-size: 13px; cursor: grab; transition: 0.2s; border: 1px solid var(--border);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 7l-7 5 7 5V7z"></path>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg><span>Cam nhiệt quay quét</span>
          </div>
          <div class="cam-order-item" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 10px; font-size: 13px; cursor: grab; transition: 0.2s; border: 1px solid var(--border);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 7l-7 5 7 5V7z"></path>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg><span>Cam thường cố định</span>
          </div>
          <div class="cam-order-item" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 10px; font-size: 13px; cursor: grab; transition: 0.2s; border: 1px solid var(--border);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 7l-7 5 7 5V7z"></path>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg><span>Cam thường quay quét</span>
          </div>
        </div>
      </div>
    </div>
    <div class="drawer-footer" style="padding: 20px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px;">
      <button class="btn-cancel" @click="()=>emit('close')" style="padding: 10px 24px; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--text-sub); cursor: pointer; font-weight: 600;">Hủy</button>
      <button class="btn-save"
              onclick="applySettings()" style="padding: 10px 24px; border-radius: 8px; border: none; background: var(--primary); color: white; cursor: pointer; font-weight: 700;">Lưu
        thiết lập</button>
    </div>
  </div>
</template>
<style scoped>
.settings-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-sub);
  margin-bottom: 12px;
  text-transform: uppercase;
}

.st-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-main);
}

.st-label input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--primary);
}

.st-label svg {
  color: var(--text-sub);
}

.layout-option {
  width: 60px;
  height: 44px;
  border: 1px solid var(--border);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
  color: var(--text-sub);
}

.layout-option.active {
  border-color: var(--primary);
  background: rgba(37, 99, 235, 0.1);
  color: var(--primary);
}
</style>