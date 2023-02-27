CREATE TABLE public."Users2"
(
    id serial NOT NULL,
    login character varying NOT NULL,
    hash character varying NOT NULL,
    email character varying NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "passwordRecoveryCode" uuid,
    "passwordRecoveryExpirationDate" timestamp with time zone,
    "passwordRecoveryIsConfirmed" boolean NOT NULL,
    "emailConfirmationCode" uuid NOT NULL,
    "emailExpirationDate" timestamp with time zone NOT NULL,
    "emailIsConfirmed" boolean NOT NULL,
    "isBanned" boolean NOT NULL,
    "banDate" timestamp with time zone,
    "banReason" character varying,
    PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public."Users2"
    OWNER to admin;