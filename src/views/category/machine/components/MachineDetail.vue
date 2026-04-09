<template>
  <el-form-item label="Ngăn lộ" prop="feederBays" :error="formErrors.FeederBays">
    <el-input v-model="machineDetail.feederBays"/>
  </el-form-item>
  <el-form-item label="Cấp điện áp " prop="voltageLevel" :error="formErrors.VoltageLevel">
    <el-input-number
        v-model="machineDetail.voltageLevel"
        :controls="false"
        :min="0"
        :max="10000"
    />
  </el-form-item>
  <el-form-item label="Hãng sản xuất" prop="manufacturerId" :error="formErrors.ManufacturerId">
    <select-from-config key-config="manufacturerList" v-model="machineDetail.manufacturerId"/>
  </el-form-item>
  <el-form-item label="Số chế tạo" prop="serialNo" :error="formErrors.SerialNo">
    <el-input v-model="machineDetail.serialNo"/>
  </el-form-item>
  <el-form-item label="Kiểu máy " prop="machineClassifyId" :error="formErrors.MachineClassifyId">
    <select-from-config
        ref="machineClassifyIdRef"
        key-config="machineClassifyList"
        v-model="machineDetail.machineClassifyId"
        :filter="(item) => item?.machineTypeId === formModel.machineTypeId"
    />
  </el-form-item>
  <el-form-item label="Số pha" prop="numberOfPhases" :error="formErrors.NumberOfPhases">
    <input-number
        v-model="machineDetail.numberOfPhases"
    />
  </el-form-item>
  <el-form-item label="Năm sản xuất" prop="yearOfProduction" :error="formErrors.YearOfProduction">
    <el-date-picker
        v-model="machineDetail.yearOfProduction"
        type="year"
        placeholder="Năm sản xuất"
        value-format="YYYY"
    />
  </el-form-item>
  <el-form-item label="Điện áp định mức" prop="ratedVoltage" :error="formErrors.RatedVoltage">
    <el-input v-model="machineDetail.ratedVoltage"/>
  </el-form-item>
  <el-form-item label="Dòng điện định mức" prop="rated_current" :error="formErrors.RatedCurrent">
    <el-input-number
        v-model="machineDetail.ratedCurrent"
        :controls="false"
        :min="0"
        :max="10000"
    />
  </el-form-item>
  <el-form-item label="Tần số" prop="frequency" :error="formErrors.frequency">
    <el-input-number
        v-model="machineDetail.frequency"
        :controls="false"
        :min="0"
        :max="10000"
    />
  </el-form-item>
  <el-form-item label="Ngày bắt đầu vận hành" prop="inServiceDate" :error="formErrors.InServiceDate">
    <el-date-picker
        v-model="machineDetail.inServiceDate"
        type="date"
        value-format="YYYY-MM-DD"
        placeholder="Chọn một ngày"
    />
  </el-form-item>
  <el-form-item label="Số tháng vận hành" prop="monthsInOperation" :error="formErrors.MonthsInOperation">
    <input-number v-model="machineDetail.monthsInOperation"/>
  </el-form-item>
  <el-form-item label="Lịch sử vận hành và bảo dưỡng" prop="operationAndMaintenance"
                :error="formErrors.OperationAndMaintenance">
    <el-input type="textarea" v-model="machineDetail.operationAndMaintenance"/>
  </el-form-item>
  <el-collapse v-if="machineTypeCode">
    <el-collapse-item :title="`Thông tin riêng của: ${machineTypeCode}`">
      <div v-if="machineTypeCode ==='MBA'">
        <el-form-item label="Công suất" prop="burden" :error="formErrors.burden">
          <el-input-number
              v-model="machineTransformer.burden"
              :controls="false"
              :min="0"
          />
        </el-form-item>
        <el-form-item label="Tổ đấu dây" prop="windingConfiguration" :error="formErrors.WindingConfiguration">
          <el-input v-model="machineTransformer.windingConfiguration"/>
        </el-form-item>
        <el-form-item label="Loại giấy cách điện" prop="insulationPaperTypeId"
                      :error="formErrors.InsulationPaperTypeId">
          <select-from-config
              key-config="insullationPaperTypeList"
              v-model="machineTransformer.insulationPaperTypeId">
          </select-from-config>
        </el-form-item>
        <el-form-item label="Loại chất lỏng cách điện" prop="insulationLiquidTypeId"
                      :error="formErrors.InsulationLiquidTypeId">
          <select-from-config
              key-config="insulationLiquidTypeList"
              v-model="machineTransformer.insulationLiquidTypeId">
          </select-from-config>
        </el-form-item>
        <el-form-item label="Dung tích dầu máy biến áp" prop="transOilVolume" :error="formErrors.TransOilVolume">
          <input-number
              v-model="machineTransformer.transOilVolume"
          />
        </el-form-item>
        <el-form-item label="Loại LTC" prop="oltcTypes"
                      :error="formErrors.OltcTypes">
          <select-from-config
              key-config="oltcTypeList"
              v-model="machineTransformer.oltcTypes">
          </select-from-config>
        </el-form-item>
        <el-form-item label="LDung tích dầu OLTC" prop="oltcOilVolume"
                      :error="formErrors.OltcOilVolume">
          <input-number
              v-model="machineTransformer.oltcOilVolume"
          />
        </el-form-item>
        <el-form-item label="Loại dầu OLTC" prop="oltcOilTypes"
                      :error="formErrors.OltcOilTypes">
          <select-from-config
              key-config="oltcOilTypeList"
              v-model="machineTransformer.oltcOilTypes">
          </select-from-config>
        </el-form-item>
        <el-form-item label="Loại tản nhiệt " prop="coolingTypes"
                      :error="formErrors.CoolingTypes">
          <select-from-config
              key-config="coolingTypeList"
              v-model="machineTransformer.coolingTypes">
          </select-from-config>
        </el-form-item>
      </div>
      <div v-if="machineTypeCode ==='MC'">
        <el-form-item label="Dòng cắt định mức" prop="ratedTrippingCurrent"
                      :error="formErrors.RatedTrippingCurrent">
          <input-number
              v-model="machineCircuitBreaker.ratedTrippingCurrent"
          />
        </el-form-item>
        <el-form-item label="Số lần đóng cắt " prop="numberOfTrippedTimes"
                      :error="formErrors.NumberOfTrippedTimes">
          <input-number
              v-model="machineCircuitBreaker.numberOfTrippedTimes"
          />
        </el-form-item>
      </div>

      <div v-if="machineTypeCode ==='DCL'">
        <el-form-item label="Vật liệu cách điện" prop="insulationTypeId"
                      :error="formErrors?.MachineDisconnectingSwitch?.InsulationTypeId">
          <select-from-config
              key-config="insulationTypeList"
              v-model="machineDisconnectingSwitch.insulationTypeId">
          </select-from-config>
        </el-form-item>
      </div>
    </el-collapse-item>
  </el-collapse>
</template>

<script setup>
import SelectFromConfig from "@/components/Selection/SelectFromConfig.vue";
import InputNumber from "@/components/Input/InputNumber.vue";
import {watch, ref, nextTick} from "vue";

const formModel = defineModel('formModel', {required: true})
const machineDetail = defineModel('machineDetail', {required: true})
const machineTransformer = defineModel('machineTransformer', {required: true})
const machineCircuitBreaker = defineModel('machineCircuitBreaker', {required: true})
const machineDisconnectingSwitch = defineModel('machineDisconnectingSwitch', {required: true})
const formErrors = defineModel('formErrors', {required: true})
const machineTypeCode = defineModel('machineTypeCode', {required: true})

const machineClassifyIdRef = ref()
watch(
    () => machineTypeCode,
    () => {
      nextTick(() => {
        machineClassifyIdRef?.value?.reloadOption();
      })
    },
    {immediate: true},
)
</script>