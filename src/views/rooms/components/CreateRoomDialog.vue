<template>
  <CommonDialog
    @onFormSubmit="onFormSubmit"
    :resolver
    :formData
    successBtn="buttons.createRoom"
    :loading="loadings.create || loadings.getDetail"
    :loader="loadings.getDetail"
    :header="t('buttons.createRoom')"
  >
    <template #default="{ $form }">
      <div class="grid grid-cols-2 gap-4">
        <SelectInput
          field="hotelId"
          label="hotel"
          :form="$form"
          v-model="formData.hotelId"
          :options="hotels"
          optionLabel="title"
          optionValue="id"
        >
        </SelectInput>
        <SelectInput
          field="type"
          label="roomType"
          :form="$form"
          v-model="formData.type"
          :options="roomTypes"
          optionLabel="title"
          optionValue="v"
        >
          <template #value="{ slotProps }">
            <div v-if="slotProps.value" class="flex items-center">
              <div>{{ t('roomTypes.' + slotProps.value) }}</div>
            </div>
            <span v-else>
              {{ slotProps.placeholder }}
            </span>
          </template>
          <template #option="{ option }">
            {{ t(option.title) }}
          </template>
        </SelectInput>
      </div>
      <NumberInput
        :minFractionDigits="2"
        :maxFractionDigits="2"
        field="price"
        label="price"
        :form="$form"
        v-model="formData.price"
      />
    </template>
  </CommonDialog>
</template>
<script setup lang="ts">
import { intResolver, priceResolver } from '@/data/resolvers'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { useMetaStore } from '@/stores/meta'
import { ref, onMounted } from 'vue'
import { z } from 'zod'
import { RoomTypes, type Room } from '@/types/room.interface.ts'
import { type DenseHotel } from '@/types/hotel.interface.ts'
import { useI18n } from 'vue-i18n'
import { roomTypes } from '@/data/enums.ts'
class FormData {
  hotelId: number
  type: RoomTypes
  price: number
  constructor() {
    this.price = 0
    this.hotelId = 0
    this.type = RoomTypes.BASIC
  }
}
const metaStore = useMetaStore()
const hotels = ref<DenseHotel[]>([])
const { t } = useI18n()
const props = defineProps<{
  loadings: {
    get: boolean
    create: boolean
    getDetail: boolean
  }
}>()
const formData = ref(new FormData())
const emits = defineEmits<{
  created: [room: Room]
}>()
const resolver = ref(
  zodResolver(
    z.object({
      price: priceResolver,
      hotelId: intResolver,
      type: intResolver,
    }),
  ),
)
const getDetail = async () => {
  if (props.loadings.create || props.loadings.getDetail) {
    return
  }
  props.loadings.getDetail = true
  const res = await metaStore.safeRequest<DenseHotel[]>('get', '/hotel?dense=true', {}, false)

  if (!res) {
    // to do
  } else {
    hotels.value = res
  }
  props.loadings.getDetail = false
}
const onFormSubmit = async (valid: boolean) => {
  if (props.loadings.create) {
    return
  }
  if (valid) {
    props.loadings.create = true
    const { price, type, hotelId } = formData.value
    const res = await metaStore.safeRequest<Room>('post', `/room/${hotelId}`, {
      price,
      type,
    })
    if (res) {
      emits('created', res)
    }
  }
  props.loadings.create = false
}
onMounted(() => {
  getDetail()
})
</script>
