export const ORDER_EVENTS = {
  CREATED: "order_created",
  PENDING: "order_pending",
  ACCEPTED: "order_accepted",
  PREPARING: "order_preparing",
  PICKED_UP: "order_picked_up",
  ON_WAY: "order_on_way",
  DELIVERED: "order_delivered",
  CANCELLED: "order_cancelled",
} as const;

export type OrderEvent =
  typeof ORDER_EVENTS[keyof typeof ORDER_EVENTS];