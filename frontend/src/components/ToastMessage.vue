<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          :class="`toast-item toast-${t.type}`"
        >
          <i :class="icons[t.type]"></i>
          <span>{{ t.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from "../composables/useToast";

const { toasts } = useToast();

const icons = {
  success: "fa-solid fa-circle-check",
  error:   "fa-solid fa-circle-xmark",
  warning: "fa-solid fa-triangle-exclamation",
  info:    "fa-solid fa-circle-info",
};
</script>
