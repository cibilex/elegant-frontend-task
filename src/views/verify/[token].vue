<template>
  <div>
    <Loader />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMetaStore } from '@/stores/meta'
import { useRouter, useRoute } from 'vue-router'

const metaStore = useMetaStore()
const router = useRouter()
const route = useRoute()
const loading = ref(false)

const submit = async (token: string) => {
  if (loading.value) {
    return
  }
  loading.value = true
  await metaStore.safeRequest<{
    accessToken: string
  }>('post', '/user/verify', {
    token,
  })

  router.replace({ name: 'login' })
  loading.value = false
}

onMounted(() => {
  const token = route.params.token
  if (!token || typeof token !== 'string' || token.length < 10) {
    router.replace({ name: 'login' })
  } else {
    submit(token)
  }
})
</script>

<route lang="yaml">
meta:
  public: true
</route>
