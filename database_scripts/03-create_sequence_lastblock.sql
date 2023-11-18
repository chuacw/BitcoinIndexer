-- SEQUENCE: public.lastblock_pk_seq

-- DROP SEQUENCE IF EXISTS public.lastblock_pk_seq;

CREATE SEQUENCE IF NOT EXISTS public.lastblock_pk_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1
    OWNED BY lastblock.pk;

ALTER SEQUENCE public.lastblock_pk_seq
    OWNER TO postgres;