import { buildSchema } from "type-graphql";
import {
  ChangePasswordResolver,
  ConfirmUserResolver,
  ForgotPasswordResolver,
  LoginResolver,
  LogoutResolver,
  CurrentUserResolver,
  RegisterResolver,
  ProfilePictureResolver,
  CreateUserResolver,
} from "../modules/user";

export const createSchema = () =>
  buildSchema({
    resolvers: [
      ChangePasswordResolver,
      ConfirmUserResolver,
      ForgotPasswordResolver,
      LoginResolver,
      LogoutResolver,
      CurrentUserResolver,
      RegisterResolver,
      CreateUserResolver,
      ProfilePictureResolver,
    ],
    authChecker: ({ context: { req } }) => {
      return !!req.session.userId;
    },
  });
