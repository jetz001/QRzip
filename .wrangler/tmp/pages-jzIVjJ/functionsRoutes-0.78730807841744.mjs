import { onRequestPost as __api_admin_members__id__ban_js_onRequestPost } from "D:\\DEV\\QRZIP\\functions\\api\\admin\\members\\[id]\\ban.js"
import { onRequestDelete as __api_admin_members__id__js_onRequestDelete } from "D:\\DEV\\QRZIP\\functions\\api\\admin\\members\\[id].js"
import { onRequestPut as __api_admin_members__id__js_onRequestPut } from "D:\\DEV\\QRZIP\\functions\\api\\admin\\members\\[id].js"
import { onRequestPost as __api_admin_login_js_onRequestPost } from "D:\\DEV\\QRZIP\\functions\\api\\admin\\login.js"
import { onRequestGet as __api_admin_members_index_js_onRequestGet } from "D:\\DEV\\QRZIP\\functions\\api\\admin\\members\\index.js"
import { onRequestGet as __api_admin_overview_js_onRequestGet } from "D:\\DEV\\QRZIP\\functions\\api\\admin\\overview.js"
import { onRequestGet as __api_admin_refs_js_onRequestGet } from "D:\\DEV\\QRZIP\\functions\\api\\admin\\refs.js"
import { onRequestGet as __api_member_history_js_onRequestGet } from "D:\\DEV\\QRZIP\\functions\\api\\member\\history.js"
import { onRequestGet as __api_member_list_js_onRequestGet } from "D:\\DEV\\QRZIP\\functions\\api\\member\\list.js"
import { onRequestPost as __api_member_signup_js_onRequestPost } from "D:\\DEV\\QRZIP\\functions\\api\\member\\signup.js"
import { onRequestGet as __api_get__id__js_onRequestGet } from "D:\\DEV\\QRZIP\\functions\\api\\get\\[id].js"
import { onRequestGet as __api_health_js_onRequestGet } from "D:\\DEV\\QRZIP\\functions\\api\\health.js"
import { onRequestPost as __api_store_js_onRequestPost } from "D:\\DEV\\QRZIP\\functions\\api\\store.js"

export const routes = [
    {
      routePath: "/api/admin/members/:id/ban",
      mountPath: "/api/admin/members/:id",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_members__id__ban_js_onRequestPost],
    },
  {
      routePath: "/api/admin/members/:id",
      mountPath: "/api/admin/members",
      method: "DELETE",
      middlewares: [],
      modules: [__api_admin_members__id__js_onRequestDelete],
    },
  {
      routePath: "/api/admin/members/:id",
      mountPath: "/api/admin/members",
      method: "PUT",
      middlewares: [],
      modules: [__api_admin_members__id__js_onRequestPut],
    },
  {
      routePath: "/api/admin/login",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_login_js_onRequestPost],
    },
  {
      routePath: "/api/admin/members",
      mountPath: "/api/admin/members",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_members_index_js_onRequestGet],
    },
  {
      routePath: "/api/admin/overview",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_overview_js_onRequestGet],
    },
  {
      routePath: "/api/admin/refs",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_refs_js_onRequestGet],
    },
  {
      routePath: "/api/member/history",
      mountPath: "/api/member",
      method: "GET",
      middlewares: [],
      modules: [__api_member_history_js_onRequestGet],
    },
  {
      routePath: "/api/member/list",
      mountPath: "/api/member",
      method: "GET",
      middlewares: [],
      modules: [__api_member_list_js_onRequestGet],
    },
  {
      routePath: "/api/member/signup",
      mountPath: "/api/member",
      method: "POST",
      middlewares: [],
      modules: [__api_member_signup_js_onRequestPost],
    },
  {
      routePath: "/api/get/:id",
      mountPath: "/api/get",
      method: "GET",
      middlewares: [],
      modules: [__api_get__id__js_onRequestGet],
    },
  {
      routePath: "/api/health",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_health_js_onRequestGet],
    },
  {
      routePath: "/api/store",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_store_js_onRequestPost],
    },
  ]