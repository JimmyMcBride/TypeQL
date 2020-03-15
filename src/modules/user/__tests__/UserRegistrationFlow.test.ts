import { Connection } from "typeorm";

import { testConn } from "../../../test-utils/testConn";
import { gCall } from "../../../test-utils/gCall";
import { User } from "../../../entity/User";

import { sendTestToken } from "../../../test-utils/sendTestToken";
import {
  createTestConfirmationToken,
  createTestForgotPasswordToken,
} from "../../../test-utils/createTestConfirmationToken";

import faker from "faker";

let conn: Connection;
beforeAll(async () => {
  conn = await testConn();
});
afterAll(async () => {
  await conn.close();
});

const fakeUser = {
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
};

const registerMutation = `
  mutation Register($data: RegisterInput!) {
    register(data: $data) {
      id
      firstName
      lastName
      name
      email
    }
  }
`;

const confirmUserMutation = `
  mutation ConfirmUser($token: String!) {
    confirmUser(token: $token)
  }
`;

const loginMutation = `
  mutation Login($email: String! $password: String!) {
  login(email: $email, password: $password) {
    id
    firstName
    lastName
    name
    email
  }
}
`;

const logoutMutation = `
  mutation Logout {
  logout
}
`;

const changePasswordMutation = `
  mutation ChangePassword($data: ChangePasswordInput!) {
    changePassword(data: $data)
  }
`;

describe("User registration 📔", () => {
  it("Creates a new user 🔥", async () => {
    const response = await gCall({
      source: registerMutation,
      variableValues: {
        data: fakeUser,
      },
    });

    expect(response).toMatchObject({
      data: {
        register: {
          firstName: fakeUser.firstName,
          lastName: fakeUser.lastName,
          email: fakeUser.email,
        },
      },
    });

    const dbUser = await User.findOne({
      where: {
        email: fakeUser.email,
      },
    });

    expect(dbUser).toBeDefined();
    expect(dbUser!.confirmed).toBeFalsy();
    expect(dbUser!.firstName).toBe(fakeUser.firstName);
    expect(dbUser!.lastName).toBe(fakeUser.lastName);
    expect(dbUser!.email).toBe(fakeUser.email);
  });
});

describe("Email confirmation 🏁", () => {
  it("confirms a new user ✔️", async () => {
    const dbUser = await User.findOne({
      where: {
        email: fakeUser.email,
      },
    });

    const userToken = await sendTestToken(
      fakeUser.email,
      await createTestConfirmationToken(dbUser!.id)
    );

    const response = await gCall({
      source: confirmUserMutation,
      variableValues: {
        token: userToken,
      },
    });

    expect(response).toMatchObject({
      data: {
        confirmUser: true,
      },
    });
  });
});

describe("Login 🌞", () => {
  it("logs current user in 🕶", async () => {
    const dbUser = await User.findOne({
      where: {
        email: fakeUser.email,
      },
    });

    const login = await gCall({
      source: loginMutation,
      variableValues: {
        email: fakeUser.email,
        password: fakeUser.password,
      },
    });

    expect(login).toMatchObject({
      data: {
        login: {
          id: `${dbUser!.id}`,
          firstName: fakeUser.firstName,
          lastName: fakeUser.lastName,
          name: `${fakeUser.firstName} mother fuckin' ${fakeUser.lastName}! 🔥💀`,
          email: fakeUser.email,
        },
      },
    });

    expect(dbUser).toBeDefined();
    expect(dbUser!.confirmed).toBeTruthy();
    expect(dbUser!.firstName).toBe(fakeUser.firstName);
    expect(dbUser!.lastName).toBe(fakeUser.lastName);
    expect(dbUser!.email).toBe(fakeUser.email);
    expect(dbUser?.name(dbUser)).toBe(
      `${fakeUser.firstName} mother fuckin' ${fakeUser.lastName}! 🔥💀`
    );
  });
});

describe("Logout", () => {
  it("logs current user out 🏃", async () => {
    const logout = await gCall({
      source: logoutMutation,
    });

    expect(logout).toMatchObject({
      data: null,
    });
  });
});

describe("Change user password 🔑", () => {
  it("Allows user to securely change their password. 🔐", async () => {
    const dbUser = await User.findOne({
      where: {
        email: fakeUser.email,
      },
    });

    const userToken = await sendTestToken(
      fakeUser.email,
      await createTestForgotPasswordToken(dbUser!.id)
    );

    const response = await gCall({
      source: changePasswordMutation,
      variableValues: {
        data: {
          token: userToken,
          password: "newPassword",
        },
      },
    });

    expect(response).toMatchObject({
      data: {
        changePassword: "Password successfully changed! 🔥",
      },
    });
  });
});
