import { Resolver, Mutation, Arg } from "type-graphql";
import { v4 } from "uuid";

import { sendEmail } from "../utils/sendEmail";
import { User } from "../../entity/User";
import { redis } from "../../redis";
import { forgotPasswordPrefix } from "../constants/redisPrefixes";

@Resolver()
export class ForgotPasswordResolver {
  @Mutation(() => String!)
  async forgotPassword(@Arg("email") email: string): Promise<string> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return "Email was not found. 🤷‍♂";
    }

    const token = v4();
    await redis.set(forgotPasswordPrefix + token, user.id, "ex", 60 * 60 * 24); // 1 day expiration

    await sendEmail(
      email,
      `http://localhost:3000/user/change-password/${token}`
    );

    return "Email has been sent! Please click on the link sent to you to change your password. 📫";
  }
}
