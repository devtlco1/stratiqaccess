-- OPTIONAL & DESTRUCTIVE: replaces all rows in "services" with the 14
-- ground-operations service cards for the new STRATIQ Access positioning.
-- Only run this if you want the live site's Services content replaced —
-- it deletes every existing row in "services" first. Back up first if you
-- have manually-edited service content you want to keep (e.g. exported via
-- the Supabase table editor).
--
-- Run in the Supabase SQL editor: Project → SQL Editor → paste → Run.

delete from public.services;

insert into public.services (slug, icon, title, description, body, highlights, image_url, sort_order)
values
(
  'local-network-partner-access',
  'handshake',
  'Local Network & Partner Access',
  'Direct introductions to reliable Iraqi stakeholders, partners, suppliers, and authorities — so you know who to meet and how to move.',
  '["Entering Iraq without a trusted local network means guessing who to trust and losing time on dead ends. STRATIQ Access connects you directly with vetted Iraqi partners, suppliers, and field contacts relevant to your sector and objectives.","We help you understand the practical landscape — who the right stakeholders are, how decisions actually get made, and how to move safely and efficiently between meetings, sites, and offices."]',
  '[{"title":"Vetted Introductions","description":"Direct access to stakeholders, suppliers, and authorities relevant to your sector."},{"title":"Local Guidance","description":"Practical direction on who to meet and how business actually moves in Iraq."},{"title":"Ongoing Access","description":"A standing local point of contact for your team, not a one-time introduction."}]',
  null,
  1
),
(
  'secure-accommodation',
  'building-2',
  'Secure Accommodation',
  'Trusted hotels, safe residences, guest houses, and long-stay accommodation for delegations, engineers, and project teams.',
  '["Where your people stay matters as much as where they work. We arrange vetted hotels, safe residences, and long-stay accommodation matched to your team''s role, duration, and security requirements.","From a single executive visit to a rotating project team, we manage bookings, standards, and logistics so accommodation is one less thing to coordinate from abroad."]',
  '[{"title":"Vetted Properties","description":"Hotels and residences assessed for safety, service, and reliability."},{"title":"Short & Long Stay","description":"From single visits to long-term project accommodation."},{"title":"Delegation-Ready","description":"Group bookings and logistics coordinated for full delegations."}]',
  null,
  2
),
(
  'private-security-coordination',
  'shield-check',
  'Private Security Coordination',
  'Coordinating with licensed private security providers for secure movement, site visits, and delegation safety.',
  '["Operating safely in Iraq requires planning, not improvisation. STRATIQ Access coordinates with licensed private security providers to plan secure movement, protect site visits, and support delegation safety.","All security coordination is carried out through licensed local providers in line with applicable Iraqi laws and authority requirements — we manage the coordination, not the enforcement."]',
  '[{"title":"Secure Movement Planning","description":"Routes, timing, and protocols planned around your itinerary."},{"title":"Site Visit Protection","description":"Coordinated coverage for site visits and field inspections."},{"title":"Delegation Safety","description":"Safety planning support for executive and group visits."}]',
  null,
  3
),
(
  'internal-transportation',
  'truck',
  'Internal Transportation',
  'Airport transfers, VIP cars, business transport, and field vehicles with drivers for intercity movement.',
  '["Reliable transport is the backbone of any visit or project in Iraq. We arrange airport pickup and drop-off, VIP cars, business transport, and field vehicles with experienced drivers.","Whether it''s a single executive transfer or a multi-vehicle convoy for a project team, we coordinate secure, on-time movement across cities and project sites."]',
  '[{"title":"Airport & VIP Transfers","description":"Reliable pickup, drop-off, and executive transport."},{"title":"Field Vehicles & Drivers","description":"Vehicles and experienced drivers for site visits and fieldwork."},{"title":"Intercity Movement","description":"Secure logistics coordination for travel between cities and regions."}]',
  null,
  4
),
(
  'call-center-support',
  'phone',
  'Call Center Support',
  'Local Iraqi phone support, Arabic-speaking operators, follow-up calls, and appointment coordination.',
  '["Staying responsive to Iraqi partners, customers, and stakeholders requires a local voice. We provide Arabic-speaking call center support to handle inbound inquiries, follow-up calls, and appointment coordination.","Our teams act as an extension of your business, keeping communication consistent while you operate remotely or between visits."]',
  '[{"title":"Arabic-Speaking Operators","description":"Local teams handling calls in Arabic and English."},{"title":"Follow-Up & Scheduling","description":"Appointment coordination and structured follow-up calls."},{"title":"Field Communication","description":"Real-time communication support between your team and local contacts."}]',
  null,
  5
),
(
  'freelance-local-staffing',
  'users',
  'Freelance & Local Staffing',
  'Freelance interpreters, coordinators, engineers, site assistants, and technical workers — short or long term.',
  '["Scaling a team in Iraq without local hiring infrastructure is slow and risky. We provide freelance and local staffing — interpreters, coordinators, engineers, site assistants, admin staff, sales representatives, drivers, and technical workers.","Staffing is arranged on a short-term or long-term basis, matched to project scope, so you can scale field capacity up or down as needed."]',
  '[{"title":"Technical & Field Staff","description":"Engineers, site assistants, and technical workers for project needs."},{"title":"Interpreters & Coordinators","description":"Language and coordination support for meetings and site work."},{"title":"Flexible Terms","description":"Short-term project staffing or longer-term placements."}]',
  null,
  6
),
(
  'contract-attestation',
  'file-check',
  'Contract Attestation',
  'Contract attestation support, government paperwork coordination, and commercial documentation follow-up.',
  '["Getting contracts and company documents properly attested and filed in Iraq involves multiple steps and offices. We coordinate the process on your behalf, working through trusted local partners.","This is documentation and coordination support — attestation and approvals remain subject to applicable Iraqi laws and the requirements of the relevant authorities."]',
  '[{"title":"Attestation Support","description":"Coordination through trusted local partners for contract attestation."},{"title":"Paperwork Follow-Up","description":"Tracking and follow-up on government and commercial documentation."},{"title":"Company Document Support","description":"Assistance organizing and submitting required company paperwork."}]',
  null,
  7
),
(
  'legal-representation',
  'landmark',
  'Legal Representation',
  'Legal representation coordination through trusted Iraqi legal partners for contracts, disputes, and compliance matters.',
  '["For matters requiring formal legal representation in Iraq, we coordinate with trusted, licensed Iraqi legal partners on your behalf.","We manage the relationship and communication so your legal counsel abroad has a reliable, responsive point of contact on the ground, subject to applicable Iraqi laws and professional regulations."]',
  '[{"title":"Trusted Legal Partners","description":"Coordination with licensed Iraqi legal practitioners."},{"title":"Representation Coordination","description":"On-the-ground liaison for legal proceedings and filings."},{"title":"Ongoing Communication","description":"Consistent updates between your team and local counsel."}]',
  null,
  8
),
(
  'legal-advisory',
  'scale',
  'Legal Advisory',
  'Legal consultation, contract review, regulatory guidance, and company setup support through trusted local partners.',
  '["Understanding Iraqi commercial law, regulatory requirements, and company setup procedures is essential before committing resources. We connect you with trusted Iraqi legal partners for consultation and advisory support.","Services include contract review, regulatory guidance, company setup support, and local compliance advisory — all delivered through licensed legal partners and subject to applicable Iraqi laws."]',
  '[{"title":"Contract Review","description":"Local legal review of agreements before signature."},{"title":"Company Setup Support","description":"Guidance through Iraqi company registration and structuring."},{"title":"Compliance Advisory","description":"Ongoing regulatory and local compliance guidance."}]',
  null,
  9
),
(
  'food-supply-procurement',
  'package',
  'Food Supply & Procurement',
  'Food supply for teams, camps, and events, plus office and site supplies and daily operational procurement.',
  '["Keeping teams, camps, and event sites supplied is a daily operational challenge in unfamiliar markets. We manage food supply, office supplies, and site procurement for teams, workers, and delegations.","From a single office to a multi-week project camp, we handle sourcing and delivery so your team stays supplied without managing local vendors directly."]',
  '[{"title":"Food & Catering Supply","description":"Reliable supply for teams, camps, and event catering."},{"title":"Office & Site Supplies","description":"Procurement of everyday operational materials."},{"title":"Daily Logistics","description":"Ongoing procurement support for extended engagements."}]',
  null,
  10
),
(
  'event-management',
  'calendar',
  'Event Management',
  'Business events, workshops, seminars, and delegations — venue booking, catering, guest management, and translation.',
  '["Hosting a business event, technical seminar, or delegation visit in Iraq involves many moving parts. We organize the full event — venue booking, catering, guest management, translation, transportation, and media coordination if needed.","We support product launches, networking meetings, and government or private-sector engagements from planning through execution."]',
  '[{"title":"Full Event Logistics","description":"Venue, catering, and guest management handled end to end."},{"title":"Delegation Programs","description":"Structured itineraries for business and government delegations."},{"title":"Translation & Media","description":"On-site translation and media coordination when required."}]',
  null,
  11
),
(
  'security-permits',
  'key',
  'Security Permits',
  'Support with security permits, site access, movement approvals, and local authorization requirements.',
  '["Certain sites, zones, and activities in Iraq require permits, movement approvals, or official coordination. We support companies with the documentation and coordination process for these requirements.","This is permit process assistance and coordination support through trusted local partners — approvals remain subject to applicable Iraqi laws and the decisions of the relevant authorities."]',
  '[{"title":"Permit Process Assistance","description":"Support preparing and submitting required documentation."},{"title":"Site Access Coordination","description":"Coordination support for site and zone access requirements."},{"title":"Movement Approvals","description":"Assistance navigating movement authorization processes."}]',
  null,
  12
),
(
  'legal-translation',
  'languages',
  'Legal Translation',
  'Legal, business, and technical translation, plus interpreters for meetings, site visits, and negotiations.',
  '["Accurate translation is critical when contracts, technical documents, and negotiations are on the line. We provide legal, business, and technical translation between Arabic and English.","Interpreters are also available for meetings, site visits, negotiations, and events — ensuring nothing is lost in a language or cultural gap."]',
  '[{"title":"Legal & Business Translation","description":"Precise translation of contracts and formal documents."},{"title":"Technical Translation","description":"Accurate translation for technical and engineering documentation."},{"title":"On-Site Interpreters","description":"Interpretation for meetings, negotiations, and site visits."}]',
  null,
  13
),
(
  'field-operations-support',
  'compass',
  'Field Operations Support',
  'Complete on-ground execution — anything a foreign company needs in Iraq, coordinated through our local team and network.',
  '["Some needs don''t fit neatly into a single category. STRATIQ Access acts as a single point of coordination for whatever your team requires on the ground in Iraq.","Through our local team and trusted partner network, we coordinate execution across logistics, staffing, documentation, and field support — so you have one reliable partner instead of a dozen local contacts."]',
  '[{"title":"Single Point of Contact","description":"One local team coordinating across every operational need."},{"title":"Flexible Scope","description":"Support scoped to your project, visit, or ongoing operation."},{"title":"Trusted Network","description":"Execution backed by a vetted network of local partners."}]',
  null,
  14
);
