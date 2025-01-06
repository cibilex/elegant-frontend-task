<template>
  <PageContent :loading="false">
    <div class="flex flex-col">
      <PageTitle title="signIn" />

      <div class="h-full w-full grid place-content-center">
        <Card class="mt-16">
          <template #content>
            <Form
              v-slot="$form"
              :resolver="resolver"
              :initialValues="formData"
              @submit="onFormSubmit"
              class="flex flex-col gap-4 w-96"
            >
              <Input field="email" label="email" :form="$form" v-model="formData.email" />
              <Input
                field="password"
                type="password"
                label="password"
                :form="$form"
                v-model="formData.password"
              />
              <div class="flex items-center gap-2">
                <Checkbox v-model="formData.rememberMe" binary />
                <label for="rememberMe"> {{ t('rememberMe') }} </label>
              </div>
              <Button
                :loading="formData.loading"
                type="submit"
                severity="secondary"
                :label="t('buttons.submit')"
              />
            </Form>
          </template>
        </Card>
        <Button
          :disabled="formData.loading"
          as="router-link"
          :to="{ name: 'register' }"
          variant="text"
          class="mt-4 self-center mx-auto"
          severity="secondary"
          :label="t('signUp')"
        />
      </div>
    </div>
  </PageContent>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { useI18n } from 'vue-i18n'
import { useMetaStore } from '@/stores/meta'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { emailResolver, passwordResolver } from '@/data/resolvers'

const { t } = useI18n()
const metaStore = useMetaStore()
const userStore = useUserStore()
const router = useRouter()
const formData = ref({
  email: '',
  password: '',
  loading: false,
  rememberMe: false,
})

const resolver = ref(
  zodResolver(
    z.object({
      email: emailResolver,
      password: passwordResolver,
    }),
  ),
)

const onFormSubmit = async ({ valid }: { valid: boolean }) => {
  if (formData.value.loading) {
    return
  }
  if (valid) {
    formData.value.loading = true
    const { email, password, rememberMe } = formData.value
    const res = await metaStore.safeRequest<{
      accessToken: string
    }>('post', '/user/login', {
      email,
      password,
      rememberMe,
    })

    if (res) {
      userStore.addLoginData(res.accessToken)
      router.replace({ name: 'index' })
    }
    formData.value.loading = false
  }
}
</script>

<route lang="yaml">
name: login
meta:
  public: true
</route>
