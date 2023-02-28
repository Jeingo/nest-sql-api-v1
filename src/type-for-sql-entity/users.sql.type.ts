export type UsersSqlType = {
  id: number;
  login: string;
  hash: string;
  email: string;
  createdAt: Date;
  passwordRecoveryCode: string;
  passwordRecoveryExpirationDate: Date;
  passwordRecoveryIsConfirmed: boolean;
  emailConfirmationCode: string;
  emailExpirationDate: Date;
  emailIsConfirmed: boolean;
  isBanned: boolean;
  banDate: Date;
  banReason: string;
};
