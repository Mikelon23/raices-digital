export const Roles = {
  ADMIN: "ADMIN",
  COMMUNITY_AGENT: "COMMUNITY_AGENT",
  HEALTH_AGENT: "HEALTH_AGENT",
  PRODUCER: "PRODUCER",
  BUYER: "BUYER",
  MENTOR: "MENTOR",
  VIEWER: "VIEWER",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

export const CommunityRoles = {
  OWNER: "OWNER",
  AGENT: "AGENT",
  MEMBER: "MEMBER",
} as const;

export type CommunityRole =
  (typeof CommunityRoles)[keyof typeof CommunityRoles];

export const ListingTypes = {
  BUY: "BUY",
  SELL: "SELL",
} as const;

export type ListingType = (typeof ListingTypes)[keyof typeof ListingTypes];

export const ListingStatus = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  CANCELLED: "CANCELLED",
} as const;

export type ListingStatusType =
  (typeof ListingStatus)[keyof typeof ListingStatus];

export const ReferralStatus = {
  OPEN: "OPEN",
  URGENT: "URGENT",
  ATTENDED: "ATTENDED",
  CLOSED: "CLOSED",
} as const;

export type ReferralStatusType =
  (typeof ReferralStatus)[keyof typeof ReferralStatus];