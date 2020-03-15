import { v4 } from "uuid";
import { redis } from "../redis";
import {
  confirmUserPrefix,
  forgotPasswordPrefix,
} from "../modules/constants/redisPrefixes";

export const createTestConfirmationToken = async (userId: number) => {
  const token = v4();
  await redis.set(confirmUserPrefix + token, userId, "ex", 60 * 60 * 24); // 1 day expiration

  return token;
};

export const createTestForgotPasswordToken = async (userId: number) => {
  const token = v4();
  await redis.set(forgotPasswordPrefix + token, userId, "ex", 60 * 60 * 24); // 1 day expiration

  return token;
};
