<template>
  <div>
    <el-date-picker
        v-model="dateRange"
        type="daterange"
        start-placeholder="Ngày bắt đầu"
        end-placeholder="Ngày kết thúc"
        value-format="YYYY-MM-DD"
    />
    <div class="mt-4">
      <VueApexChart
          ref="chartBarRef"
          type="bar"
          height="500"
          :options="chartOptions"
          :series="series">
      </VueApexChart>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, ref} from "vue";
import {notificationsCountApi} from "@/api/notification";
import VueApexChart from "vue3-apexcharts";

const chartOptions = ref({
  chart: {
    height: 350,
    type: 'bar',
    zoom: {
      enabled: true
    },
    dropShadow: {
      enabled: true,
      color: '#000',
      top: 18,
      left: 7,
      blur: 10,
      opacity: 0.2
    },
  },
  dataLabels: {
    enabled: true
  },
  stroke: {
    curve: 'straight'
  },
  grid: {
    row: {
      colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
      opacity: 0.5
    },
  },
  xaxis: {
    title: {
      style: {
        fontSize: '12px',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontWeight: 500,
        cssClass: 'apexcharts-xaxis-title',
      },
    },
    categories: [],
  },
  yaxis: {
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: true,
      formatter: function (val) {
        return val;
      }
    },
    title: {
      style: {
        fontSize: '12px',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontWeight: 500,
        cssClass: 'apexcharts-xaxis-title',
      },
    },
  },
})

const series = ref<any[]>([{
  name: "Total",
  data: []
}])
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]; // format to YYYY-MM-DD
}

const today = new Date();
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(today.getDate() - 6);

const searchParams = ref({
  startDate: formatDate(sevenDaysAgo),
  endDate: formatDate(today),
})

const chartBarRef = ref<ApexCharts>()

const dateRange = computed<[string, string] | []>({
  get() {
    return searchParams.value.startDate && searchParams.value.endDate
        ? [searchParams.value.startDate, searchParams.value.endDate]
        : []
  },
  set([start, end]) {
    searchParams.value = {
      ...searchParams.value,
      startDate: start ?? '',
      endDate: end ?? ''
    }
    nextTick(() => {
      refresh()
    })
  }
})
const refresh = () => {
  notificationsCountApi(searchParams.value).then(res => {
    let seriesData: number[] = [];
    let categoryLabel: string[] = [];

    for (const item of res.data as { numberOfNotifications: number; dataDate: string }[]) {
      seriesData.push(item.numberOfNotifications);
      categoryLabel.push(item.dataDate);
    }
    series.value = [{
      name: "Total",
      data: seriesData
    }]
    chartBarRef.value?.updateSeries(series.value, true)
    chartBarRef.value?.updateOptions({
      xaxis: {
        categories: categoryLabel,
      }
    }, true, true)
  })
}

onMounted(() => {
  refresh()
})
</script>