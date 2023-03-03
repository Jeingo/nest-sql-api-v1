CREATE TABLE "PostLikes"
(
    id serial NOT NULL,
    "myStatus" character varying NOT NULL,
    "addedAt" timestamp with time zone NOT NULL,
    "postId" integer NOT NULL,
    "userId" integer NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("postId")
        REFERENCES "Posts" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    FOREIGN KEY ("userId")
        REFERENCES "Users" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE IF EXISTS "PostLikes"
    OWNER to admin;