# Microservices Integration Plan (Task 57)

## Objective
Establish a robust boilerplate for NestJS microservices utilizing TCP/Redis transport and define gRPC endpoints for orchestrating custom business logic beyond the standard monolithic API.

## Implementation Steps

### Phase 1: Microservice App Initialization
1. Use the Nest CLI within the `apps` directory to generate a new microservice app (e.g., `apps/microservices/custom-logic`).
2. Configure the new app's `main.ts` to run as a microservice using `Transport.TCP` (or `Transport.REDIS` if high availability is required immediately).
3. Ensure the monorepo's `package.json` scripts are updated to build and run the new microservice alongside the main API.

### Phase 2: Protobuf Schema Definition
1. Create a `proto` directory in a shared package (e.g., `packages/shared-types/proto` or similar).
2. Define `.proto` schemas for custom business logic (e.g., advanced inventory calculations, dynamic routing, or external ERP syncing).
3. Set up a script using `ts-proto` to compile the `.proto` files into TypeScript interfaces so both the `api` and the `microservice` can share the strongly-typed contracts.

### Phase 3: Main API Integration (Client)
1. In the `apps/api` application, use `ClientsModule.register` to configure a client connecting to the newly created microservice via TCP/Redis.
2. Inject the microservice client into the relevant services (e.g., `OrdersService` or a new `CustomLogicService`).
3. Create sample controller endpoints in `apps/api` that delegate processing to the microservice via `client.send()` or `client.emit()`.

### Phase 4: Microservice Handlers (Server)
1. In the new microservice app, implement controllers decorated with `@MessagePattern()` or `@EventPattern()` (or `@GrpcMethod()` if strictly using gRPC).
2. Handle the incoming payloads and return the processed results back to the main API.

## Questions for Clarification
1. **Transport Layer:** We currently have Redis installed for caching. Should we use Redis as the primary message broker for the microservices (`Transport.REDIS`), or stick to standard TCP (`Transport.TCP`), or fully commit to gRPC (`Transport.GRPC`)?
2. **First Use Case:** Do you have a specific custom module or business logic in mind that we should implement as the first concrete example (e.g., an ERP sync job, a complex discount calculator)?
3. **Firebase Support:** Per the global rules, do these microservices need to be deployable to Firebase Cloud Functions, or will they run purely as Dockerized containers alongside the main Node.js backend?

Please review this plan and let me know your thoughts or answers to the questions above so we can proceed with the code implementation!
