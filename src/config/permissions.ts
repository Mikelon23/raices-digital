import { Role, Roles } from "./roles";

export function canManageUsers(role: Role): boolean {
  return role === Roles.ADMIN;
}

export function canManageCommunities(role: Role): boolean {
  return role === Roles.ADMIN;
}

export function canViewDashboard(role: Role): boolean {
  return role !== Roles.VIEWER;
}

export function canCreatePriceQuote(role: Role): boolean {
  return [
    Roles.ADMIN,
    Roles.COMMUNITY_AGENT,
    Roles.PRODUCER,
  ].includes(role);
}

export function canCreateHealthReferral(role: Role): boolean {
  return [
    Roles.ADMIN,
    Roles.COMMUNITY_AGENT,
    Roles.HEALTH_AGENT,
  ].includes(role);
}

export function canUpdateHealthFacilities(role: Role): boolean {
  return [Roles.ADMIN, Roles.HEALTH_AGENT].includes(role);
}

export function canCreateSellListing(role: Role): boolean {
  return [
    Roles.ADMIN,
    Roles.COMMUNITY_AGENT,
    Roles.PRODUCER,
  ].includes(role);
}

export function canCreateBuyListing(role: Role): boolean {
  return [
    Roles.ADMIN,
    Roles.COMMUNITY_AGENT,
    Roles.BUYER,
  ].includes(role);
}

export function canCreateKnowledgeContent(role: Role): boolean {
  return [Roles.ADMIN, Roles.MENTOR, Roles.COMMUNITY_AGENT].includes(role);
}

export function canViewAuditLogs(role: Role): boolean {
  return role === Roles.ADMIN;
}