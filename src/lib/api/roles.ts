import { api } from "./client";
import type { Role } from "./types";

export const getRoles = () => api<Role[]>("/roles");
