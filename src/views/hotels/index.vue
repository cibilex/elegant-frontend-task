<template>
  <PageContent :loading="loadings.get">
    <PageTitle title="hotels" />
    <CommonTable admin @clicked="openDialog" btnText="buttons.createHotel" :items="hotels">
      <Column field="title" :header="t('title')"></Column>
      <Column header="">
        <template #body="{ data }">
          <div v-if="countryName(data.country)" class="flex items-center gap-2">
            <CountryFlag :country="data.country" />
            <div class="translate-y-1">{{ countryName(data.country) }}</div>
          </div>
        </template></Column
      >
      <Column :header="t('status')">
        <template #body="{ data }">
          <Tag
            v-if="userStatus(data)"
            :value="t(userStatus(data).title)"
            :severity="userStatus(data).severity"
          />
        </template>
      </Column>

      <Column field="createdAt" :header="t('createdAt')">
        <template #body="{ data, field }"> {{ formatDate(data[field]) }}</template></Column
      >
      <Column field="updatedAt" :header="t('updatedAt')">
        <template #body="{ data, field }"> {{ formatDate(data[field]) }}</template></Column
      >

      <Column v-if="userStore.isAdmin" header="">
        <template #body="{ data }">
          <Button
            icon="pi pi-times"
            severity="danger"
            rounded
            @click="deleteHotel(data)"
            variant="outlined"
            aria-label="Cancel"
          /> </template
      ></Column>
    </CommonTable>
    <CreateHotelDialog @created="created" :loadings v-model="visible" v-if="visible" />
  </PageContent>
  <ConfirmDialog group="headless">
    <template #container="{ message, acceptCallback, rejectCallback }">
      <div class="flex flex-col items-center p-8 bg-surface-0 dark:bg-surface-900 rounded">
        <div
          class="rounded-full bg-red-6 text-primary-contrast inline-flex justify-center items-center h-24 w-24 -mt-20"
        >
          <div class="i-tabler-exclamation-circle text-white text-5xl"></div>
        </div>
        <span class="font-bold text-2xl block mb-2 mt-6">{{ message.header }}</span>
        <p class="mb-0">{{ message.message }}</p>
        <div class="flex items-center gap-2 mt-6">
          <Button
            :label="t('buttons.cancel')"
            outlined
            @click="rejectCallback"
            severity="secondary"
            class="w-32"
          ></Button>
          <Button
            :label="t('buttons.delete')"
            @click="acceptCallback"
            severity="danger"
            class="w-32"
          ></Button>
        </div>
      </div>
    </template>
  </ConfirmDialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMetaStore } from '@/stores/meta'
import { formatDate } from '@/lib/utils'
import CreateHotelDialog from '@/views/hotels/components/CreateHotelDialog.vue'
import { commonStatuses } from '@/data/enums'
import { useConfirm } from 'primevue/useconfirm'
import { useUserStore } from '@/stores/user'
import type { Hotel } from '@/types/hotel.interface.ts'
import countries from '@/data/countries.json'
const userStore = useUserStore()

const confirm = useConfirm()
const { t, locale } = useI18n()
const metaStore = useMetaStore()
const countryName = computed(() => (code: string) => {
  const country = countries.find((item) => item.v === code)
  if (!country) {
    return false
  }
  return country[locale.value as keyof typeof country]
})

const loadings = reactive({
  get: false,
  create: false,
  delete: false,
})
const hotels = ref<Hotel[]>([])
const visible = ref(false)
const userStatus = computed(() => (data: Hotel) => commonStatuses[data.status])
const created = (hotel: Hotel) => {
  visible.value = false
  hotels.value.unshift(hotel)
}

const openDialog = () => {
  visible.value = true
}
const getHotels = async () => {
  if (loadings.get) {
    return
  }
  loadings.get = true
  const res = await metaStore.safeRequest('get', '/hotel', {}, false)
  if (res) {
    hotels.value = res
  }
  loadings.get = false
}

const deleteHotel = (data: Hotel) => {
  if (loadings.delete) {
    return
  }
  confirm.require({
    group: 'headless',
    header: t('areYouSure'),
    message: t('confirmToDeleteHotel'),
    accept: async () => {
      if (loadings.delete) {
        return
      }
      const res = await metaStore.safeRequest('delete', '/hotel/' + data.id, {})
      if (res) {
        hotels.value = hotels.value.filter((item) => item.id !== data.id)
      }
    },
    reject: () => {},
  })
}

onMounted(() => {
  getHotels()
})
</script>
