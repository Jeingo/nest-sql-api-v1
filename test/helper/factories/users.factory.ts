import { InputCreateUserDto } from '../../../src/superadmin/users/api/dto/input.create.user.dto';
import { TestPairToken, TestStringID } from '../types/test.type';
import request from 'supertest';
import { superAdminLogin, superAdminPassword } from '../auth/basic.auth';
import {
  authLoginPath,
  superAdminUsersPath
} from '../paths-to-endpoints/paths';

export const createUsers = (count: number): InputCreateUserDto[] => {
  const users: InputCreateUserDto[] = [];
  for (let i = 0; i < count; i++) {
    const user: InputCreateUserDto = {
      login: `login${i}`,
      email: `email${i}@gmail.com`,
      password: `password${i}`
    };
    users.push(user);
  }
  return users;
};

export const createUser = (): InputCreateUserDto => {
  return {
    login: `login`,
    email: `email@gmail.com`,
    password: `password`
  };
};

export const saveUser = async (
  app: any,
  user: InputCreateUserDto
): Promise<TestStringID> => {
  const response = await request(app)
    .post(superAdminUsersPath)
    .auth(superAdminLogin, superAdminPassword)
    .send(user);
  return response.body.id;
};

export const saveUsers = async (
  app: any,
  users: InputCreateUserDto[]
): Promise<TestStringID[]> => {
  const ids: TestStringID[] = [];
  for (let i = 0; i < users.length; i++) {
    const response = await request(app)
      .post(superAdminUsersPath)
      .auth(superAdminLogin, superAdminPassword)
      .send(users[i]);
    ids.push(response.body.id);
  }
  return ids;
};

export const loginAndGetPairToken = async (
  app: any,
  user: InputCreateUserDto
): Promise<TestPairToken> => {
  const response = await request(app).post(authLoginPath).send({
    loginOrEmail: user.login,
    password: user.password
  });
  const accessToken = response.body.accessToken;
  const refreshToken = response.headers['set-cookie'][0].split(';')[0];
  return {
    accessToken: accessToken,
    refreshToken: refreshToken
  };
};

export const loginAndGetPairTokens = async (
  app: any,
  users: InputCreateUserDto[]
): Promise<TestPairToken[]> => {
  const pairTokens: TestPairToken[] = [];
  for (let i = 0; i < users.length; i++) {
    const response = await request(app).post(authLoginPath).send({
      loginOrEmail: users[i].login,
      password: users[i].password
    });
    const accessToken = response.body.accessToken;
    const refreshToken = response.headers['set-cookie'][0].split(';')[0];
    pairTokens.push({
      accessToken: accessToken,
      refreshToken: refreshToken
    });
  }
  return pairTokens;
};
