# WhatsApp Commerce Integration Plan (Task 58)

## Objective
Implement a premium, two-way WhatsApp communication system using the Meta Business API. This will route incoming messages into the Admin CRM Inbox and allow automated transactional updates (order confirmations, shipping alerts) to be sent directly to customers.

## The Premium Workflow
1. **Omnichannel Inbox:** Incoming WhatsApp messages appear instantly in the `/dashboard/crm/inbox`, alongside email tickets.
2. **Contextual Conversations:** When an agent replies to a WhatsApp message from the dashboard, they see the customer's order history and profile side-by-side.
3. **Automated Triggers:** Order state changes (e.g., PACKED, SHIPPED) trigger pre-approved Meta WhatsApp templates.
4. **Seamless Identity Mapping:** The system automatically maps incoming phone numbers to existing user accounts or creates temporary "Lead" accounts.

## Implementation Steps

### Phase 1: Meta App Setup & Webhook Infrastructure
1. **Environment Config:** Add `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and `WHATSAPP_VERIFY_TOKEN` to the `.env`.
2. **Webhook Controller:** Create `GET /webhook/whatsapp` for Meta's verification challenge and `POST /webhook/whatsapp` to receive message payloads.
3. *Firebase Support:* Structure the webhook handlers so they can be exported as standard HTTP Cloud Functions.

### Phase 2: Backend Message Routing (NestJS API)
1. **Message Parser:** Parse Meta's incoming JSON payload to extract the sender's phone number and message body.
2. **CRM Integration:** 
   - Look up the `User` by phone number.
   - Create a `SupportTicket` or `MessageThread` if none exists.
   - Save the incoming message to the thread.
3. **Outbound Service:** Create a `WhatsappService.sendMessage(to, text)` to hit the `graph.facebook.com` API for sending replies from the dashboard.

### Phase 3: Web Admin UI (Next.js)
1. **Inbox Enhancements:** Update the CRM Inbox UI to support real-time chat bubbles.
2. **Channel Indicators:** Add visual icons indicating whether a message thread is via Email or WhatsApp.
3. **Template Triggers:** Add a toggle in Global Settings to "Enable WhatsApp Order Notifications".

## Questions for Clarification
1. **Meta App Status:** Do you already have an approved Meta Developer account and a verified WhatsApp Business number, or will we be developing against the Meta Test Number for now?
2. **Real-time Updates:** For the chat interface to feel premium and instant, should we implement WebSockets (Socket.io) for the dashboard, or is aggressive polling acceptable for the first version?
