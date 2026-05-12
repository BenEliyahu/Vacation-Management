<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="container" style="max-width: 520px">
      <div class="text-center mb-4">
        <i class="fa-solid fa-umbrella-beach fa-3x text-primary mb-3"></i>
        <h1 class="fw-bold">Vacation Manager</h1>
        <p class="text-muted">Select your profile to continue</p>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

      <template v-else>
        <!-- Requester cards -->
        <h6 class="text-uppercase text-muted fw-semibold mb-2 small">Requesters</h6>
        <div class="row g-2 mb-3">
          <div v-for="u in requesters" :key="u.id" class="col-6">
            <button
              class="btn btn-outline-primary w-100 py-3 d-flex align-items-center gap-2"
              @click="goRequester(u.id)"
            >
              <i class="fa-solid fa-user-tie fa-lg"></i>
              <span class="fw-semibold">{{ u.name }}</span>
            </button>
          </div>
        </div>

        <!-- Validator cards -->
        <h6 class="text-uppercase text-muted fw-semibold mb-2 small">Validators</h6>
        <div class="row g-2">
          <div v-for="u in validators" :key="u.id" class="col-6">
            <button
              class="btn btn-outline-success w-100 py-3 d-flex align-items-center gap-2"
              @click="goValidator"
            >
              <i class="fa-solid fa-user-shield fa-lg"></i>
              <span class="fw-semibold">{{ u.name }}</span>
            </button>
          </div>
        </div>

        <div class="text-center mt-4">
          <button class="btn btn-sm btn-link text-muted" @click="seed" :disabled="seeding">
            <i class="fa-solid fa-database me-1"></i>
            {{ seeding ? "Seeding…" : "Seed demo users" }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usersApi } from "../api";
import type { User } from "../types";
import { UserRole } from "../types";

const router = useRouter();
const users = ref<User[]>([]);
const loading = ref(false);
const error = ref("");
const seeding = ref(false);

const requesters = computed(() => users.value.filter((u) => u.role === UserRole.REQUESTER));
const validators = computed(() => users.value.filter((u) => u.role === UserRole.VALIDATOR));

async function fetchUsers() {
  loading.value = true;
  error.value = "";
  try {
    const res = await usersApi.getAll();
    users.value = res.data;
  } catch {
    error.value = "Could not load users. Is the backend running?";
  } finally {
    loading.value = false;
  }
}

async function seed() {
  seeding.value = true;
  try {
    await usersApi.seed();
    await fetchUsers();
  } finally {
    seeding.value = false;
  }
}

function goRequester(userId: number) {
  router.push({ name: "requester", params: { userId } });
}

function goValidator() {
  router.push({ name: "validator" });
}

onMounted(fetchUsers);
</script>
