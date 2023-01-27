import type { RouteRecordNormalized } from "vue-router";

export type RouteMiddlewareFunction = (route: RouteRecordNormalized) => boolean
