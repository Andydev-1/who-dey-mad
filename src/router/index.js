import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/game",
      name: "game",
      component: () => import("../views/GameView.vue"),
    },
    {
      path: "/result",
      name: "result",
      component: () => import("../views/ResultView.vue"),
    },
    {
      path: "/friends",
      name: "friends",
      component: () => import("../views/FriendsView.vue"),
    },
    {
      path: "/daily",
      name: "daily",
      component: () => import("../views/DailyView.vue"),
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
