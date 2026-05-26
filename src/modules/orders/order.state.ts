import { ORDER_STATUS } from "./order.constants";

export const ORDER_TRANSITIONS: Record<string, string[]> = {
  [ORDER_STATUS.PENDING]: [
    ORDER_STATUS.ACCEPTED,
    ORDER_STATUS.CANCELLED,
  ],

  [ORDER_STATUS.ACCEPTED]: [
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.CANCELLED,
  ],

  [ORDER_STATUS.PREPARING]: [
    ORDER_STATUS.PICKED_UP,
  ],

  [ORDER_STATUS.PICKED_UP]: [
    ORDER_STATUS.ON_WAY,
  ],

  [ORDER_STATUS.ON_WAY]: [
    ORDER_STATUS.DELIVERED,
  ],

  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

// ✅ THIS IS WHAT WAS MISSING
export function canTransition(from: string, to: string): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}