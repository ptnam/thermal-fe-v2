<template>
  <div class="ptz-container">
    <div class="ptz-center">PTZ</div>

    <!-- 8 Direction Buttons -->
    <button type="button" class="ptz-btn up"
            @mousedown.prevent="() => press('Up')"
            @mouseup.prevent="() => release('Up')"></button>
    <button type="button" class="ptz-btn down"
            @mousedown.prevent="() => press('Down')"
            @mouseup.prevent="() => release('Down')"></button>
    <button type="button" class="ptz-btn left"
            @mousedown.prevent="() => press('Left')"
            @mouseup.prevent="() => release('Left')"></button>
    <button type="button" class="ptz-btn right"
            @mousedown.prevent="() => press('Right')"
            @mouseup.prevent="() => release('Right')"></button>
    <button type="button" class="ptz-btn up-left"
            @mousedown.prevent="() => press('UpLeft')"
            @mouseup.prevent="() => release('UpLeft')"></button>
    <button type="button" class="ptz-btn up-right"
            @mousedown.prevent="() => press('UpRight')"
            @mouseup.prevent="() => release('UpRight')"></button>
    <button type="button" class="ptz-btn down-left"
            @mousedown.prevent="() => press('DownLeft')"
            @mouseup.prevent="() => release('DownLeft')"></button>
    <button type="button" class="ptz-btn down-right"
            @mousedown.prevent="() => press('DownRight')"
            @mouseup.prevent="() => release('DownRight')"></button>
  </div>
</template>

<script setup>
const emits = defineEmits(['press', 'release'])

function press(direction) {
  emits('press', direction)
}

function release(direction) {
  emits('release', direction)
}
</script>

<style scoped>
.ptz-container {
  position: relative;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: radial-gradient(circle at center, #e6f0fa, #cfd8e3);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3) inset;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Center button */
.ptz-center {
  width: 38px;
  height: 38px;
  background: radial-gradient(circle at center, #5ba9e0, #2266aa);
  border-radius: 50%;
  color: white;
  font-weight: bold;
  font-size: 0.75rem;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

/* Arrow buttons (straight) */
.ptz-btn {
  position: absolute;
  width: 18px;
  height: 18px;
  background: #3b83c4;
  clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
  border-radius: 3px;
}

.ptz-btn:hover {
  transform: scale(1.1);
  background: #1d5da8;
}

/* Position straight buttons */
.ptz-btn.up {
  top: 5px;
  left: 50%;
  transform: translateX(-50%) rotate(0deg);
}

.ptz-btn.down {
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%) rotate(180deg);
}

.ptz-btn.left {
  left: 5px;
  top: 50%;
  transform: translateY(-50%) rotate(-90deg);
}

.ptz-btn.right {
  right: 5px;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
}

/* Diagonal buttons (smaller) */
.ptz-btn.up-left,
.ptz-btn.up-right,
.ptz-btn.down-left,
.ptz-btn.down-right {
  width: 15px;
  height: 15px;
}

.ptz-btn.up-left {
  top: 20px;
  left: 20px;
  transform: rotate(-45deg);
}

.ptz-btn.up-right {
  top: 20px;
  right: 20px;
  transform: rotate(45deg);
}

.ptz-btn.down-left {
  bottom: 20px;
  left: 20px;
  transform: rotate(-135deg);
}

.ptz-btn.down-right {
  bottom: 20px;
  right: 20px;
  transform: rotate(135deg);
}
</style>
