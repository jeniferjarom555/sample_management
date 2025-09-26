--
-- PostgreSQL database dump
--

\restrict kWKaxY6tkdTB3lxxD8RPq3ESFquIAt4KaVn9JAZd4fypTMz9FCqnanNU5ShIJbU

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointment_patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointment_patients (
    id integer NOT NULL,
    appointment_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.appointment_patients OWNER TO postgres;

--
-- Name: appointment_patients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointment_patients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointment_patients_id_seq OWNER TO postgres;

--
-- Name: appointment_patients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointment_patients_id_seq OWNED BY public.appointment_patients.id;


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    appointment_id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid NOT NULL,
    appointment_date timestamp without time zone NOT NULL,
    doctor_name character varying(100),
    status character varying(20) DEFAULT 'scheduled'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    address character varying(255)
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- Name: barcode_table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.barcode_table (
    barcode_id character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    sample_id uuid
);


ALTER TABLE public.barcode_table OWNER TO postgres;

--
-- Name: otps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.otps (
    id integer NOT NULL,
    phone character varying(15) NOT NULL,
    otp character varying(6) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.otps OWNER TO postgres;

--
-- Name: otps_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.otps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.otps_id_seq OWNER TO postgres;

--
-- Name: otps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.otps_id_seq OWNED BY public.otps.id;


--
-- Name: patient_tests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_tests (
    patient_test_id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_patient_id integer,
    test_id uuid,
    result character varying(255),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.patient_tests OWNER TO postgres;

--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    patient_id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    dob date,
    gender character varying(10),
    phone character varying(20),
    email character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.patients OWNER TO postgres;

--
-- Name: samples; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.samples (
    sample_id uuid NOT NULL,
    appointment_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    tests jsonb NOT NULL,
    sample_type character varying(50) NOT NULL,
    specimen_type character varying(50) NOT NULL,
    sample_color character varying(50) NOT NULL,
    sample_collected boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    barcode_id character varying(20)
);


ALTER TABLE public.samples OWNER TO postgres;

--
-- Name: tests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tests (
    test_id uuid DEFAULT gen_random_uuid() NOT NULL,
    test_name character varying(255) NOT NULL,
    sample_type character varying(50),
    specimen_type character varying(50),
    sample_color character varying(50),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tests OWNER TO postgres;

--
-- Name: appointment_patients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_patients ALTER COLUMN id SET DEFAULT nextval('public.appointment_patients_id_seq'::regclass);


--
-- Name: otps id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otps ALTER COLUMN id SET DEFAULT nextval('public.otps_id_seq'::regclass);


--
-- Data for Name: appointment_patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointment_patients (id, appointment_id, patient_id, created_at) FROM stdin;
8	11111111-2222-3333-4444-555555555555	d4c2dd72-6822-4013-baa2-dd3e21544f59	2025-09-16 19:33:18.157672
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (appointment_id, patient_id, appointment_date, doctor_name, status, created_at, address) FROM stdin;
11111111-2222-3333-4444-555555555555	d4c2dd72-6822-4013-baa2-dd3e21544f59	2025-09-15 10:30:00	Dr. Mehta	scheduled	2025-09-10 15:13:41.633962	Chennai, India
\.


--
-- Data for Name: barcode_table; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.barcode_table (barcode_id, status, sample_id) FROM stdin;
UWVsxUJc	pending	\N
j1U5WJnY	pending	\N
5nTqDwDN	pending	\N
KxhSHM7B	pending	\N
kjnwGJhV	pending	\N
d5gsE0iX	pending	\N
rqtGHYB8	pending	\N
nYNmPnC_	pending	\N
2SzfXOW_	pending	\N
\.


--
-- Data for Name: otps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.otps (id, phone, otp, expires_at, created_at) FROM stdin;
61	9898789878	686420	2025-09-11 19:35:22.354	2025-09-11 19:25:22.422254
62	98987898	588716	2025-09-11 19:48:38.558	2025-09-11 19:38:38.606867
63	9789891467	169131	2025-09-11 20:21:09.978	2025-09-11 20:11:10.022045
64	9639632589	927868	2025-09-12 16:39:44.006	2025-09-12 16:29:44.149278
65	5555545663	679384	2025-09-12 16:41:49.841	2025-09-12 16:31:49.898952
66	6655555622	580913	2025-09-12 17:00:03.345	2025-09-12 16:50:03.42624
\.


--
-- Data for Name: patient_tests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient_tests (patient_test_id, appointment_patient_id, test_id, result, created_at) FROM stdin;
7d6c95e9-0ec0-4592-b7ba-157be19dc077	8	6c73c549-f542-4114-adc9-c4e2ca44ce64	\N	2025-09-23 21:31:53.113085
213ac6d3-7a80-4afa-ad00-44212e47553d	8	d9710ba0-e6e2-4a58-ab00-1c7fc9fb4a0f	\N	2025-09-23 21:31:53.121017
4d71770e-377c-41f3-9c41-f39f4ff7d98a	8	abf1430e-5e0f-4558-8ec1-5585f9893b7d	\N	2025-09-23 21:31:53.122879
1db3ac97-730d-410c-b9ab-ff5d18134ea0	8	389b3cac-0bc6-4c73-8c23-936e7f10b7db	\N	2025-09-23 21:32:21.539791
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (patient_id, first_name, last_name, dob, gender, phone, email, created_at) FROM stdin;
d4c2dd72-6822-4013-baa2-dd3e21544f59	John	Doe	1990-01-01	Male	1234567890	john@example.com	2025-09-09 22:00:01.424747
9602361b-9acf-47a2-aec2-9d0d7d25bfbd	Jane	Smith	1992-05-12	Female	0987654321	jane@example.com	2025-09-09 22:00:01.424747
e4899c85-a397-43fd-ac12-25560d13b3ec	Aarav	Kumar	1988-08-08	Male	9876543210	aarav@example.com	2025-09-09 22:00:01.424747
\.


--
-- Data for Name: samples; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.samples (sample_id, appointment_id, patient_id, tests, sample_type, specimen_type, sample_color, sample_collected, created_at, barcode_id) FROM stdin;
9205368f-06c6-4679-9708-d593d297960c	11111111-2222-3333-4444-555555555555	d4c2dd72-6822-4013-baa2-dd3e21544f59	["7d6c95e9-0ec0-4592-b7ba-157be19dc077", "213ac6d3-7a80-4afa-ad00-44212e47553d"]	Blood	Whole Blood	LAVENDER (EDTA)	f	2025-09-23 21:31:53.128695	\N
c25b4f4d-a6a3-4ae4-801d-3823f66fdded	11111111-2222-3333-4444-555555555555	d4c2dd72-6822-4013-baa2-dd3e21544f59	["4d71770e-377c-41f3-9c41-f39f4ff7d98a", "1db3ac97-730d-410c-b9ab-ff5d18134ea0"]	Blood	Serum	RED (No Additive)	f	2025-09-23 21:31:53.137629	\N
\.


--
-- Data for Name: tests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tests (test_id, test_name, sample_type, specimen_type, sample_color, created_at) FROM stdin;
6c73c549-f542-4114-adc9-c4e2ca44ce64	CBC	Blood	Whole Blood	LAVENDER (EDTA)	2025-09-16 19:16:23.51328
d9710ba0-e6e2-4a58-ab00-1c7fc9fb4a0f	HbA1c	Blood	Whole Blood	LAVENDER (EDTA)	2025-09-16 19:16:23.51328
abf1430e-5e0f-4558-8ec1-5585f9893b7d	Lipid Panel	Blood	Serum	RED (No Additive)	2025-09-16 19:16:23.51328
28a0da8d-62ad-4bfb-8b5f-c94249c229df	Vitamin D	Blood	Serum	RED (No Additive)	2025-09-16 19:16:23.51328
15bdd080-0dae-4e5e-8734-cb38f98f09c5	Liver Function Test	Blood	Serum	RED (No Additive)	2025-09-18 17:52:57.068669
9e532c05-3889-4cf7-b9d5-c469d8c9790b	Kidney Function Test	Blood	Serum	RED (No Additive)	2025-09-18 17:52:57.068669
389b3cac-0bc6-4c73-8c23-936e7f10b7db	Thyroid Panel	Blood	Serum	RED (No Additive)	2025-09-18 17:52:57.068669
5f45f583-ceee-432e-94f8-8bce1906504f	Electrolytes	Blood	Serum	RED (No Additive)	2025-09-18 17:52:57.068669
e3ba0cae-0ff7-4ede-8419-bcee32659780	ECG	Other	N/A	N/A	2025-09-18 17:52:57.068669
\.


--
-- Name: appointment_patients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointment_patients_id_seq', 8, true);


--
-- Name: otps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.otps_id_seq', 66, true);


--
-- Name: appointment_patients appointment_patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_patients
    ADD CONSTRAINT appointment_patients_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (appointment_id);


--
-- Name: barcode_table barcode_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barcode_table
    ADD CONSTRAINT barcode_table_pkey PRIMARY KEY (barcode_id);


--
-- Name: otps otps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otps
    ADD CONSTRAINT otps_pkey PRIMARY KEY (id);


--
-- Name: patient_tests patient_tests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_tests
    ADD CONSTRAINT patient_tests_pkey PRIMARY KEY (patient_test_id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (patient_id);


--
-- Name: samples samples_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.samples
    ADD CONSTRAINT samples_pkey PRIMARY KEY (sample_id);


--
-- Name: tests tests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_pkey PRIMARY KEY (test_id);


--
-- Name: tests tests_test_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_test_name_key UNIQUE (test_name);


--
-- Name: idx_appointment_patients_appointment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointment_patients_appointment_id ON public.appointment_patients USING btree (appointment_id);


--
-- Name: idx_appointment_patients_patient_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointment_patients_patient_id ON public.appointment_patients USING btree (patient_id);


--
-- Name: appointment_patients appointment_patients_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_patients
    ADD CONSTRAINT appointment_patients_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(appointment_id) ON DELETE CASCADE;


--
-- Name: appointment_patients appointment_patients_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_patients
    ADD CONSTRAINT appointment_patients_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;


--
-- Name: barcode_table barcode_table_sample_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barcode_table
    ADD CONSTRAINT barcode_table_sample_id_fkey FOREIGN KEY (sample_id) REFERENCES public.samples(sample_id) ON DELETE SET NULL;


--
-- Name: samples fk_appointment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.samples
    ADD CONSTRAINT fk_appointment FOREIGN KEY (appointment_id) REFERENCES public.appointments(appointment_id) ON DELETE CASCADE;


--
-- Name: appointments fk_patient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- Name: patient_tests patient_tests_appointment_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_tests
    ADD CONSTRAINT patient_tests_appointment_patient_id_fkey FOREIGN KEY (appointment_patient_id) REFERENCES public.appointment_patients(id) ON DELETE CASCADE;


--
-- Name: patient_tests patient_tests_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_tests
    ADD CONSTRAINT patient_tests_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(test_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict kWKaxY6tkdTB3lxxD8RPq3ESFquIAt4KaVn9JAZd4fypTMz9FCqnanNU5ShIJbU

