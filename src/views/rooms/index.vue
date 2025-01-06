<template>
  <PageContent :loading="loadings.get">
    <PageTitle title="rooms" />
    <CommonTable
      editMode="cell"
      @cell-edit-complete="editQuantity"
      @clicked="openDialog"
      btnText="buttons.createRoom"
      :items="inventories"
    >
      <Column field="hotel.title" :header="t('hotel')"></Column>
      <Column field="price" :header="t('price')">
        <template #body="{ data }">
          {{ getPrice(data.price) }}
        </template>
      </Column>
      <Column header="">
        <template #body="{ data }">
          <div v-if="countryName(data.country)" class="flex items-center gap-2">
            <CountryFlag :country="data.country" />
            <div class="translate-y-1">{{ countryName(data.country) }}</div>
          </div>
        </template></Column
      >

      <Column :header="t('roomType')">
        <template #body="{ data }">
          <Tag
            v-if="roomType(data)"
            :value="t(roomType(data).title)"
            :severity="roomType(data).severity"
          />
        </template>
      </Column>
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
      <Column header="">
        <template #body="{ data }">
          <Button
            icon="pi pi-times"
            severity="danger"
            rounded
            @click="deleteRoom(data)"
            variant="outlined"
            aria-label="Cancel"
          /> </template
      ></Column>
    </CommonTable>
    <CreateRoomDialog @created="created" :loadings v-model="visible" v-if="visible" />
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
import { formatDate, getPrice } from '@/lib/utils'
import { commonStatuses, roomTypes } from '@/data/enums'
import { useConfirm } from 'primevue/useconfirm'
import { type Room } from '@/types/room.interface.ts'
import CreateRoomDialog from '@/views/rooms/components/CreateRoomDialog.vue'
import countries from '@/data/countries.json'
const { t, locale } = useI18n()
const confirm = useConfirm()
const metaStore = useMetaStore()
const loadings = reactive({
  get: false,
  create: false,
  delete: false,
  getDetail: false,
  update: false,
})
const inventories = ref<Room[]>([])
const visible = ref(false)
const userStatus = computed(() => (data: Room) => commonStatuses[data.status])
const roomType = computed(() => (data: Room) => roomTypes.find((item) => item.v === data.type)!)
const countryName = computed(() => (code: string) => {
  const country = countries.find((item) => item.v === code)
  if (!country) {
    return false
  }
  return country[locale.value as keyof typeof country]
})
const created = (room: Room) => {
  visible.value = false
  inventories.value.unshift(room)
}
const editQuantity = async ({
  newValue,
  value,
  data,
}: {
  data: Room
  value: number
  newValue: number
}) => {
  if (loadings.update || isNaN(newValue) || isNaN(value) || value < 0 || newValue < 0) {
    return
  }
  loadings.update = true
  data.price = newValue
  const res = await metaStore.safeRequest('put', `/room/${data.hotel.id}//${data.id}`, {
    quantity: newValue,
  })
  if (!res) {
    data.price = value
  }
  loadings.update = false
}

const openDialog = () => {
  visible.value = true
}
const getRooms = async () => {
  if (loadings.get) {
    return
  }
  loadings.get = true
  const res = await metaStore.safeRequest('get', '/room', {}, false)
  if (res) {
    inventories.value = res
  }
  loadings.get = false
}
const deleteRoom = (data: Room) => {
  if (loadings.delete) {
    return
  }
  confirm.require({
    group: 'headless',
    header: t('areYouSure'),
    message: t('confirmToDeleteBook'),
    accept: async () => {
      if (loadings.delete) {
        return
      }
      const res = await metaStore.safeRequest('delete', `/room/${data.hotel.id}}/${data.id}`, {})
      if (res) {
        inventories.value = inventories.value.filter((item) => item.id !== data.id)
      }
    },
    reject: () => {},
  })
}
onMounted(() => {
  getRooms()
})
</script>
