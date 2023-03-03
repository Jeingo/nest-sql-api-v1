CREATE TABLE "CommentLikes"
(
    id serial NOT NULL,
    "myStatus" character varying NOT NULL,
    "commentId" integer NOT NULL,
    "userId" integer NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("commentId")
        REFERENCES "Comments" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    FOREIGN KEY ("userId")
        REFERENCES "Users" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE IF EXISTS "CommentLikes"
    OWNER to admin;