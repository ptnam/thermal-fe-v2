import { ref, onMounted, onUnmounted } from 'vue';

export function useClock(formatString = 'YYYY-MM-DD HH:mm:ss') {
  const localTime = ref('');

  const formatDateTime = (date) => {
    const map = {
      YYYY: date.getFullYear(),
      MM: String(date.getMonth() + 1).padStart(2, '0'),
      DD: String(date.getDate()).padStart(2, '0'),
      HH: String(date.getHours()).padStart(2, '0'),
      mm: String(date.getMinutes()).padStart(2, '0'),
      ss: String(date.getSeconds()).padStart(2, '0'),
    };

    return formatString.replace(/YYYY|MM|DD|HH|mm|ss/g, (matched) => map[matched]);
  };

  const updateTime = () => {
    localTime.value = formatDateTime(new Date());
  };

  updateTime();

  let timer = null;
  onMounted(() => {
    timer = setInterval(updateTime, 1000);
  });

  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });

  return { localTime };
}