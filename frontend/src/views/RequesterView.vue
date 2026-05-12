<template>
  <div id="wrapper">
    <!-- ── Sidebar ──────────────────────────────────────── -->
    <aside class="nav-side">
      <router-link to="/" class="brand">
        <i class="fa-solid fa-umbrella-beach"></i>VacationMgr
      </router-link>

      <div class="profile-element">
        <span class="user-name">{{ userName }}</span>
        <span class="user-role">Requester</span>
      </div>

      <nav>
        <ul>
          <li :class="{ active: activeSection === 'form' }">
            <a href="#" @click.prevent="activeSection = 'form'">
              <i class="fa-solid fa-plus-circle"></i>
              <span>Submit Request</span>
            </a>
          </li>
          <li :class="{ active: activeSection === 'list' }">
            <a href="#" @click.prevent="activeSection = 'list'">
              <i class="fa-solid fa-list-check"></i>
              <span>My Requests</span>
            </a>
          </li>
        </ul>
      </nav>

      <div class="nav-footer">
        <router-link to="/"><i class="fa-solid fa-arrow-left"></i> Back to Home</router-link>
      </div>
    </aside>

    <!-- ── Page wrapper ────────────────────────────────── -->
    <div id="page-wrapper">
      <div class="navbar-top">
        <h2 class="page-title">
          <i class="fa-solid fa-calendar-days me-2" style="color:#1c84c6"></i>
          My Vacation Requests
        </h2>
      </div>

      <div class="wrapper-content">
        <div class="row g-4">

          <!-- Form column -->
          <div class="col-lg-4">
            <!-- ibox: submit form -->
            <div class="ibox">
              <div class="ibox-title">
                <h5><i class="fa-solid fa-paper-plane" style="color:#1c84c6"></i>New Request</h5>
              </div>
              <div class="ibox-content">
                <form @submit.prevent="submitRequest">
                  <div class="mb-3">
                    <label class="form-label">
                      Start Date <span class="text-danger">*</span>
                    </label>
                    <input
                      v-model="form.startDate"
                      type="date"
                      class="form-control"
                      :class="{ 'is-invalid': formErrors.startDate }"
                      :min="today"
                      required
                    />
                    <div class="invalid-feedback">{{ formErrors.startDate }}</div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">
                      End Date <span class="text-danger">*</span>
                    </label>
                    <input
                      v-model="form.endDate"
                      type="date"
                      class="form-control"
                      :class="{ 'is-invalid': formErrors.endDate }"
                      :min="form.startDate || today"
                      required
                    />
                    <div class="invalid-feedback">{{ formErrors.endDate }}</div>
                  </div>

                  <div class="mb-4">
                    <label class="form-label">
                      Reason
                      <small class="text-muted text-lowercase fw-normal">(optional)</small>
                    </label>
                    <textarea
                      v-model="form.reason"
                      class="form-control"
                      rows="3"
                      placeholder="e.g. family vacation, medical leave…"
                      maxlength="500"
                    ></textarea>
                    <small class="text-muted d-block text-end">
                      {{ form.reason?.length ?? 0 }}/500
                    </small>
                  </div>

                  <button
                    type="submit"
                    class="btn btn-primary w-100"
                    :disabled="submitting"
                  >
                    <span v-if="submitting">
                      <span class="spinner-border spinner-border-sm me-1"></span>Submitting…
                    </span>
                    <span v-else>
                      <i class="fa-solid fa-paper-plane me-1"></i>Submit Request
                    </span>
                  </button>
                </form>
              </div>
            </div>

            <!-- Mini stats -->
            <div class="row g-2">
              <div v-for="s in miniStats" :key="s.label" class="col-4">
                <div class="ibox mb-0 text-center py-3">
                  <div class="fw-bold fs-4" :style="`color: ${s.color}`">{{ s.value }}</div>
                  <div style="font-size:11px; color:#aaa; text-transform:uppercase; letter-spacing:0.5px">
                    {{ s.label }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Requests table column -->
          <div class="col-lg-8">
            <div class="ibox">
              <div class="ibox-title">
                <h5>
                  <i class="fa-solid fa-clock-rotate-left" style="color:#1c84c6"></i>
                  Request History
                </h5>
                <div class="ibox-tools">
                  <button
                    class="btn btn-xs btn-white border"
                    title="Refresh"
                    @click="fetchRequests"
                    style="padding: 2px 8px; font-size:12px"
                  >
                    <i class="fa-solid fa-rotate-right"></i>
                  </button>
                </div>
              </div>
              <div class="ibox-content no-padding">
                <div v-if="loadingRequests" class="text-center p-5">
                  <div class="spinner-border" style="color:#1c84c6"></div>
                </div>

                <div
                  v-else-if="requests.length === 0"
                  class="text-center p-5 text-muted"
                >
                  <i class="fa-solid fa-inbox fa-2x mb-3 d-block" style="color:#dee2e6"></i>
                  No requests yet — submit your first one!
                </div>

                <div v-else class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Days</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="req in requests" :key="req.id">
                        <td class="text-muted">{{ req.id }}</td>
                        <td>{{ formatDate(req.startDate) }}</td>
                        <td>{{ formatDate(req.endDate) }}</td>
                        <td>
                          <span class="badge bg-secondary">
                            {{ dayCount(req.startDate, req.endDate) }}d
                          </span>
                        </td>
                        <td style="max-width:140px">
                          <span class="text-truncate d-block text-muted">
                            {{ req.reason || "—" }}
                          </span>
                        </td>
                        <td>
                          <span :class="`badge-${req.status.toLowerCase()}`">
                            {{ req.status }}
                          </span>
                        </td>
                        <td style="max-width:140px">
                          <span class="text-truncate d-block text-muted">
                            {{ req.comments || "—" }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { vacationsApi, usersApi } from "../api";
import type { VacationRequest } from "../types";
import { RequestStatus } from "../types";
import { useToast } from "../composables/useToast";
import { useDateFormat } from "../composables/useDateFormat";

const props = defineProps<{ userId: number }>();

const toast = useToast();
const { formatDate, dayCount } = useDateFormat();
const userName = ref("Loading…");
const requests = ref<VacationRequest[]>([]);
const loadingRequests = ref(false);
const submitting = ref(false);
const activeSection = ref<"form" | "list">("form");

const form = ref({ startDate: "", endDate: "", reason: "" });
const formErrors = ref({ startDate: "", endDate: "" });

const today = new Date().toISOString().slice(0, 10);

// ── Computed ───────────────────────────────────────────────

const miniStats = computed(() => [
  {
    label: "Pending",
    value: requests.value.filter((r) => r.status === RequestStatus.PENDING).length,
    color: "#f8ac59",
  },
  {
    label: "Approved",
    value: requests.value.filter((r) => r.status === RequestStatus.APPROVED).length,
    color: "#1c84c6",
  },
  {
    label: "Rejected",
    value: requests.value.filter((r) => r.status === RequestStatus.REJECTED).length,
    color: "#ed5565",
  },
]);

// ── Helpers ────────────────────────────────────────────────

function validate(): boolean {
  formErrors.value = { startDate: "", endDate: "" };
  let ok = true;
  if (!form.value.startDate) {
    formErrors.value.startDate = "Start date is required";
    ok = false;
  }
  if (!form.value.endDate) {
    formErrors.value.endDate = "End date is required";
    ok = false;
  } else if (form.value.endDate < form.value.startDate) {
    formErrors.value.endDate = "End date must be on or after start date";
    ok = false;
  }
  return ok;
}

// ── Actions ────────────────────────────────────────────────

async function submitRequest() {
  if (!validate()) return;
  submitting.value = true;
  try {
    await vacationsApi.create({
      userId: props.userId,
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      reason: form.value.reason || undefined,
    });
    form.value = { startDate: "", endDate: "", reason: "" };
    toast.success("Vacation request submitted successfully!");
    activeSection.value = "list";
    await fetchRequests();
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
    toast.error(msg ?? "Failed to submit request. Please try again.");
  } finally {
    submitting.value = false;
  }
}

async function fetchRequests() {
  loadingRequests.value = true;
  try {
    const res = await vacationsApi.getByUser(props.userId);
    requests.value = res.data;
  } catch {
    toast.error("Could not load your requests.");
  } finally {
    loadingRequests.value = false;
  }
}

async function fetchUserName() {
  try {
    const res = await usersApi.getById(props.userId);
    userName.value = res.data.name ?? "Unknown";
  } catch {
    userName.value = "Unknown";
  }
}

onMounted(async () => {
  await fetchUserName();
  await fetchRequests();
});
</script>
