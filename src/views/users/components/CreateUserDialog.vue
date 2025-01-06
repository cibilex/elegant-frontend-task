<template>
  <CommonDialog
    @onFormSubmit="onFormSubmit"
    :resolver
    :formData
    successBtn="buttons.create"
    :loading="loadings.create"
    :header="t('buttons.createUser')"
  >
    <template #default="{ $form }">
      <Input field="email" label="email" :form="$form" v-model="formData.email" />
      <Input field="password" label="password" :form="$form" v-model="formData.password" />
    </template>
  </CommonDialog>
</template>
<script setup lang="ts">
import { passwordResolver, emailResolver } from '@/data/resolvers.ts'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { useMetaStore } from '@/stores/meta'
import { ref, onMounted, computed } from 'vue'
import { z } from 'zod'
import type { User } from '@/types/user.interface'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'

class FormData {
  email: string
  password: string
  constructor() {
    this.email = ''
    this.password = ''
  }
}

const userStore = useUserStore()
const metaStore = useMetaStore()
const { t } = useI18n()
const formData = ref(new FormData())

const props = defineProps<{
  loadings: {
    get: boolean
    create: boolean
  }
}>()

const emits = defineEmits<{
  created: [user: User]
}>()
const resolver = ref(
  zodResolver(
    z.object({
      email: emailResolver,
      password: passwordResolver,
    }),
  ),
)

const onFormSubmit = async (valid: boolean) => {
  if (props.loadings.create) {
    return
  }
  if (valid) {
    props.loadings.create = true
    const { email, password } = formData.value

    const res = await metaStore.safeRequest<User>('post', '/user', {
      email,
      password,
    })

    if (res) {
      emits('created', res)
    }
  }
  props.loadings.create = false
}
</script>
