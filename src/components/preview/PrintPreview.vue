<script setup lang="ts">
import type { DocumentData, SectionConfig } from '@/types/document'
import DocumentClassic from '@/components/documents/DocumentClassic.vue'
import DocumentModern from '@/components/documents/DocumentModern.vue'
import DocumentMinimal from '@/components/documents/DocumentMinimal.vue'

defineProps<{ doc: DocumentData; sections: SectionConfig[] }>()
</script>

<template>
  <DocumentClassic v-if="doc.style === 'classic'" :doc="doc" :sections="sections" />
  <DocumentModern v-else-if="doc.style === 'modern'" :doc="doc" :sections="sections" />
  <DocumentMinimal v-else :doc="doc" :sections="sections" />
</template>
