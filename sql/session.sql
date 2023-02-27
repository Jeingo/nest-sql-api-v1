CREATE TABLE public."Session"
(
    id serial NOT NULL,
    "issueAt" timestamp with time zone NOT NULL,
    "deviceId" uuid NOT NULL,
    "deviceName" character varying NOT NULL,
    ip character varying NOT NULL,
    "userId" integer NOT NULL,
    "expireAt" timestamp with time zone NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE IF EXISTS public."Session"
    OWNER to admin;