-- Table: public.blocktransactions

-- DROP TABLE IF EXISTS public.blocktransactions;

CREATE TABLE IF NOT EXISTS public.blocktransactions
(
    pk bigint NOT NULL DEFAULT nextval('blocktransactions_pk_seq'::regclass),
    opreturn character varying COLLATE pg_catalog."default",
    txid character varying COLLATE pg_catalog."default",
    txhash character varying COLLATE pg_catalog."default",
    blockhash character varying COLLATE pg_catalog."default",
    CONSTRAINT blocktransactions_pkey PRIMARY KEY (pk)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.blocktransactions
    OWNER to postgres;