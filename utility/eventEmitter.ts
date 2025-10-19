import EventEmitter from "eventemitter3";

export const eventEmitter = new EventEmitter();

export const NotificationEvent = "notificationEvent";
export const ConfirmationEvent = "confirmationEvent";
