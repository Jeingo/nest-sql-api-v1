CREATE TABLE "Users_Blogs_Ban"
(
    "banDate" timestamp with time zone NOT NULL,
    "banReason" character varying NOT NULL,
    "blogId" integer NOT NULL,
    "userId" integer NOT NULL,
    FOREIGN KEY ("blogId")
        REFERENCES "Blogs" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    FOREIGN KEY ("userId")
        REFERENCES "Users" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE IF EXISTS "Users_Blogs_Ban"
    OWNER to admin;