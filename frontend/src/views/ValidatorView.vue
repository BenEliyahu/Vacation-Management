<template>
  <div id="wrapper">
    <!-- ── Sidebar ──────────────────────────────────────── -->
    <aside class="nav-side">
      <router-link to="/" class="brand">
        <i class="fa-solid fa-umbrella-beach"></i>VacationMgr
      </router-link>

      <div class="profile-element">
        <span class="user-name">Manager</span>
        <span class="user-role">Validator</span>
      </div>

      <nav>
        <ul>
          <li class="active">
            <a href="#">
              <i class="fa-solid fa-gauge-high"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a href="#" @click.prevent="setFilter('all')">
              <i class="fa-solid fa-list"></i>
              <span>All Requests</span>
            </a>
          </li>
          <li>
            <a href="#" @click.prevent="setFilter('Pending')">
              <i class="fa-solid fa-clock"></i>
              <span>Pending</span>
              <span
                v-if="countByStatus('Pending')"
                class="ms-auto badge rounded-pill"
                style="background:#f8ac59; font-size:11px"
              >
                {{ countByStatus("Pending") }}
              </span>
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
          <i class="fa-solid fa-gauge-high me-2" style="color:#19aa8d"></i>
          Validator Dashboard
        </h2>
      </div>

      <div class="wrapper-content">

        <!-- ── Stat boxes ──────────────────────────────── -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-xl-3" v-for="s in stats" :key="s.label">
            <div class="ibox mb-0">
              <div class="stat-box">
                <div class="icon" :style="`background: ${s.color}`">
                  <i :class="`fa-solid ${s.icon}`"></i>
                </div>
                <div>
                  <div class="count">{{ s.value }}</div>
                  <div class="label-text">{{ s.label }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Requests ibox ───────────────────────────── -->
        <div class="ibox">
          <div class="ibox-title">
            <h5>
              <i class="fa-solid fa-clipboard-list" style="color:#19aa8d"></i>
              Vacation Requests
            </h5>
            <div class="ibox-tools d-flex align-items-center gap-2">
              <!-- Filter tabs -->
              <div class="d-flex gap-1 flex-wrap">
                <button
                  v-for="f in filterOptions"
                  :key="f.value"
                  class="filter-tab"
                  :class="activeFilter === f.value ? `tab-${f.value.toLowerCase()}` : ''"
                  @click="setFilter(f.value)"
                >
                  {{ f.label }}
                  <span style="opacity:0.75">({{ countByStatus(f.value) }})</span>
                </button>
              </div>
              <button
                class="btn btn-xs btn-white border"
                style="padding:2px 8px; font-size:12px"
                title="Refresh"
                @click="fetchAll"
              >
                <i class="fa-solid fa-rotate-right"></i>
              </button>
            </div>
          </div>

          <div class="ibox-content no-padding">
            <div v-if="loading" class="text-center p-5">
              <div class="spinner-border" style="color:#19aa8d"></div>
            </div>

            <div
              v-else-if="filtered.length === 0"
              class="text-center p-5 text-muted"
            >
              <i class="fa-solid fa-inbox fa-2x mb-3 d-block" style="color:#dee2e6"></i>
              No requests found for this filter.
            </div>

            <div v-else class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Employee</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th class="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="req in filtered" :key="req.id">
                    <td class="text-muted">{{ req.id }}</td>
                    <td>
                      <strong>{{ req.user?.name }}</strong>
                      <br />
                      <small class="text-muted">{{ req.user?.role }}</small>
                    </td>
                    <td>{{ formatDate(req.startDate) }}</td>
                    <td>{{ formatDate(req.endDate) }}</td>
                    <td>
                      <span class="badge bg-secondary">
                        {{ dayCount(req.startDate, req.endDate) }}d
                      </span>
                    </td>
                    <td style="max-width:130px">
                      <span class="text-truncate d-block text-muted">
                        {{ req.reason || "—" }}
                      </span>
                    </td>
                    <td>
                      <span :class="`badge-${req.status.toLowerCase()}`">
                        {{ req.status }}
                      </span>
                      <div
                        v-if="req.comments"
                        class="text-muted mt-1"
                        style="font-size:11px; max-width:120px"
                      >
                        <i class="fa-solid fa-comment-dots me-1"></i>
                        <span class="text-truncate d-inline-block" style="vertical-align:middle; max-width:100px">
                          {{ req.comments }}
                        </span>
                      </div>
                    </td>
                    <td class="text-muted" style="font-size:12px">
                      {{ formatDate(req.createdAt.slice(0, 10)) }}
                    </td>
                    <td class="text-center" style="white-space:nowrap">
                      <template v-if="req.status === 'Pending'">
                        <button
                          class="btn btn-xs btn-success me-1"
                          style="padding:3px 10px"
                          title="Approve"
                          :disabled="actionId === req.id"
                          @click="approve(req.id)"
                        >
                          <i class="fa-solid fa-check"></i> Approve
                        </button>
                        <button
                          class="btn btn-xs btn-danger"
                          style="padding:3px 10px"
                          title="Reject"
                          :disabled="actionId === req.id"
                          @click="openRejectModal(req)"
                        >
                          <i class="fa-solid fa-ban"></i> Reject
                        </button>
                      </template>
                      <span v-else class="text-muted">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ── Reject modal ──────────────────────────────────── -->
    <div class="modal fade" id="rejectModal" tabindex="-1" ref="modalEl">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0" style="box-shadow: 0 4px 20px rgba(0,0,0,.2)">
          <div class="modal-header" style="background:#ed5565; color:#fff">
            <h5 class="modal-title">
              <i class="fa-solid fa-ban me-2"></i>Reject Request
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted mb-3" style="font-size:13px">
              Rejecting request from
              <strong>{{ selectedRequest?.user?.name }}</strong>
              ({{ selectedRequest ? formatDate(selectedRequest.startDate) : "" }} –
              {{ selectedRequest ? formatDate(selectedRequest.endDate) : "" }})
            </p>
            <label class="form-label">
              Rejection reason <span class="text-danger">*</span>
            </label>
            <textarea
              v-model="rejectComment"
              class="form-control"
              :class="{ 'is-invalid': rejectError }"
              rows="4"
              placeholder="Explain why this request is being rejected…"
              maxlength="1000"
              @input="rejectError = ''"
            ></textarea>
            <div class="invalid-feedback">{{ rejectError }}</div>
            <small class="text-muted d-block text-end">{{ rejectComment.length }}/1000</small>
          </div>
          <div class="modal-footer">
            <button class="btn btn-white border" @click="closeModal">Cancel</button>
            <button
              class="btn btn-danger"
              :disabled="rejecting"
              @click="confirmReject"
            >
              <span v-if="rejecting">
                <span class="spinner-border spinner-border-sm me-1"></span>Rejecting…
              </span>
              <span v-else>
                <i class="fa-solid fa-ban me-1"></i>Reject
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { vacationsApi } from "../api";
import type { VacationRequest } from "../types";
import { RequestStatus } from "../types";
import { useToast } from "../composables/useToast";
import { useDateFormat } from "../composables/useDateFormat";

// Bootstrap Modal (loaded via CDN in index.html)
declare const bootstrap: {
  Modal: new (el: Element) => { show(): void; hide(): void };
};

const toast = useToast();
const { formatDate, dayCount } = useDateFormat();
const allRequests = ref<VacationRequest[]>([]);
const loading = ref(false);
const activeFilter = ref("all");
const actionId = ref<number | null>(null);

const selectedRequest = ref<VacationRequest | null>(null);
const rejectComment = ref("");
const rejectError = ref("");
const rejecting = ref(false);
const modalEl = ref<Element | null>(null);
let bsModal: ReturnType<typeof bootstrap.Modal> | null = null;

// ── Filter options ─────────────────────────────────────────

const filterOptions = [
  { label: "All",      value: "all"                  },
  { label: "Pending",  value: RequestStatus.PENDING   },
  { label: "Approved", value: RequestStatus.APPROVED  },
  { label: "Rejected", value: RequestStatus.REJECTED  },
];

const filtered = computed(() =>
  activeFilter.value === "all"
    ? allRequests.value
    : allRequests.value.filter((r) => r.status === activeFilter.value)
);

function countByStatus(val: string) {
  if (val === "all") return allRequests.value.length;
  return allRequests.value.filter((r) => r.status === val).length;
}

// ── Stat boxes ─────────────────────────────────────────────

const stats = computed(() => [
  {
    label: "Total",
    value: allRequests.value.length,
    icon: "fa-calendar-days",
    color: "#1a7ebf",
  },
  {
    label: "Pending",
    value: allRequests.value.filter((r) => r.status === RequestStatus.PENDING).length,
    icon: "fa-clock",
    color: "#f8ac59",
  },
  {
    label: "Approved",
    value: allRequests.value.filter((r) => r.status === RequestStatus.APPROVED).length,
    icon: "fa-circle-check",
    color: "#19aa8d",
  },
  {
    label: "Rejected",
    value: allRequests.value.filter((r) => r.status === RequestStatus.REJECTED).length,
    icon: "fa-circle-xmark",
    color: "#ed5565",
  },
]);

// ── Helpers ────────────────────────────────────────────────

function setFilter(val: string) {
  activeFilter.value = val;
}

// ── API actions ────────────────────────────────────────────

async function fetchAll() {
  loading.value = true;
  try {
    const res = await vacationsApi.getAll();
    allRequests.value = res.data;
  } catch {
    toast.error("Could not load vacation requests.");
  } finally {
    loading.value = false;
  }
}

async function approve(id: number) {
  actionId.value = id;
  try {
    await vacationsApi.update(id, { status: "Approved" });
    toast.success("Request approved successfully.");
    await fetchAll();
  } catch {
    toast.error("Could not approve the request.");
  } finally {
    actionId.value = null;
  }
}

function openRejectModal(req: VacationRequest) {
  selectedRequest.value = req;
  rejectComment.value = "";
  rejectError.value = "";
  if (modalEl.value) {
    bsModal = new bootstrap.Modal(modalEl.value);
    bsModal.show();
  }
}

function closeModal() {
  bsModal?.hide();
  selectedRequest.value = null;
}

async function confirmReject() {
  if (!rejectComment.value.trim()) {
    rejectError.value = "A rejection reason is required.";
    return;
  }
  if (!selectedRequest.value) return;

  rejecting.value = true;
  try {
    await vacationsApi.update(selectedRequest.value.id, {
      status: "Rejected",
      comments: rejectComment.value.trim(),
    });
    closeModal();
    toast.warning("Request rejected.");
    await fetchAll();
  } catch {
    toast.error("Could not reject the request.");
  } finally {
    rejecting.value = false;
  }
}

onMounted(fetchAll);
</script>
