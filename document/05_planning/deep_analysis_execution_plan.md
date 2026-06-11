# Fahmak Alena — Master Execution Plan & Deep Analysis

> **Source of Truth**: Every specification below is grounded in a line-by-line inspection of the actual codebase, not the documentation alone. Discrepancies between documentation and code are flagged as ⚠️ **REALITY CHECK** callouts.

---

## 0. Critical Codebase Reality Checks

Before implementing anything, the team must be aware of these discrepancies between the project documentation (`FAHMAK_ALENA_CONTEXT.md`) and the actual code:

> [!WARNING]
> ### ⚠️ REALITY CHECK #1: Brand Colors Are RED, Not Blue
> The `FAHMAK_ALENA_CONTEXT.md` documents brand colors as blues (`brand-500: #3b82f6`), but [tailwind.config.js](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/frontend/tailwind.config.js#L12-L24) actually defines them as **deep reds** (`brand-500: #ca2a22`). The `shadow-glow` is also red-tuned (`rgba(202, 42, 34, 0.4)`). **All new UI work must use the RED palette that is actually in production**, not the blue palette from the context doc.

> [!WARNING]
> ### ⚠️ REALITY CHECK #2: Spring Boot 4.0.6, Not 3.x
> The [pom.xml](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/pom.xml#L8) declares `spring-boot-starter-parent` version **4.0.6**, not 3.x as documented. This impacts dependency compatibility — particularly for OAuth2 Client, WebSocket, and Stripe SDK versions.

> [!WARNING]
> ### ⚠️ REALITY CHECK #3: NgRx is Installed But Not Mentioned
> The [package.json](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/frontend/package.json#L21-L24) includes `@ngrx/store`, `@ngrx/effects`, `@ngrx/entity`, and `@ngrx/store-devtools` (v17.2.0). The context doc only mentions "RxJS, Angular Services" for state management. New features should decide: **use NgRx or stick with BehaviorSubject-based services?** The existing `AuthService` uses BehaviorSubjects, so the recommendation is to continue that pattern for consistency unless the team explicitly wants to migrate.

> [!WARNING]
> ### ⚠️ REALITY CHECK #4: PostgreSQL Driver is MISSING from pom.xml
> Despite `docker-compose.yml` defining a PostgreSQL container and the context doc specifying PostgreSQL for production, the [pom.xml](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/pom.xml#L60-L64) only has the **H2** driver. `application.properties` also connects to `jdbc:h2:mem:fahmak_alena`. Before any production deploy, `org.postgresql:postgresql` must be added as a runtime dependency and a production profile created.

> [!IMPORTANT]
> ### ⚠️ REALITY CHECK #5: No `@Builder` on User Entity
> The [User.java](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/src/main/java/com/fahmak/alena/user/entity/User.java) uses `@Getter/@Setter/@NoArgsConstructor/@AllArgsConstructor` but **not** `@Builder`. The `AuthResponse` DTO uses `@Builder`. When modifying the User entity for OAuth2, continue using setter-based construction (not builder) to stay consistent.

---

## Part 1: Database Schema & Domain Modeling

### 1.1 Modified Entity: `User` (OAuth2 Support)

**File**: [User.java](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/src/main/java/com/fahmak/alena/user/entity/User.java)

The existing `User` entity has `passwordHash` marked `@Column(nullable = false)`. For OAuth2 users who never set a password, this must become **nullable**.

```diff
 @Column(nullable = false)
-@ToString.Exclude
-@JsonIgnore
-private String passwordHash;
+// CHANGED: nullable=true to support OAuth2 users who have no password
+@Column(nullable = true)
+@ToString.Exclude
+@JsonIgnore
+private String passwordHash;

+// --- NEW FIELDS FOR OAUTH2 ---
+@Column(name = "auth_provider")
+@Enumerated(EnumType.STRING)
+private AuthProvider authProvider = AuthProvider.LOCAL;
+
+@Column(name = "provider_id")
+private String providerId;  // Google/Facebook unique user ID
+
+@Column(name = "avatar_url")
+private String avatarUrl;   // Profile picture from OAuth provider
```

**New Enum**: `com.fahmak.alena.user.entity.AuthProvider`
```java
public enum AuthProvider {
    LOCAL,     // email/password
    GOOGLE,
    FACEBOOK
}
```

**Impact on existing code**:
- [UserService.registerUser()](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/src/main/java/com/fahmak/alena/user/service/UserService.java#L23-L39): Must set `authProvider = LOCAL` explicitly.
- [UserService.authenticateUser()](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/src/main/java/com/fahmak/alena/user/service/UserService.java#L41-L55): Must check `authProvider == LOCAL` before comparing password.
- [DataInitializer.createUser()](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/src/main/java/com/fahmak/alena/config/DataInitializer.java#L75-L87): Must set `authProvider = LOCAL`.

---

### 1.2 New Entities: Payment Domain

**New Package**: `com.fahmak.alena.payment`

#### Entity: `SubscriptionPlan`
```java
@Entity
@Table(name = "subscription_plans")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SubscriptionPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;            // "Free", "Pro", "Enterprise"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double priceMonthly;    // 0.00 for Free tier

    private Double priceYearly;

    private Integer maxCourses;     // null = unlimited
    private Boolean aiChatEnabled;
    private Boolean certificatesEnabled;
    private Boolean prioritySupport;

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, ARCHIVED

    private LocalDateTime createdAt;
}
```

#### Entity: `Subscription`
```java
@Entity
@Table(name = "subscriptions")
@Data @NoArgsConstructor
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private SubscriptionPlan plan;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;
    // ACTIVE, CANCELLED, PAST_DUE, EXPIRED, TRIALING

    @Column(name = "stripe_subscription_id", unique = true)
    private String stripeSubscriptionId;

    @Column(name = "current_period_start")
    private LocalDateTime currentPeriodStart;

    @Column(name = "current_period_end")
    private LocalDateTime currentPeriodEnd;

    @Column(name = "cancel_at_period_end")
    private Boolean cancelAtPeriodEnd = false;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

#### Entity: `PaymentTransaction`
```java
@Entity
@Table(name = "payment_transactions")
@Data @NoArgsConstructor
public class PaymentTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id")
    private Subscription subscription;

    @Column(name = "stripe_payment_intent_id", unique = true)
    private String stripePaymentIntentId;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status; // SUCCEEDED, FAILED, PENDING, REFUNDED

    private String failureReason;
    private LocalDateTime createdAt;
}
```

---

### 1.3 New Entities: Cheating Detection

These entities extend the existing `assessment` package — **not** a new package.

#### Entity: `QuizSession`
Tracks the entire lifecycle of a student taking a quiz (start time → submission time → all behavioral events).

```java
@Entity
@Table(name = "quiz_sessions")
@Data @NoArgsConstructor
public class QuizSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;

    @Column(name = "total_focus_loss_count")
    private Integer totalFocusLossCount = 0;

    @Column(name = "total_focus_loss_duration_ms")
    private Long totalFocusLossDurationMs = 0L;

    @Column(name = "rapid_answer_count")
    private Integer rapidAnswerCount = 0; // answers submitted < 3 sec each

    @Column(name = "copy_paste_count")
    private Integer copyPasteCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "integrity_verdict")
    private IntegrityVerdict integrityVerdict = IntegrityVerdict.CLEAN;
    // CLEAN, SUSPICIOUS, FLAGGED

    @Column(name = "risk_score")
    private Double riskScore = 0.0; // 0.0 to 1.0

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CheatEvent> cheatEvents;
}
```

#### Entity: `CheatEvent`
Individual behavioral anomaly events within a quiz session.

```java
@Entity
@Table(name = "cheat_events")
@Data @NoArgsConstructor
public class CheatEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private QuizSession session;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CheatEventType eventType;
    // WINDOW_BLUR, WINDOW_FOCUS, COPY_DETECTED, PASTE_DETECTED,
    // RAPID_ANSWER, RIGHT_CLICK, DEV_TOOLS_OPEN, SCREEN_CAPTURE_ATTEMPT

    private LocalDateTime eventTimestamp;

    @Column(columnDefinition = "TEXT")
    private String metadata; // JSON blob for event-specific details
}
```

---

### 1.4 New Entities: Collaborative / Peer Tutoring

**New Package**: `com.fahmak.alena.collaborative`

#### Entity: `PeerSession`
```java
@Entity
@Table(name = "peer_sessions")
@Data @NoArgsConstructor
public class PeerSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String roomCode; // Generated unique room code

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(name = "topic")
    private String topic;

    @Enumerated(EnumType.STRING)
    private PeerSessionStatus status = PeerSessionStatus.WAITING;
    // WAITING, ACTIVE, COMPLETED

    @Column(name = "max_participants")
    private Integer maxParticipants = 4;

    @Column(name = "current_participants")
    private Integer currentParticipants = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_user_id")
    private User host;

    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PeerSessionParticipant> participants;
}
```

#### Entity: `PeerSessionParticipant`
```java
@Entity
@Table(name = "peer_session_participants",
       uniqueConstraints = @UniqueConstraint(columnNames = {"session_id", "user_id"}))
@Data @NoArgsConstructor
public class PeerSessionParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private PeerSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;

    @Enumerated(EnumType.STRING)
    private ParticipantRole role = ParticipantRole.LEARNER;
    // HOST, TUTOR, LEARNER
}
```

---

## Part 2: API Contract Design

### 2.1 OAuth2 Authentication Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| `POST` | `/api/auth/oauth2/google` | Public | Exchange Google ID token for JWT |
| `POST` | `/api/auth/oauth2/facebook` | Public | Exchange Facebook access token for JWT |

**Request DTO** — `OAuthLoginRequest`:
```json
{
  "token": "google-id-token-or-facebook-access-token",
  "provider": "GOOGLE" // or "FACEBOOK"
}
```

**Response** — same [AuthResponse](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/src/main/java/com/fahmak/alena/user/dto/AuthResponse.java) DTO already in use:
```json
{
  "message": "Login successful",
  "token": "jwt-token",
  "userId": 42,
  "role": "STUDENT",
  "firstName": "Omar",
  "lastName": "Khaled",
  "email": "omar@gmail.com"
}
```

> [!NOTE]
> We validate the OAuth token server-side by calling Google's `tokeninfo` API or Facebook's Graph API `/me` endpoint. We do NOT use Spring Security OAuth2 Client's redirect flow — instead, the frontend handles the OAuth popup/redirect and sends the resulting token to our backend. This keeps the stateless JWT architecture intact.

---

### 2.2 Payment & Subscription Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| `GET` | `/api/subscriptions/plans` | Public | List all available subscription plans |
| `GET` | `/api/subscriptions/my` | JWT | Get current user's active subscription |
| `POST` | `/api/subscriptions/checkout` | JWT | Create Stripe Checkout Session |
| `POST` | `/api/subscriptions/webhook` | Stripe Sig | Handle Stripe webhook events |
| `POST` | `/api/subscriptions/cancel` | JWT | Cancel subscription at period end |
| `GET` | `/api/admin/subscriptions` | JWT (ADMIN) | Get all subscriptions with filters |
| `GET` | `/api/admin/revenue` | JWT (ADMIN) | Revenue analytics (MRR, churn, etc.) |

**Checkout Request**:
```json
{
  "planId": 2,
  "billingCycle": "MONTHLY" // or "YEARLY"
}
```

**Checkout Response**:
```json
{
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_live_...",
  "sessionId": "cs_live_..."
}
```

---

### 2.3 Cheating Detection Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| `POST` | `/api/assessments/sessions/start` | JWT | Start a quiz session (returns sessionId) |
| `POST` | `/api/assessments/sessions/{sessionId}/events` | JWT | Report a batch of behavioral events |
| `POST` | `/api/assessments/sessions/{sessionId}/submit` | JWT | Submit quiz & finalize integrity verdict |
| `GET` | `/api/instructor/integrity/{quizId}` | JWT (INSTRUCTOR) | Get integrity reports for a quiz |
| `GET` | `/api/instructor/integrity/flags` | JWT (INSTRUCTOR) | Get all flagged sessions for instructor's courses |

**Event Batch Request**:
```json
{
  "events": [
    { "eventType": "WINDOW_BLUR", "timestamp": "2026-06-10T02:30:00Z", "metadata": "{}" },
    { "eventType": "WINDOW_FOCUS", "timestamp": "2026-06-10T02:30:05Z", "metadata": "{\"durationMs\": 5000}" }
  ]
}
```

**Integrity Report Response** (for instructors):
```json
{
  "sessionId": 1,
  "studentName": "Omar Khaled",
  "quizTitle": "Neural Networks Exam",
  "riskScore": 0.72,
  "verdict": "SUSPICIOUS",
  "focusLossCount": 4,
  "totalFocusLossDurationMs": 18000,
  "rapidAnswerCount": 2,
  "copyPasteCount": 1,
  "events": [ ... ]
}
```

---

### 2.4 Peer Tutoring WebSocket Endpoints

**STOMP Configuration**:
- WebSocket endpoint: `/ws`
- Application destination prefix: `/app`
- Broker prefixes: `/topic`, `/queue`

| Destination | Direction | Description |
|-------------|-----------|-------------|
| `/app/peer/find-match` | Client → Server | Request to be matched with peers |
| `/app/peer/join/{roomCode}` | Client → Server | Join an existing room |
| `/app/peer/leave/{roomCode}` | Client → Server | Leave a room |
| `/app/peer/signal/{roomCode}` | Client → Server | WebRTC signaling (offer/answer/ICE) |
| `/topic/peer/matched/{userId}` | Server → Client | Notify user of successful match |
| `/topic/peer/room/{roomCode}` | Server → Client | Room state updates (join/leave/start) |
| `/topic/peer/signal/{roomCode}/{userId}` | Server → Client | WebRTC signals to specific user |

**Match Request Message**:
```json
{
  "courseId": 2,
  "topic": "Neural Networks",
  "role": "LEARNER" // or "TUTOR"
}
```

**Room Update Message**:
```json
{
  "type": "PARTICIPANT_JOINED", // or LEFT, SESSION_STARTED, SESSION_ENDED
  "roomCode": "ABC123",
  "participants": [
    { "userId": 1, "name": "Omar Khaled", "level": 15, "role": "LEARNER" },
    { "userId": 3, "name": "Seif Mahmoud", "level": 32, "role": "TUTOR" }
  ]
}
```

---

## Part 3: Backend Implementation Roadmap

### Phase 1: OAuth2 Social Login

#### Step 1.1 — Add Dependencies to [pom.xml](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/pom.xml)
```xml
<!-- Google API Client for token verification -->
<dependency>
    <groupId>com.google.api-client</groupId>
    <artifactId>google-api-client</artifactId>
    <version>2.7.2</version>
</dependency>

<!-- Facebook RestTemplate calls (already available via spring-boot-starter-webmvc) -->
<!-- No additional dependency needed -->
```

#### Step 1.2 — Create New Files

| File | Path |
|------|------|
| `AuthProvider.java` | `user/entity/AuthProvider.java` |
| `OAuthLoginRequest.java` | `user/dto/OAuthLoginRequest.java` |
| `OAuthService.java` | `user/service/OAuthService.java` |

#### Step 1.3 — Modify Existing Files

| File | Changes |
|------|---------|
| [User.java](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/src/main/java/com/fahmak/alena/user/entity/User.java) | Add `authProvider`, `providerId`, `avatarUrl` fields. Make `passwordHash` nullable. |
| [UserService.java](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/src/main/java/com/fahmak/alena/user/service/UserService.java) | Add `findOrCreateOAuthUser()` method. Guard `authenticateUser()` against OAuth-only accounts. |
| [UserRepository.java](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/src/main/java/com/fahmak/alena/user/repository/UserRepository.java) | Add `findByProviderIdAndAuthProvider(String, AuthProvider)`. |
| [AuthController.java](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/src/main/java/com/fahmak/alena/user/controller/AuthController.java) | Add `@PostMapping("/oauth2/google")` and `@PostMapping("/oauth2/facebook")` endpoints. |
| [SecurityConfig.java](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/src/main/java/com/fahmak/alena/config/SecurityConfig.java#L46) | Add `/api/auth/oauth2/**` to `permitAll()` request matchers. |
| [JwtAuthenticationFilter.java](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/src/main/java/com/fahmak/alena/user/security/JwtAuthenticationFilter.java#L82-L87) | Add `/api/auth/oauth2/` to `shouldNotFilter()`. |
| [DataInitializer.java](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/src/main/java/com/fahmak/alena/config/DataInitializer.java#L75-L87) | Set `user.setAuthProvider(AuthProvider.LOCAL)` in `createUser()`. |
| [application.properties](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/src/main/resources/application.properties) | Add `google.client.id`, `facebook.app.id`, `facebook.app.secret` properties. |

**`OAuthService` Core Logic**:
```java
@Service
@RequiredArgsConstructor
public class OAuthService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RestTemplate restTemplate;

    @Value("${google.client.id}")
    private String googleClientId;

    public AuthResponse authenticateWithGoogle(String idToken) {
        // 1. Verify token with Google's tokeninfo endpoint
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier
            .Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
            .setAudience(Collections.singletonList(googleClientId))
            .build();

        GoogleIdToken token = verifier.verify(idToken);
        if (token == null) throw new RuntimeException("Invalid Google token");

        GoogleIdToken.Payload payload = token.getPayload();
        String email = payload.getEmail();
        String googleId = payload.getSubject();
        String firstName = (String) payload.get("given_name");
        String lastName = (String) payload.get("family_name");
        String avatar = (String) payload.get("picture");

        // 2. Find or create user
        User user = userRepository
            .findByProviderIdAndAuthProvider(googleId, AuthProvider.GOOGLE)
            .orElseGet(() -> {
                // Check if email already exists (local account)
                Optional<User> existingByEmail = userRepository.findByEmail(email);
                if (existingByEmail.isPresent()) {
                    // Link OAuth to existing local account
                    User existing = existingByEmail.get();
                    existing.setAuthProvider(AuthProvider.GOOGLE);
                    existing.setProviderId(googleId);
                    existing.setAvatarUrl(avatar);
                    return userRepository.save(existing);
                }
                // Create brand new user
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setUsername(email.split("@")[0]);
                newUser.setFirstName(firstName);
                newUser.setLastName(lastName);
                newUser.setRole(Role.STUDENT); // Default role for social sign-ups
                newUser.setAuthProvider(AuthProvider.GOOGLE);
                newUser.setProviderId(googleId);
                newUser.setAvatarUrl(avatar);
                newUser.setRegistrationDate(LocalDateTime.now());
                newUser.setStatus("ACTIVE");
                return userRepository.save(newUser);
            });

        // 3. Generate JWT (same flow as email/password login)
        user.setLastLoginDate(LocalDateTime.now());
        userRepository.save(user);
        String jwt = jwtService.generateToken(user);

        return AuthResponse.builder()
            .message("Login successful")
            .token(jwt)
            .userId(user.getId())
            .role(user.getRole().name())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .email(user.getEmail())
            .build();
    }
}
```

---

### Phase 2: Payment & Subscription System

#### Step 2.1 — Add Dependencies to [pom.xml](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/pom.xml)
```xml
<dependency>
    <groupId>com.stripe</groupId>
    <artifactId>stripe-java</artifactId>
    <version>28.2.0</version>
</dependency>
```

#### Step 2.2 — New Package Structure
```
com.fahmak.alena.payment/
├── controller/
│   ├── SubscriptionController.java      // Student-facing endpoints
│   └── AdminRevenueController.java      // Admin dashboard data
├── dto/
│   ├── CheckoutRequest.java
│   ├── CheckoutResponse.java
│   ├── SubscriptionResponse.java
│   ├── PlanResponse.java
│   └── RevenueStatsDTO.java
├── entity/
│   ├── SubscriptionPlan.java
│   ├── Subscription.java
│   ├── SubscriptionStatus.java          // Enum
│   ├── PaymentTransaction.java
│   └── PaymentStatus.java               // Enum
├── repository/
│   ├── SubscriptionPlanRepository.java
│   ├── SubscriptionRepository.java
│   └── PaymentTransactionRepository.java
├── service/
│   ├── SubscriptionService.java
│   ├── StripeService.java               // Stripe API wrapper
│   └── StripeWebhookService.java
└── config/
    └── StripeConfig.java                // @Configuration for API key
```

#### Step 2.3 — Modify Existing Files

| File | Changes |
|------|---------|
| [SecurityConfig.java](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/src/main/java/com/fahmak/alena/config/SecurityConfig.java#L46) | Add `/api/subscriptions/plans` and `/api/subscriptions/webhook` to `permitAll()`. |
| [application.properties](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/src/main/resources/application.properties) | Add `stripe.api.key`, `stripe.webhook.secret`, `stripe.success.url`, `stripe.cancel.url`. |
| [DataInitializer.java](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/src/main/java/com/fahmak/alena/config/DataInitializer.java) | Add `initializeSubscriptionPlans()` to seed Free/Pro/Enterprise plans. |

**Stripe Integration Strategy**: Use **Stripe Checkout Sessions** (hosted by Stripe) rather than embedded elements. This reduces PCI compliance scope to SAQ-A. The flow is:
1. Frontend calls `POST /api/subscriptions/checkout` with `planId`.
2. Backend creates a `Stripe.Checkout.Session` with `mode=subscription`.
3. Backend returns the `checkoutUrl` to frontend.
4. Frontend redirects user to Stripe-hosted page.
5. Stripe sends webhook events (`checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`) to `POST /api/subscriptions/webhook`.
6. Backend processes webhooks and updates `Subscription`/`PaymentTransaction` entities.

---

### Phase 3: Cheating Detection

#### Step 3.1 — New Files (within existing `assessment` package)
```
com.fahmak.alena.assessment/
├── entity/
│   ├── QuizSession.java                 // NEW
│   ├── CheatEvent.java                  // NEW
│   ├── CheatEventType.java              // NEW (enum)
│   └── IntegrityVerdict.java            // NEW (enum)
├── dto/
│   ├── StartSessionRequest.java         // NEW
│   ├── StartSessionResponse.java        // NEW
│   ├── CheatEventBatchRequest.java      // NEW
│   └── IntegrityReportResponse.java     // NEW
├── repository/
│   ├── QuizSessionRepository.java       // NEW
│   └── CheatEventRepository.java        // NEW
├── service/
│   ├── IntegrityService.java            // NEW — risk scoring engine
```

#### Step 3.2 — Modify Existing Files

| File | Changes |
|------|---------|
| [AssessmentController.java](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/src/main/java/com/fahmak/alena/assessment/controller/AssessmentController.java) | Add session start, event reporting, and session submit endpoints. |
| [InstructorDashboardResponse.java](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/src/main/java/com/fahmak/alena/instructor/dto/InstructorDashboardResponse.java) | Add `flaggedSessionCount` field. |

**Risk Scoring Algorithm** (`IntegrityService`):
```java
public double calculateRiskScore(QuizSession session) {
    double score = 0.0;

    // Factor 1: Focus loss frequency (weight: 0.35)
    if (session.getTotalFocusLossCount() >= 5) score += 0.35;
    else if (session.getTotalFocusLossCount() >= 3) score += 0.20;
    else if (session.getTotalFocusLossCount() >= 1) score += 0.05;

    // Factor 2: Total time away (weight: 0.25)
    long awaySeconds = session.getTotalFocusLossDurationMs() / 1000;
    if (awaySeconds >= 30) score += 0.25;
    else if (awaySeconds >= 10) score += 0.15;

    // Factor 3: Rapid answers (weight: 0.20)
    if (session.getRapidAnswerCount() >= 3) score += 0.20;
    else if (session.getRapidAnswerCount() >= 1) score += 0.10;

    // Factor 4: Copy/paste activity (weight: 0.20)
    if (session.getCopyPasteCount() >= 2) score += 0.20;
    else if (session.getCopyPasteCount() >= 1) score += 0.10;

    return Math.min(score, 1.0);
}

public IntegrityVerdict determineVerdict(double riskScore) {
    if (riskScore >= 0.60) return IntegrityVerdict.FLAGGED;
    if (riskScore >= 0.30) return IntegrityVerdict.SUSPICIOUS;
    return IntegrityVerdict.CLEAN;
}
```

---

### Phase 4: Peer Tutoring (WebSockets)

#### Step 4.1 — Add Dependencies to [pom.xml](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/backend/pom.xml)
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

#### Step 4.2 — New Package Structure
```
com.fahmak.alena.collaborative/
├── config/
│   └── WebSocketConfig.java             // STOMP configuration
├── controller/
│   └── PeerTutoringController.java      // @MessageMapping handlers
├── dto/
│   ├── MatchRequest.java
│   ├── RoomUpdateMessage.java
│   ├── SignalMessage.java
│   └── PeerParticipantDTO.java
├── entity/
│   ├── PeerSession.java
│   ├── PeerSessionParticipant.java
│   ├── PeerSessionStatus.java           // Enum
│   └── ParticipantRole.java             // Enum
├── repository/
│   ├── PeerSessionRepository.java
│   └── PeerSessionParticipantRepository.java
└── service/
    ├── MatchmakingService.java          // Queue-based matching algorithm
    └── PeerSessionService.java
```

**WebSocketConfig.java**:
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:4200")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new JwtChannelInterceptor(jwtService));
    }
}
```

**Matchmaking Algorithm** (in-memory, Redis-backed in production):
```java
@Service
public class MatchmakingService {
    // Queue: courseId → List of waiting users
    private final ConcurrentHashMap<Long, Queue<MatchRequest>> waitingQueues
        = new ConcurrentHashMap<>();

    public Optional<PeerSession> findOrCreateMatch(MatchRequest request) {
        Queue<MatchRequest> queue = waitingQueues
            .computeIfAbsent(request.getCourseId(), k -> new ConcurrentLinkedQueue<>());

        // Try to find an existing waiting room with space
        // If none, add to queue and wait
        // When queue reaches 2+ participants, create a PeerSession
    }
}
```

---

## Part 4: Frontend Implementation Roadmap

### Actual Color Palette Reference (from real [tailwind.config.js](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/frontend/tailwind.config.js))

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-50` | `#FDF3F2` | Light backgrounds |
| `brand-100` | `#FBE4E3` | Hover states, borders |
| `brand-500` | `#ca2a22` | **Primary brand** (buttons, accents) |
| `brand-600` | `#B5251E` | **Hover states** |
| `brand-900` | `#661813` | Dark text |
| `surface` | `#ffffff` | Card backgrounds |
| `surface-50` | `#f8fafc` | Page backgrounds |
| `shadow-soft` | `0 4px 20px -2px rgba(0,0,0,0.05)` | Cards, floating elements |
| `shadow-glow` | `0 0 20px rgba(202, 42, 34, 0.4)` | Active/interactive elements |

---

### Phase F1: OAuth2 Social Login UI

#### New/Modified Files:

| Action | File | Description |
|--------|------|-------------|
| MODIFY | `features/auth/login/login.component.html` | Add Google/Facebook buttons below email form |
| MODIFY | `features/auth/register/register.component.html` | Add Google/Facebook buttons with "or" divider |
| MODIFY | `core/services/auth.service.ts` | Add `loginWithGoogle()`, `loginWithFacebook()` methods |
| MODIFY | `core/models/auth.model.ts` | Add `OAuthLoginRequest` interface |
| NEW | `core/services/oauth.helper.ts` | Google Sign-In SDK and Facebook SDK initialization |

**Frontend OAuth Flow**:
1. Load Google Sign-In SDK (`accounts.google.com/gsi/client`) dynamically.
2. On "Sign in with Google" button click → trigger Google popup.
3. Google returns ID token in callback.
4. Frontend calls `POST /api/auth/oauth2/google` with the token.
5. Backend validates, creates/finds user, returns JWT.
6. Frontend stores JWT in `localStorage` — same as current email/password flow in [auth.service.ts](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/frontend/src/app/core/services/auth.service.ts#L21-L31).

**UI Design** — Social buttons styling:
```html
<!-- Divider -->
<div class="flex items-center my-6">
  <div class="flex-1 border-t border-gray-200"></div>
  <span class="px-4 text-sm text-gray-400">or continue with</span>
  <div class="flex-1 border-t border-gray-200"></div>
</div>

<!-- Social Buttons -->
<div class="grid grid-cols-2 gap-3">
  <button (click)="loginWithGoogle()"
    class="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200
           rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50
           shadow-sm transition-all hover:shadow-soft">
    <img src="assets/google-icon.svg" class="w-5 h-5" alt="Google">
    Google
  </button>
  <button (click)="loginWithFacebook()"
    class="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1877F2] border-0
           rounded-xl text-sm font-medium text-white hover:bg-[#166FE5]
           shadow-sm transition-all">
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">...</svg>
    Facebook
  </button>
</div>
```

---

### Phase F2: Subscription & Payment UI

#### New Files:

| File | Path | Description |
|------|------|-------------|
| NEW | `features/subscription-plans/` | Plan selection page (3-column pricing cards) |
| NEW | `features/admin-dashboard/admin-revenue/` | Revenue analytics sub-component |
| NEW | `core/services/payment.service.ts` | API calls for subscriptions/checkout |
| NEW | `core/models/payment.model.ts` | TypeScript interfaces |

#### Modify:

| File | Changes |
|------|---------|
| [app.routes.ts](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/frontend/src/app/app.routes.ts) | Add `subscription-plans` route (auth-guarded) |
| `features/admin-dashboard/admin-dashboard.component.html` | Add "Revenue" tab/section |
| `shared/sidebar/sidebar.component.html` | Add "Subscription" nav item |

**Pricing Cards Design** — 3-tier layout with brand-600 "Popular" highlight:
```html
<!-- Pro Plan Card (highlighted) -->
<div class="relative bg-white rounded-2xl border-2 border-brand-500 shadow-glow p-8 transform scale-105">
  <span class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-500
               text-white text-xs font-bold rounded-full uppercase tracking-wider">
    Most Popular
  </span>
  <h3 class="text-xl font-extrabold text-gray-900">Pro</h3>
  <p class="text-4xl font-extrabold text-brand-500 mt-4">$19<span class="text-base font-normal text-gray-400">/mo</span></p>
  <!-- Features list -->
  <button class="w-full mt-8 py-3 bg-brand-600 text-white rounded-xl font-semibold
                 hover:bg-brand-700 shadow-md transition-all">
    Get Started
  </button>
</div>
```

---

### Phase F3: Cheating Detection Frontend

#### Modified Files:

| File | Changes |
|------|---------|
| `features/adaptive-assessment/adaptive-assessment.component.ts` | Add `@HostListener('window:blur')`, `@HostListener('window:focus')`, copy/paste interception, session lifecycle management |
| `features/adaptive-assessment/adaptive-assessment.component.html` | Add "Proctored Assessment" banner with webcam icon |
| `core/services/assessment.service.ts` | Add `startSession()`, `reportEvents()`, `submitSession()` methods |
| `core/models/assessment.model.ts` | Add `QuizSession`, `CheatEvent` interfaces |
| `features/instructor-dashboard/instructor-dashboard.component.html` | Add "Integrity Reports" section with flagged student cards |
| `core/services/instructor.service.ts` | Add `getIntegrityReports()`, `getFlaggedSessions()` |

**Event Tracking Implementation** in assessment component:
```typescript
@Component({ ... })
export class AdaptiveAssessmentComponent implements OnInit, OnDestroy {
  private sessionId: number | null = null;
  private eventBuffer: CheatEvent[] = [];
  private flushInterval: any;

  @HostListener('window:blur')
  onWindowBlur() {
    this.eventBuffer.push({
      eventType: 'WINDOW_BLUR',
      timestamp: new Date().toISOString(),
      metadata: '{}'
    });
  }

  @HostListener('window:focus')
  onWindowFocus() {
    this.eventBuffer.push({
      eventType: 'WINDOW_FOCUS',
      timestamp: new Date().toISOString(),
      metadata: '{}'
    });
    this.flushEvents(); // Send immediately on refocus
  }

  @HostListener('document:copy', ['$event'])
  onCopy(event: ClipboardEvent) {
    event.preventDefault();
    this.eventBuffer.push({ eventType: 'COPY_DETECTED', ... });
  }

  @HostListener('document:paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    this.eventBuffer.push({ eventType: 'PASTE_DETECTED', ... });
  }

  private flushEvents() {
    if (this.eventBuffer.length > 0 && this.sessionId) {
      this.assessmentService.reportEvents(this.sessionId, this.eventBuffer).subscribe();
      this.eventBuffer = [];
    }
  }
}
```

---

### Phase F4: Peer Tutoring UI

#### New Files:

| File | Path | Description |
|------|------|-------------|
| NEW | `core/services/collaborative.service.ts` | WebSocket/STOMP client, WebRTC signaling |
| NEW | `core/models/collaborative.model.ts` | PeerSession, MatchRequest, RoomUpdate interfaces |

#### Modified Files:

| File | Changes |
|------|---------|
| [immersive-hub.component.ts](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/frontend/src/app/features/immersive-hub/immersive-hub.component.ts) | Inject `CollaborativeService`, connect to WebSocket on init, handle match events |
| [immersive-hub.component.html](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/frontend/src/app/features/immersive-hub/immersive-hub.component.html#L124-L146) | Replace hardcoded "Seif/Amr" peer list with `*ngFor` bound to live WebSocket data |
| [package.json](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/frontend/package.json) | Add `@stomp/stompjs` and `sockjs-client` dependencies |

**WebSocket Service Core**:
```typescript
@Injectable({ providedIn: 'root' })
export class CollaborativeService {
  private stompClient: Client;
  private matchSubject = new BehaviorSubject<PeerSession | null>(null);
  public match$ = this.matchSubject.asObservable();

  constructor(private authService: AuthService) {}

  connect() {
    const token = this.authService.getToken();
    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
    });

    this.stompClient.onConnect = () => {
      // Subscribe to personal match notifications
      this.stompClient.subscribe(`/user/topic/peer/matched`, (message) => {
        this.matchSubject.next(JSON.parse(message.body));
      });
    };

    this.stompClient.activate();
  }

  findMatch(courseId: number, topic: string) {
    this.stompClient.publish({
      destination: '/app/peer/find-match',
      body: JSON.stringify({ courseId, topic, role: 'LEARNER' })
    });
  }
}
```

---

## Part 5: DevOps & Backup Strategy

### 5.1 Automated PostgreSQL Backups

**New File**: `devops/backup/backup.sh`

```bash
#!/bin/bash
# Fahmak Alena - Automated Database Backup Script
# Schedule: Daily at 02:00 AM via cron/Docker

set -euo pipefail

# Configuration (via environment variables)
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-fahmak_alena}"
DB_USER="${POSTGRES_USER:-root}"
BACKUP_DIR="/backups"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/fahmak_alena_${TIMESTAMP}.sql.gz"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting backup of ${DB_NAME}..."

# Perform compressed backup
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --format=custom \
  --compress=9 \
  --verbose \
  -f "${BACKUP_FILE}"

echo "[$(date)] Backup created: ${BACKUP_FILE} ($(du -h ${BACKUP_FILE} | cut -f1))"

# Upload to cloud storage (Google Cloud Storage example)
if command -v gsutil &> /dev/null; then
  GCS_BUCKET="${GCS_BACKUP_BUCKET:-gs://fahmak-alena-backups}"
  gsutil cp "${BACKUP_FILE}" "${GCS_BUCKET}/daily/"
  echo "[$(date)] Uploaded to ${GCS_BUCKET}/daily/"
fi

# Cleanup old local backups
find "${BACKUP_DIR}" -name "fahmak_alena_*.sql.gz" -mtime +"${RETENTION_DAYS}" -delete
echo "[$(date)] Cleaned up backups older than ${RETENTION_DAYS} days."

echo "[$(date)] Backup completed successfully."
```

### 5.2 Docker Backup Service

Add to [docker-compose.yml](file:///c:/Users/NTG%20SCHOOL1/Downloads/fahmak-alena/docker-compose.yml):

```yaml
  db-backup:
    image: postgres:15-alpine
    container_name: fahmak-backup
    volumes:
      - ./devops/backup:/scripts
      - backup-data:/backups
    environment:
      POSTGRES_HOST: postgres
      POSTGRES_PORT: 5432
      POSTGRES_DB: fahmak_alena
      POSTGRES_USER: root
      POSTGRES_PASSWORD: password
      BACKUP_RETENTION_DAYS: 30
    entrypoint: /bin/sh
    command: >
      -c "echo '0 2 * * * /scripts/backup.sh >> /var/log/backup.log 2>&1' | crontab - && crond -f"
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  postgres-data:
  redis-data:
  backup-data:     # NEW
```

### 5.3 Disaster Recovery Plan

| Scenario | Recovery Action | RTO |
|----------|----------------|-----|
| Database corruption | Restore from latest backup via `pg_restore` | < 30 min |
| Accidental data deletion | Point-in-time recovery from backup chain | < 1 hour |
| Full server loss | Rebuild from Docker images + latest GCS backup | < 2 hours |

**Restore Command**:
```bash
pg_restore --host=localhost --port=5432 --username=root \
  --dbname=fahmak_alena --clean --if-exists \
  /backups/fahmak_alena_20260610_020000.sql.gz
```

---

## Implementation Priority & Timeline

| # | Feature | Priority | Estimated Effort | Dependencies |
|---|---------|----------|-----------------|--------------|
| 1 | OAuth2 Social Login | 🔴 High | 3-4 days | None |
| 2 | Payment & Subscriptions | 🔴 High | 5-7 days | Stripe account setup |
| 3 | Cheating Detection | 🔴 High | 4-5 days | None (extends existing assessment) |
| 4 | Automated Backups | 🔴 High | 1 day | PostgreSQL driver in pom.xml |
| 5 | Peer Tutoring (WebSockets) | 🟡 Medium | 6-8 days | WebSocket dependency |

**Recommended Order**: `4 → 1 → 3 → 2 → 5`
- Start with backups (1 day, immediate safety value).
- OAuth2 next (unblocks onboarding friction).
- Cheating detection (extends existing assessment — no new packages needed).
- Payments (most complex, needs Stripe account/keys).
- Peer tutoring last (highest complexity, lowest priority, requires WebRTC expertise).

---

## Verification Plan

### Automated Tests
```bash
# Backend (Maven)
./mvnw test -pl backend

# Frontend (Angular)
cd frontend && npm run test
```

### Manual Verification Checklist
- [ ] Register with Google → verify JWT returned → verify dashboard loads
- [ ] Register with Facebook → same flow
- [ ] Existing email user logs in with Google → accounts linked, not duplicated
- [ ] Subscribe to Pro plan → Stripe Checkout → webhook fires → subscription active in DB
- [ ] Cancel subscription → `cancelAtPeriodEnd` = true → access continues until period end
- [ ] Take quiz → switch tabs 5 times → verify `riskScore` ≥ 0.35
- [ ] Instructor views integrity dashboard → flagged sessions visible
- [ ] Peer match → 2 students same course → room created → WebSocket room updates received
- [ ] Database backup runs → file appears in `/backups` → `pg_restore` succeeds
