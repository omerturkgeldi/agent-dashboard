import { api } from "./client";
import type { DashboardSummary } from "./types";

export const getDashboardSummary = () => api<DashboardSummary>("/dashboard/summary");
