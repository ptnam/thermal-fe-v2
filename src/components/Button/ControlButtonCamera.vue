<template>
  <div>
    <FormWrapper
        :form-model="formModel"
        :form-props="{ labelWidth: '140px', inline: true, labelPosition: 'top' }"
        :request-fn="setViewingAngleApi"
        class="!justify-center"
    >
      <template v-slot="{ formErrors }">
        <div>
          <div class="flex flex-col md:flex-row mx-4 items-center">
            <el-form-item label="Tốc độ quay" prop="speed" :error="formErrors.speed">
              <el-slider
                  :min="0"
                  :step="3"
                  :max="5"
                  :show-stops="true"
                  v-model="speed"
                  style="width: 160px"
              />
            </el-form-item>
            <div class="flex items-center gap-2 md:ml-20">
              <div>
                <game-controller-pad
                    @press="(command) => requestCommand(CAMERA_COMMANDS[command])"
                    @release="() => requestCommand(CAMERA_COMMANDS.Stop)"
                />
              </div>
              <div class="flex flex-row">
                <el-button
                    circle
                    :icon="ZoomIn"
                    color="#64B35A"
                    @click="() => requestCommand(CAMERA_COMMANDS.ZoomIn)"
                    title="Phóng to"
                ></el-button>
                <el-button
                    circle
                    :icon="ZoomOut"
                    color="#E6513B"
                    @click="() => requestCommand(CAMERA_COMMANDS.ZoomOut)"
                    title="Thu nhỏ"
                ></el-button>
              </div>
              <div class="flex flex-row">
                <el-button
                    color="#FACE38"
                    circle
                    :icon="SwitchButton"
                    @click="() => requestCommand(CAMERA_COMMANDS.Restart)"
                    title="Khởi động lại"
                ></el-button>
                <el-button
                    color="#1D5DA8"
                    circle
                    :icon="Setting"
                    @click="() => requestCommand(CAMERA_COMMANDS.Calibration)"
                    title="Điều chỉnh (calibration) tự động"
                ></el-button>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:button><span></span></template>
    </FormWrapper>
    <slot></slot>
  </div>
</template>
<script setup lang="ts">
import FormWrapper from '@/components/Form/FormWrapper.vue'
import {sendCommandCameraApi, setViewingAngleApi} from '@/api/camera'
import GameControllerPad from '@/components/Button/GameControllerPad.vue'
import {SwitchButton, ZoomIn, ZoomOut, Setting} from '@element-plus/icons-vue'
import useRequest from "@/hooks/web/useRequest";
import {ref} from "vue";
import {CAMERA_COMMANDS} from "@/constants/camera";

const props = defineProps({
  formModel: {
    type: Object,
    required: true,
  },
  isEditing: {
    type: Boolean,
    required: false,
  }
})

const speed = ref(3);
const preCommand = ref();

const {onRequest} = useRequest();
const requestCommand = (command: number) => {
  onRequest(sendCommandCameraApi, {
    cameraId: props.formModel.id,
    speed: speed.value,
    command: command,
    preCommand: preCommand.value
  })
  preCommand.value = command
}
</script>
