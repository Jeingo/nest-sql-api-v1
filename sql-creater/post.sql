CREATE TABLE "Posts"
(
    id serial NOT NULL,
    title character varying NOT NULL,
    "shortDescription" character varying NOT NULL,
    content character varying NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "blogId" integer NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("blogId")
        REFERENCES "Blogs" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE IF EXISTS "Posts"
    OWNER to admin;