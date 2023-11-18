-- Table: public.lastblock

-- DROP TABLE IF EXISTS public.lastblock;

CREATE TABLE IF NOT EXISTS public.lastblock
(
    pk bigint NOT NULL DEFAULT nextval('lastblock_pk_seq'::regclass),
    blocknumber bigint,
    voindex bigint,
    txindex bigint,
    CONSTRAINT lastblock_pkey PRIMARY KEY (pk)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.lastblock
    OWNER to postgres;