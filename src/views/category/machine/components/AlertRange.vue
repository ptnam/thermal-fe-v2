<script setup>
import { useLang } from '@/hooks/web/useI18n'

const { t } = useLang()
const props = defineProps({
  item: {
    type: Object,
    default: false
  },
  fromModel: String | Number,
  readonly: {
    type: Boolean,
    default: false
  },
  unit: {
    type: String,
    default: '°C'
  },
})

const toModel = defineModel('toModel', {required: true})

const step = 1;
const increase = () => {
  if (props.readonly) return
  toModel.value = (toModel.value ?? 0) + step
}

const decrease = () => {
  if (props.readonly) return
  toModel.value = (toModel.value ?? 0) - step
}
</script>

<template>
  <div class="level-block " :class="['lvl-'+item.level]">
    <div class="level-info">
      <div class="lvl-icon" v-html="item.icon">
      </div>
      <div class="lvl-text">
        <h4>{{ t(item.labelKey) }}</h4>
        <p>{{ t(item.noteKey) }}</p>
      </div>
    </div>
    <div class="level-range-row">
      <span class="rng-label">{{ t('machine.from') }}</span>
      <div class="rng-val-box" style="justify-content: center;">
        <span class="rng-unit">{{ fromModel }}{{ unit }}</span>
      </div>
      <span class="rng-arrow">→</span>
      <span class="rng-label">{{ t('machine.to') }}</span>
      <div class="val-ctrl-modern">
        <button
            type="button"
            @click="decrease"
            :disabled="readonly"
            class="btn-step-modern">-
        </button>
        <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
          <input-number :readonly="readonly" type="text" v-model="toModel"></input-number>
          {{ unit }}
        </div>
        <button
            type="button"
            @click="increase"
            :disabled="readonly"
            class="btn-step-modern">+
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.level-block {
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid var(--border);
  background: rgba(30, 41, 59, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.level-block:hover {
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.level-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.lvl-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.lvl-text h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.lvl-text p {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--text-sub);
  opacity: 0.8;
}

.level-range-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.rng-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-sub);
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.7;
}

.rng-val-box {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border);
  border-radius: 6px;
  height: 36px;
  width: 85px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0;
}

.rng-input {
  background: transparent;
  border: none;
  color: white;
  width: 28px;
  text-align: right;
  font-weight: 700;
  font-size: 14px;
  outline: none;
  padding: 0;
}

.rng-unit {
  font-size: 11px;
  color: var(--text-sub);
  margin-left: 2px;
}

.rng-arrow {
  color: var(--text-sub);
  font-size: 16px;
  opacity: 0.5;
  margin: 0 4px;
}

.val-ctrl-modern {
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--border);
  border-radius: 6px;
  height: 36px;
  width: 260px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  padding: 0;
  overflow: hidden;
}

.btn-step-modern {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: #ffffff !important;
  width: 36px;
  height: 100%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
  flex-shrink: 0;
}

.btn-step-modern:hover {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6 !important;
}

.val-input-modern {
  background: transparent;
  border: none;
  color: #ffffff !important;
  width: 28px;
  height: 100%;
  text-align: right;
  font-weight: 700;
  font-size: 15px;
  outline: none;
  padding: 0;
  margin: 0;
}

.val-unit-modern {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-sub);
  margin: 0;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .level-block {
    padding: 14px;
  }

  .level-range-row {
    padding: 8px 10px !important;
    flex-wrap: wrap !important;
    gap: 10px 6px !important;
    justify-content: center !important;
  }

  .rng-label {
    font-size: 10px !important;
    letter-spacing: 0.5px;
  }

  .rng-val-box {
    width: 70px !important;
    height: 32px !important;
  }

  .rng-arrow {
    display: none;
  }

  .val-ctrl-modern {
    width: 220px !important;
    height: 34px !important;
    flex-shrink: 0 !important;
  }

  .btn-step-modern {
    width: 32px !important;
  }

  .val-input-modern {
    width: 40px !important;
  }
}

.lvl-1 {
  border-left: 4px solid #10b981;
}

.lvl-1 .lvl-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.lvl-1 h4 {
  color: #10b981;
}

.lvl-2 {
  border-left: 4px solid #3b82f6;
}

.lvl-2 .lvl-icon {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.lvl-2 h4 {
  color: #3b82f6;
}

.lvl-3 {
  border-left: 4px solid #f59e0b;
}

.lvl-3 .lvl-icon {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.lvl-3 h4 {
  color: #f59e0b;
}

.lvl-4 {
  border-left: 4px solid #ef4444;
}

.lvl-4 .lvl-icon {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.lvl-4 h4 {
  color: #ef4444;
}
</style>