<template>
  <DataTable
    :value="items"
    paginator
    :rows="10"
    :rowsPerPageOptions
    tableStyle="min-width: 50rem"
    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
    currentPageReportTemplate="{first} to {last} of {totalRecords}"
    class="flex flex-col grow"
    scrollable
  >
    <template v-if="btnText && ((admin && userStore.isAdmin) || !admin)" #header>
      <div class="flex flex-wrap justify-end gap-2">
        <Button text icon="pi pi-plus" :label="t(btnText)" @click="emits('clicked')" />
      </div>
    </template>

    <template #empty>{{ t('emptyTable') }}</template>
    <slot />
  </DataTable>
</template>

<script setup lang="ts">
import { rowsPerPageOptions } from '@/data/enums'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

defineProps<{
  items: any[]
  btnText?: string
  admin?: boolean
}>()
const { t } = useI18n()
const emits = defineEmits<{
  clicked: []
}>()
</script>

<style scoped></style>
