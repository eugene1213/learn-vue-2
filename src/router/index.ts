import { createRouter, createWebHistory } from 'vue-router'

import BudgetManagementPage from '@/pages/BudgetManagementPage.vue'
import DashboardPage from '@/pages/DashboardPage.vue'
import NotFoundPage from '@/pages/NotFoundPage.vue'
import ScheduleManagementPage from '@/pages/ScheduleManagementPage.vue'
import SettingsPage from '@/pages/SettingsPage.vue'
import TripCreatePage from '@/pages/TripCreatePage.vue'
import TripDetailPage from '@/pages/TripDetailPage.vue'
import TripListPage from '@/pages/TripListPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: DashboardPage,
    },
    {
      path: '/trips',
      name: 'trips',
      component: TripListPage,
    },
    {
      path: '/trips/new',
      name: 'trip-create',
      component: TripCreatePage,
    },
    {
      path: '/trips/:tripId',
      name: 'trip-detail',
      component: TripDetailPage,
    },
    {
      path: '/trips/:tripId/schedule',
      name: 'trip-schedule',
      component: ScheduleManagementPage,
    },
    {
      path: '/trips/:tripId/budget',
      name: 'trip-budget',
      component: BudgetManagementPage,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsPage,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundPage,
    },
  ],
})

export default router
