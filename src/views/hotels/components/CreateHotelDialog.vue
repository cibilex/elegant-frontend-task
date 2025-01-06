<template>
  <CommonDialog
    @onFormSubmit="onFormSubmit"
    :resolver
    :formData
    successBtn="buttons.create"
    :loading="loadings.create"
    :header="t('buttons.createHotel')"
  >
    <template #default="{ $form }">
      <Input field="title" label="title" :form="$form" v-model="formData.title" />
      <SelectInput
        field="country"
        label="country"
        :form="$form"
        v-model="formData.country"
        :options="countries"
        optionValue="v"
        :optionLabel="locale"
      >
      </SelectInput>
    </template>
  </CommonDialog>
</template>
<script setup lang="ts">
import { titleResolver, countryResolver } from '@/data/resolvers.ts'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { useMetaStore } from '@/stores/meta'
import { ref } from 'vue'
import { z } from 'zod'
import type { Hotel } from '@/types/hotel.interface'
import { useI18n } from 'vue-i18n'
import countries from '@/data/countries.json'

class FormData {
  title: string
  country: string
  constructor() {
    this.title = ''
    this.country = ''
  }
}

const metaStore = useMetaStore()
const { t, locale } = useI18n()
const formData = ref(new FormData())

const props = defineProps<{
  loadings: {
    get: boolean
    create: boolean
  }
}>()

const emits = defineEmits<{
  created: [hotel: Hotel]
}>()
const resolver = ref(
  zodResolver(
    z.object({
      title: titleResolver,
      country: countryResolver,
    }),
  ),
)

const onFormSubmit = async (valid: boolean) => {
  if (props.loadings.create) {
    return
  }
  if (valid) {
    props.loadings.create = true
    const { title, country } = formData.value

    const res = await metaStore.safeRequest<Hotel>('post', '/hotel', {
      title,
      country,
    })

    if (res) {
      emits('created', res)
    }
  }
  props.loadings.create = false
}
</script>
