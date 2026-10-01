--
-- PostgreSQL database dump
--

\restrict VXfAmwacEbaNneJmGjzaG9HHrpNKxh1OYXPJ86g3n3WDLhB6eZug2NClTmFjNix

-- Dumped from database version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: work_item_status_history_from_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.work_item_status_history_from_status_enum AS ENUM (
    'RECEIVED',
    'ANALYSING',
    'READY_FOR_REVIEW',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE public.work_item_status_history_from_status_enum OWNER TO postgres;

--
-- Name: work_item_status_history_to_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.work_item_status_history_to_status_enum AS ENUM (
    'RECEIVED',
    'ANALYSING',
    'READY_FOR_REVIEW',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE public.work_item_status_history_to_status_enum OWNER TO postgres;

--
-- Name: work_items_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.work_items_status_enum AS ENUM (
    'RECEIVED',
    'ANALYSING',
    'READY_FOR_REVIEW',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE public.work_items_status_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: work_item_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_item_status_history (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    work_item_id uuid NOT NULL,
    from_status public.work_item_status_history_from_status_enum,
    to_status public.work_item_status_history_to_status_enum NOT NULL,
    reason text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.work_item_status_history OWNER TO postgres;

--
-- Name: work_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    external_id character varying NOT NULL,
    title character varying NOT NULL,
    description text NOT NULL,
    status public.work_items_status_enum DEFAULT 'RECEIVED'::public.work_items_status_enum NOT NULL,
    category character varying,
    priority character varying,
    summary text,
    recommended_action text,
    ai_error text,
    ai_attempts integer DEFAULT 0 NOT NULL,
    analysed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.work_items OWNER TO postgres;

--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1735400000000	InitSchema1735400000000
\.


--
-- Data for Name: work_item_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_item_status_history (id, work_item_id, from_status, to_status, reason, created_at) FROM stdin;
11b1b00b-f423-4a09-8bc5-5d3ebb72ff60	722d93d0-f661-48b1-b170-4356598bebf7	RECEIVED	ANALYSING	\N	2026-09-30 09:54:44.488371
2cbc1858-31c4-49a4-83bf-2d4604fe588a	722d93d0-f661-48b1-b170-4356598bebf7	ANALYSING	READY_FOR_REVIEW	\N	2026-09-30 09:54:44.51601
9e3f920f-bb1f-4285-9012-d306b04f5f37	722d93d0-f661-48b1-b170-4356598bebf7	READY_FOR_REVIEW	COMPLETED	\N	2026-09-30 09:54:50.231016
e47c830f-6cc1-4496-b98a-eb0a16834f00	9c105baa-4df8-4a0c-9d6b-8f843a810551	RECEIVED	ANALYSING	\N	2026-09-30 10:49:58.943011
c0e5edcb-bf50-428f-a2fa-5b03c2fba0de	9c105baa-4df8-4a0c-9d6b-8f843a810551	ANALYSING	READY_FOR_REVIEW	\N	2026-09-30 10:49:58.964926
28b79234-4194-4117-a3e6-190b86896a70	4d216457-6f42-423a-99ba-ded99a0d1dfb	RECEIVED	ANALYSING	\N	2026-09-30 10:49:58.977895
e26d174a-d9ae-4c9d-8266-84f282520bf3	4d216457-6f42-423a-99ba-ded99a0d1dfb	ANALYSING	READY_FOR_REVIEW	\N	2026-09-30 10:49:58.985987
8d321381-b67a-4815-9210-d205c9867c16	d28b7002-e7a3-4ddb-afb7-43b0dbbcb0f3	RECEIVED	ANALYSING	\N	2026-09-30 10:49:58.995931
b0074ff9-7df3-460b-9884-712bb027e240	d28b7002-e7a3-4ddb-afb7-43b0dbbcb0f3	ANALYSING	READY_FOR_REVIEW	\N	2026-09-30 10:49:59.002514
11071859-6d9b-4bfc-8311-18b7feac4e2c	0a019476-f9cf-4130-a27d-0eb318f47d0d	RECEIVED	ANALYSING	\N	2026-09-30 10:57:43.637651
224a734f-604f-45fa-bf8e-5e4ffd3bf046	0a019476-f9cf-4130-a27d-0eb318f47d0d	ANALYSING	READY_FOR_REVIEW	\N	2026-09-30 10:57:43.661014
46f0436c-a663-4842-aa50-34ce9d40ab6d	0a019476-f9cf-4130-a27d-0eb318f47d0d	READY_FOR_REVIEW	COMPLETED	\N	2026-09-30 10:57:45.813758
\.


--
-- Data for Name: work_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_items (id, external_id, title, description, status, category, priority, summary, recommended_action, ai_error, ai_attempts, analysed_at, created_at, updated_at) FROM stdin;
b2b165e1-becf-41c5-87ff-4276fb9eb2d5	CRM-VERIFY-1	Test	Local DB connection check	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 09:38:23.142329	2026-09-30 09:38:23.142329
722d93d0-f661-48b1-b170-4356598bebf7	CRM-222	Hello there	this is hello there work items	COMPLETED	GENERAL_INQUIRY	LOW	this is hello there work items	Review "Hello there" and follow up based on category GENERAL_INQUIRY.	\N	0	2026-09-30 09:54:44.508	2026-09-30 09:54:32.770769	2026-09-30 09:54:50.231016
79ea31d3-0c53-4d8e-9a11-586f0c4149b1	SEED-1	Item 1	desc 1	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 10:03:54.322268	2026-09-30 10:03:54.322268
9a3a469d-f80b-4bf8-b955-1c38253a5e11	SEED-2	Item 2	desc 2	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 10:03:54.339006	2026-09-30 10:03:54.339006
5ffeb00e-2b9e-4130-bcef-bf9eee3dfe92	SEED-3	Item 3	desc 3	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 10:03:54.349387	2026-09-30 10:03:54.349387
80fc2678-9e3b-4018-93bb-13a1f65aed90	SEED-4	Item 4	desc 4	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 10:03:54.361084	2026-09-30 10:03:54.361084
78883630-2781-453f-86dc-c0a3fbd95fe2	SEED-5	Item 5	desc 5	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 10:03:54.376212	2026-09-30 10:03:54.376212
85c9ec67-f2f0-401b-854f-887be9c8c600	SEED-6	Item 6	desc 6	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 10:03:54.39153	2026-09-30 10:03:54.39153
2e777aaf-bf60-4723-a1b9-8ffb78cc34c0	SEED-7	Item 7	desc 7	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 10:03:54.406444	2026-09-30 10:03:54.406444
0874a3c1-3588-4340-883f-020952ad2bc9	SEED-8	Item 8	desc 8	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 10:03:54.417389	2026-09-30 10:03:54.417389
6975099f-4db7-4ead-b040-1b9299f853a6	SEED-9	Item 9	desc 9	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 10:03:54.431333	2026-09-30 10:03:54.431333
1ec29048-1c88-40e1-b277-1a993de597b3	SEED-10	Item 10	desc 10	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 10:03:54.446644	2026-09-30 10:03:54.446644
9c104fcf-a9d2-4c95-a5d7-b5df43d3a773	SEED-11	Item 11	desc 11	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 10:03:54.462071	2026-09-30 10:03:54.462071
a9d0c1c1-bd16-4ccc-a1c4-ede7dcf974f2	SEED-12	Item 12	desc 12	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 10:03:54.476326	2026-09-30 10:03:54.476326
7ffb7b2b-f503-4ac3-acff-deb2f7557e57	SEED-13	Item 13	desc 13	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 10:03:54.49028	2026-09-30 10:03:54.49028
6147ac55-ad64-47c3-9079-d92b67d8ea16	SEED-14	Item 14	desc 14	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 10:03:54.50136	2026-09-30 10:03:54.50136
e7fef486-c84e-4128-921d-639e1b3c9d26	SEED-15	Item 15	desc 15	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 10:03:54.514219	2026-09-30 10:03:54.514219
ac2cb416-2b73-4b77-89f2-891b5d69d8ce	SEED-16	Item 16	desc 16	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 10:03:54.529131	2026-09-30 10:03:54.529131
805c7ef2-2228-470a-9975-ffbc87a5c1b8	SEED-17	Item 17	desc 17	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 10:03:54.544639	2026-09-30 10:03:54.544639
fd27d25b-0f60-4bd4-9a44-c602ed40c775	SEED-18	Item 18	desc 18	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 10:03:54.559679	2026-09-30 10:03:54.559679
e39985bd-1ecf-4510-9335-ce40a76a0b36	SEED-19	Item 19	desc 19	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 10:03:54.573524	2026-09-30 10:03:54.573524
99749daf-c2d5-4ca2-9618-ce9bdbb6c850	SEED-20	Item 20	desc 20	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 10:03:54.586642	2026-09-30 10:03:54.586642
c853e53a-7de0-46de-a6a8-e687b61fd2b8	SEED-21	Item 21	desc 21	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 10:03:54.599243	2026-09-30 10:03:54.599243
da2d820c-acdc-4c05-970a-57767f517d3b	SEED-22	Item 22	desc 22	RECEIVED	\N	\N	\N	\N	\N	0	\N	2026-09-30 10:03:54.609948	2026-09-30 10:03:54.609948
9c105baa-4df8-4a0c-9d6b-8f843a810551	SEED-25	Item 25	desc 25	READY_FOR_REVIEW	GENERAL_INQUIRY	LOW	desc 25	Review "Item 25" and follow up based on category GENERAL_INQUIRY.	\N	0	2026-09-30 10:49:58.96	2026-09-30 10:03:54.644014	2026-09-30 10:49:58.964926
4d216457-6f42-423a-99ba-ded99a0d1dfb	SEED-24	Item 24	desc 24	READY_FOR_REVIEW	GENERAL_INQUIRY	LOW	desc 24	Review "Item 24" and follow up based on category GENERAL_INQUIRY.	\N	0	2026-09-30 10:49:58.982	2026-09-30 10:03:54.633658	2026-09-30 10:49:58.985987
d28b7002-e7a3-4ddb-afb7-43b0dbbcb0f3	SEED-23	Item 23	desc 23	READY_FOR_REVIEW	GENERAL_INQUIRY	LOW	desc 23	Review "Item 23" and follow up based on category GENERAL_INQUIRY.	\N	0	2026-09-30 10:49:58.999	2026-09-30 10:03:54.622609	2026-09-30 10:49:59.002514
0a019476-f9cf-4130-a27d-0eb318f47d0d	Ticket 1	Ui design	this is the ui design of transaciton	COMPLETED	GENERAL_INQUIRY	LOW	this is the ui design of transaciton	Review "Ui design" and follow up based on category GENERAL_INQUIRY.	\N	0	2026-09-30 10:57:43.655	2026-09-30 10:57:32.50797	2026-09-30 10:57:45.813758
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 1, true);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: work_item_status_history PK_work_item_status_history; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_item_status_history
    ADD CONSTRAINT "PK_work_item_status_history" PRIMARY KEY (id);


--
-- Name: work_items PK_work_items; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_items
    ADD CONSTRAINT "PK_work_items" PRIMARY KEY (id);


--
-- Name: work_items UQ_work_items_external_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_items
    ADD CONSTRAINT "UQ_work_items_external_id" UNIQUE (external_id);


--
-- Name: IDX_work_item_status_history_work_item_id_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_work_item_status_history_work_item_id_created_at" ON public.work_item_status_history USING btree (work_item_id, created_at);


--
-- Name: IDX_work_items_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_work_items_created_at" ON public.work_items USING btree (created_at);


--
-- Name: IDX_work_items_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_work_items_status" ON public.work_items USING btree (status);


--
-- Name: work_item_status_history FK_work_item_status_history_work_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_item_status_history
    ADD CONSTRAINT "FK_work_item_status_history_work_item" FOREIGN KEY (work_item_id) REFERENCES public.work_items(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict VXfAmwacEbaNneJmGjzaG9HHrpNKxh1OYXPJ86g3n3WDLhB6eZug2NClTmFjNix

