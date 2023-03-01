CREATE TABLE "Blogs"
(
    id serial NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL,
    "websiteUrl" character varying NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "isMembership" boolean NOT NULL,
    "isBanned" boolean NOT NULL,
    "banDate" timestamp with time zone,
    "userId" integer NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("userId")
        REFERENCES "Users" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE IF EXISTS "Blogs"
    OWNER to admin;