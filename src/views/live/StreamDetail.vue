<template>
  <header class="live-header">
    <div style="display:flex; align-items:center; gap:15px">
      <a href="giamsattructiep.html" class="v-btn" title="Thu nhỏ / Quay lại" style="text-decoration:none; background:rgba(255,255,255,0.05)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"></path>
        </svg>
      </a>
      <div class="cam-title">
        <svg width="20" height="20" viewBox="0 0 24 24" style="color:var(--primary)">
          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"></path>
        </svg>
        <div>
          <div style="line-height:1.2">CAM149</div>
          <div style="font-size:11px; color:var(--text-sub); font-weight:400">Trạm 110kV Nam Phú Quốc • Khu
            vực MBA T2</div>
        </div>
      </div>
    </div>
    <div style="display:flex; gap:15px; align-items:center">
      <div class="live-badge">LIVE FEED</div>
      <div style="font-family:'JetBrains Mono'; font-size:13px; color:#94A3B8">2026-01-28 09:58:39</div>
    </div>
  </header>
  <div class="live-container">

    <div class="video-wrapper">
      <img src="./images/cam-live.png" class="video-feed">

      <div class="hud-box alert" style="top: 35%; left: 42%; width: 90px; height: 140px;">
        <div class="hud-label">
          <span>MBA T2 (Sứ A)</span>
          <span class="hud-val">58.2°C</span>
        </div>
      </div>
      <div class="hud-box" style="top: 30%; left: 68%; width: 50px; height: 70px;">
        <div class="hud-label">
          <span>Sứ B</span>
          <span class="hud-val">42.5°C</span>
        </div>
      </div>

    </div>

    <div class="sidebar">

      <div class="ptz-section">
        <div class="ptz-wrapper">
          <div class="ptz-ring"></div>
          <button class="ptz-btn ptz-up"><svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path>
          </svg></button>
          <button class="ptz-btn ptz-down"><svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"></path>
          </svg></button>
          <button class="ptz-btn ptz-left"><svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"></path>
          </svg></button>
          <button class="ptz-btn ptz-right"><svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"></path>
          </svg></button>
          <button class="ptz-center">RESET</button>
        </div>

        <div class="slider-group">
          <div style="font-size:12px; color:var(--text-sub); width:60px; font-weight:600">Tốc độ</div>
          <span style="font-size:12px; color:var(--text-sub)">1</span>
          <input type="range" min="1" max="5" value="3" class="custom-slider">
          <span style="font-size:12px; color:var(--text-sub)">5</span>
          <span style="font-size:13px; color:var(--primary); width:20px; text-align:right; font-weight:700">3</span>
        </div>

        <div class="slider-group" style="margin-top:10px">
          <div style="font-size:12px; color:var(--text-sub); width:60px; font-weight:600">Zoom</div>
          <div style="display:flex; gap:10px; flex:1">
            <button class="v-btn" style="background:#334155; flex:1; height:40px" title="Phóng to">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            <button class="v-btn" style="background:#334155; flex:1; height:40px" title="Thu nhỏ">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Measure Temp Section -->
        <div style="margin-top:20px; padding-top:20px; border-top:1px solid var(--border); width:100%">
          <div style="font-size:11px; font-weight:700; color:var(--text-sub); margin-bottom:12px; text-transform:uppercase;">
            ĐO NHIỆT ĐỘ</div>

          <!-- Start Button -->
          <div id="measure-start-btn" style="display: none;">
            <button class="v-btn action-btn-primary" onclick="toggleMeasureMode(true)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon>
                <line x1="3" y1="22" x2="21" y2="22"></line>
              </svg>
              Vẽ điểm/vùng
            </button>
          </div>

          <style>
            /* Action Buttons Modern Style */
            .action-btn-primary,
            .action-btn-danger,
            .action-btn-secondary {
              width: 100%;
              height: 44px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
              border-radius: 8px;
              /* Slightly more rounded */
              font-weight: 600;
              font-size: 13px;
              transition: all 0.2s ease;
              text-transform: capitalize;
              letter-spacing: 0.3px;
            }

            .action-btn-primary {
              background: rgba(59, 130, 246, 0.1);
              border: 1px solid rgba(59, 130, 246, 0.4);
              color: var(--primary);
            }

            .action-btn-primary:hover {
              background: rgba(59, 130, 246, 0.2);
              border-color: var(--primary);
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
            }

            .action-btn-danger {
              background: var(--danger);
              color: white;
              border: 1px solid var(--danger);
              box-shadow: 0 4px 6px rgba(239, 68, 68, 0.25);
            }

            .action-btn-danger:hover {
              background: #DC2626;
              /* Darker red */
              transform: translateY(-1px);
              box-shadow: 0 6px 12px rgba(239, 68, 68, 0.35);
            }

            .action-btn-secondary {
              background: #334155;
              border: 1px solid var(--border);
              color: white;
            }

            .action-btn-secondary:hover {
              background: #475569;
              border-color: #94a3b8;
              transform: translateY(-1px);
            }
          </style>

          <!-- Active Actions (Hidden by default) -->
          <div id="measure-actions" style="display: grid; gap: 12px; grid-template-columns: 1.5fr 1fr;">
            <button class="v-btn" onclick="showMeasureResults()" style="background:#3B82F6; color:white; width:100%; height:44px; display:flex; align-items:center; justify-content:center; gap:8px; border-radius:6px; font-weight:600; font-size:13px; border:none">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
              </svg>
              Đo nhiệt
            </button>
            <button class="v-btn" onclick="toggleMeasureMode(false)" style="background:rgba(239, 68, 68, 0.15); border:1px solid rgba(239, 68, 68, 0.5); color:#EF4444; width:100%; height:44px; display:flex; align-items:center; justify-content:center; gap:8px; border-radius:6px; font-weight:600; font-size:13px">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Thoát
            </button>
          </div>

          <!-- Measurement Results (Hidden by default) -->
          <div id="measure-results" style="display:none; margin-top:15px; animation: fadeIn 0.3s ease-in-out;">
            <div style="font-size:13px; color:var(--text-sub); margin-bottom:10px;">Kết quả đo:</div>
            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px;">
              <!-- Max -->
              <div style="background:rgba(239, 68, 68, 0.1); border:1px solid rgba(239, 68, 68, 0.3); border-radius:8px; padding:10px; text-align:center;">
                <div style="font-size:11px; color:#EF4444; font-weight:600; margin-bottom:4px;">Max
                </div>
                <div style="font-family:'JetBrains Mono'; font-size:16px; font-weight:700; color:#EF4444;">
                  57.8°C</div>
              </div>
              <!-- Avg -->
              <div style="background:rgba(245, 158, 11, 0.1); border:1px solid rgba(245, 158, 11, 0.3); border-radius:8px; padding:10px; text-align:center;">
                <div style="font-size:11px; color:#F59E0B; font-weight:600; margin-bottom:4px;">Avg
                </div>
                <div style="font-family:'JetBrains Mono'; font-size:16px; font-weight:700; color:#F59E0B;">
                  42.5°C</div>
              </div>
              <!-- Min -->
              <div style="background:rgba(16, 185, 129, 0.1); border:1px solid rgba(16, 185, 129, 0.3); border-radius:8px; padding:10px; text-align:center;">
                <div style="font-size:11px; color:#10B981; font-weight:600; margin-bottom:4px;">Min
                </div>
                <div style="font-family:'JetBrains Mono'; font-size:16px; font-weight:700; color:#10B981;">
                  27.2°C</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Toolbar -->
        <div style="margin-top:20px; padding-top:20px; border-top:1px solid var(--border); width:100%">
          <div style="font-size:11px; font-weight:700; color:var(--text-sub); margin-bottom:12px; text-transform:uppercase;">
            ĐIỀU KHIỂN</div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <button class="v-btn action-btn-danger" title="Nút nguồn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                <line x1="12" y1="2" x2="12" y2="12"></line>
              </svg>
              Nguồn
            </button>
            <button class="v-btn action-btn-secondary" title="Cài đặt camera">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
                </path>
              </svg>
              Cài đặt
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>