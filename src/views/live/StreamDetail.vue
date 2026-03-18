<script setup lang="ts">

import {useRoute} from "vue-router";
import StreamControl from "@/components/Video/StreamControl.vue";
import {ref} from "vue";

const route = useRoute()
const key = ref(route.params.id)

</script>
<template>
  <StreamControl :streamKey="key"></StreamControl>
</template>
