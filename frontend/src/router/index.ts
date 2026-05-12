import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import RequesterView from "../views/RequesterView.vue";
import ValidatorView from "../views/ValidatorView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/requester/:userId",
      name: "requester",
      component: RequesterView,
      props: (route) => ({ userId: Number(route.params.userId) }),
    },
    {
      path: "/validator",
      name: "validator",
      component: ValidatorView,
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

export default router;
