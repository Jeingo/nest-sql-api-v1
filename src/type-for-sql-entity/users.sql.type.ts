export type UsersSqlType = {
  id: number;
  login: string;
  hash: string;
  email: string;
  createdAt: Date;
  passwordRecoveryCode: string | null;
  passwordRecoveryExpirationDate: Date | null;
  passwordRecoveryIsConfirmed: boolean;
  emailConfirmationCode: string;
  emailExpirationDate: Date;
  emailIsConfirmed: boolean;
  isBanned: boolean;
  banDate: Date | null;
  banReason: string | null;
};
